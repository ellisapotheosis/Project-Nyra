<#
    Nav module

    Provides simple navigation helpers that are automatically loaded when
    functions defined here are first called.  Because this module lives in
    `$BaseDir\Modules`, the bootstrap script prepends that path to
    `$env:PSModulePath`, enabling PowerShell’s module autoloading feature.
#>

function Up {
    <#
        Move up one directory.  Equivalent to `Set‑Location ..`.
    #>
    Set-Location ..
}

function Jump {
    <#
        Jump to a specific path.  Accepts a single path argument and changes
        the current location to that path.

        Example:
            Jump 'C:\Dev\Projects'
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    Set-Location $Path
}

Export-ModuleMember -Function Up, Jump