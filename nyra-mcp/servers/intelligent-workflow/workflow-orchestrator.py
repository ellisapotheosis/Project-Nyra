#!/usr/bin/env python3
"""
🧠 NYRA Intelligent Development Workflow

Automatically starts relevant MCP servers, injects secrets, sets up dev databases/services,
and configures monitoring based on project type and context.
"""

import asyncio
import json
import logging
import os
import shutil
import subprocess
import yaml
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from enum import Enum
import time
import psutil
import docker
from concurrent.futures import ThreadPoolExecutor, as_completed

# Third-party imports
import aiohttp
import aiofiles
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging with XulbuX Purple theme
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

class ProjectType(Enum):
    WEBAPP = "webapp"
    API = "api" 
    MICROSERVICE = "microservice"
    FULLSTACK = "fullstack"
    AI_AGENT = "ai-agent"
    MCP_SERVER = "mcp-server"
    DATA_SCIENCE = "data-science"
    MOBILE = "mobile"
    DESKTOP = "desktop"
    UNKNOWN = "unknown"

class WorkflowStage(Enum):
    DETECTION = "detection"
    PREPARATION = "preparation"
    MCP_STARTUP = "mcp-startup"
    SECRETS_INJECTION = "secrets-injection"
    SERVICES_SETUP = "services-setup"
    MONITORING_CONFIG = "monitoring-config"
    READY = "ready"
    ERROR = "error"

@dataclass
class ProjectContext:
    path: str
    name: str
    project_type: ProjectType
    framework: Optional[str]
    language: Optional[str]
    package_files: List[str]
    config_files: List[str]
    docker_files: List[str]
    dependencies: Dict[str, Any]
    environment_vars: Dict[str, str]
    required_services: List[str]
    mcp_servers: List[str]
    monitoring_enabled: bool = True
    
@dataclass 
class WorkflowResult:
    project_context: ProjectContext
    stage: WorkflowStage
    services_started: List[str]
    mcp_servers_started: List[str]
    secrets_injected: Dict[str, str]
    monitoring_configured: bool
    execution_time: float
    errors: List[str]
    recommendations: List[str]

