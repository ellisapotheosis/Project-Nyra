/**
 * Coordination Layer - Index
 * 
 * Exports coordination components for specialized workflows and integrations
 */

const SPARCIntegrator = require('./sparc-integrator');
const WebAppScaffolder = require('./web-app-scaffolder');

/**
 * Coordination Manager - Manages specialized coordination components
 */
class CoordinationManager {
    constructor(orchestrationManager, config = {}) {
        this.orchestration = orchestrationManager;
        this.config = {
            sparc: config.sparc || {},
            webScaffolding: config.webScaffolding || {},
            ...config
        };
        
        this.components = {
            sparc: null,
            webScaffolder: null
        };
        
        this.state = {
            initialized: false
        };
        
        this.logger = this._createLogger();
    }
    
    /**
     * Initialize coordination components
     */
    async initialize() {
        if (this.state.initialized) {
            return;
        }
        
        this.logger.info('🎯 Initializing Coordination Layer...');
        
        try {
            // Initialize SPARC Integrator
            this.components.sparc = new SPARCIntegrator(this.orchestration, this.config.sparc);
            
            // Initialize Web App Scaffolder
            this.components.webScaffolder = new WebAppScaffolder(this.orchestration, this.config.webScaffolding);
            
            this.state.initialized = true;
            this.logger.info('✅ Coordination Layer initialized');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize Coordination Layer:', error);
            throw error;
        }
    }
    
    /**
     * Get SPARC integrator
     */
    getSPARC() {
        this._ensureInitialized();
        return this.components.sparc;
    }
    
    /**
     * Get Web App Scaffolder
     */
    getWebScaffolder() {
        this._ensureInitialized();
        return this.components.webScaffolder;
    }
    
    /**
     * Execute SPARC workflow
     */
    async executeSPARCWorkflow(projectDefinition, options = {}) {
        this._ensureInitialized();
        return await this.components.sparc.executeSPARCWorkflow(projectDefinition, options);
    }
    
    /**
     * Scaffold web application
     */
    async scaffoldWebApp(templateName, projectConfig, options = {}) {
        this._ensureInitialized();
        return await this.components.webScaffolder.scaffoldWebApp(templateName, projectConfig, options);
    }
    
    /**
     * Get available web app templates
     */
    getWebAppTemplates() {
        this._ensureInitialized();
        return this.components.webScaffolder.getAvailableTemplates();
    }
    
    /**
     * Get coordination status
     */
    getStatus() {
        return {
            initialized: this.state.initialized,
            components: {
                sparc: !!this.components.sparc,
                webScaffolder: !!this.components.webScaffolder
            }
        };
    }
    
    /**
     * Ensure coordination layer is initialized
     */
    _ensureInitialized() {
        if (!this.state.initialized) {
            throw new Error('Coordination layer not initialized. Call initialize() first.');
        }
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[CoordinationManager] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[CoordinationManager] ${message}`, ...args),
            error: (message, ...args) => console.error(`[CoordinationManager] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[CoordinationManager] ${message}`, ...args)
        };
    }
}

module.exports = {
    CoordinationManager,
    SPARCIntegrator,
    WebAppScaffolder,
    
    // Factory function
    createCoordinationManager: (orchestrationManager, config = {}) => 
        new CoordinationManager(orchestrationManager, config)
};