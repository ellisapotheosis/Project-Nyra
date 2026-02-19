Clear-Host
Write-Host ""
Write-Host "========================================================"
Write-Host ""
Write-Host "        __  __      _ ______     __  __  ______" -ForegroundColor Cyan
Write-Host "       / / / /___  (_) ____/__  / /_/ / / /  _/" -ForegroundColor Cyan
Write-Host "      / / / / __ \/ / / __/ _ \/ __/ / / // /" -ForegroundColor Cyan
Write-Host "     / /_/ / / / / / /_/ /  __/ /_/ /_/ // /" -ForegroundColor Cyan
Write-Host "     \____/_/ /_/_/\____/\___/\__/\____/___/" -ForegroundColor Cyan
Write-Host "          UniGetUI Package Installer Script" 
Write-Host "        Created with UniGetUI Version 3.3.6"
Write-Host ""
Write-Host "========================================================"
Write-Host ""
Write-Host "NOTES:" -ForegroundColor Yellow
Write-Host "  - The install process will not be as reliable as importing a bundle with UniGetUI. Expect issues and errors." -ForegroundColor Yellow
Write-Host "  - Packages will be installed with the install options specified at the time of creation of this script." -ForegroundColor Yellow
Write-Host "  - Error/Sucess detection may not be 100% accurate." -ForegroundColor Yellow
Write-Host "  - Some of the packages may require elevation. Some of them may ask for permission, but others may fail. Consider running this script elevated." -ForegroundColor Yellow
Write-Host "  - You can skip confirmation prompts by running this script with the parameter `/DisablePausePrompts` " -ForegroundColor Yellow
Write-Host ""
Write-Host ""
if ($args[0] -ne "/DisablePausePrompts") { pause }
Write-Host ""
Write-Host "This script will attempt to install the following packages:"
Write-Host "  - Vcredist140 from Chocolatey"
Write-Host "  - Git LFS from WinGet"
Write-Host "  - Visualstudio2019buildtools from Chocolatey"
Write-Host "  - Bca.Docker from PowerShell 7.x"
Write-Host "  - Bitwarden CLI from WinGet"
Write-Host "  - Scoop from PowerShell 7.x"
Write-Host "  - Cmd Posh Bridge from PowerShell 7.x"
Write-Host "  - DockerComposeComplet. from PowerShell 7.x"
Write-Host "  - Copilot Cli Powershell from PowerShell 7.x"
Write-Host "  - Foil from PowerShell 7.x"
Write-Host "  - Node.js (LTS) from WinGet"
Write-Host "  - Direnv from Scoop"
Write-Host "  - Google Chrome (EXE) from WinGet"
Write-Host "  - Cargo Update from Cargo"
Write-Host "  - Git Credential Manager (User) from WinGet"
Write-Host "  - Chocolatey Compatibility.extension from Chocolatey"
Write-Host "  - Invoke CommandAs from PowerShell 7.x"
Write-Host "  - Docker Credential Wincred from Chocolatey"
Write-Host "  - KB3033929 from Chocolatey"
Write-Host "  - Nuget License from .NET Tool"
Write-Host "  - NerdFonts from PowerShell 7.x"
Write-Host "  - Nuget from Scoop"
Write-Host "  - Windows Package Manager Manifest Creator from WinGet"
Write-Host "  - Dotnetfx from Chocolatey"
Write-Host "  - AnyPackage from PowerShell 7.x"
Write-Host "  - Psreadline from Scoop"
Write-Host "  - Microsoft Web Deploy from WinGet"
Write-Host "  - DockerMachine from PowerShell 7.x"
Write-Host "  - Vcredist2015 from Chocolatey"
Write-Host "  - Oh My Posh from WinGet"
Write-Host "  - Java 8 from WinGet"
Write-Host "  - Fonts from PowerShell 7.x"
Write-Host "  - Curl from Scoop"
Write-Host "  - Uv from Scoop"
Write-Host "  - Microsoft .NET SDK 8.0 from WinGet"
Write-Host "  - Gpg4win from WinGet"
Write-Host "  - Microsoft.PowerShell.SecretStore from PowerShell 7.x"
Write-Host "  - Trash Nodejs Lts from Scoop"
Write-Host "  - AnyPackage from PowerShell 7.x"
Write-Host "  - jq from WinGet"
Write-Host "  - Posh Docker from PowerShell 7.x"
Write-Host "  - GoodSync from WinGet"
Write-Host "  - Microsoft.WinGet.DSC from PowerShell 7.x"
Write-Host "  - Eclipse Temurin JDK with Hotspot 21 from WinGet"
Write-Host "  - Microsoft .NET Windows Desktop Runtime 8.0 from WinGet"
Write-Host "  - NerdFonts from PowerShell 7.x"
Write-Host "  - PowerShell Preview from WinGet"
Write-Host "  - DockerComposeCompletion from PowerShell 7.x"
Write-Host "  - Microsoft.UI.Xaml from WinGet"
Write-Host "  - Microsoft.PowerShell. from PowerShell 7.x"
Write-Host "  - Docker from Scoop"
Write-Host "  - Curl from Chocolatey"
Write-Host "  - opencode from WinGet"
Write-Host "  - Git Extensions from WinGet"
Write-Host "  - dyad from WinGet"
Write-Host "  - PSFzf from Scoop"
Write-Host "  - Copilot Cli Powershe. from PowerShell 7.x"
Write-Host "  - VeraCrypt from WinGet"
Write-Host "  - DockerHelpers from PowerShell 7.x"
Write-Host "  - Desktop App for Jira from WinGet"
Write-Host "  - Chocolatey Core.extension from Chocolatey"
Write-Host "  - git-credential-oauth from WinGet"
Write-Host "  - Gitlab Release Cli from Scoop"
Write-Host "  - GitHubView from WinGet"
Write-Host "  - Microsoft.WinGet.Client from PowerShell 7.x"
Write-Host "  - Microsoft Visual Studio Code from WinGet"
Write-Host "  - Chocolateygui from Chocolatey"
Write-Host "  - Microsoft.WinGet.RestSource from PowerShell 7.x"
Write-Host "  - Docker Machine from Scoop"
Write-Host "  - Chocolatey Windowsupdate.extension from Chocolatey"
Write-Host "  - Scoop Search from Scoop"
Write-Host "  - Ripgrep from Scoop"
Write-Host "  - Python Launcher from WinGet"
Write-Host "  - Wave from WinGet"
Write-Host "  - Microsoft.WinGet.Con. from PowerShell 7.x"
Write-Host "  - PowerType from PowerShell 7.x"
Write-Host "  - KB2919442 from Chocolatey"
Write-Host "  - Powershell Yaml from PowerShell 7.x"
Write-Host "  - ChocolateyUpdateMoni. from PowerShell 7.x"
Write-Host "  - Infisical from Scoop"
Write-Host "  - Foil from PowerShell 7.x"
Write-Host "  - Winaero Tweaker from WinGet"
Write-Host "  - Jq from Scoop"
Write-Host "  - Gitify from WinGet"
Write-Host "  - Scoop Completion from Scoop"
Write-Host "  - 7zip from Scoop"
Write-Host "  - Lazy Posh Git from PowerShell 7.x"
Write-Host "  - Vcpkg Cmake from vcpkg"
Write-Host "  - Visualstudio Installer from Chocolatey"
Write-Host "  - Posh Cargo from PowerShell 7.x"
Write-Host "  - GNU Privacy Guard from WinGet"
Write-Host "  - TreeSize Free from WinGet"
Write-Host "  - elvish from WinGet"
Write-Host "  - Scoop from Chocolatey"
Write-Host "  - Pipx from Scoop"
Write-Host "  - Microsoft Visual C++ 2013 Redistributable (x64) from WinGet"
Write-Host "  - Rapid Environment Editor from WinGet"
Write-Host "  - Docker Compose from WinGet"
Write-Host "  - ChocolateyUpdateMonitor from PowerShell 7.x"
Write-Host "  - Revo Uninstaller from WinGet"
Write-Host "  - Winget from Scoop"
Write-Host "  - Docker CLI from WinGet"
Write-Host "  - LM Studio from WinGet"
Write-Host "  - Posh Cli from Chocolatey"
Write-Host "  - Gitomatic from Scoop"
Write-Host "  - ChocolateySourceExtensions from PowerShell 7.x"
Write-Host "  - DockerMsftProviderInsider from PowerShell 7.x"
Write-Host "  - Just from Scoop"
Write-Host "  - Chatbox from WinGet"
Write-Host "  - Warp from WinGet"
Write-Host "  - Posh Git from Scoop"
Write-Host "  - opencode from WinGet"
Write-Host "  - Volta from WinGet"
Write-Host "  - PSCompletions from Chocolatey"
Write-Host "  - Chocolatey Tab Completion from PowerShell 7.x"
Write-Host "  - Meld from WinGet"
Write-Host "  - Trivy from Scoop"
Write-Host "  - Posh Winget from PowerShell 7.x"
Write-Host "  - Gsudo from Scoop"
Write-Host "  - Microsoft Visual C++ 2010 x86 Redistributable from WinGet"
Write-Host "  - Autorun Organizer from WinGet"
Write-Host "  - 7tsp from Scoop"
Write-Host "  - Stremio Service from WinGet"
Write-Host "  - Fmt from vcpkg"
Write-Host "  - Gource from WinGet"
Write-Host "  - Cargo Watch from Scoop"
Write-Host "  - Microsoft Visual C++ 2015-2022 Redistributable (x86) from WinGet"
Write-Host "  - Go Programming Language from WinGet"
Write-Host "  - Trackyon.nuget from PowerShell 7.x"
Write-Host "  - DockerStack from PowerShell 7.x"
Write-Host "  - PSWinGet from PowerShell 7.x"
Write-Host "  - AnyPackage.Npm from PowerShell 7.x"
Write-Host "  - Cagent from WinGet"
Write-Host "  - Git from WinGet"
Write-Host "  - Chocolatey from Chocolatey"
Write-Host "  - Go My Posh from PowerShell 7.x"
Write-Host "  - Adobe Acrobat Reader (64-bit) from WinGet"
Write-Host "  - Microsoft .NET Windows Desktop Runtime 9.0 from WinGet"
Write-Host "  - Python 3.13 from WinGet"
Write-Host "  - NirSoft ShellExView from WinGet"
Write-Host "  - Vcpkg Cmake Config from vcpkg"
Write-Host "  - Rust (MSVC) from WinGet"
Write-Host "  - PSReadLine from PowerShell 7.x"
Write-Host "  - Microsoft Visual C++ 2010 x64 Redistributable from WinGet"
Write-Host "  - ZLocation from PowerShell 7.x"
Write-Host "  - PowerShell from WinGet"
Write-Host "  - fd from WinGet"
Write-Host "  - KB2919355 from Chocolatey"
Write-Host "  - Intel® Driver & Support Assistant from WinGet"
Write-Host "  - Admin from PowerShell 7.x"
Write-Host "  - DockerCompletion from PowerShell 7.x"
Write-Host "  - Docker CI from PowerShell 7.x"
Write-Host "  - Sudo from Scoop"
Write-Host "  - Docker Desktop from WinGet"
Write-Host "  - Docker Tidy from PowerShell 7.x"
Write-Host "  - DockerCompletion from PowerShell 7.x"
Write-Host "  - ParkControl from WinGet"
Write-Host "  - Ollama from WinGet"
Write-Host "  - Nssm from Chocolatey"
Write-Host "  - Lessmsi from Scoop"
Write-Host "  - Visualstudio2019 Workload Vctools from Chocolatey"
Write-Host "  - Nullsoft Install System from WinGet"
Write-Host "  - PSGitCompletions from Chocolatey"
Write-Host "  - Innounp from Scoop"
Write-Host "  - Admin from PowerShell 7.x"
Write-Host "  - Hack NF from Scoop"
Write-Host "  - starship from WinGet"
Write-Host "  - Docker Compose from Scoop"
Write-Host "  - NVIDIA PhysX System Software from WinGet"
Write-Host "  - Microsoft Visual C++ 2015-2022 Redistributable (x64) from WinGet"
Write-Host "  - Google Cloud SDK from WinGet"
Write-Host "  - Ngrok from WinGet"
Write-Host "  - Nuget Package Explorer from Scoop"
Write-Host "  - Gh from Scoop"
Write-Host "  - Debian from WinGet"
Write-Host "  - SteelSeries GG from WinGet"
Write-Host "  - AnyPackage from Chocolatey"
Write-Host "  - DockerMachineCompletion from PowerShell 7.x"
Write-Host "  - DockerInstall from PowerShell 7.x"
Write-Host "  - MPC-HC from WinGet"
Write-Host "  - Ps2exe from PowerShell 7.x"
Write-Host "  - Microsoft .NET Windows Desktop Runtime 6.0 from WinGet"
Write-Host "  - Configuration from PowerShell 7.x"
Write-Host "  - Microsoft.WinGet.Configuration from PowerShell 7.x"
Write-Host "  - Chocolatey Commands from PowerShell 7.x"
Write-Host "  - GitHub Desktop from WinGet"
Write-Host "  - Cs Syntaxer from .NET Tool"
Write-Host "  - rscoop from WinGet"
Write-Host "  - AnyPackage.Scoop from Chocolatey"
Write-Host "  - bat from WinGet"
Write-Host "  - ChocolateySourceExte. from PowerShell 7.x"
Write-Host "  - WinGet-AutoUpdate-Configurator from WinGet"
Write-Host "  - Notepad++ from WinGet"
Write-Host "  - DockerMachineComplet. from PowerShell 7.x"
Write-Host "  - CredentialManager from PowerShell 7.x"
Write-Host "  - WhatsApp Beta from WinGet"
Write-Host "  - Lazydocker from Scoop"
Write-Host "  - DockerProvider from PowerShell 7.x"
Write-Host "  - CDSCDockerSwarm from PowerShell 7.x"
Write-Host "  - Rustup from Scoop"
Write-Host "  - Chocolatey Tools from PowerShell 7.x"
Write-Host "  - AnyPackage.Scoop from PowerShell 7.x"
Write-Host "  - Warp from WinGet"
Write-Host "  - Chocolatey Tab Compl. from PowerShell 7.x"
Write-Host "  - Microsoft .NET SDK 9.0 from WinGet"
Write-Host "  - Chocolatey Visualstudio.extension from Chocolatey"
Write-Host "  - dotenvx from WinGet"
Write-Host "  - Microsoft.WinGet.Res. from PowerShell 7.x"
Write-Host "  - Microsoft ASP.NET Core Runtime 8.0 from WinGet"
Write-Host "  - PostgreSQL 17 from WinGet"
Write-Host "  - PowerType from PowerShell 7.x"
Write-Host "  - golangci-lint from WinGet"
Write-Host "  - Microsoft Visual C++ 2015 UWP Desktop Runtime Package from WinGet"
Write-Host "  - NVIDIA CUDA Toolkit from WinGet"
Write-Host "  - DSC v3 Preview from WinGet"
Write-Host "  - Gitkraken from Scoop"
Write-Host "  - Docker.Build from PowerShell 7.x"
Write-Host "  - NerdFonts from PowerShell 7.x"
Write-Host "  - Codanna from Cargo"
Write-Host "  - Invoke CommandAs from PowerShell 7.x"
Write-Host "  - gsudo from WinGet"
Write-Host "  - Microsoft.WinGet.DSC from PowerShell 7.x"
Write-Host "  - Microsoft.WinGet.Cli. from PowerShell 7.x"
Write-Host "  - PackageManagement from PowerShell 7.x"
Write-Host "  - Npm Completion from Chocolatey"
Write-Host "  - Microsoft.PowerShell.SecretManagement from PowerShell 7.x"
Write-Host "  - DockerStack from PowerShell 7.x"
Write-Host "  - AnyPackage.Chocolatey from PowerShell 7.x"
Write-Host "  - Bitwarden from WinGet"
Write-Host "  - Windows Terminal Preview from WinGet"
Write-Host "  - Dark from Scoop"
Write-Host "  - 1password Cli from Chocolatey"
Write-Host "  - Chocolatey GUI from WinGet"
Write-Host "  - Yarn Completion from Chocolatey"
Write-Host "  - 1Password from WinGet"
Write-Host "  - Visual Studio BuildTools 2019 from WinGet"
Write-Host "  - SourceGit from WinGet"
Write-Host "  - Fzf from Scoop"
Write-Host "  - DockerColorPosh from PowerShell 7.x"
Write-Host "  - Vcpkg from Scoop"
Write-Host "  - Gitignore from Scoop"
Write-Host "  - VLC media player from WinGet"
Write-Host "  - Fonts from PowerShell 7.x"
Write-Host "  - Repoz from Chocolatey"
Write-Host "  - App Installer from WinGet"
Write-Host "  - KB2999226 from Chocolatey"
Write-Host "  - GitHub CLI from WinGet"
Write-Host "  - llama.cpp from WinGet"
Write-Host "  - Microsoft Visual Studio 2010 Tools for Office Runtime from WinGet"
Write-Host "  - PSReadLine from PowerShell 7.x"
Write-Host "  - 7-Zip from WinGet"
Write-Host "  - Terminal Icons from Scoop"
Write-Host "  - Scoop from PowerShell 7.x"
Write-Host "  - DockerPowershell from PowerShell 7.x"
Write-Host "  - Python Tab Completion from PowerShell 7.x"
Write-Host "  - PSReadLine from PowerShell 7.x"
Write-Host "  - Make from Chocolatey"
Write-Host "  - Rustup: the Rust toolchain installer from WinGet"
Write-Host "  - Pester from PowerShell 7.x"
Write-Host "  - Metadata from PowerShell 7.x"
Write-Host "  - Docker Cli from Chocolatey"
Write-Host "  - K-Lite Codec Pack Full from WinGet"
Write-Host "  - Posh SSH from Chocolatey"
Write-Host "  - AnyPackage.Docker from PowerShell 7.x"
Write-Host "  - Microsoft Edge from WinGet"
Write-Host "  - PSCompletions from Chocolatey"
Write-Host "  - Ollama from WinGet"
Write-Host "  - Microsoft OneDrive from WinGet"
Write-Host "  - mpv.net from WinGet"
Write-Host "  - Microsoft.PowerShell. from PowerShell 7.x"
Write-Host "  - Fonts from PowerShell 7.x"
Write-Host "  - Notion from WinGet"
Write-Host "  - Cargo Binstall from Scoop"
Write-Host "  - Delta from Scoop"
Write-Host "  - Chocolatey Dotnetfx.extension from Chocolatey"
Write-Host "  - Admin from PowerShell 7.x"
Write-Host "  - DockerMsftProviderIn. from PowerShell 7.x"
Write-Host "  - Scoop Tab Completion from Chocolatey"
Write-Host "  - Microsoft.UI.Xaml from WinGet"
Write-Host "  - DockerMsftProvider from PowerShell 7.x"
Write-Host "  - Admin from PowerShell 7.x"
Write-Host "  - Brave from WinGet"
Write-Host "  - lazygit from WinGet"
Write-Host "  - Windows Terminal from WinGet"
Write-Host "  - Gitui from Scoop"
Write-Host "  - Docker Buildx from Scoop"
Write-Host "  - DockerDsc from PowerShell 7.x"
Write-Host "  - Docker Ops from PowerShell 7.x"
Write-Host "  - KB3035131 from Chocolatey"
Write-Host "  - Spdlog from vcpkg"
Write-Host "  - Python Install Manager from WinGet"
Write-Host ""
if ($args[0] -ne "/DisablePausePrompts") { pause }
Clear-Host

