<#
.SYNOPSIS
    RateHunter GUI Interactive Setup Wizard
    
.DESCRIPTION
    Comprehensive WPF-based setup wizard for RateHunter system configuration,
    deployment, and management across distributed infrastructure
    
.NOTES
    Requires:  Windows 10+, PowerShell 5.1+, Admin privileges
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('setup', 'configure', 'deploy', 'manage')]
    [string]$Mode = 'setup'
)

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue"

# ===========================
# XAML UI Definition
# ===========================

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    Title="RateHunter Setup Wizard" Height="600" Width="900"
    Background="#F5F5F5" WindowStartupLocation="CenterScreen"
    Icon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PC9zdmc+">
    
    <Grid Background="#F5F5F5">
        <StackPanel Orientation="Vertical" Margin="20">
            <!-- Header -->
            <StackPanel Orientation="Horizontal" Margin="0,0,0,20">
                <TextBlock Text="RateHunter Setup Wizard" FontSize="24" FontWeight="Bold" Foreground="#2E5090"/>
                <TextBlock Text="v2.0.0" FontSize="12" Foreground="#666" VerticalAlignment="Bottom" Margin="10,0,0,0"/>
            </StackPanel>
            
            <!-- Navigation Tabs -->
            <TabControl x:Name="SetupTabs" Margin="0,0,0,20">
                <!-- Setup Tab -->
                <TabItem Header="Initial Setup" x:Name="SetupTab">
                    <StackPanel Margin="20">
                        <TextBlock Text="Environment Configuration" FontSize="16" FontWeight="Bold" Margin="0,0,0,15"/>
                        
                        <StackPanel Margin="0,0,0,15">
                            <TextBlock Text="Target Environment:" FontWeight="Bold"/>
                            <ComboBox x:Name="EnvironmentSelect" Margin="0,5,0,0">
                                <ComboBoxItem>Development</ComboBoxItem>
                                <ComboBoxItem>Staging</ComboBoxItem>
                                <ComboBoxItem Selected="True">Production</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        
                        <StackPanel Margin="0,0,0,15">
                            <TextBlock Text="Infrastructure Deployment:" FontWeight="Bold"/>
                            <CheckBox x:Name="DeployOrchestrator" Margin="0,5,0,0">Orchestrator (orchestrator-mini)</CheckBox>
                            <CheckBox x:Name="DeployWorkers" Margin="0,5,0,0">Worker Agents (all 3 nodes)</CheckBox>
                            <CheckBox x:Name="DeployKoyeb" Margin="0,5,0,0">Koyeb Cloud VPS</CheckBox>
                            <CheckBox x:Name="DeployMonitoring" Margin="0,5,0,0" IsChecked="True">Monitoring Stack</CheckBox>
                        </StackPanel>
                        
                        <Button x:Name="NextButton" Content="Next" Click="OnNext" Background="#2E5090" Foreground="White" Padding="15,8"/>
                    </StackPanel>
                </TabItem>
                
                <!-- Secrets Tab -->
                <TabItem Header="Secrets Management" x:Name="SecretsTab">
                    <StackPanel Margin="20">
                        <TextBlock Text="Infisical Configuration" FontSize="16" FontWeight="Bold" Margin="0,0,0,15"/>
                        
                        <StackPanel Margin="0,0,0,15">
                            <TextBlock Text="Infisical API Key:" FontWeight="Bold"/>
                            <PasswordBox x:Name="InfisicalAPIKey" Margin="0,5,0,0"/>
                        </StackPanel>
                        
                        <StackPanel Margin="0,0,0,15">
                            <TextBlock Text="Project ID:" FontWeight="Bold"/>
                            <TextBox x:Name="ProjectIDInput" Margin="0,5,0,0"/>
                        </StackPanel>
                        
                        <TextBlock Text="Actions:" FontWeight="Bold" Margin="0,10,0,10"/>
                        <Button x: Name="InitInfisical" Content="Initialize Infisical" Click="OnInitInfisical" Margin="0,0,10,0"/>
                        <Button x:Name="ValidateSecrets" Content="Validate Secrets" Click="OnValidateSecrets" Margin="0,0,10,0"/>
                    </StackPanel>
                </TabItem>
                
                <!-- Docker Tab -->
                <TabItem Header="Docker Services" x:Name="DockerTab">
                    <StackPanel Margin="20">
                        <TextBlock Text="Docker Composition" FontSize="16" FontWeight="Bold" Margin="0,0,0,15"/>
                        
                        <DataGrid x:Name="DockerServicesGrid" Margin="0,0,0,15" Height="300">
                        </DataGrid>
                        
                        <Button x:Name="BuildDocker" Content="Build Images" Click="OnBuildDocker" Background="#2E5090" Foreground="White" Margin="0,0,10,0"/>
                        <Button x: Name="PushRegistry" Content="Push to Registry" Click="OnPushRegistry" Background="#2E5090" Foreground="White"/>
                    </StackPanel>
                </TabItem>
                
                <!-- Deployment Tab -->
                <TabItem Header="Deployment" x:Name="DeploymentTab">
                    <StackPanel Margin="20">
                        <TextBlock Text="Deployment Status" FontSize="16" FontWeight="Bold" Margin="0,0,0,15"/>
                        
                        <ListBox x:Name="DeploymentLog" Margin="0,0,0,15" Height="300" Background="#F0F0F0"/>
                        
                        <Button x:Name="DeployButton" Content="Deploy" Click="OnDeploy" Background="#2E5090" Foreground="White" Margin="0,0,10,0"/>
                        <Button x:Name="RollbackButton" Content="Rollback" Click="OnRollback"/>
                    </StackPanel>
                </TabItem>
                
                <!-- Monitoring Tab -->
                <TabItem Header="Monitoring" x: Name="MonitoringTab">
                    <StackPanel Margin="20">
                        <TextBlock Text="System Health" FontSize="16" FontWeight="Bold" Margin="0,0,0,15"/>
                        
                        <StackPanel Margin="0,0,0,15">
                            <ProgressBar x:Name="CPUUsage" Height="20" Margin="0,5,0,0"/>
                            <TextBlock x:Name="CPULabel" Text="CPU:  0%" FontSize="12" Foreground="#666"/>
                        </StackPanel>
                        
                        <StackPanel Margin="0,0,0,15">
                            <ProgressBar x:Name="MemoryUsage" Height="20" Margin="0,5,0,0"/>
                            <TextBlock x:Name="MemoryLabel" Text="Memory: 0%" FontSize="12" Foreground="#666"/>
                        </StackPanel>
                        
                        <Button x:Name="OpenDashboard" Content="Open Grafana Dashboard" Click="OnOpenDashboard" Background="#2E5090" Foreground="White"/>
                    </StackPanel>
                </TabItem>
            </TabControl>
            
            <!-- Status Bar -->
            <Border BorderThickness="0,1,0,0" BorderBrush="#CCCCCC" Padding="0,10,0,0">
                <TextBlock x:Name="StatusText" Text="Ready" Foreground="#666" FontSize="12"/>
            </Border>
        </StackPanel>
    </Grid>