class ProjectDetector:
    """Detects project type and extracts context"""
    
    def __init__(self):
        self.type_indicators = {
            ProjectType.WEBAPP: {
                "files": ["index.html", "app.js", "package.json", "webpack.config.js"],
                "packages": ["react", "vue", "angular", "svelte", "webpack", "vite"],
                "frameworks": ["react", "vue", "angular", "svelte", "nextjs", "nuxt"]
            },
            ProjectType.API: {
                "files": ["app.py", "main.py", "server.js", "index.js", "Cargo.toml"],
                "packages": ["fastapi", "flask", "express", "koa", "axum", "actix-web"],
                "frameworks": ["fastapi", "flask", "express", "nestjs", "django"]
            },
            ProjectType.FULLSTACK: {
                "files": ["docker-compose.yml", "package.json", "requirements.txt"],
                "packages": ["react", "vue", "fastapi", "django", "express", "nextjs"],
                "indicators": ["frontend", "backend", "client", "server"]
            },
            ProjectType.AI_AGENT: {
                "files": ["agent.py", "main.py", "requirements.txt"],
                "packages": ["openai", "anthropic", "langchain", "transformers", "torch"],
                "keywords": ["agent", "llm", "ai", "ml", "chatbot"]
            },
            ProjectType.MCP_SERVER: {
                "files": ["mcp_server.py", "server.py", "mcp.json"],
                "packages": ["mcp", "anthropic-mcp"],
                "keywords": ["mcp", "model-context-protocol"]
            },
            ProjectType.DATA_SCIENCE: {
                "files": ["notebook.ipynb", "analysis.py", "data.csv"],
                "packages": ["jupyter", "pandas", "numpy", "scikit-learn", "matplotlib"],
                "keywords": ["analysis", "data", "ml", "notebook"]
            },
            ProjectType.MOBILE: {
                "files": ["android", "ios", "App.js", "pubspec.yaml"],
                "packages": ["react-native", "flutter", "expo"],
                "frameworks": ["react-native", "flutter", "ionic"]
            }
        }
    
    async def detect_project_type(self, project_path: str) -> ProjectContext:
        """Detect project type and extract context"""
        path = Path(project_path)
        if not path.exists():
            raise ValueError(f"Project path does not exist: {project_path}")
        
        logger.info(f"🔍 Analyzing project: {path.name}")
        
        # Collect file information
        files = self._collect_files(path)
        package_files = self._find_package_files(path)
        config_files = self._find_config_files(path) 
        docker_files = self._find_docker_files(path)
        
        # Analyze dependencies
        dependencies = await self._analyze_dependencies(path, package_files)
        
        # Detect project type
        project_type = self._detect_type(files, dependencies)
        
        # Determine framework and language
        framework = self._detect_framework(dependencies, files)
        language = self._detect_language(files, dependencies)
        
        # Determine required services and MCP servers
        required_services = self._determine_required_services(project_type, dependencies)
        mcp_servers = self._determine_required_mcp_servers(project_type, dependencies)
        
        context = ProjectContext(
            path=str(path),
            name=path.name,
            project_type=project_type,
            framework=framework,
            language=language,
            package_files=package_files,
            config_files=config_files,
            docker_files=docker_files,
            dependencies=dependencies,
            environment_vars={},
            required_services=required_services,
            mcp_servers=mcp_servers
        )
        
        logger.info(f"✅ Detected: {project_type.value} ({framework or 'unknown framework'})")
        return context
    
    def _collect_files(self, path: Path) -> List[str]:
        """Collect all relevant files in the project"""
        files = []
        for file_path in path.rglob("*"):
            if file_path.is_file() and not self._should_ignore_file(file_path):
                files.append(file_path.name.lower())
        return files
    
    def _should_ignore_file(self, file_path: Path) -> bool:
        """Check if file should be ignored"""
        ignore_patterns = [
            "node_modules", ".git", "__pycache__", ".venv", "venv",
            "target", "build", "dist", ".next", ".nuxt"
        ]
        return any(pattern in str(file_path) for pattern in ignore_patterns)
    
    def _find_package_files(self, path: Path) -> List[str]:
        """Find package manager files"""
        package_files = []
        candidates = [
            "package.json", "requirements.txt", "Pipfile", "pyproject.toml",
            "Cargo.toml", "go.mod", "composer.json", "Gemfile"
        ]
        
        for candidate in candidates:
            if (path / candidate).exists():
                package_files.append(str(path / candidate))
        
        return package_files
    
    def _find_config_files(self, path: Path) -> List[str]:
        """Find configuration files"""
        config_files = []
        patterns = [
            "*.json", "*.yml", "*.yaml", "*.toml", "*.ini", "*.conf",
            ".env*", "Dockerfile", "docker-compose*"
        ]
        
        for pattern in patterns:
            for file_path in path.glob(pattern):
                if file_path.is_file():
                    config_files.append(str(file_path))
        
        return config_files
    
    def _find_docker_files(self, path: Path) -> List[str]:
        """Find Docker-related files"""
        docker_files = []
        candidates = [
            "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
            ".dockerignore"
        ]
        
        for candidate in candidates:
            if (path / candidate).exists():
                docker_files.append(str(path / candidate))
        
        return docker_files
    
    async def _analyze_dependencies(self, path: Path, package_files: List[str]) -> Dict[str, Any]:
        """Analyze project dependencies"""
        dependencies = {"packages": [], "dev_packages": []}
        
        for package_file in package_files:
            file_path = Path(package_file)
            
            try:
                if file_path.name == "package.json":
                    async with aiofiles.open(file_path) as f:
                        data = json.loads(await f.read())
                        dependencies["packages"].extend(data.get("dependencies", {}).keys())
                        dependencies["dev_packages"].extend(data.get("devDependencies", {}).keys())
                
                elif file_path.name == "requirements.txt":
                    async with aiofiles.open(file_path) as f:
                        content = await f.read()
                        for line in content.split('\n'):
                            if line.strip() and not line.startswith('#'):
                                package = line.split('==')[0].split('>=')[0].split('<=')[0]
                                dependencies["packages"].append(package.strip())
                
                elif file_path.name == "Cargo.toml":
                    # Parse Cargo.toml for Rust dependencies
                    try:
                        with open(file_path) as f:
                            import toml
                            data = toml.load(f)
                            dependencies["packages"].extend(data.get("dependencies", {}).keys())
                    except ImportError:
                        logger.warning("toml package not available, skipping Cargo.toml parsing")
            
            except Exception as e:
                logger.warning(f"Error parsing {package_file}: {e}")
        
        return dependencies
    
    def _detect_type(self, files: List[str], dependencies: Dict[str, Any]) -> ProjectType:
        """Detect project type based on files and dependencies"""
        all_packages = dependencies.get("packages", []) + dependencies.get("dev_packages", [])
        
        # Score each project type
        scores = {ptype: 0 for ptype in ProjectType}
        
        for ptype, indicators in self.type_indicators.items():
            # Check files
            for file_indicator in indicators.get("files", []):
                if file_indicator.lower() in files:
                    scores[ptype] += 3
            
            # Check packages
            for package in indicators.get("packages", []):
                if any(package in pkg for pkg in all_packages):
                    scores[ptype] += 2
            
            # Check keywords in project structure
            for keyword in indicators.get("keywords", []):
                if any(keyword in file_name for file_name in files):
                    scores[ptype] += 1
        
        # Return highest scoring type
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        
        return ProjectType.UNKNOWN
    
    def _detect_framework(self, dependencies: Dict[str, Any], files: List[str]) -> Optional[str]:
        """Detect framework being used"""
        all_packages = dependencies.get("packages", [])
        
        framework_indicators = {
            "react": ["react"],
            "vue": ["vue"],
            "angular": ["@angular/core"],
            "nextjs": ["next"],
            "nuxt": ["nuxt"],
            "svelte": ["svelte"],
            "fastapi": ["fastapi"],
            "flask": ["flask"],
            "django": ["django"],
            "express": ["express"],
            "nestjs": ["@nestjs/core"],
            "flutter": ["flutter"],
            "react-native": ["react-native"]
        }
        
        for framework, packages in framework_indicators.items():
            if any(pkg in all_packages for pkg in packages):
                return framework
        
        return None
    
    def _detect_language(self, files: List[str], dependencies: Dict[str, Any]) -> Optional[str]:
        """Detect primary programming language"""
        extensions = {}
        for file_name in files:
            if '.' in file_name:
                ext = file_name.split('.')[-1]
                extensions[ext] = extensions.get(ext, 0) + 1
        
        # Language priority mapping
        language_map = {
            "py": "python",
            "js": "javascript", 
            "ts": "typescript",
            "rs": "rust",
            "go": "go",
            "java": "java",
            "kt": "kotlin",
            "swift": "swift",
            "dart": "dart",
            "php": "php",
            "rb": "ruby"
        }
        
        if extensions:
            primary_ext = max(extensions, key=extensions.get)
            return language_map.get(primary_ext)
        
        return None
    
    def _determine_required_services(self, project_type: ProjectType, dependencies: Dict[str, Any]) -> List[str]:
        """Determine what services this project needs"""
        services = []
        all_packages = dependencies.get("packages", [])
        
        # Database services
        if any(pkg in all_packages for pkg in ["postgresql", "psycopg2", "pg", "postgres"]):
            services.append("postgresql")
        if any(pkg in all_packages for pkg in ["redis", "redis-py"]):
            services.append("redis")
        if any(pkg in all_packages for pkg in ["mongodb", "pymongo", "mongoose"]):
            services.append("mongodb")
        
        # Message queues
        if any(pkg in all_packages for pkg in ["rabbitmq", "celery", "kombu"]):
            services.append("rabbitmq")
        
        # Search engines
        if any(pkg in all_packages for pkg in ["elasticsearch", "opensearch"]):
            services.append("elasticsearch")
        
        # Project type specific services
        if project_type in [ProjectType.WEBAPP, ProjectType.FULLSTACK]:
            if "nginx" not in services:
                services.append("nginx")  # Reverse proxy
        
        if project_type == ProjectType.AI_AGENT:
            services.append("vector-db")  # For embeddings
        
        return services
    
    def _determine_required_mcp_servers(self, project_type: ProjectType, dependencies: Dict[str, Any]) -> List[str]:
        """Determine what MCP servers this project needs"""
        mcp_servers = ["filesystem"]  # Always need filesystem
        
        # Always add GitHub for version control
        mcp_servers.append("github")
        
        # Project type specific MCP servers
        if project_type == ProjectType.AI_AGENT:
            mcp_servers.extend(["infisical", "bitwarden"])  # Need secrets for API keys
        
        if project_type in [ProjectType.API, ProjectType.MICROSERVICE, ProjectType.FULLSTACK]:
            mcp_servers.extend(["docker", "infisical"])  # Need containerization and secrets
        
        # Check for specific dependencies
        all_packages = dependencies.get("packages", [])
        if any(pkg in all_packages for pkg in ["docker", "docker-compose"]):
            if "docker" not in mcp_servers:
                mcp_servers.append("docker")
        
        return mcp_servers

