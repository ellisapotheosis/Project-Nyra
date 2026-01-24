
param(
  [string]$Role = "worker",
  [string]$InventoryRoot = "",
  [switch]$Quiet
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-OneDrivePath {
  if ($env:OneDriveCommercial -and (Test-Path $env:OneDriveCommercial)) { return $env:OneDriveCommercial }
  if ($env:OneDrive -and (Test-Path $env:OneDrive)) { return $env:OneDrive }

  $candidates = @(
    "HKCU:\Software\Microsoft\OneDrive\Accounts\Personal",
    "HKCU:\Software\Microsoft\OneDrive\Accounts\Business1",
    "HKCU:\Software\Microsoft\OneDrive\Accounts\Business2"
  )
  foreach ($k in $candidates) {
    try {
      $p = (Get-ItemProperty -Path $k -ErrorAction Stop).UserFolder
      if ($p -and (Test-Path $p)) { return $p }
    } catch {}
  }
  return $null
}

function Get-PublicIP {
  try { return (Invoke-RestMethod -Uri "https://api.ipify.org?format=json" -TimeoutSec 8).ip } catch { return $null }
}

if ([string]::IsNullOrWhiteSpace($InventoryRoot)) {
  $od = Get-OneDrivePath
  if (-not $od) { throw "Could not detect OneDrive folder. Set -InventoryRoot manually." }
  $InventoryRoot = Join-Path $od "NyraFleet\inventory"
}

$machinesDir = Join-Path $InventoryRoot "machines"
New-Item -ItemType Directory -Force -Path $machinesDir | Out-Null

$hostname = $env:COMPUTERNAME
$user = "$env:USERDOMAIN\$env:USERNAME"
$now = (Get-Date).ToString("o")

$cs = Get-CimInstance Win32_ComputerSystem
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor
$gpus = Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion
$mem = Get-CimInstance Win32_PhysicalMemory | Select-Object Capacity, Speed, Manufacturer, PartNumber
$disks = Get-CimInstance Win32_DiskDrive | Select-Object Model, Size, InterfaceType, MediaType, SerialNumber

$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed, Status
$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch "^169\.254\." } | Select-Object InterfaceAlias, IPAddress, PrefixLength
$routes = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 3 | Select-Object InterfaceAlias, NextHop, RouteMetric
$wifi = Get-NetConnectionProfile -ErrorAction SilentlyContinue | Select-Object Name, InterfaceAlias, IPv4Connectivity, NetworkCategory
$publicIp = Get-PublicIP

$tailscale = $null
try {
  if (Get-Command tailscale -ErrorAction SilentlyContinue) {
    $tsip = & tailscale ip -4 2>$null
    $tailscale = @{ ipv4 = ($tsip | Select-Object -First 1) }
  }
} catch {}

$cloudflared = $null
try {
  if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    $ver = & cloudflared version 2>$null
    $cloudflared = @{ version = ($ver | Select-Object -First 1) }
  }
} catch {}

$obj = [ordered]@{
  collected_at = $now
  role = $Role
  host = @{
    computername = $hostname
    username = $user
    manufacturer = $cs.Manufacturer
    model = $cs.Model
    total_physical_memory_bytes = [int64]$cs.TotalPhysicalMemory
  }
  os = @{
    caption = $os.Caption
    version = $os.Version
    build = $os.BuildNumber
    install_date = $os.InstallDate
    last_boot = $os.LastBootUpTime
  }
  cpu = $cpu | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed
  gpus = $gpus
  memory_modules = $mem
  disks = $disks
  network = @{
    adapters_up = $adapters
    ipv4 = $ips
    default_routes = $routes
    connection_profiles = $wifi
    public_ip = $publicIp
  }
  tools = @{
    tailscale = $tailscale
    cloudflared = $cloudflared
  }
}

$outPath = Join-Path $machinesDir "$hostname.json"
$obj | ConvertTo-Json -Depth 6 | Out-File -FilePath $outPath -Encoding utf8

$indexPath = Join-Path $InventoryRoot "index.json"
$index = @()
if (Test-Path $indexPath) {
  try { $index = Get-Content $indexPath -Raw | ConvertFrom-Json } catch { $index = @() }
}
$index = @($index | Where-Object { $_.computername -ne $hostname -and $_.hostname -ne $hostname })
$index += [pscustomobject]@{ computername=$hostname; role=$Role; updated_at=$now; file=("machines/$hostname.json") }
$index | ConvertTo-Json -Depth 4 | Out-File -FilePath $indexPath -Encoding utf8

if (-not $Quiet) {
  Write-Host "Inventory written:"
  Write-Host "  $outPath"
  Write-Host "  $indexPath"
}