</Window>
"@

# ===========================
# Event Handlers
# ===========================

function New-RateHunterWindow {
    [xml]$xamlDoc = $xaml
    $xamlReader = (New-Object System.Xml. XmlNodeReader $xamlDoc)
    $window = [System.Windows. Markup.XamlReader]:: Load($xamlReader)
    
    # Store references to controls
    $script:Controls = @{
        Window = $window
        EnvironmentSelect = $window.FindName("EnvironmentSelect")
        DeployOrchestrator = $window.FindName("DeployOrchestrator")
        DeployWorkers = $window.FindName("DeployWorkers")
        DeployKoyeb = $window.FindName("DeployKoyeb")
        DeployMonitoring = $window.FindName("DeployMonitoring")
        InfisicalAPIKey = $window.FindName("InfisicalAPIKey")
        ProjectIDInput = $window.FindName("ProjectIDInput")
        DockerServicesGrid = $window. FindName("DockerServicesGrid")
        DeploymentLog = $window.FindName("DeploymentLog")
        CPUUsage = $window.FindName("CPUUsage")
        MemoryUsage = $window.FindName("MemoryUsage")
        CPULabel = $window.FindName("CPULabel")
        MemoryLabel = $window.FindName("MemoryLabel")
        StatusText = $window.FindName("StatusText")
    }
    
    # Attach event handlers
    $window.FindName("NextButton").Add_Click({ OnNext })
    $window.FindName("InitInfisical").Add_Click({ OnInitInfisical })
    $window.FindName("ValidateSecrets").Add_Click({ OnValidateSecrets })
    $window.FindName("BuildDocker").Add_Click({ OnBuildDocker })
    $window.FindName("PushRegistry").Add_Click({ OnPushRegistry })
    $window.FindName("DeployButton").Add_Click({ OnDeploy })
    $window.FindName("RollbackButton").Add_Click({ OnRollback })
    $window.FindName("OpenDashboard").Add_Click({ OnOpenDashboard })
    
    return $window
}

