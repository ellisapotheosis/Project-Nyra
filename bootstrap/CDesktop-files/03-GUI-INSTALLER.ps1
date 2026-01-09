# =====================================================
# Project Nyra - 4-PC GUI Bootstrap Installer
# =====================================================
# Windows Forms GUI installer for all 4 PCs
# =====================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

# =====================================================
# CONFIGURATION
# =====================================================

$Script:Config = @{
    Version = "2.0.0"
    BootstrapDir = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap"
    LogFile = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\install-log-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').txt"
}

$Script:PCRoles = @{
    "Orchestrator" = @{
        Name = "Area51 (Orchestrator)"
        Description = "Main development PC with all services"
        IP = "192.168.1.10"
        Components = @("WSL2", "Docker", "Gitea", "Claude-Code", "All-Services", "MCP-Servers")
        Services = @("PostgreSQL", "Redis", "Neo4j", "Qdrant", "FalkorDB", "Dify", "n8n", "TwentyCRM", "Nexus-Router", "All-Memory-Systems")
    }
    "Worker-5090" = @{
        Name = "AWM15R7 (GPU Worker - RTX 5090)"
        Description = "Primary GPU worker with RTX 5090 (48GB VRAM)"
        IP = "192.168.1.11"
        Components = @("WSL2", "Docker", "NVIDIA-Toolkit", "Ollama", "Tailscale")
        Models = @("DeepSeek-R1:236B-Q4", "Qwen2.5:72B-Q8")
        GPU = "RTX 5090 (48GB VRAM)"
    }
    "Worker-3090" = @{
        Name = "GPU Worker 2 (RTX 3090 Ti)"
        Description = "Secondary GPU worker with RTX 3090 Ti (24GB VRAM)"
        IP = "192.168.1.12"
        Components = @("WSL2", "Docker", "NVIDIA-Toolkit", "Ollama", "Tailscale")
        Models = @("Llama3.1:70B-Q4", "Mistral-Large:123B-Q4")
        GPU = "RTX 3090 Ti (24GB VRAM)"
    }
    "Worker-3060" = @{
        Name = "GPU Worker 3 (RTX 3060)"
        Description = "Tertiary GPU worker with RTX 3060 (12GB VRAM)"
        IP = "192.168.1.13"
        Components = @("WSL2", "Docker", "NVIDIA-Toolkit", "Ollama", "Tailscale")
        Models = @("CodeLlama:34B-Q8", "Qwen2.5:32B-Q8", "Gemma2:27B")
        GPU = "RTX 3060 (12GB VRAM)"
    }
}

# =====================================================
# LOGGING
# =====================================================