$success_count=0
$failure_count=0
$commands_run=0
$results=""

$commands= @(
    'cmd.exe /C choco.exe install vcredist140 -y --no-progress',
    'cmd.exe /C winget.exe install --id "GitHub.GitLFS" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install visualstudio2019buildtools -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Bca.Docker -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Bitwarden.CLI" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Scoop -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name cmd-posh-bridge -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerComposeComplet. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name copilot-cli-powershell -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Foil -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "OpenJS.NodeJS.LTS" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/direnv',
    'cmd.exe /C winget.exe install --id "Google.Chrome.EXE" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C cargo.exe binstall --version Latest cargo-update --no-confirm',
    'cmd.exe /C winget.exe install --id "Git.GCM" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install chocolatey-compatibility.extension -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Invoke-CommandAs -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install docker-credential-wincred -y --no-progress',
    'cmd.exe /C choco.exe install KB3033929 -y --no-progress',
    'cmd.exe /C dotnet tool install nuget-license',
    'cmd.exe /C pwsh.exe Install-PSResource -Name NerdFonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/nuget',
    'cmd.exe /C winget.exe install --id "Microsoft.WingetCreate" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install dotnetfx -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install extras/psreadline',
    'cmd.exe /C winget.exe install --id "Microsoft.WebDeploy" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMachine -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install vcredist2015 -y --no-progress',
    'cmd.exe /C winget.exe install --id "JanDeDobbeleer.OhMyPosh" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Oracle.JavaRuntimeEnvironment" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Fonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/curl',
    'cmd.exe /C scoop install main/uv',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.SDK.8" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "GnuPG.Gpg4win" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.PowerShell.SecretStore -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/trash-nodejs-lts',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "jqlang.jq" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name posh-docker -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "SiberSystems.GoodSync" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.DSC -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "EclipseAdoptium.Temurin.21.JDK" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.DesktopRuntime.8" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name NerdFonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.PowerShell.Preview" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerComposeCompletion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.UI.Xaml.2.7" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.PowerShell. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/docker',
    'cmd.exe /C choco.exe install curl -y --no-progress',
    'cmd.exe /C winget.exe install --id "SST.opencode" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "GitExtensionsTeam.GitExtensions" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Dyad.Dyad" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/PSFzf',
    'cmd.exe /C pwsh.exe Install-PSResource -Name copilot-cli-powershe. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "IDRIX.VeraCrypt" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerHelpers -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "9PGNM3C7F1F7" --exact --source msstore --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install chocolatey-core.extension -y --no-progress',
    'cmd.exe /C winget.exe install --id "hickford.git-credential-oauth" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/gitlab-release-cli',
    'cmd.exe /C winget.exe install --id "DuckStudio.GitHubView" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.Client -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.VisualStudioCode" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install chocolateygui -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.RestSource -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/docker-machine',
    'cmd.exe /C choco.exe install chocolatey-windowsupdate.extension -y --no-progress',
    'cmd.exe /C scoop install main/scoop-search',
    'cmd.exe /C scoop install main/ripgrep',
    'cmd.exe /C winget.exe install --id "Python.Launcher" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "CommandLine.Wave" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.Con. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PowerType -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install KB2919442 -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name powershell-yaml -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name ChocolateyUpdateMoni. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install infisical/infisical',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Foil -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "winaero.tweaker" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/jq',
    'cmd.exe /C winget.exe install --id "Gitify.Gitify" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/scoop-completion',
    'cmd.exe /C scoop install main/7zip',
    'cmd.exe /C pwsh.exe Install-PSResource -Name lazy-posh-git -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C vcpkg install vcpkg-cmake:x64-windows',
    'cmd.exe /C choco.exe install visualstudio-installer -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name posh-cargo -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "GnuPG.GnuPG" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "XP9M26RSCLNT88" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "elves.elvish" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install Scoop -y --no-progress',
    'cmd.exe /C scoop install main/pipx',
    'cmd.exe /C winget.exe install --id "Microsoft.VCRedist.2013.x64" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "OlegDanilov.RapidEnvironmentEditor" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Docker.DockerCompose" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name ChocolateyUpdateMonitor -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "RevoUninstaller.RevoUninstaller" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/winget',
    'cmd.exe /C winget.exe install --id "Docker.DockerCLI" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "ElementLabs.LMStudio" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install posh-cli -y --no-progress',
    'cmd.exe /C scoop install main/gitomatic',
    'cmd.exe /C pwsh.exe Install-PSResource -Name chocolateySourceExtensions -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMsftProviderInsider -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/just',
    'cmd.exe /C winget.exe install --id "Bin-Huang.Chatbox" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Warp.Warp" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/posh-git',
    'cmd.exe /C winget.exe install --id "SST.opencode" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Volta.Volta" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install PSCompletions -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name chocolatey-tab-completion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Meld.Meld" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/trivy',
    'cmd.exe /C pwsh.exe Install-PSResource -Name posh-winget -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/gsudo',
    'cmd.exe /C winget.exe install --id "Microsoft.VCRedist.2010.x86" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "ChemTableSoftware.AutorunOrganizer" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/7tsp',
    'cmd.exe /C winget.exe install --id "Stremio.StremioService" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C vcpkg install fmt:x64-windows',
    'cmd.exe /C winget.exe install --id "acaudwell.Gource" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/cargo-watch',
    'cmd.exe /C winget.exe install --id "Microsoft.VCRedist.2015+.x86" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "GoLang.Go" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name trackyon.nuget -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerStack -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PSWinGet -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage.Npm -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Docker.Cagent" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Git.Git" --exact --source winget --accept-source-agreements --disable-interactivity --interactive --accept-package-agreements --force',
    'cmd.exe /C choco.exe install chocolatey -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name go-my-posh -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Adobe.Acrobat.Reader.64-bit" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.DesktopRuntime.9" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Python.Python.3.13" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "NirSoft.ShellExView" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C vcpkg install vcpkg-cmake-config:x64-windows',
    'cmd.exe /C winget.exe install --id "Rustlang.Rust.MSVC" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PSReadLine -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.VCRedist.2010.x64" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name ZLocation -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.PowerShell" --exact --source winget --accept-source-agreements --disable-interactivity --interactive --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "sharkdp.fd" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install KB2919355 -y --no-progress',
    'cmd.exe /C winget.exe install --id "Intel.IntelDriverAndSupportAssistant" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Admin -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerCompletion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Docker-CI -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/sudo',
    'cmd.exe /C winget.exe install --id "Docker.DockerDesktop" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name docker-tidy -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerCompletion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "BitSum.ParkControl" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Ollama.Ollama" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install nssm -y --no-progress',
    'cmd.exe /C scoop install main/lessmsi',
    'cmd.exe /C choco.exe install visualstudio2019-workload-vctools -y --no-progress',
    'cmd.exe /C winget.exe install --id "NSIS.NSIS" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install PSGitCompletions -y --no-progress',
    'cmd.exe /C scoop install main/innounp',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Admin -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install nerd-fonts/Hack-NF',
    'cmd.exe /C winget.exe install --id "Starship.Starship" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/docker-compose',
    'cmd.exe /C winget.exe install --id "Nvidia.PhysX" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.VCRedist.2015+.x64" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Google.CloudSDK" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Ngrok.Ngrok" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/nuget-package-explorer',
    'cmd.exe /C scoop install main/gh',
    'cmd.exe /C winget.exe install --id "Debian.Debian" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "SteelSeries.GG" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install AnyPackage -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMachineCompletion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerInstall -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "clsid2.mpc-hc" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name ps2exe -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.DesktopRuntime.6" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Configuration -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.Configuration -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Chocolatey-Commands -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "GitHub.GitHubDesktop" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C dotnet tool install cs-syntaxer',
    'cmd.exe /C winget.exe install --id "AmarBego.Rscoop" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install AnyPackage.Scoop -y --no-progress',
    'cmd.exe /C winget.exe install --id "sharkdp.bat" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name chocolateySourceExte. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "XP89BSK82W9J28" --exact --source msstore --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Notepad++.Notepad++" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMachineComplet. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name CredentialManager -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "9NBDXK71NK08" --exact --source msstore --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/lazydocker',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerProvider -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name cDSCDockerSwarm -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/rustup',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Chocolatey-tools -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage.Scoop -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Warp.Warp" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name chocolatey-tab-compl. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.SDK.9" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install chocolatey-visualstudio.extension -y --no-progress',
    'cmd.exe /C winget.exe install --id "dotenvx.dotenvx" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.Res. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.DotNet.AspNetCore.8" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "PostgreSQL.PostgreSQL.17" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PowerType -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "GolangCI.golangci-lint" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.VCLibs.Desktop.14" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Nvidia.CUDA" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.DSC.Preview" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/gitkraken',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Docker.Build -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name NerdFonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C cargo.exe binstall --version Latest codanna --no-confirm',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Invoke-CommandAs -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "gerardog.gsudo" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.DSC -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.WinGet.Cli. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PackageManagement -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install npm-completion -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.PowerShell.SecretManagement -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerStack -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage.Chocolatey -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Bitwarden.Bitwarden" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.WindowsTerminal.Preview" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/dark',
    'cmd.exe /C choco.exe install 1password-cli -y --no-progress',
    'cmd.exe /C winget.exe install --id "Chocolatey.ChocolateyGUI" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install yarn-completion -y --no-progress',
    'cmd.exe /C winget.exe install --id "AgileBits.1Password" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.VisualStudio.2019.BuildTools" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "sourcegit-scm.SourceGit" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/fzf',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerColorPosh -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C scoop install main/vcpkg',
    'cmd.exe /C scoop install main/gitignore',
    'cmd.exe /C winget.exe install --id "VideoLAN.VLC" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Fonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install repoz -y --no-progress',
    'cmd.exe /C winget.exe install --id "Microsoft.AppInstaller" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install KB2999226 -y --no-progress',
    'cmd.exe /C winget.exe install --id "GitHub.cli" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "ggml.llamacpp" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.VSTOR" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PSReadLine -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "7zip.7zip" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install extras/terminal-icons',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Scoop -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerPowershell -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name python-tab-completion -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name PSReadLine -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install make -y --no-progress',
    'cmd.exe /C winget.exe install --id "Rustlang.Rustup" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Pester -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Metadata -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install docker-cli -y --no-progress',
    'cmd.exe /C winget.exe install --id "CodecGuide.K-LiteCodecPack.Full" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install Posh-SSH -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name AnyPackage.Docker -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Microsoft.Edge" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C choco.exe install PSCompletions -y --no-progress',
    'cmd.exe /C winget.exe install --id "Ollama.Ollama" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.OneDrive" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "mpv.net" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Microsoft.PowerShell. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Fonts -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Notion.Notion" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/cargo-binstall',
    'cmd.exe /C scoop install main/delta',
    'cmd.exe /C choco.exe install chocolatey-dotnetfx.extension -y --no-progress',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Admin -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMsftProviderIn. -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install scoop-tab-completion -y --no-progress',
    'cmd.exe /C winget.exe install --id "Microsoft.UI.Xaml.2.8" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerMsftProvider -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Admin -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C winget.exe install --id "Brave.Brave" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "JesseDuffield.lazygit" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C winget.exe install --id "Microsoft.WindowsTerminal" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force',
    'cmd.exe /C scoop install main/gitui',
    'cmd.exe /C scoop install main/docker-buildx',
    'cmd.exe /C pwsh.exe Install-PSResource -Name DockerDsc -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C pwsh.exe Install-PSResource -Name Docker-Ops -Confirm:$false -TrustRepository -AcceptLicense -Scope CurrentUser',
    'cmd.exe /C choco.exe install KB3035131 -y --no-progress',
    'cmd.exe /C vcpkg install spdlog:x64-windows',
    'cmd.exe /C winget.exe install --id "Python.PythonInstallManager" --exact --source winget --accept-source-agreements --disable-interactivity --silent --accept-package-agreements --force'
)

foreach ($command in $commands) {
    Write-Host "Running: $command" -ForegroundColor Yellow
    cmd.exe /C $command
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[  OK  ] $command" -ForegroundColor Green
        $success_count++
        $results += "$([char]0x1b)[32m[  OK  ] $command`n"
    }
    else {
        Write-Host "[ FAIL ] $command" -ForegroundColor Red
        $failure_count++
        $results += "$([char]0x1b)[31m[ FAIL ] $command`n"
    }
    $commands_run++
    Write-Host ""
}

Write-Host "========================================================"
Write-Host "                  OPERATION SUMMARY"
Write-Host "========================================================"
Write-Host "Total commands run: $commands_run"
Write-Host "Successful: $success_count"
Write-Host "Failed: $failure_count"
Write-Host ""
Write-Host "Details:"
Write-Host "$results$([char]0x1b)[37m"
Write-Host "========================================================"

if ($failure_count -gt 0) {
    Write-Host "Some commands failed. Please check the log above." -ForegroundColor Yellow
}
else {
    Write-Host "All commands executed successfully!" -ForegroundColor Green
}
Write-Host ""
if ($args[0] -ne "/DisablePausePrompts") { pause }
exit $failure_count