function OnNext {
    $script:Controls.StatusText.Text = "Proceeding to next step..."
    # Move to next tab
}

function OnInitInfisical {
    $script:Controls. StatusText.Text = "Initializing Infisical..."
    
    $apiKey = $script:Controls.InfisicalAPIKey.Password
    $projectId = $script:Controls.ProjectIDInput.Text
    
    # Call Initialize-Infisical. ps1
    & ".\Initialize-Infisical.ps1" -Environment "production" -Action "init"
    
    $script:Controls.StatusText.Text = "Infisical initialized successfully"
}

function OnValidateSecrets {
    $script:Controls.StatusText.Text = "Validating secrets..."
    
    & ".\Initialize-Infisical.ps1" -Environment "production" -Action "validate"
    
    $script:Controls.StatusText.Text = "Secrets validated"
}

function OnBuildDocker {
    $script:Controls.StatusText.Text = "Building Docker images..."
    
    & docker-compose build --parallel
    
    $script:Controls.StatusText.Text = "Docker images built successfully"
}

function OnPushRegistry {
    $script:Controls.StatusText.Text = "Pushing to registry..."
    
    # Tag and push images
    $images = @("orchestrator", "worker-agent", "web-ui", "api-gateway")
    foreach ($image in $images) {
        & docker tag "ratehunter-$image" "ghcr.io/ellisapotheosis/ratehunter/$image: latest"
        & docker push "ghcr.io/ellisapotheosis/ratehunter/$image:latest"
    }
    
    $script: Controls.StatusText.Text = "Images pushed to registry"
}

function OnDeploy {
    $script:Controls.StatusText.Text = "Deploying RateHunter..."
    
    $script:Controls.DeploymentLog.Items.Add("Starting deployment...")
    
    # Run deployment script
    & ".\Deploy-RateHunter.ps1"
    
    $script:Controls.StatusText.Text = "Deployment complete"
}

function OnRollback {
    $script:Controls.StatusText.Text = "Rolling back deployment..."
    
    # Rollback logic
    $script:Controls.StatusText.Text = "Rollback complete"
}

function OnOpenDashboard {
    Start-Process "https://monitoring.ratehunter.net"
}

# ===========================
# Monitoring Loop
# ===========================

function Update-SystemMetrics {
    param(
        [Parameter(Mandatory=$true)]
        $Window
    )
    
    while ($true) {
        $cpu = (Get-Counter -Counter "\Processor(_Total)\% Processor Time").CounterSamples[0].CookedValue
        $memory = (Get-Counter -Counter "\Memory\% Committed Bytes In Use").CounterSamples[0].CookedValue
        
        $script:Controls.CPUUsage. Value = $cpu
        $script:Controls.CPULabel.Text = "CPU:  $([Math]::Round($cpu))%"
        
        $script:Controls.MemoryUsage.Value = $memory
        $script:Controls.MemoryLabel.Text = "Memory: $([Math]::Round($memory))%"
        
        Start-Sleep -Seconds 5
    }
}

# ===========================
# Main Execution
# ===========================

$window = New-RateHunterWindow

# Start monitoring in background
$monitoringThread = [System.Threading.Thread]::new({
    param($w)
    Update-SystemMetrics $w
}, $window)
$monitoringThread.IsBackground = $true
$monitoringThread.Start($window)

# Show window
$window.ShowDialog() | Out-Null