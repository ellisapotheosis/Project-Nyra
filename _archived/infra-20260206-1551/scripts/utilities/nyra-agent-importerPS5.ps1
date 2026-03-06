# nyra-agent-importer.ps1
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Log([string]$msg) {
  $ts = (Get-Date).ToString("HH:mm:ss")
  $txtLog.AppendText("[$ts] $msg`r`n")
}

function Run-Git([string]$args) {
  $p = New-Object System.Diagnostics.Process
  $p.StartInfo.FileName = "git"
  $p.StartInfo.Arguments = $args
  $p.StartInfo.RedirectStandardOutput = $true
  $p.StartInfo.RedirectStandardError  = $true
  $p.StartInfo.UseShellExecute = $false
  $p.StartInfo.CreateNoWindow = $true
  $p.Start() | Out-Null
  $out = $p.StandardOutput.ReadToEnd()
  $err = $p.StandardError.ReadToEnd()
  $p.WaitForExit()
  if ($out) { Log($out.Trim()) }
  if ($err) { Log($err.Trim()) }
  return $p.ExitCode
}

function RepoRoot {
  $p = New-Object System.Diagnostics.Process
  $p.StartInfo.FileName = "git"
  $p.StartInfo.Arguments = "rev-parse --show-toplevel"
  $p.StartInfo.RedirectStandardOutput = $true
  $p.StartInfo.RedirectStandardError  = $true
  $p.StartInfo.UseShellExecute = $false
  $p.StartInfo.CreateNoWindow = $true
  $p.Start() | Out-Null
  $out = $p.StandardOutput.ReadToEnd().Trim()
  $p.WaitForExit()
  if (-not $out) { throw "Run this from inside a git repo." }
  return $out
}

$Root = RepoRoot

function Find-EmbeddedRepos {
  Get-ChildItem -Path $Root -Recurse -Directory -Force -Filter ".git" |
    Where-Object { $_.FullName -ne (Join-Path $Root ".git") } |
    ForEach-Object { [PSCustomObject]@{ Path = (Split-Path $_.FullName -Parent) } }
}

function Vendor-One([string]$path) {
  Log "Vendoring: $path"
  Run-Git "rm -r --cached `"$path`"" | Out-Null
  $gitDir = Join-Path $path ".git"
  if (Test-Path $gitDir) { Remove-Item -Recurse -Force $gitDir }
  Run-Git "add -A `"$path`"" | Out-Null
}

function Submodule-One([string]$path) {
  Log "Submoduling: $path"
  $url = ""
  $sha = ""
  try { $url = & git -C "$path" remote get-url origin 2>$null } catch {}
  try { $sha = & git -C "$path" rev-parse HEAD 2>$null } catch {}

  if (-not $url) {
    $url = [Microsoft.VisualBasic.Interaction]::InputBox("Enter clone URL for: $path", "Submodule URL", "")
    if (-not $url) { Log "Skipped $path (no URL)"; return }
  }

  # Backup existing folder to zip
  $zip = Join-Path $Root ("backup-" + (Split-Path $path -Leaf) + "-" + (Get-Date -Format yyyyMMdd-HHmmss) + ".zip")
  [System.IO.Compression.ZipFile]::CreateFromDirectory($path, $zip)
  Log "Backup: $zip"

  # Remove from index and filesystem, then add submodule fresh
  Run-Git "rm -r --cached `"$path`"" | Out-Null
  if (Test-Path $path) { Remove-Item -Recurse -Force $path }

  $ec = Run-Git "submodule add `"$url`" `"$path`""
  if ($ec -ne 0) { Log "Failed to add submodule for $path"; return }

  if ($sha) {
    Run-Git "-C `"$path`" fetch --tags --prune" | Out-Null
    Run-Git "-C `"$path`" checkout $sha" | Out-Null
  }

  Run-Git "add .gitmodules `"$path`"" | Out-Null
}

function Commit([string]$msg) {
  Run-Git "commit -m `"$msg`""
}

function Refresh-List {
  $list.Items.Clear()
  $repos = Find-EmbeddedRepos
  foreach ($r in $repos) {
    $item = New-Object System.Windows.Forms.ListViewItem($r.Path.Substring($Root.Length+1))
    $item.Tag = $r.Path
    $item.Checked = $true
    [void]$list.Items.Add($item)
  }
  if ($list.Items.Count -eq 0) { Log "No embedded .git folders found under $Root." }
}

