Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Get-RepoRoot {
  try {
    $p = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $p) { return $p }
  } catch {}
  return (Get-Location).Path
}

$root = Get-RepoRoot
$mcpPath = Join-Path $root ".mcp.json"

$form = New-Object System.Windows.Forms.Form
$form.Text = "Nyra Agent Importer"
$form.Size = New-Object System.Drawing.Size(720,420)
$form.StartPosition = "CenterScreen"

$lblUrl = New-Object System.Windows.Forms.Label
$lblUrl.Text = "Git URL:"
$lblUrl.Location = New-Object System.Drawing.Point(12,18)
$lblUrl.AutoSize = $true
$form.Controls.Add($lblUrl)

$txtUrl = New-Object System.Windows.Forms.TextBox
$txtUrl.Location = New-Object System.Drawing.Point(90,14)
$txtUrl.Size = New-Object System.Drawing.Size(600,24)
$form.Controls.Add($txtUrl)

$lblDest = New-Object System.Windows.Forms.Label
$lblDest.Text = "Destination:"
$lblDest.Location = New-Object System.Drawing.Point(12,54)
$lblDest.AutoSize = $true
$form.Controls.Add($lblDest)

$txtDest = New-Object System.Windows.Forms.TextBox
$txtDest.Location = New-Object System.Drawing.Point(90,50)
$txtDest.Size = New-Object System.Drawing.Size(520,24)
$txtDest.Text = $root
$form.Controls.Add($txtDest)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "…"
$btnBrowse.Location = New-Object System.Drawing.Point(618,50)
$btnBrowse.Size = New-Object System.Drawing.Size(72,24)
$btnBrowse.Add_Click({
    $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
    $fbd.SelectedPath = $txtDest.Text
    if ($fbd.ShowDialog() -eq "OK") { $txtDest.Text = $fbd.SelectedPath }
})
$form.Controls.Add($btnBrowse)

$grpMcp = New-Object System.Windows.Forms.GroupBox
$grpMcp.Text = "MCP Server Entry"
$grpMcp.Location = New-Object System.Drawing.Point(12,90)
$grpMcp.Size = New-Object System.Drawing.Size(678,180)
$form.Controls.Add($grpMcp)

$lblName = New-Object System.Windows.Forms.Label
$lblName.Text = "Name:"
$lblName.Location = New-Object System.Drawing.Point(12,30)
$lblName.AutoSize = $true
$grpMcp.Controls.Add($lblName)

$txtName = New-Object System.Windows.Forms.TextBox
$txtName.Location = New-Object System.Drawing.Point(90,26)
$txtName.Size = New-Object System.Drawing.Size(560,24)
$grpMcp.Controls.Add($txtName)

$lblType = New-Object System.Windows.Forms.Label
$lblType.Text = "Type:"
$lblType.Location = New-Object System.Drawing.Point(12,66)
$lblType.AutoSize = $true
$grpMcp.Controls.Add($lblType)

$cmbType = New-Object System.Windows.Forms.ComboBox
$cmbType.Location = New-Object System.Drawing.Point(90,62)
$cmbType.Size = New-Object System.Drawing.Size(160,24)
$cmbType.DropDownStyle = "DropDownList"
[void]$cmbType.Items.Add("stdio")
[void]$cmbType.Items.Add("http")
$cmbType.SelectedIndex = 0
$grpMcp.Controls.Add($cmbType)

$lblCmd = New-Object System.Windows.Forms.Label
$lblCmd.Text = "Command (or URL for http):"
$lblCmd.Location = New-Object System.Drawing.Point(12,102)
$lblCmd.AutoSize = $true
$grpMcp.Controls.Add($lblCmd)

$txtCmd = New-Object System.Windows.Forms.TextBox
$txtCmd.Location = New-Object System.Drawing.Point(180,98)
$txtCmd.Size = New-Object System.Drawing.Size(470,24)
$grpMcp.Controls.Add($txtCmd)

$lblArgs = New-Object System.Windows.Forms.Label
$lblArgs.Text = "Args (comma-separated):"
$lblArgs.Location = New-Object System.Drawing.Point(12,138)
$lblArgs.AutoSize = $true
$grpMcp.Controls.Add($lblArgs)

