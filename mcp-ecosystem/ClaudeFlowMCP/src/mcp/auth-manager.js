/**
 * MCP Authentication Manager
 * Handles authentication and authorization for MCP servers
 */

const crypto = require('crypto');
const { MCPLogger } = require('./utils/logger');
const { MCPValidator } = require('./utils/validator');

class MCPAuthManager {
  constructor(config) {
    this.config = config;
    this.logger = new MCPLogger('MCPAuthManager');
    this.validator = new MCPValidator();
    
    // Authentication state
    this.tokens = new Map();
    this.sessions = new Map();
    this.authCache = new Map();
    
    // Configuration
    this.tokenExpiry = config.get('auth.tokenExpiry', 3600000); // 1 hour
    this.sessionExpiry = config.get('auth.sessionExpiry', 86400000); // 24 hours
    this.maxRetries = config.get('auth.maxRetries', 3);
    
    // Cleanup expired tokens periodically
    this.startCleanupInterval();
  }

  /**
   * Initialize authentication manager
   */
  async initialize() {
    try {
      this.logger.info('Initializing MCP authentication manager');
      
      // Load cached tokens
      await this.loadCachedTokens();
      
      // Validate existing sessions
      await this.validateSessions();
      
      this.logger.info('MCP authentication manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize auth manager:', error);
      throw error;
    }
  }

