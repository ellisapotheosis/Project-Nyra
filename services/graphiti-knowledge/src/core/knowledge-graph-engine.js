import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { RelationshipInference } from './relationship-inference.js';

/**
 * Core Knowledge Graph Engine
 * Handles graph construction, querying, and relationship management
 */
export class KnowledgeGraphEngine {
  constructor(database, temporalTracker) {
    this.db = database;
    this.temporal = temporalTracker;
    this.inference = new RelationshipInference();
    this.graphName = 'knowledge_graph';
  }

  /**
   * Build knowledge graph from text and extracted entities
   */
  async buildFromText(text, entities, timestamp = new Date()) {
    logger.info('Building knowledge graph from text');

    const graphId = uuidv4();
    const nodes = [];
    const edges = [];

    try {
      // Create nodes for each entity
      for (const entity of entities) {
        const nodeId = await this.createNode({
          id: uuidv4(),
          type: entity.type,
          label: entity.text,
          properties: {
            ...entity.properties,
            sourceText: text,
            confidence: entity.confidence,
            createdAt: timestamp.toISOString()
          }
        });

        nodes.push(nodeId);

        // Track temporally
        await this.temporal.trackEntity(nodeId, entity, timestamp);
      }

      // Infer and create relationships
      const relationships = await this.inference.inferRelationships(entities, text);

      for (const rel of relationships) {
        const edgeId = await this.createRelationship({
          source: rel.source,
          target: rel.target,
          type: rel.type,
          properties: {
            confidence: rel.confidence,
            evidence: rel.evidence,
            createdAt: timestamp.toISOString()
          }
        });

        edges.push(edgeId);

        // Track relationship temporally
        await this.temporal.trackRelationship(edgeId, rel, timestamp);
      }

      logger.info(`Created graph with ${nodes.length} nodes and ${edges.length} edges`);

      return {
        graphId,
        nodes,
        edges,
        timestamp: timestamp.toISOString(),
        metadata: {
          entityCount: entities.length,
          relationshipCount: relationships.length,
          sourceLength: text.length
        }
      };
    } catch (error) {
      logger.error('Error building knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Create a node in the knowledge graph
   */
  async createNode(nodeData) {
    const query = `
      CREATE (n:Entity {
        id: $id,
        type: $type,
        label: $label,
        properties: $properties
      })
      RETURN n.id as nodeId
    `;

    const result = await this.db.query(this.graphName, query, nodeData);
    return result[0]?.nodeId || nodeData.id;
  }

  /**
   * Create a relationship between nodes
   */
  async createRelationship(relData) {
    const query = `
      MATCH (source:Entity {id: $source})
      MATCH (target:Entity {id: $target})
      CREATE (source)-[r:${relData.type} {
        confidence: $confidence,
        properties: $properties
      }]->(target)
      RETURN id(r) as relationshipId
    `;

    const result = await this.db.query(this.graphName, query, {
      source: relData.source,
      target: relData.target,
      confidence: relData.properties.confidence,
      properties: relData.properties
    });

    return result[0]?.relationshipId || uuidv4();
  }

  /**
   * Query nodes by criteria
   */
  async queryNodes(criteria) {
    const { type, properties, limit = 100 } = criteria;

    let query = 'MATCH (n:Entity)';
    const params = {};

    if (type) {
      query += ' WHERE n.type = $type';
      params.type = type;
    }

    if (properties) {
      Object.entries(properties).forEach(([key, value], index) => {
        query += index === 0 && !type ? ' WHERE' : ' AND';
        query += ` n.properties.${key} = $prop${index}`;
        params[`prop${index}`] = value;
      });
    }

    query += ` RETURN n LIMIT ${limit}`;

    return await this.db.query(this.graphName, query, params);
  }

  /**
   * Find paths between nodes
   */
  async findPaths(sourceId, targetId, maxDepth = 5) {
    const query = `
      MATCH path = (source:Entity {id: $sourceId})-[*1..${maxDepth}]->(target:Entity {id: $targetId})
      RETURN path, length(path) as pathLength
      ORDER BY pathLength
      LIMIT 10
    `;

    return await this.db.query(this.graphName, query, { sourceId, targetId });
  }

  /**
   * Get neighborhood of a node
   */
  async getNeighborhood(nodeId, depth = 1) {
    const query = `
      MATCH (n:Entity {id: $nodeId})-[r*1..${depth}]-(neighbor)
      RETURN n, r, neighbor
    `;

    return await this.db.query(this.graphName, query, { nodeId });
  }

  /**
   * Update node properties
   */
  async updateNode(nodeId, properties, timestamp = new Date()) {
    const query = `
      MATCH (n:Entity {id: $nodeId})
      SET n.properties = $properties,
          n.updatedAt = $timestamp
      RETURN n
    `;

    const result = await this.db.query(this.graphName, query, {
      nodeId,
      properties,
      timestamp: timestamp.toISOString()
    });

    // Track temporal change
    await this.temporal.trackChange(nodeId, 'update', properties, timestamp);

    return result;
  }

  /**
   * Delete node and its relationships
   */
  async deleteNode(nodeId, timestamp = new Date()) {
    const query = `
      MATCH (n:Entity {id: $nodeId})
      DETACH DELETE n
    `;

    await this.db.query(this.graphName, query, { nodeId });
    await this.temporal.trackChange(nodeId, 'delete', {}, timestamp);
  }

  /**
   * Get graph statistics
   */
  async getStatistics() {
    const nodeCountQuery = 'MATCH (n:Entity) RETURN count(n) as nodeCount';
    const edgeCountQuery = 'MATCH ()-[r]->() RETURN count(r) as edgeCount';
    const typeDistQuery = 'MATCH (n:Entity) RETURN n.type as type, count(*) as count';

    const [nodeResult, edgeResult, typeResult] = await Promise.all([
      this.db.query(this.graphName, nodeCountQuery),
      this.db.query(this.graphName, edgeCountQuery),
      this.db.query(this.graphName, typeDistQuery)
    ]);

    return {
      totalNodes: nodeResult[0]?.nodeCount || 0,
      totalEdges: edgeResult[0]?.edgeCount || 0,
      typeDistribution: typeResult
    };
  }

  /**
   * Execute custom Cypher query
   */
  async customQuery(cypherQuery, params = {}) {
    return await this.db.query(this.graphName, cypherQuery, params);
  }
}
