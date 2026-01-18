# MetaMCP Unified Integration Script

# Configuration Paths
$metamcpConfigPath = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-mcp\channels\consolidated-channels.yml"
$openWebuiPath = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-ui\open-webui"
$archonUiPath = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-ui\archon-ui"

# Function to Configure UI Integration
function Configure-UIIntegration {
    # Copy Archon UI Extensions to Open WebUI
    if (Test-Path $archonUiPath) {
        $extensionsSource = Join-Path $archonUiPath "extensions"
        $extensionsDest = Join-Path $openWebuiPath "extensions"
        
        if (!(Test-Path $extensionsDest)) {
            New-Item -Path $extensionsDest -ItemType Directory
        }
        
        Copy-Item -Path "$extensionsSource\*" -Destination $extensionsDest -Recurse -Force
    }
}

# Function to Create MetaMCP Proxy Configuration
function Create-MetaMCPProxyConfig {
    $proxyConfig = @{
        proxy = @{
            port = 12008
            routes = @(
                @{
                    path = "/archon"
                    target = "http://localhost:8080"
                },
                @{
                    path = "/owui"
                    target = "http://localhost:3000"
                },
                @{
                    path = "/claude"
                    target = "http://localhost:7070"
                }
            )
        }
    }
    
    $proxyConfigPath = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-mcp\metamcp-proxy.yml"
    $proxyConfig | ConvertTo-Yaml | Out-File $proxyConfigPath -Encoding UTF8
}

# Main Integration Function
function Invoke-MetaMCPIntegration {
    Configure-UIIntegration
    Create-MetaMCPProxyConfig
    
    # Additional integration steps can be added here
    Write-Host "MetaMCP Integration Complete"
}

# Execute Integration
Invoke-MetaMCPIntegration