$txtArgs = New-Object System.Windows.Forms.TextBox
$txtArgs.Location = New-Object System.Drawing.Point(180,134)
$txtArgs.Size = New-Object System.Drawing.Size(470,24)
$grpMcp.Controls.Add($txtArgs)

$chkDisabled = New-Object System.Windows.Forms.CheckBox
$chkDisabled.Text = "Disabled"
$chkDisabled.Location = New-Object System.Drawing.Point(540,62)
$chkDisabled.Checked = $false
$grpMcp.Controls.Add($chkDisabled)

$btnClone = New-Object System.Windows.Forms.Button
$btnClone.Text = "Clone Repo"
$btnClone.Location = New-Object System.Drawing.Point(12,290)
$btnClone.Size = New-Object System.Drawing.Size(150,36)
$btnClone.Add_Click({
    $url = $txtUrl.Text.Trim()
    $dest = $txtDest.Text.Trim()
    if (-not $url) { [System.Windows.Forms.MessageBox]::Show("Enter a Git URL."); return }
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "git"
    $psi.Arguments = "clone `"$url`""
    $psi.WorkingDirectory = $dest
    $psi.UseShellExecute = $false
    $p = [System.Diagnostics.Process]::Start($psi)
    $p.WaitForExit()
    [System.Windows.Forms.MessageBox]::Show("Clone finished with exit code $($p.ExitCode).")
})
$form.Controls.Add($btnClone)

$btnAddMcp = New-Object System.Windows.Forms.Button
$btnAddMcp.Text = "Append to .mcp.json"
$btnAddMcp.Location = New-Object System.Drawing.Point(180,290)
$btnAddMcp.Size = New-Object System.Drawing.Size(180,36)
$btnAddMcp.Add_Click({
    if (-not (Test-Path $mcpPath)) {
        [System.Windows.Forms.MessageBox]::Show(".mcp.json not found at $mcpPath")
        return
    }
    $name = $txtName.Text.Trim()
    if (-not $name) { [System.Windows.Forms.MessageBox]::Show("Enter a server name."); return }
    $type = $cmbType.SelectedItem.ToString()
    $cmd  = $txtCmd.Text.Trim()
    $args = @()
    if ($txtArgs.Text.Trim()) {
        $args = $txtArgs.Text.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    }

    $json = Get-Content $mcpPath -Raw | ConvertFrom-Json
    if (-not $json.mcpServers) { $json | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value (@{}) }
    $entry = @{"type"=$type}
    if ($type -eq "stdio") {
      $entry["command"] = $cmd
      $entry["args"]    = $args
    } else {
      $entry["url"]     = $cmd
      if ($args.Count -gt 0) {
        $entry["headers"] = @{"Authorization"=$args[0]}
      }
    }
    if ($chkDisabled.Checked) { $entry["disabled"] = $true }

    $json.mcpServers[$name] = $entry
    ($json | ConvertTo-Json -Depth 10) | Set-Content -Path $mcpPath -Encoding UTF8
    [System.Windows.Forms.MessageBox]::Show("Appended '$name' to .mcp.json")
})
$form.Controls.Add($btnAddMcp)

$btnOpenMcp = New-Object System.Windows.Forms.Button
$btnOpenMcp.Text = "Open .mcp.json"
$btnOpenMcp.Location = New-Object System.Drawing.Point(378,290)
$btnOpenMcp.Size = New-Object System.Drawing.Size(150,36)
$btnOpenMcp.Add_Click({
    Start-Process "explorer.exe" "/select,$mcpPath"
})
$form.Controls.Add($btnOpenMcp)

$btnClose = New-Object System.Windows.Forms.Button
$btnClose.Text = "Close"
$btnClose.Location = New-Object System.Drawing.Point(540,290)
$btnClose.Size = New-Object System.Drawing.Size(150,36)
$btnClose.Add_Click({ $form.Close() })
$form.Controls.Add($btnClose)

[void]$form.ShowDialog()