function Create-Branches-And-Push {
  $repoURL = [Microsoft.VisualBasic.Interaction]::InputBox("Remote URL (origin)", "Repo URL", "https://github.com/ellisapotheosis/Project-Nyra.git")
  if (-not $repoURL) { return }
  Log "Normalizing remotes to $repoURL"
  Run-Git "remote set-url origin `"$repoURL`""
  Run-Git "remote set-url --push origin `"$repoURL`""
  if ((git remote | Select-String "^production$")) {
    Run-Git "remote set-url production `"$repoURL`""
    Run-Git "remote set-url --push production `"$repoURL`""
  }

  Run-Git "fetch --all --prune"

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $backup = "backup/pre-force-$stamp"
  Run-Git "branch -f $backup origin/main"
  Run-Git "push origin $backup:$backup"
  if ((git remote | Select-String "^production$")) {
    Run-Git "push production $backup:$backup"
  }

  Run-Git "switch main"
  Run-Git "add -A"
  Run-Git "commit -m `"Savepoint before branch setup & force push`"" | Out-Null

  if (-not (& git show-ref --verify --quiet refs/heads/dev)) { Run-Git "branch dev main" }
  Run-Git "branch -f staging dev"
  Run-Git "branch -f prod dev"

  Run-Git "push -u origin dev"
  Run-Git "push -u origin staging"
  Run-Git "push -u origin prod"
  if ((git remote | Select-String "^production$")) {
    Run-Git "push -u production dev"
    Run-Git "push -u production staging"
    Run-Git "push -u production prod"
  }

  Run-Git "push --force-with-lease origin main"
  if ((git remote | Select-String "^production$")) {
    Run-Git "push --force-with-lease production main"
  }

  Log "Done: dev/staging/prod pushed (based on dev), remote main backed up to $backup."
}

# ----- UI -----
$form = New-Object System.Windows.Forms.Form
$form.Text = "Nyra Agent Importer"
$form.Size = New-Object System.Drawing.Size(900,600)
$form.StartPosition = "CenterScreen"

$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "Embedded Git repos in your project:"
$lbl.AutoSize = $true
$lbl.Location = New-Object System.Drawing.Point(10,10)
$form.Controls.Add($lbl)

$list = New-Object System.Windows.Forms.ListView
$list.CheckBoxes = $true
$list.View = [System.Windows.Forms.View]::Details
$list.FullRowSelect = $true
$list.Location = New-Object System.Drawing.Point(10,30)
$list.Size = New-Object System.Drawing.Size(860,250)
[void]$list.Columns.Add("Path (relative to repo root)", 820)
$form.Controls.Add($list)

$lblAction = New-Object System.Windows.Forms.Label
$lblAction.Text = "Action:"
$lblAction.AutoSize = $true
$lblAction.Location = New-Object System.Drawing.Point(10,290)
$form.Controls.Add($lblAction)

$action = New-Object System.Windows.Forms.ComboBox
$action.Items.AddRange(@("Vendor (strip nested .git)","Convert to Submodule"))
$action.SelectedIndex = 0
$action.DropDownStyle = "DropDownList"
$action.Location = New-Object System.Drawing.Point(65,286)
$action.Width = 220
$form.Controls.Add($action)

$btnRun = New-Object System.Windows.Forms.Button
$btnRun.Text = "Run on Selected"
$btnRun.Location = New-Object System.Drawing.Point(300,284)
$btnRun.Add_Click({
  $selected = @()
  foreach ($it in $list.Items) { if ($it.Checked) { $selected += $it.Tag } }
  if ($selected.Count -eq 0) { Log "Nothing selected."; return }

  if ($action.SelectedItem -eq "Vendor (strip nested .git)") {
    foreach ($p in $selected) { Vendor-One $p }
    Commit "Vendor embedded repos (strip nested .git)"
    Log "Vendoring complete."
  } else {
    [System.Windows.Forms.MessageBox]::Show("Submodule conversion will REPLACE folder with a fresh clone. A zip backup will be created first.","Heads up") | Out-Null
    foreach ($p in $selected) { Submodule-One $p }
    Commit "Convert selected folders to submodules"
    Log "Submodule conversion complete."
  }
})
$form.Controls.Add($btnRun)

$btnRefresh = New-Object System.Windows.Forms.Button
$btnRefresh.Text = "Refresh"
$btnRefresh.Location = New-Object System.Drawing.Point(430,284)
$btnRefresh.Add_Click({ Refresh-List })
$form.Controls.Add($btnRefresh)

$btnBranches = New-Object System.Windows.Forms.Button
$btnBranches.Text = "Create dev/staging/prod (base=dev) + Force Push main"
$btnBranches.Location = New-Object System.Drawing.Point(520,284)
$btnBranches.Width = 350
$btnBranches.Add_Click({ Create-Branches-And-Push })
$form.Controls.Add($btnBranches)

$txtLog = New-Object System.Windows.Forms.TextBox
$txtLog.Multiline = $true
$txtLog.ScrollBars = "Vertical"
$txtLog.ReadOnly = $true
$txtLog.Location = New-Object System.Drawing.Point(10,320)
$txtLog.Size = New-Object System.Drawing.Size(860,230)
$form.Controls.Add($txtLog)

$form.Add_Shown({ Refresh-List; Log "Repo root: $Root" })
[void]$form.ShowDialog()
