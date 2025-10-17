Get-ChildItem -Path . -Recurse -Include *.ps1,*.psm1 | Unblock-File
Write-Host "Unblocked all PowerShell scripts in the tree."
