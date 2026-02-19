param(
    [string]$ProjectRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
)

# Sync Archon Extensions to Open WebUI
function Sync-ArchonExtensions {
    $archonExtPath = Join-Path $ProjectRoot "nyra-mcp\integrations\archon-extensions"
    $owuiExtPath = Join-Path $ProjectRoot "nyra-mcp\integrations\owui-plugins\archon"
    
    # Create destination if not exists
    if (!(Test-Path $owuiExtPath)) {
        New-Item -Path $owuiExtPath -ItemType Directory
    }
    
    # Copy Archon extensions to Open WebUI
    Copy-Item -Path "$archonExtPath\*" -Destination $owuiExtPath -Recurse -Force
}

# Configure MetaMCP Proxy Routing
function Configure-MetaMCPProxy {
    $proxyConfig = @{
        routes = @{
            "/archon" = "http://archon-ui:8080"
            "/owui" = "http://open-webui:3000"
        }
        auth = @{
            provider = "infisical"
            mode = "jwt"
        }
    }
    
    $proxyConfigPath = Join-Path $ProjectRoot "nyra-mcp\channels\proxy-config.yml"
    $proxyConfig | ConvertTo-Yaml | Out-File $proxyConfigPath
}

# Main Integration Function
function Integrate-ArchonOpenWebUI {
    Sync-ArchonExtensions
    Configure-MetaMCPProxy
    
    # Rebuild and restart services
    docker-compose -f "$ProjectRoot\nyra-infra\compose\compose.ui-integration.yml" up -d --build
}

# Execute Integration
Integrate-ArchonOpenWebUI