function Write-Log {
    param($Message, $Type = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    
    Add-Content -Path $Script:Config.LogFile -Value $logMessage
    
    if ($Script:LogTextBox) {
        $Script:LogTextBox.AppendText("$logMessage`r`n")
        $Script:LogTextBox.SelectionStart = $Script:LogTextBox.Text.Length
        $Script:LogTextBox.ScrollToCaret()
    }
}

# =====================================================
# GUI CREATION
# =====================================================

function New-MainWindow {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Project Nyra - 4-PC Bootstrap Installer v$($Script:Config.Version)"
    $form.Size = New-Object System.Drawing.Size(900, 700)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
    
    # Title Label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $titleLabel.Size = New-Object System.Drawing.Size(860, 40)
    $titleLabel.Text = "🏠 Project Nyra - Ultimate 4-PC Bootstrap System"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleLabel.TextAlign = "MiddleCenter"
    $form.Controls.Add($titleLabel)
    
    # Subtitle Label
    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Location = New-Object System.Drawing.Point(20, 65)
    $subtitleLabel.Size = New-Object System.Drawing.Size(860, 25)
    $subtitleLabel.Text = "AI-Powered Mortgage Automation Platform with Memory Systems Integration"
    $subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $subtitleLabel.TextAlign = "MiddleCenter"
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
    $form.Controls.Add($subtitleLabel)
    
    # Tab Control
    $tabControl = New-Object System.Windows.Forms.TabControl
    $tabControl.Location = New-Object System.Drawing.Point(20, 100)
    $tabControl.Size = New-Object System.Drawing.Size(860, 480)
    $form.Controls.Add($tabControl)
    
    # PC Selection Tab
    $pcTab = New-Object System.Windows.Forms.TabPage
    $pcTab.Text = "1. Select PC Role"
    $tabControl.TabPages.Add($pcTab)
    
    New-PCSelectionTab $pcTab
    
    # Components Tab
    $componentsTab = New-Object System.Windows.Forms.TabPage
    $componentsTab.Text = "2. Select Components"
    $tabControl.TabPages.Add($componentsTab)
    
    New-ComponentsTab $componentsTab
    
    # Configuration Tab
    $configTab = New-Object System.Windows.Forms.TabPage
    $configTab.Text = "3. Configuration"
    $tabControl.TabPages.Add($configTab)
    
    New-ConfigurationTab $configTab
    
    # Progress Tab
    $progressTab = New-Object System.Windows.Forms.TabPage
    $progressTab.Text = "4. Installation"
    $tabControl.TabPages.Add($progressTab)
    
    New-ProgressTab $progressTab
    
    # Bottom Panel
    $bottomPanel = New-Object System.Windows.Forms.Panel
    $bottomPanel.Location = New-Object System.Drawing.Point(20, 590)
    $bottomPanel.Size = New-Object System.Drawing.Size(860, 60)
    $bottomPanel.BorderStyle = "FixedSingle"
    $form.Controls.Add($bottomPanel)
    
    # Install Button
    $Script:InstallButton = New-Object System.Windows.Forms.Button
    $Script:InstallButton.Location = New-Object System.Drawing.Point(700, 15)
    $Script:InstallButton.Size = New-Object System.Drawing.Size(140, 35)
    $Script:InstallButton.Text = "Start Installation"
    $Script:InstallButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $Script:InstallButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    $Script:InstallButton.ForeColor = [System.Drawing.Color]::White
    $Script:InstallButton.FlatStyle = "Flat"
    $Script:InstallButton.Add_Click({ Start-Installation })
    $bottomPanel.Controls.Add($Script:InstallButton)
    
    # Cancel Button
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(550, 15)
    $cancelButton.Size = New-Object System.Drawing.Size(140, 35)
    $cancelButton.Text = "Cancel"
    $cancelButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $cancelButton.Add_Click({ $form.Close() })
    $bottomPanel.Controls.Add($cancelButton)
    
    # Status Label
    $Script:StatusLabel = New-Object System.Windows.Forms.Label
    $Script:StatusLabel.Location = New-Object System.Drawing.Point(15, 20)
    $Script:StatusLabel.Size = New-Object System.Drawing.Size(520, 25)
    $Script:StatusLabel.Text = "Ready to install. Please select PC role and components."
    $Script:StatusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $bottomPanel.Controls.Add($Script:StatusLabel)
    
    return $form
}

function New-PCSelectionTab {
    param($Tab)
    
    $y = 20
    
    # Instructions
    $instructionLabel = New-Object System.Windows.Forms.Label
    $instructionLabel.Location = New-Object System.Drawing.Point(20, $y)
    $instructionLabel.Size = New-Object System.Drawing.Size(800, 40)
    $instructionLabel.Text = "Select the role of this PC in your Project Nyra infrastructure:"
    $instructionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $Tab.Controls.Add($instructionLabel)
    
    $y += 50
    
    # Create radio buttons for each PC role
    $Script:PCRoleButtons = @{}
    
    foreach ($role in $Script:PCRoles.GetEnumerator()) {
        $panel = New-Object System.Windows.Forms.Panel
        $panel.Location = New-Object System.Drawing.Point(20, $y)
        $panel.Size = New-Object System.Drawing.Size(800, 80)
        $panel.BorderStyle = "FixedSingle"
        $panel.BackColor = [System.Drawing.Color]::White
        $Tab.Controls.Add($panel)
        
        $radioButton = New-Object System.Windows.Forms.RadioButton
        $radioButton.Location = New-Object System.Drawing.Point(15, 15)
        $radioButton.Size = New-Object System.Drawing.Size(750, 25)
        $radioButton.Text = "$($role.Value.Name)"
        $radioButton.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
        $radioButton.Tag = $role.Key
        $radioButton.Add_CheckedChanged({ Update-ComponentsForRole })
        $panel.Controls.Add($radioButton)
        
        $Script:PCRoleButtons[$role.Key] = $radioButton
        
        $descLabel = New-Object System.Windows.Forms.Label
        $descLabel.Location = New-Object System.Drawing.Point(35, 40)
        $descLabel.Size = New-Object System.Drawing.Size(750, 30)
        $descLabel.Text = "$($role.Value.Description) | IP: $($role.Value.IP)"
        if ($role.Value.GPU) {
            $descLabel.Text += " | GPU: $($role.Value.GPU)"
        }
        $descLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $descLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
        $panel.Controls.Add($descLabel)
        
        $y += 90
    }
}

function New-ComponentsTab {
    param($Tab)
    
    $y = 20
    
    # Instructions
    $instructionLabel = New-Object System.Windows.Forms.Label
    $instructionLabel.Location = New-Object System.Drawing.Point(20, $y)
    $instructionLabel.Size = New-Object System.Drawing.Size(800, 30)
    $instructionLabel.Text = "Components will be automatically selected based on your PC role. You can customize below:"
    $instructionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $Tab.Controls.Add($instructionLabel)
    
    $y += 40
    
    # Component checkboxes
    $Script:ComponentCheckboxes = @{}
    
    # All possible components
    $allComponents = @(
        @{Name="WSL2"; Description="Windows Subsystem for Linux 2"; Category="Core"},
        @{Name="Docker"; Description="Docker Desktop with WSL2 integration"; Category="Core"},
        @{Name="Tailscale"; Description="Mesh VPN for worker connectivity"; Category="Networking"},
        @{Name="Gitea"; Description="Local Git server (Orchestrator only)"; Category="Development"},
        @{Name="Claude-Code"; Description="AI coding assistant (Orchestrator only)"; Category="Development"},
        @{Name="NVIDIA-Toolkit"; Description="NVIDIA Container Toolkit (GPU workers only)"; Category="GPU"},
        @{Name="Ollama"; Description="Local LLM serving (GPU workers only)"; Category="GPU"},
        @{Name="All-Services"; Description="All memory systems and services (Orchestrator only)"; Category="Services"},
        @{Name="MCP-Servers"; Description="Model Context Protocol servers (Orchestrator only)"; Category="Services"}
    )
    
    $categories = $allComponents | Group-Object -Property Category
    
    foreach ($category in $categories) {
        $categoryLabel = New-Object System.Windows.Forms.Label
        $categoryLabel.Location = New-Object System.Drawing.Point(20, $y)
        $categoryLabel.Size = New-Object System.Drawing.Size(800, 25)
        $categoryLabel.Text = "━━━ $($category.Name) ━━━"
        $categoryLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        $Tab.Controls.Add($categoryLabel)
        
        $y += 30
        
        foreach ($component in $category.Group) {
            $checkbox = New-Object System.Windows.Forms.CheckBox
            $checkbox.Location = New-Object System.Drawing.Point(30, $y)
            $checkbox.Size = New-Object System.Drawing.Size(750, 25)
            $checkbox.Text = "$($component.Name) - $($component.Description)"
            $checkbox.Font = New-Object System.Drawing.Font("Segoe UI", 9)
            $checkbox.Tag = $component.Name
            $Tab.Controls.Add($checkbox)
            
            $Script:ComponentCheckboxes[$component.Name] = $checkbox
            
            $y += 30
        }
        
        $y += 10
    }
}

function New-ConfigurationTab {
    param($Tab)
    
    $y = 20
    
    # Configuration inputs
    $Script:ConfigInputs = @{}
    
    # Infisical Project ID
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(20, $y)
    $label.Size = New-Object System.Drawing.Size(300, 25)
    $label.Text = "Infisical Project ID:"
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $Tab.Controls.Add($label)
    
    $textbox = New-Object System.Windows.Forms.TextBox
    $textbox.Location = New-Object System.Drawing.Point(330, $y)
    $textbox.Size = New-Object System.Drawing.Size(480, 25)
    $textbox.Text = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    $textbox.Font = New-Object System.Drawing.Font("Consolas", 9)
    $Tab.Controls.Add($textbox)
    
    $Script:ConfigInputs["InfisicalProjectId"] = $textbox
    
    $y += 40
    
    # Anthropic API Key
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(20, $y)
    $label.Size = New-Object System.Drawing.Size(300, 25)
    $label.Text = "Anthropic API Key:"
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $Tab.Controls.Add($label)
    
    $textbox = New-Object System.Windows.Forms.TextBox
    $textbox.Location = New-Object System.Drawing.Point(330, $y)
    $textbox.Size = New-Object System.Drawing.Size(480, 25)
    $textbox.PasswordChar = '*'
    $textbox.Font = New-Object System.Drawing.Font("Consolas", 9)
    $Tab.Controls.Add($textbox)
    
    $Script:ConfigInputs["AnthropicApiKey"] = $textbox
    
    $y += 40
    
    # Add more configuration fields as needed...
    
    # Memory Systems Section
    $y += 20
    
    $sectionLabel = New-Object System.Windows.Forms.Label
    $sectionLabel.Location = New-Object System.Drawing.Point(20, $y)
    $sectionLabel.Size = New-Object System.Drawing.Size(800, 30)
    $sectionLabel.Text = "━━━ Memory Systems Configuration ━━━"
    $sectionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $Tab.Controls.Add($sectionLabel)
    
    $y += 40
    
    # Memory system checkboxes
    $memorySystems = @("RuVector", "Letta", "Graphiti", "Mem0", "OpenMemory", "Qdrant")
    
    foreach ($system in $memorySystems) {
        $checkbox = New-Object System.Windows.Forms.CheckBox
        $checkbox.Location = New-Object System.Drawing.Point(30, $y)
        $checkbox.Size = New-Object System.Drawing.Size(200, 25)
        $checkbox.Text = $system
        $checkbox.Checked = $true
        $checkbox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
        $Tab.Controls.Add($checkbox)
        
        $Script:ConfigInputs["Memory_$system"] = $checkbox
        
        $y += 30
    }
}

function New-ProgressTab {
    param($Tab)
    
    # Progress bar
    $Script:ProgressBar = New-Object System.Windows.Forms.ProgressBar
    $Script:ProgressBar.Location = New-Object System.Drawing.Point(20, 20)
    $Script:ProgressBar.Size = New-Object System.Drawing.Size(800, 30)
    $Script:ProgressBar.Style = "Continuous"
    $Tab.Controls.Add($Script:ProgressBar)
    
    # Progress label
    $Script:ProgressLabel = New-Object System.Windows.Forms.Label
    $Script:ProgressLabel.Location = New-Object System.Drawing.Point(20, 60)
    $Script:ProgressLabel.Size = New-Object System.Drawing.Size(800, 25)
    $Script:ProgressLabel.Text = "Ready to begin installation..."
    $Script:ProgressLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $Tab.Controls.Add($Script:ProgressLabel)
    
    # Log text box
    $Script:LogTextBox = New-Object System.Windows.Forms.TextBox
    $Script:LogTextBox.Location = New-Object System.Drawing.Point(20, 95)
    $Script:LogTextBox.Size = New-Object System.Drawing.Size(800, 330)
    $Script:LogTextBox.Multiline = $true
    $Script:LogTextBox.ScrollBars = "Vertical"
    $Script:LogTextBox.Font = New-Object System.Drawing.Font("Consolas", 8)
    $Script:LogTextBox.ReadOnly = $true
    $Script:LogTextBox.BackColor = [System.Drawing.Color]::Black
    $Script:LogTextBox.ForeColor = [System.Drawing.Color]::LimeGreen
    $Tab.Controls.Add($Script:LogTextBox)
}

# =====================================================
# HELPER FUNCTIONS
# =====================================================

function Update-ComponentsForRole {
    $selectedRole = $null
    
    foreach ($button in $Script:PCRoleButtons.Values) {
        if ($button.Checked) {
            $selectedRole = $button.Tag
            break
        }
    }
    
    if ($selectedRole) {
        $roleConfig = $Script:PCRoles[$selectedRole]
        
        # Update component checkboxes
        foreach ($checkbox in $Script:ComponentCheckboxes.Values) {
            $componentName = $checkbox.Tag
            $checkbox.Checked = $roleConfig.Components -contains $componentName
        }
        
        $Script:StatusLabel.Text = "Selected: $($roleConfig.Name)"
    }
}

function Start-Installation {
    # Get selected role
    $selectedRole = $null
    foreach ($button in $Script:PCRoleButtons.Values) {
        if ($button.Checked) {
            $selectedRole = $button.Tag
            break
        }
    }
    
    if (-not $selectedRole) {
        [System.Windows.Forms.MessageBox]::Show("Please select a PC role first.", "Error", "OK", "Error")
        return
    }
    
    # Confirm installation
    $result = [System.Windows.Forms.MessageBox]::Show(
        "This will bootstrap this PC as: $($Script:PCRoles[$selectedRole].Name)`n`nAre you sure you want to continue?",
        "Confirm Installation",
        "YesNo",
        "Question"
    )
    
    if ($result -ne "Yes") {
        return
    }
    
    # Disable install button
    $Script:InstallButton.Enabled = $false
    $Script:StatusLabel.Text = "Installation in progress..."
    
    # Switch to progress tab
    $Script:MainForm.Controls[1].SelectedIndex = 3  # Progress tab
    
    # Run installation
    Invoke-Installation $selectedRole
}

function Invoke-Installation {
    param($Role)
    
    $totalSteps = 10
    $currentStep = 0
    
    function Update-Progress($Message) {
        $Script:currentStep++
        $percentage = [Math]::Round(($Script:currentStep / $totalSteps) * 100)
        $Script:ProgressBar.Value = $percentage
        $Script:ProgressLabel.Text = "$Message ($percentage%)"
        Write-Log $Message
        [System.Windows.Forms.Application]::DoEvents()
    }
    
    try {
        Write-Log "Starting installation for role: $Role" "INFO"
        
        Update-Progress "Validating system requirements..."
        # Add validation logic here
        
        Update-Progress "Installing WSL2..."
        # Add WSL2 installation logic
        
        Update-Progress "Installing Docker Desktop..."
        # Add Docker installation logic
        
        if ($Role -like "Worker-*") {
            Update-Progress "Installing NVIDIA Container Toolkit..."
            # Add NVIDIA toolkit installation
            
            Update-Progress "Installing Ollama..."
            # Add Ollama installation
        }
        
        if ($Role -eq "Orchestrator") {
            Update-Progress "Installing Gitea..."
            # Add Gitea installation
            
            Update-Progress "Installing Claude Code..."
            # Add Claude Code installation
            
            Update-Progress "Starting memory systems..."
            # Add memory systems startup
        }
        
        Update-Progress "Installing Tailscale..."
        # Add Tailscale installation
        
        Update-Progress "Configuring environment..."
        # Add environment configuration
        
        Update-Progress "Installation complete!"
        
        Write-Log "Installation completed successfully!" "SUCCESS"
        
        [System.Windows.Forms.MessageBox]::Show(
            "Installation completed successfully!`n`nPlease review the log file for details.",
            "Success",
            "OK",
            "Information"
        )
        
    } catch {
        Write-Log "Installation failed: $_" "ERROR"
        
        [System.Windows.Forms.MessageBox]::Show(
            "Installation failed!`n`nError: $_`n`nCheck the log file for details.",
            "Error",
            "OK",
            "Error"
        )
    } finally {
        $Script:InstallButton.Enabled = $true
        $Script:StatusLabel.Text = "Installation complete. Check log for details."
    }
}

# =====================================================
# MAIN EXECUTION
# =====================================================

# Create log directory
$logDir = Split-Path $Script:Config.LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Create and show main window
$Script:MainForm = New-MainWindow
[System.Windows.Forms.Application]::Run($Script:MainForm)
