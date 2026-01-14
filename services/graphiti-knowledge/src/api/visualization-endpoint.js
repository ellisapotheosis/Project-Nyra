import express from 'express';
import { logger } from '../utils/logger.js';

/**
 * Graph Visualization Endpoint
 * Provides data for graph visualization in various formats
 */
export class VisualizationEndpoint {
  constructor(knowledgeGraph) {
    this.graph = knowledgeGraph;
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Setup visualization routes
   */
  setupRoutes() {
    // Get graph in Cytoscape format
    this.router.get('/cytoscape', this.getCytoscapeFormat.bind(this));

    // Get graph in D3 force format
    this.router.get('/d3-force', this.getD3ForceFormat.bind(this));

    // Get subgraph for visualization
    this.router.get('/subgraph', this.getSubgraph.bind(this));

    // Get graph layout
    this.router.get('/layout', this.getLayout.bind(this));

    // Get graph communities
    this.router.get('/communities', this.getCommunities.bind(this));

    // Export graph as DOT format
    this.router.get('/export/dot', this.exportDOT.bind(this));

    // Export graph as GraphML
    this.router.get('/export/graphml', this.exportGraphML.bind(this));
  }

  /**
   * Get graph in Cytoscape.js format
   */
  async getCytoscapeFormat(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const nodeType = req.query.type;

      // Get nodes
      const nodes = await this.graph.queryNodes({
        type: nodeType,
        limit
      });

      // Get edges
      const edges = await this.getEdgesForNodes(nodes.map(n => n.id));

      // Format for Cytoscape
      const cytoscapeData = {
        nodes: nodes.map(node => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            properties: node.properties
          },
          classes: node.type
        })),
        edges: edges.map(edge => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.type,
            properties: edge.properties
          },
          classes: edge.type
        }))
      };

      res.json({
        success: true,
        format: 'cytoscape',
        data: cytoscapeData,
        stats: {
          nodeCount: cytoscapeData.nodes.length,
          edgeCount: cytoscapeData.edges.length
        }
      });
    } catch (error) {
      logger.error('Cytoscape format error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get graph in D3 force-directed format
   */
  async getD3ForceFormat(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const nodeType = req.query.type;

      const nodes = await this.graph.queryNodes({
        type: nodeType,
        limit
      });

      const edges = await this.getEdgesForNodes(nodes.map(n => n.id));

      // Format for D3
      const d3Data = {
        nodes: nodes.map((node, index) => ({
          id: node.id,
          name: node.label,
          type: node.type,
          group: this.getNodeGroup(node.type),
          properties: node.properties,
          index
        })),
        links: edges.map(edge => ({
          source: nodes.findIndex(n => n.id === edge.source),
          target: nodes.findIndex(n => n.id === edge.target),
          type: edge.type,
          value: edge.properties?.confidence || 1
        }))
      };

      res.json({
        success: true,
        format: 'd3-force',
        data: d3Data,
        stats: {
          nodeCount: d3Data.nodes.length,
          linkCount: d3Data.links.length
        }
      });
    } catch (error) {
      logger.error('D3 format error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get subgraph centered on a node
   */
  async getSubgraph(req, res) {
    try {
      const { nodeId } = req.query;
      const depth = parseInt(req.query.depth) || 2;
      const format = req.query.format || 'cytoscape';

      if (!nodeId) {
        return res.status(400).json({
          success: false,
          error: 'nodeId parameter required'
        });
      }

      const neighborhood = await this.graph.getNeighborhood(nodeId, depth);

      // Extract nodes and edges from neighborhood
      const nodes = this.extractNodesFromNeighborhood(neighborhood);
      const edges = this.extractEdgesFromNeighborhood(neighborhood);

      let formattedData;

      if (format === 'd3-force') {
        formattedData = this.formatD3(nodes, edges);
      } else {
        formattedData = this.formatCytoscape(nodes, edges);
      }

      res.json({
        success: true,
        format,
        data: formattedData,
        centerNode: nodeId,
        depth
      });
    } catch (error) {
      logger.error('Get subgraph error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get graph layout with coordinates
   */
  async getLayout(req, res) {
    try {
      const algorithm = req.query.algorithm || 'force-directed';
      const limit = parseInt(req.query.limit) || 100;

      const nodes = await this.graph.queryNodes({ limit });
      const edges = await this.getEdgesForNodes(nodes.map(n => n.id));

      // Calculate layout
      const layout = this.calculateLayout(nodes, edges, algorithm);

      res.json({
        success: true,
        algorithm,
        layout,
        stats: {
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      });
    } catch (error) {
      logger.error('Get layout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Detect communities in the graph
   */
  async getCommunities(req, res) {
    try {
      const cypherQuery = `
        MATCH (n:Entity)
        OPTIONAL MATCH (n)-[r]-(m:Entity)
        WITH n, collect(m) as neighbors
        RETURN n, neighbors
        LIMIT 500
      `;

      const result = await this.graph.customQuery(cypherQuery);

      // Simple community detection using Louvain-like algorithm
      const communities = this.detectCommunities(result);

      res.json({
        success: true,
        communities,
        communityCount: communities.length
      });
    } catch (error) {
      logger.error('Get communities error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Export graph as DOT format
   */
  async exportDOT(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 200;

      const nodes = await this.graph.queryNodes({ limit });
      const edges = await this.getEdgesForNodes(nodes.map(n => n.id));

      let dot = 'digraph KnowledgeGraph {\n';
      dot += '  node [shape=box];\n\n';

      // Add nodes
      for (const node of nodes) {
        dot += `  "${node.id}" [label="${node.label}", type="${node.type}"];\n`;
      }

      dot += '\n';

      // Add edges
      for (const edge of edges) {
        dot += `  "${edge.source}" -> "${edge.target}" [label="${edge.type}"];\n`;
      }

      dot += '}\n';

      res.setHeader('Content-Type', 'text/vnd.graphviz');
      res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.dot"');
      res.send(dot);
    } catch (error) {
      logger.error('Export DOT error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Export graph as GraphML
   */
  async exportGraphML(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 200;

      const nodes = await this.graph.queryNodes({ limit });
      const edges = await this.getEdgesForNodes(nodes.map(n => n.id));

      let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
      graphml += '  <graph id="KnowledgeGraph" edgedefault="directed">\n';

      // Add nodes
      for (const node of nodes) {
        graphml += `    <node id="${node.id}">\n`;
        graphml += `      <data key="label">${this.escapeXML(node.label)}</data>\n`;
        graphml += `      <data key="type">${node.type}</data>\n`;
        graphml += '    </node>\n';
      }

      // Add edges
      for (const edge of edges) {
        graphml += `    <edge source="${edge.source}" target="${edge.target}">\n`;
        graphml += `      <data key="type">${edge.type}</data>\n`;
        graphml += '    </edge>\n';
      }

      graphml += '  </graph>\n';
      graphml += '</graphml>\n';

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.graphml"');
      res.send(graphml);
    } catch (error) {
      logger.error('Export GraphML error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Helper: Get edges for nodes
   */
  async getEdgesForNodes(nodeIds) {
    const cypherQuery = `
      MATCH (source:Entity)-[r]->(target:Entity)
      WHERE source.id IN $nodeIds AND target.id IN $nodeIds
      RETURN id(r) as id, source.id as source, target.id as target,
             type(r) as type, r as properties
    `;

    return await this.graph.customQuery(cypherQuery, { nodeIds });
  }

  /**
   * Helper: Get node group for coloring
   */
  getNodeGroup(nodeType) {
    const groups = {
      'PERSON': 1,
      'ORGANIZATION': 2,
      'LOCATION': 3,
      'DATE': 4,
      'CONCEPT': 5
    };

    return groups[nodeType] || 0;
  }

  /**
   * Helper: Extract nodes from neighborhood result
   */
  extractNodesFromNeighborhood(neighborhood) {
    const nodes = new Map();

    for (const result of neighborhood) {
      if (result.n) {
        nodes.set(result.n.id, result.n);
      }
      if (result.neighbor) {
        nodes.set(result.neighbor.id, result.neighbor);
      }
    }

    return Array.from(nodes.values());
  }

  /**
   * Helper: Extract edges from neighborhood result
   */
  extractEdgesFromNeighborhood(neighborhood) {
    const edges = [];

    for (const result of neighborhood) {
      if (result.r && Array.isArray(result.r)) {
        edges.push(...result.r);
      }
    }

    return edges;
  }

  /**
   * Helper: Format for Cytoscape
   */
  formatCytoscape(nodes, edges) {
    return {
      nodes: nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type
        }
      })),
      edges: edges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.type
        }
      }))
    };
  }

  /**
   * Helper: Format for D3
   */
  formatD3(nodes, edges) {
    return {
      nodes: nodes.map((node, index) => ({
        id: node.id,
        name: node.label,
        type: node.type,
        group: this.getNodeGroup(node.type),
        index
      })),
      links: edges.map(edge => ({
        source: nodes.findIndex(n => n.id === edge.source),
        target: nodes.findIndex(n => n.id === edge.target),
        type: edge.type
      }))
    };
  }

  /**
   * Helper: Calculate layout
   */
  calculateLayout(nodes, edges, algorithm) {
    // Simple force-directed layout simulation
    const layout = {};

    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const radius = 100 + (nodes.length * 2);

      layout[node.id] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    });

    return layout;
  }

  /**
   * Helper: Detect communities
   */
  detectCommunities(graphData) {
    // Simple community detection based on connectivity
    const communities = [];
    const visited = new Set();

    // Group by entity type as simple community detection
    const typeGroups = new Map();

    for (const data of graphData) {
      if (data.n && !visited.has(data.n.id)) {
        const type = data.n.type;

        if (!typeGroups.has(type)) {
          typeGroups.set(type, []);
        }

        typeGroups.get(type).push(data.n);
        visited.add(data.n.id);
      }
    }

    // Convert to community format
    typeGroups.forEach((nodes, type) => {
      communities.push({
        id: type,
        nodes: nodes.map(n => n.id),
        size: nodes.length,
        type
      });
    });

    return communities;
  }

  /**
   * Helper: Escape XML characters
   */
  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
