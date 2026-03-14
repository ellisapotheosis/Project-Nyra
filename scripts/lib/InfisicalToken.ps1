Set-StrictMode -Version Latest

$script:NyraInfisicalProjectIdDefault = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"

function Get-NyraInfisicalProjectId {
    param(
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID
    )

    if ([string]::IsNullOrWhiteSpace($ProjectId)) {
        return $script:NyraInfisicalProjectIdDefault
    }

    return $ProjectId
}

function Assert-NyraInfisicalToken {
    if ([string]::IsNullOrWhiteSpace($env:INFISICAL_TOKEN)) {
        throw "INFISICAL_TOKEN environment variable is required."
    }
}

function Get-NyraInfisicalBaseArgs {
    param(
        [string]$Environment,
        [string]$Path,
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID
    )

    Assert-NyraInfisicalToken

    if ([string]::IsNullOrWhiteSpace($Environment)) {
        throw "Infisical environment is required."
    }

    $args = @(
        "--projectId", (Get-NyraInfisicalProjectId -ProjectId $ProjectId),
        "--env", $Environment
    )

    if (-not [string]::IsNullOrWhiteSpace($Path)) {
        $args += @("--path", $Path)
    }

    return $args
}

function Invoke-NyraInfisicalRun {
    param(
        [string]$Environment,
        [string]$Path,
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID,
        [string[]]$CommandArgs
    )

    $args = @("run")
    $args += Get-NyraInfisicalBaseArgs -Environment $Environment -Path $Path -ProjectId $ProjectId
    $args += "--"
    $args += $CommandArgs

    & infisical @args
}

function Invoke-NyraInfisicalExport {
    param(
        [string]$Environment,
        [string]$Path,
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID,
        [string[]]$ExtraArgs = @()
    )

    $args = @("export")
    $args += Get-NyraInfisicalBaseArgs -Environment $Environment -Path $Path -ProjectId $ProjectId
    $args += $ExtraArgs

    & infisical @args
}

function Get-NyraInfisicalSecret {
    param(
        [string]$SecretName,
        [string]$Environment,
        [string]$Path,
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID,
        [string[]]$ExtraArgs = @()
    )

    $args = @("secrets", "get", $SecretName)
    $args += Get-NyraInfisicalBaseArgs -Environment $Environment -Path $Path -ProjectId $ProjectId
    $args += $ExtraArgs

    & infisical @args
}

function Set-NyraInfisicalSecret {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Environment,
        [string]$Path,
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID
    )

    $args = @("secrets", "set", "$Name=$Value")
    $args += Get-NyraInfisicalBaseArgs -Environment $Environment -Path $Path -ProjectId $ProjectId

    & infisical @args
}
