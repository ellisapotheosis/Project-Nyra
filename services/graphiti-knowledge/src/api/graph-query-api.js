import express from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger.js';

/**
 * Graph Query API
 * REST API for querying the knowledge graph
 */
export class GraphQueryAPI {
  constructor(knowledgeGraph) {
    this.graph = knowledgeGraph;
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Query nodes
    this.router.get('/nodes', this.queryNodes.bind(this));

    // Get specific node
    this.router.get('/nodes/:id', this.getNode.bind(this));

    // Find paths
    this.router.get('/paths', this.findPaths.bind(this));

    // Get neighborhood
    this.router.get('/neighborhood/:id', this.getNeighborhood.bind(this));

    // Execute custom Cypher query
    this.router.post('/cypher', this.executeCypher.bind(this));

    // Graph statistics
    this.router.get('/statistics', this.getStatistics.bind(this));

    // Search entities
    this.router.get('/search', this.searchEntities.bind(this));

    // Get related entities
    this.router.get('/related/:id', this.getRelatedEntities.bind(this));

    // Shortest path
    this.router.get('/shortest-path', this.shortestPath.bind(this));

    // Centrality metrics
    this.router.get('/centrality', this.getCentrality.bind(this));
  }

  /**
   * Query nodes by criteria
   */
  async queryNodes(req, res) {
    try {
      const schema = Joi.object({
        type: Joi.string(),
        properties: Joi.object(),
        limit: Joi.number().min(1).max(1000).default(100),
        offset: Joi.number().min(0).default(0)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const nodes = await this.graph.queryNodes(value);

      res.json({
        success: true,
        nodes,
        count: nodes.length,
        limit: value.limit,
        offset: value.offset
      });
    } catch (error) {
      logger.error('Query nodes error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get specific node by ID
   */
  async getNode(req, res) {
    try {
      const { id } = req.params;

      const result = await this.graph.queryNodes({
        properties: { id },
        limit: 1
      });

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Node not found' });
      }

      res.json({ success: true, node: result[0] });
    } catch (error) {
      logger.error('Get node error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Find paths between nodes
   */
  async findPaths(req, res) {
    try {
      const schema = Joi.object({
        source: Joi.string().required(),
        target: Joi.string().required(),
        maxDepth: Joi.number().min(1).max(10).default(5)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const paths = await this.graph.findPaths(
        value.source,
        value.target,
        value.maxDepth
      );

      res.json({
        success: true,
        paths,
        count: paths.length
      });
    } catch (error) {
      logger.error('Find paths error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get neighborhood of a node
   */
  async getNeighborhood(req, res) {
    try {
      const { id } = req.params;
      const depth = parseInt(req.query.depth) || 1;

      if (depth < 1 || depth > 5) {
        return res.status(400).json({
          success: false,
          error: 'Depth must be between 1 and 5'
        });
      }

      const neighborhood = await this.graph.getNeighborhood(id, depth);

      res.json({
        success: true,
        neighborhood,
        nodeId: id,
        depth
      });
    } catch (error) {
      logger.error('Get neighborhood error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Execute custom Cypher query
   */
  async executeCypher(req, res) {
    try {
      const schema = Joi.object({
        query: Joi.string().required(),
        params: Joi.object().default({})
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Security check - prevent destructive operations
      const destructiveOperations = ['DELETE', 'REMOVE', 'DROP', 'DETACH'];
      const upperQuery = value.query.toUpperCase();

      if (destructiveOperations.some(op => upperQuery.includes(op))) {
        return res.status(403).json({
          success: false,
          error: 'Destructive operations not allowed via API'
        });
      }

      const result = await this.graph.customQuery(value.query, value.params);

      res.json({
        success: true,
        result,
        count: result.length
      });
    } catch (error) {
      logger.error('Execute Cypher error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get graph statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await this.graph.getStatistics();

      res.json({
        success: true,
        statistics: stats
      });
    } catch (error) {
      logger.error('Get statistics error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Search entities
   */
  async searchEntities(req, res) {
    try {
      const schema = Joi.object({
        query: Joi.string().required(),
        type: Joi.string(),
        limit: Joi.number().min(1).max(100).default(20)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const cypherQuery = `
        MATCH (n:Entity)
        WHERE n.label CONTAINS $query
        ${value.type ? 'AND n.type = $type' : ''}
        RETURN n
        LIMIT $limit
      `;

      const results = await this.graph.customQuery(cypherQuery, {
        query: value.query,
        type: value.type,
        limit: value.limit
      });

      res.json({
        success: true,
        results,
        count: results.length,
        searchQuery: value.query
      });
    } catch (error) {
      logger.error('Search entities error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get related entities
   */
  async getRelatedEntities(req, res) {
    try {
      const { id } = req.params;
      const relationshipType = req.query.type;
      const limit = parseInt(req.query.limit) || 50;

      let cypherQuery = `
        MATCH (source:Entity {id: $id})-[r]->(target:Entity)
      `;

      if (relationshipType) {
        cypherQuery += ` WHERE type(r) = $type`;
      }

      cypherQuery += ` RETURN target, type(r) as relationshipType LIMIT $limit`;

      const results = await this.graph.customQuery(cypherQuery, {
        id,
        type: relationshipType,
        limit
      });

      res.json({
        success: true,
        sourceId: id,
        relatedEntities: results
      });
    } catch (error) {
      logger.error('Get related entities error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Find shortest path
   */
  async shortestPath(req, res) {
    try {
      const schema = Joi.object({
        source: Joi.string().required(),
        target: Joi.string().required()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const cypherQuery = `
        MATCH path = shortestPath((source:Entity {id: $source})-[*]-(target:Entity {id: $target}))
        RETURN path, length(path) as pathLength
      `;

      const result = await this.graph.customQuery(cypherQuery, {
        source: value.source,
        target: value.target
      });

      res.json({
        success: true,
        path: result[0] || null,
        source: value.source,
        target: value.target
      });
    } catch (error) {
      logger.error('Shortest path error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get centrality metrics
   */
  async getCentrality(req, res) {
    try {
      const metric = req.query.metric || 'degree';
      const limit = parseInt(req.query.limit) || 10;

      let cypherQuery;

      switch (metric) {
        case 'degree':
          cypherQuery = `
            MATCH (n:Entity)-[r]-()
            RETURN n, count(r) as centrality
            ORDER BY centrality DESC
            LIMIT $limit
          `;
          break;

        case 'betweenness':
          cypherQuery = `
            CALL algo.betweenness.stream('Entity', null)
            YIELD nodeId, centrality
            MATCH (n:Entity) WHERE id(n) = nodeId
            RETURN n, centrality
            ORDER BY centrality DESC
            LIMIT $limit
          `;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid metric. Supported: degree, betweenness'
          });
      }

      const results = await this.graph.customQuery(cypherQuery, { limit });

      res.json({
        success: true,
        metric,
        results
      });
    } catch (error) {
      logger.error('Get centrality error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