class ServiceManager:
    """Manages development services (Docker containers, databases, etc.)"""
    
    def __init__(self):
        try:
            self.docker_client = docker.from_env()
        except Exception as e:
            logger.warning(f"Docker not available: {e}")
            self.docker_client = None
    
    async def start_required_services(self, context: ProjectContext) -> List[str]:
        """Start all required services for the project"""
        started_services = []
        
        logger.info(f"🚀 Starting services: {', '.join(context.required_services)}")
        
        for service in context.required_services:
            try:
                success = await self._start_service(service, context)
                if success:
                    started_services.append(service)
                    logger.info(f"✅ Started: {service}")
                else:
                    logger.warning(f"❌ Failed to start: {service}")
            except Exception as e:
                logger.error(f"Error starting {service}: {e}")
        
        return started_services
    
    async def _start_service(self, service: str, context: ProjectContext) -> bool:
        """Start a specific service"""
        if not self.docker_client:
            logger.warning("Docker not available, skipping service startup")
            return False
        
        service_configs = {
            "postgresql": {
                "image": "postgres:15-alpine",
                "environment": {
                    "POSTGRES_DB": f"{context.name}_dev",
                    "POSTGRES_USER": f"{context.name}_user", 
                    "POSTGRES_PASSWORD": "dev_password_change_in_production"
                },
                "ports": {"5432/tcp": 5432},
                "name": f"{context.name}-postgres"
            },
            "redis": {
                "image": "redis:7-alpine",
                "ports": {"6379/tcp": 6379},
                "name": f"{context.name}-redis"
            },
            "mongodb": {
                "image": "mongo:7",
                "ports": {"27017/tcp": 27017},
                "name": f"{context.name}-mongo"
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": {"80/tcp": 8080},
                "name": f"{context.name}-nginx"
            },
            "elasticsearch": {
                "image": "elasticsearch:8.11.0",
                "environment": {
                    "discovery.type": "single-node",
                    "xpack.security.enabled": "false"
                },
                "ports": {"9200/tcp": 9200},
                "name": f"{context.name}-elasticsearch"
            }
        }
        
        if service not in service_configs:
            logger.warning(f"Unknown service: {service}")
            return False
        
        config = service_configs[service]
        container_name = config["name"]
        
        try:
            # Check if container already exists and is running
            try:
                container = self.docker_client.containers.get(container_name)
                if container.status == "running":
                    logger.info(f"Service {service} already running")
                    return True
                else:
                    container.start()
                    return True
            except docker.errors.NotFound:
                # Container doesn't exist, create it
                container = self.docker_client.containers.run(
                    config["image"],
                    environment=config.get("environment", {}),
                    ports=config.get("ports", {}),
                    name=container_name,
                    detach=True,
                    restart_policy={"Name": "unless-stopped"}
                )
                
                # Wait for service to be ready
                await asyncio.sleep(2)
                return True
        
        except Exception as e:
            logger.error(f"Failed to start {service}: {e}")
            return False
    
    def get_service_status(self, context: ProjectContext) -> Dict[str, str]:
        """Get status of all required services"""
        status = {}
        
        if not self.docker_client:
            return {service: "docker_unavailable" for service in context.required_services}
        
        for service in context.required_services:
            container_name = f"{context.name}-{service}"
            try:
                container = self.docker_client.containers.get(container_name)
                status[service] = container.status
            except docker.errors.NotFound:
                status[service] = "not_found"
            except Exception as e:
                status[service] = f"error: {str(e)}"
        
        return status

