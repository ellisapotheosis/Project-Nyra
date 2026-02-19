<#
    User profile entry point

    This file lives in your Documents\PowerShell folder as `$PROFILE` and
    dot-sources the repository bootstrap script.  On a new machine you
    should copy this file into `C:\Users\<you>\Documents\PowerShell\` and
    ensure that the `$BaseDir` inside `bootstrap.ps1` points to the correct
    location of your profiles repository.
#>

. 'C:\Dev\Profiles\PowerShell\bootstrap-enhanced.ps1'