  /**
   * Authenticate with an MCP server
   */
  async authenticate(serverName, credentials = {}) {
    try {
      this.logger.debug(`Authenticating with server: ${serverName}`);
      
      const serverConfig = this.config.getServerConfig(serverName);
      if (!serverConfig) {
        throw new Error(`Server configuration not found: ${serverName}`);
      }

      // Check if authentication is required
      if (!this.requiresAuth(serverConfig)) {
        this.logger.debug(`No authentication required for server: ${serverName}`);
        return { authenticated: true, method: 'none' };
      }

      // Check for cached valid authentication
      const cachedAuth = this.authCache.get(serverName);
      if (cachedAuth && this.isAuthValid(cachedAuth)) {
        this.logger.debug(`Using cached authentication for server: ${serverName}`);
        return cachedAuth;
      }

      // Perform authentication based on server type and configuration
      let authResult;
      
      if (serverConfig.auth) {
        authResult = await this.performAuthentication(serverName, serverConfig, credentials);
      } else if (serverConfig.headers && serverConfig.headers.Authorization) {
        authResult = await this.performHeaderAuth(serverName, serverConfig);
      } else if (serverConfig.apiKey) {
        authResult = await this.performApiKeyAuth(serverName, serverConfig);
      } else {
        // Try environment variable authentication
        authResult = await this.performEnvAuth(serverName, serverConfig);
      }

      // Cache successful authentication
      if (authResult.authenticated) {
        this.cacheAuthentication(serverName, authResult);
      }

      this.logger.info(`Authentication ${authResult.authenticated ? 'successful' : 'failed'} for server: ${serverName}`);
      return authResult;
    } catch (error) {
      this.logger.error(`Authentication failed for server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Check if server requires authentication
   */
  requiresAuth(serverConfig) {
    return !!(
      serverConfig.auth ||
      serverConfig.headers?.Authorization ||
      serverConfig.apiKey ||
      this.hasAuthEnvVars(serverConfig)
    );
  }

  /**
   * Check if server has authentication environment variables
   */
  hasAuthEnvVars(serverConfig) {
    const envVars = [
      `${serverConfig.name?.toUpperCase()}_TOKEN`,
      `${serverConfig.name?.toUpperCase()}_API_KEY`,
      `${serverConfig.name?.toUpperCase()}_AUTH_TOKEN`
    ];
    
    return envVars.some(varName => process.env[varName]);
  }

  /**
   * Perform authentication based on configuration
   */
  async performAuthentication(serverName, serverConfig, credentials) {
    const authConfig = serverConfig.auth;
    
    switch (authConfig.type) {
      case 'bearer':
        return await this.performBearerAuth(serverName, authConfig, credentials);
      case 'basic':
        return await this.performBasicAuth(serverName, authConfig, credentials);
      case 'oauth':
        return await this.performOAuthAuth(serverName, authConfig, credentials);
      case 'apikey':
        return await this.performApiKeyAuth(serverName, authConfig, credentials);
      default:
        throw new Error(`Unsupported authentication type: ${authConfig.type}`);
    }
  }

  /**
   * Perform Bearer token authentication
   */
  async performBearerAuth(serverName, authConfig, credentials) {
    const token = credentials.token || 
                  authConfig.token || 
                  process.env[`${serverName.toUpperCase()}_TOKEN`] ||
                  process.env.MCP_TOKEN;

    if (!token) {
      throw new Error(`Bearer token not provided for server: ${serverName}`);
    }

    // Validate token format if specified
    if (authConfig.tokenPattern && !new RegExp(authConfig.tokenPattern).test(token)) {
      throw new Error(`Invalid token format for server: ${serverName}`);
    }

    return {
      authenticated: true,
      method: 'bearer',
      token: token,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      expiresAt: Date.now() + this.tokenExpiry
    };
  }

  /**
   * Perform Basic authentication
   */
  async performBasicAuth(serverName, authConfig, credentials) {
    const username = credentials.username || 
                     authConfig.username || 
                     process.env[`${serverName.toUpperCase()}_USERNAME`];
    
    const password = credentials.password || 
                     authConfig.password || 
                     process.env[`${serverName.toUpperCase()}_PASSWORD`];

    if (!username || !password) {
      throw new Error(`Username or password not provided for server: ${serverName}`);
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    return {
      authenticated: true,
      method: 'basic',
      username,
      headers: {
        'Authorization': `Basic ${auth}`
      },
      expiresAt: Date.now() + this.sessionExpiry
    };
  }

  /**
   * Perform OAuth authentication
   */
  async performOAuthAuth(serverName, authConfig, credentials) {
    // This is a simplified OAuth implementation
    // In production, you might want to use a proper OAuth library
    
    const clientId = credentials.clientId || 
                     authConfig.clientId || 
                     process.env[`${serverName.toUpperCase()}_CLIENT_ID`];
    
    const clientSecret = credentials.clientSecret || 
                         authConfig.clientSecret || 
                         process.env[`${serverName.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`OAuth credentials not provided for server: ${serverName}`);
    }

    // Check for existing token
    const existingToken = this.tokens.get(serverName);
    if (existingToken && this.isTokenValid(existingToken)) {
      return {
        authenticated: true,
        method: 'oauth',
        token: existingToken.accessToken,
        headers: {
          'Authorization': `Bearer ${existingToken.accessToken}`
        },
        expiresAt: existingToken.expiresAt
      };
    }

    // Request new token
    if (authConfig.tokenUrl) {
      const tokenResponse = await this.requestOAuthToken(
        authConfig.tokenUrl, 
        clientId, 
        clientSecret
      );
      
      this.tokens.set(serverName, {
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type || 'Bearer',
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
        refreshToken: tokenResponse.refresh_token
      });

      return {
        authenticated: true,
        method: 'oauth',
        token: tokenResponse.access_token,
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`
        },
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000)
      };
    }

    throw new Error(`OAuth token URL not configured for server: ${serverName}`);
  }

  /**
   * Perform API Key authentication
   */
  async performApiKeyAuth(serverName, authConfig, credentials) {
    const apiKey = credentials.apiKey || 
                   authConfig.apiKey || 
                   process.env[`${serverName.toUpperCase()}_API_KEY`];

    if (!apiKey) {
      throw new Error(`API key not provided for server: ${serverName}`);
    }

    const headerName = authConfig.headerName || 'X-API-Key';
    const headers = {};
    headers[headerName] = apiKey;

    return {
      authenticated: true,
      method: 'apikey',
      apiKey,
      headers,
      expiresAt: Date.now() + this.tokenExpiry
    };
  }

  /**
   * Perform header-based authentication
   */
  async performHeaderAuth(serverName, serverConfig) {
    const authHeader = serverConfig.headers.Authorization;
    
    // Resolve environment variables in the header
    const resolvedHeader = this.resolveEnvironmentVariables(authHeader);
    
    if (!resolvedHeader || resolvedHeader === authHeader) {
      this.logger.warn(`Authorization header may contain unresolved variables: ${serverName}`);
    }

    return {
      authenticated: true,
      method: 'header',
      headers: {
        'Authorization': resolvedHeader
      },
      expiresAt: Date.now() + this.tokenExpiry
    };
  }

  /**
   * Perform environment variable authentication
   */
  async performEnvAuth(serverName, serverConfig) {
    const envVars = [
      `${serverName.toUpperCase()}_TOKEN`,
      `${serverName.toUpperCase()}_API_KEY`,
      `${serverName.toUpperCase()}_AUTH_TOKEN`
    ];

    for (const varName of envVars) {
      const value = process.env[varName];
      if (value) {
        return {
          authenticated: true,
          method: 'environment',
          token: value,
          headers: {
            'Authorization': `Bearer ${value}`
          },
          expiresAt: Date.now() + this.tokenExpiry
        };
      }
    }

    return { authenticated: false, method: 'none' };
  }

  /**
   * Request OAuth token
   */
  async requestOAuthToken(tokenUrl, clientId, clientSecret) {
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth token request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('OAuth token request failed:', error);
      throw error;
    }
  }

  /**
   * Check if authentication is valid
   */
  isAuthValid(auth) {
    return auth && 
           auth.authenticated && 
           auth.expiresAt > Date.now();
  }

  /**
   * Check if token is valid
   */
  isTokenValid(token) {
    return token && 
           token.accessToken && 
           token.expiresAt > Date.now();
  }

  /**
   * Cache authentication result
   */
  cacheAuthentication(serverName, authResult) {
    this.authCache.set(serverName, {
      ...authResult,
      cachedAt: Date.now()
    });
  }

  /**
   * Get authentication headers for a server
   */
  getAuthHeaders(serverName) {
    const cachedAuth = this.authCache.get(serverName);
    if (cachedAuth && this.isAuthValid(cachedAuth)) {
      return cachedAuth.headers || {};
    }
    return {};
  }

  /**
   * Refresh authentication for a server
   */
  async refreshAuthentication(serverName) {
    this.logger.debug(`Refreshing authentication for server: ${serverName}`);
    
    // Remove cached authentication
    this.authCache.delete(serverName);
    
    // Re-authenticate
    return await this.authenticate(serverName);
  }

  /**
   * Resolve environment variables in strings
   */
  resolveEnvironmentVariables(str) {
    if (typeof str !== 'string') return str;
    
    return str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const [name, defaultValue] = varName.split(':');
      return process.env[name] || defaultValue || match;
    });
  }

  /**
   * Load cached tokens from storage
   */
  async loadCachedTokens() {
    // In a real implementation, you might load from secure storage
    this.logger.debug('Loading cached tokens (placeholder)');
  }

  /**
   * Validate existing sessions
   */
  async validateSessions() {
    this.logger.debug('Validating existing sessions');
    
    for (const [serverName, auth] of this.authCache.entries()) {
      if (!this.isAuthValid(auth)) {
        this.authCache.delete(serverName);
        this.logger.debug(`Removed expired authentication for server: ${serverName}`);
      }
    }
  }

  /**
   * Start cleanup interval for expired tokens and sessions
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpired();
    }, 300000); // 5 minutes
  }

  /**
   * Cleanup expired tokens and sessions
   */
  cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;

    // Cleanup expired authentication cache
    for (const [serverName, auth] of this.authCache.entries()) {
      if (!this.isAuthValid(auth)) {
        this.authCache.delete(serverName);
        cleaned++;
      }
    }

    // Cleanup expired tokens
    for (const [serverName, token] of this.tokens.entries()) {
      if (!this.isTokenValid(token)) {
        this.tokens.delete(serverName);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired authentication entries`);
    }
  }

  /**
   * Get authentication status for all servers
   */
  getAuthStatus() {
    const status = {};
    
    for (const [serverName, auth] of this.authCache.entries()) {
      status[serverName] = {
        authenticated: auth.authenticated,
        method: auth.method,
        valid: this.isAuthValid(auth),
        expiresAt: auth.expiresAt,
        cachedAt: auth.cachedAt
      };
    }
    
    return status;
  }

  /**
   * Clear all authentication cache
   */
  clearAuthCache() {
    this.authCache.clear();
    this.tokens.clear();
    this.sessions.clear();
    this.logger.info('Authentication cache cleared');
  }
}

module.exports = MCPAuthManager;