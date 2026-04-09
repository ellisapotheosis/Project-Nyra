import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

/**
 * FalkorDB Database Connector
 * Manages connection and queries to FalkorDB graph database
 */
export class FalkorDBConnector {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || null,
      database: config.database || 0
    };

    this.client = null;
    this.connected = false;
  }

  /**
   * Connect to FalkorDB
   */
  async connect() {
    try {
      const url = this.config.password
        ? `redis://:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`
        : `redis://${this.config.host}:${this.config.port}/${this.config.database}`;

      this.client = createClient({ url });

      this.client.on('error', (err) => {
        logger.error('FalkorDB connection error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        logger.info('Connected to FalkorDB');
        this.connected = true;
      });

      await this.client.connect();

      // Test connection with ping
      await this.client.ping();

      return true;
    } catch (error) {
      logger.error('Failed to connect to FalkorDB:', error);
      throw error;
    }
  }

  /**
   * Execute a Cypher query
   */
  async query(graphName, cypherQuery, params = {}) {
    if (!this.connected) {
      throw new Error('Not connected to FalkorDB');
    }

    try {
      // Build parameterized query
      const parameterizedQuery = this.buildParameterizedQuery(cypherQuery, params);

      logger.debug(`Executing query on graph ${graphName}:`, parameterizedQuery);

      // Execute query using GRAPH.QUERY command
      const result = await this.client.sendCommand([
        'GRAPH.QUERY',
        graphName,
        parameterizedQuery
      ]);

      // Parse result
      const parsed = this.parseResult(result);

      logger.debug(`Query returned ${parsed.length} results`);
      return parsed;

    } catch (error) {
      logger.error('Query execution error:', error);
      throw error;
    }
  }

  /**
   * Build parameterized query
   */
  buildParameterizedQuery(query, params) {
    let parameterizedQuery = query;

    // Replace parameters in query
    for (const [key, value] of Object.entries(params)) {
      const paramPlaceholder = `$${key}`;
      let paramValue;

      if (typeof value === 'string') {
        paramValue = `'${value.replace(/'/g, "\\'")}'`;
      } else if (typeof value === 'object' && value !== null) {
        paramValue = JSON.stringify(value).replace(/'/g, "\\'");
      } else {
        paramValue = value;
      }

      parameterizedQuery = parameterizedQuery.replace(
        new RegExp(`\\${paramPlaceholder}`, 'g'),
        paramValue
      );
    }

    return parameterizedQuery;
  }

  /**
   * Parse FalkorDB result
   */
  parseResult(result) {
    if (!result || !Array.isArray(result)) {
      return [];
    }

    // FalkorDB returns results in a specific format
    // [header, data_rows, statistics]
    const [header, dataRows] = result;

    if (!dataRows || dataRows.length === 0) {
      return [];
    }

    const parsed = [];

    for (const row of dataRows) {
      const obj = {};

      for (let i = 0; i < header.length; i++) {
        obj[header[i]] = this.parseValue(row[i]);
      }

      parsed.push(obj);
    }

    return parsed;
  }

  /**
   * Parse individual value
   */
  parseValue(value) {
    if (Array.isArray(value)) {
      return value.map(v => this.parseValue(v));
    }

    if (typeof value === 'object' && value !== null) {
      // Parse node or relationship
      if (value.type === 'node') {
        return {
          id: value.id,
          labels: value.labels,
          properties: value.properties || {}
        };
      } else if (value.type === 'edge') {
        return {
          id: value.id,
          type: value.relationshipType,
          source: value.src,
          target: value.dest,
          properties: value.properties || {}
        };
      }

      return value;
    }

    return value;
  }

  /**
   * Create a new graph
   */
  async createGraph(graphName) {
    try {
      // Graph is created implicitly on first query
      await this.query(graphName, 'RETURN 1');
      logger.info(`Graph ${graphName} created/accessed`);
      return true;
    } catch (error) {
      logger.error(`Failed to create graph ${graphName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a graph
   */
  async deleteGraph(graphName) {
    try {
      await this.client.sendCommand(['GRAPH.DELETE', graphName]);
      logger.info(`Graph ${graphName} deleted`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete graph ${graphName}:`, error);
      throw error;
    }
  }

  /**
   * List all graphs
   */
  async listGraphs() {
    try {
      const result = await this.client.sendCommand(['GRAPH.LIST']);
      return result || [];
    } catch (error) {
      logger.error('Failed to list graphs:', error);
      throw error;
    }
  }

  /**
   * Get graph schema
   */
  async getSchema(graphName) {
    try {
      const result = await this.client.sendCommand(['GRAPH.QUERY', graphName, 'CALL db.labels()']);
      return this.parseResult(result);
    } catch (error) {
      logger.error(`Failed to get schema for graph ${graphName}:`, error);
      throw error;
    }
  }

  /**
   * Execute read-only query
   */
  async readOnlyQuery(graphName, cypherQuery, params = {}) {
    if (!this.connected) {
      throw new Error('Not connected to FalkorDB');
    }

    try {
      const parameterizedQuery = this.buildParameterizedQuery(cypherQuery, params);

      const result = await this.client.sendCommand([
        'GRAPH.RO_QUERY',
        graphName,
        parameterizedQuery
      ]);

      return this.parseResult(result);
    } catch (error) {
      logger.error('Read-only query error:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(graphName) {
    try {
      const queries = {
        nodeCount: 'MATCH (n) RETURN count(n) as count',
        edgeCount: 'MATCH ()-[r]->() RETURN count(r) as count',
        labelDistribution: 'MATCH (n) RETURN labels(n) as label, count(*) as count'
      };

      const [nodes, edges, labels] = await Promise.all([
        this.readOnlyQuery(graphName, queries.nodeCount),
        this.readOnlyQuery(graphName, queries.edgeCount),
        this.readOnlyQuery(graphName, queries.labelDistribution)
      ]);

      return {
        nodes: nodes[0]?.count || 0,
        edges: edges[0]?.count || 0,
        labels: labels || []
      };
    } catch (error) {
      logger.error('Failed to get statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk insert nodes
   */
  async bulkInsertNodes(graphName, nodes) {
    const queries = nodes.map(node => {
      const props = Object.entries(node.properties || {})
        .map(([key, value]) => `${key}: '${value}'`)
        .join(', ');

      return `CREATE (n:${node.label} {${props}})`;
    });

    // Execute in batches
    const batchSize = 100;
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const combinedQuery = batch.join(' ');
      await this.query(graphName, combinedQuery);
    }

    logger.info(`Bulk inserted ${nodes.length} nodes`);
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('Disconnected from FalkorDB');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Ping database
   */
  async ping() {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}