class MCPServerManager:
    """Manages MCP server lifecycle"""
    
    def __init__(self, base_url: str = "http://localhost:12008"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.mcp_manager_script = Path("C:/Dev/Tools/MCP-Servers/mcp_manager.ps1")
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def start_required_servers(self, context: ProjectContext) -> List[str]:
        """Start all required MCP servers for the project"""
        started_servers = []
        
        logger.info(f"🔌 Starting MCP servers: {', '.join(context.mcp_servers)}")
        
        for server in context.mcp_servers:
            try:
                success = await self._start_mcp_server(server)
                if success:
                    started_servers.append(server)
                    logger.info(f"✅ MCP Started: {server}")
                else:
                    logger.warning(f"❌ Failed to start MCP: {server}")
            except Exception as e:
                logger.error(f"Error starting MCP {server}: {e}")
        
        return started_servers
    
    async def _start_mcp_server(self, server: str) -> bool:
        """Start a specific MCP server"""
        if not self.mcp_manager_script.exists():
            logger.error(f"MCP manager script not found: {self.mcp_manager_script}")
            return False
        
        try:
            # Use PowerShell to start MCP server
            cmd = [
                "pwsh", "-ExecutionPolicy", "Bypass", "-File", 
                str(self.mcp_manager_script), "-Action", "start", "-Target", server
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.debug(f"MCP {server} started successfully")
                return True
            else:
                logger.error(f"Failed to start MCP {server}: {stderr.decode()}")
                return False
        
        except Exception as e:
            logger.error(f"Error executing MCP manager: {e}")
            return False
    
    async def get_server_status(self) -> Dict[str, Any]:
        """Get status of all MCP servers"""
        if not self.session:
            return {"error": "Session not initialized"}
        
        try:
            async with self.session.get(f"{self.base_url}/status") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"Status check failed: {response.status}"}
        except Exception as e:
            return {"error": str(e)}

class SecretsManager:
    """Manages secret injection from Infisical"""
    
    def __init__(self):
        self.infisical_cli = shutil.which("infisical")
    
    async def inject_secrets(self, context: ProjectContext, environment: str = "dev") -> Dict[str, str]:
        """Inject secrets into project environment"""
        if not self.infisical_cli:
            logger.warning("Infisical CLI not found, skipping secret injection")
            return {}
        
        logger.info(f"🔐 Injecting secrets for environment: {environment}")
        
        try:
            # Export secrets to temporary file
            env_file = Path(context.path) / ".env.injected"
            
            cmd = [
                self.infisical_cli, "export", "--format=dotenv", 
                f"--env={environment}", "--path", str(env_file)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=context.path
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                # Read the injected secrets
                secrets = {}
                if env_file.exists():
                    async with aiofiles.open(env_file) as f:
                        content = await f.read()
                        for line in content.split('\n'):
                            if '=' in line and not line.startswith('#'):
                                key, value = line.split('=', 1)
                                secrets[key.strip()] = value.strip()
                    
                    # Clean up temporary file
                    env_file.unlink()
                
                logger.info(f"✅ Injected {len(secrets)} secrets")
                return secrets
            else:
                logger.error(f"Secret injection failed: {stderr.decode()}")
                return {}
        
        except Exception as e:
            logger.error(f"Error injecting secrets: {e}")
            return {}

class MonitoringConfigurator:
    """Configures monitoring and observability"""
    
    async def configure_monitoring(self, context: ProjectContext) -> bool:
        """Configure monitoring for the project"""
        if not context.monitoring_enabled:
            return True
        
        logger.info("📊 Configuring monitoring...")
        
        try:
            # Create monitoring configuration
            monitoring_config = self._generate_monitoring_config(context)
            
            # Write monitoring config files
            config_path = Path(context.path) / ".nyra" / "monitoring"
            config_path.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(config_path / "config.json", "w") as f:
                await f.write(json.dumps(monitoring_config, indent=2))
            
            # Generate docker-compose for monitoring stack
            monitoring_compose = self._generate_monitoring_compose(context)
            async with aiofiles.open(config_path / "docker-compose.monitoring.yml", "w") as f:
                await f.write(yaml.dump(monitoring_compose, default_flow_style=False))
            
            logger.info("✅ Monitoring configured")
            return True
        
        except Exception as e:
            logger.error(f"Error configuring monitoring: {e}")
            return False
    
    def _generate_monitoring_config(self, context: ProjectContext) -> Dict[str, Any]:
        """Generate monitoring configuration"""
        return {
            "project": {
                "name": context.name,
                "type": context.project_type.value,
                "framework": context.framework
            },
            "metrics": {
                "enabled": True,
                "port": 9090,
                "endpoints": ["/metrics", "/health"]
            },
            "logging": {
                "level": "info",
                "format": "json",
                "output": "stdout"
            },
            "alerts": {
                "enabled": True,
                "email": "dev@example.com",
                "slack_webhook": None
            },
            "dashboards": {
                "grafana": {
                    "enabled": True,
                    "port": 3001
                }
            }
        }
    
    def _generate_monitoring_compose(self, context: ProjectContext) -> Dict[str, Any]:
        """Generate Docker Compose for monitoring stack"""
        return {
            "version": "3.8",
            "services": {
                "prometheus": {
                    "image": "prom/prometheus:latest",
                    "container_name": f"{context.name}-prometheus",
                    "ports": ["9090:9090"],
                    "volumes": [
                        "./prometheus.yml:/etc/prometheus/prometheus.yml:ro"
                    ],
                    "restart": "unless-stopped"
                },
                "grafana": {
                    "image": "grafana/grafana:latest", 
                    "container_name": f"{context.name}-grafana",
                    "ports": ["3001:3000"],
                    "environment": {
                        "GF_SECURITY_ADMIN_PASSWORD": "admin"
                    },
                    "volumes": [
                        "grafana-data:/var/lib/grafana"
                    ],
                    "restart": "unless-stopped"
                }
            },
            "volumes": {
                "grafana-data": None
            }
        }

class IntelligentWorkflowOrchestrator:
    """Main orchestrator for intelligent development workflows"""
    
    def __init__(self):
        self.detector = ProjectDetector()
        self.service_manager = ServiceManager()
        self.secrets_manager = SecretsManager()
        self.monitoring_configurator = MonitoringConfigurator()
        self.mcp_manager = MCPServerManager()
    
    async def initialize_project_workflow(self, project_path: str, environment: str = "dev") -> WorkflowResult:
        """Initialize complete workflow for a project"""
        start_time = time.time()
        stage = WorkflowStage.DETECTION
        errors = []
        recommendations = []
        
        try:
            # Stage 1: Project Detection
            logger.info("🔍 Stage 1: Project Detection")
            context = await self.detector.detect_project_type(project_path)
            stage = WorkflowStage.PREPARATION
            
            # Stage 2: Preparation
            logger.info("⚙️ Stage 2: Environment Preparation")
            await self._prepare_environment(context)
            stage = WorkflowStage.MCP_STARTUP
            
            # Stage 3: MCP Server Startup
            logger.info("🔌 Stage 3: MCP Server Startup") 
            async with self.mcp_manager:
                mcp_servers_started = await self.mcp_manager.start_required_servers(context)
            stage = WorkflowStage.SECRETS_INJECTION
            
            # Stage 4: Secrets Injection
            logger.info("🔐 Stage 4: Secrets Injection")
            secrets_injected = await self.secrets_manager.inject_secrets(context, environment)
            context.environment_vars.update(secrets_injected)
            stage = WorkflowStage.SERVICES_SETUP
            
            # Stage 5: Services Setup
            logger.info("🚀 Stage 5: Services Setup")
            services_started = await self.service_manager.start_required_services(context)
            stage = WorkflowStage.MONITORING_CONFIG
            
            # Stage 6: Monitoring Configuration
            logger.info("📊 Stage 6: Monitoring Configuration")
            monitoring_configured = await self.monitoring_configurator.configure_monitoring(context)
            stage = WorkflowStage.READY
            
            # Generate recommendations
            recommendations = self._generate_recommendations(context, services_started, mcp_servers_started)
            
            execution_time = time.time() - start_time
            
            result = WorkflowResult(
                project_context=context,
                stage=stage,
                services_started=services_started,
                mcp_servers_started=mcp_servers_started,
                secrets_injected={k: "[REDACTED]" for k in secrets_injected.keys()},
                monitoring_configured=monitoring_configured,
                execution_time=execution_time,
                errors=errors,
                recommendations=recommendations
            )
            
            logger.info(f"✅ Workflow completed in {execution_time:.2f}s")
            await self._display_summary(result)
            
            return result
        
        except Exception as e:
            logger.error(f"Workflow failed at stage {stage.value}: {e}")
            errors.append(str(e))
            
            return WorkflowResult(
                project_context=context if 'context' in locals() else None,
                stage=WorkflowStage.ERROR,
                services_started=[],
                mcp_servers_started=[],
                secrets_injected={},
                monitoring_configured=False,
                execution_time=time.time() - start_time,
                errors=errors,
                recommendations=[]
            )
    
    async def _prepare_environment(self, context: ProjectContext):
        """Prepare the development environment"""
        # Create .nyra directory for workflow metadata
        nyra_dir = Path(context.path) / ".nyra"
        nyra_dir.mkdir(exist_ok=True)
        
        # Write project context for future reference
        async with aiofiles.open(nyra_dir / "context.json", "w") as f:
            context_dict = asdict(context)
            context_dict["project_type"] = context.project_type.value
            await f.write(json.dumps(context_dict, indent=2, default=str))
        
        # Create environment-specific directories
        for env in ["dev", "staging", "prod"]:
            (nyra_dir / env).mkdir(exist_ok=True)
    
    def _generate_recommendations(
        self, 
        context: ProjectContext, 
        services_started: List[str],
        mcp_servers_started: List[str]
    ) -> List[str]:
        """Generate recommendations for the project"""
        recommendations = []
        
        # Development recommendations
        if context.project_type == ProjectType.WEBAPP:
            recommendations.append("🔧 Consider setting up hot reload for faster development")
            recommendations.append("📱 Add responsive design testing tools")
        
        elif context.project_type == ProjectType.API:
            recommendations.append("📚 Set up API documentation with Swagger/OpenAPI")
            recommendations.append("🧪 Add API testing with Postman collections")
        
        elif context.project_type == ProjectType.AI_AGENT:
            recommendations.append("🤖 Set up vector database for embeddings")
            recommendations.append("📊 Add conversation logging and analytics")
        
        # Security recommendations
        if "infisical" not in mcp_servers_started:
            recommendations.append("🔐 Consider adding Infisical for secret management")
        
        # Performance recommendations
        if "redis" not in services_started and context.project_type in [ProjectType.API, ProjectType.FULLSTACK]:
            recommendations.append("⚡ Add Redis for caching to improve performance")
        
        # Monitoring recommendations
        if context.monitoring_enabled:
            recommendations.append("📊 Check Grafana dashboard at http://localhost:3001")
            recommendations.append("📈 Set up alerts for critical metrics")
        
        return recommendations
    
    async def _display_summary(self, result: WorkflowResult):
        """Display workflow completion summary"""
        context = result.project_context
        
        summary = f"""
🎉 NYRA Intelligent Workflow Complete!

📁 Project: {context.name} ({context.project_type.value})
🛠️  Framework: {context.framework or 'Unknown'}
⚡ Language: {context.language or 'Unknown'}

🔌 MCP Servers Started: {len(result.mcp_servers_started)}
   {', '.join(result.mcp_servers_started)}

🚀 Services Started: {len(result.services_started)}
   {', '.join(result.services_started)}

🔐 Secrets: {len(result.secrets_injected)} environment variables injected
📊 Monitoring: {'✅ Configured' if result.monitoring_configured else '❌ Not configured'}

⏱️  Execution Time: {result.execution_time:.2f}s

💡 Recommendations:
"""
        
        for rec in result.recommendations:
            summary += f"   {rec}\n"
        
        logger.info(summary)

# File system watcher for automatic workflow triggering
class ProjectWatcher(FileSystemEventHandler):
    """Watches for project changes and triggers workflows"""
    
    def __init__(self, orchestrator: IntelligentWorkflowOrchestrator):
        self.orchestrator = orchestrator
        self.debounce_time = 5  # seconds
        self.last_trigger = {}
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        # Check if it's a significant file change
        if self._is_significant_file(event.src_path):
            current_time = time.time()
            if (event.src_path not in self.last_trigger or 
                current_time - self.last_trigger[event.src_path] > self.debounce_time):
                
                self.last_trigger[event.src_path] = current_time
                asyncio.create_task(self._handle_project_change(event.src_path))
    
    def _is_significant_file(self, file_path: str) -> bool:
        """Check if the changed file is significant for workflow"""
        significant_files = [
            "package.json", "requirements.txt", "Pipfile", "Cargo.toml",
            "docker-compose.yml", "Dockerfile", ".env"
        ]
        return any(sig_file in file_path for sig_file in significant_files)
    
    async def _handle_project_change(self, file_path: str):
        """Handle significant project changes"""
        project_path = str(Path(file_path).parent)
        logger.info(f"📁 Project change detected: {file_path}")
        logger.info("🔄 Re-running intelligent workflow...")
        
        try:
            await self.orchestrator.initialize_project_workflow(project_path)
        except Exception as e:
            logger.error(f"Auto-workflow failed: {e}")

async def main():
    """Main CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NYRA Intelligent Development Workflow")
    parser.add_argument("project_path", help="Path to project directory")
    parser.add_argument("--environment", default="dev", help="Environment (dev/staging/prod)")
    parser.add_argument("--watch", action="store_true", help="Watch for changes and auto-trigger")
    parser.add_argument("--output", help="Output file for results")
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = IntelligentWorkflowOrchestrator()
    
    # Run workflow
    result = await orchestrator.initialize_project_workflow(
        args.project_path,
        args.environment
    )
    
    # Output results if requested
    if args.output:
        async with aiofiles.open(args.output, "w") as f:
            result_dict = asdict(result)
            result_dict["project_context"]["project_type"] = result.project_context.project_type.value
            result_dict["stage"] = result.stage.value
            await f.write(json.dumps(result_dict, indent=2, default=str))
        logger.info(f"Results written to {args.output}")
    
    # Start file watcher if requested
    if args.watch:
        logger.info("👀 Starting file watcher...")
        event_handler = ProjectWatcher(orchestrator)
        observer = Observer()
        observer.schedule(event_handler, args.project_path, recursive=True)
        observer.start()
        
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

if __name__ == "__main__":
    asyncio.run(main())