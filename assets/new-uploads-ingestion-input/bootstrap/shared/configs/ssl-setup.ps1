<#
.SYNOPSIS
    SSL/TLS certificate generation and management for Project-Nyra

.DESCRIPTION
    Generates self-signed certificates or integrates with Let's Encrypt
    Configures Traefik for SSL termination
    Manages certificate renewal
#>

[CmdletBinding()]
param(
    [ValidateSet('self-signed', 'letsencrypt')]
    [string]$CertificateType = 'self-signed',

    [string]$Domain = 'nyra.local',

    [string[]]$SubjectAlternativeNames = @(),

    [string]$CertPath = 'C:\nyra\certs',

    [string]$Email = 'admin@nyra.local',

    [int]$ValidityDays = 365
)

$ErrorActionPreference = 'Stop'

function Write-SSLLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message
}

function New-CertificateDirectories {
    Write-SSLLog "Creating certificate directories..." -Level Info

    $directories = @(
        $CertPath,
        "$CertPath\private",
        "$CertPath\certs",
        "$CertPath\ca"
    )

    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            $null = New-Item -ItemType Directory -Path $dir -Force
            Write-SSLLog "Created: $dir" -Level Success
        }
    }

    # Set permissions
    $acl = Get-Acl $CertPath
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "BUILTIN\Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.AddAccessRule($rule)
    Set-Acl -Path $CertPath -AclObject $acl

    Write-SSLLog "Certificate directories secured" -Level Success
}

function New-SelfSignedCA {
    Write-SSLLog "Creating self-signed CA..." -Level Info

    $caParams = @{
        DnsName = "Project-Nyra Root CA"
        KeyLength = 4096
        KeyAlgorithm = 'RSA'
        HashAlgorithm = 'SHA256'
        KeyUsage = 'CertSign', 'CRLSign'
        KeyExportPolicy = 'Exportable'
        NotAfter = (Get-Date).AddYears(10)
        CertStoreLocation = 'Cert:\CurrentUser\My'
    }

    $ca = New-SelfSignedCertificate @caParams

    # Export CA certificate
    $caCertPath = "$CertPath\ca\ca.crt"
    Export-Certificate -Cert $ca -FilePath $caCertPath -Type CERT | Out-Null

    # Export CA private key
    $caKeyPath = "$CertPath\ca\ca.key"
    $password = ConvertTo-SecureString -String "ca_password_change_me" -Force -AsPlainText
    Export-PfxCertificate -Cert $ca -FilePath "$CertPath\ca\ca.pfx" -Password $password | Out-Null

    Write-SSLLog "CA certificate created: $caCertPath" -Level Success

    return $ca
}

function New-ServerCertificate {
    param($CA, [string]$ServerName)

    Write-SSLLog "Creating server certificate for: $ServerName" -Level Info

    # Build SAN list
    $sanList = @(
        "DNS:$ServerName",
        "DNS:*.$Domain",
        "DNS:localhost",
        "IP:127.0.0.1",
        "IP:192.168.1.10",
        "IP:192.168.1.11",
        "IP:192.168.1.12",
        "IP:192.168.1.13"
    )

    if ($SubjectAlternativeNames.Count -gt 0) {
        $sanList += $SubjectAlternativeNames
    }

    # Create certificate request
    $certParams = @{
        DnsName = $ServerName
        Signer = $CA
        KeyLength = 2048
        KeyAlgorithm = 'RSA'
        HashAlgorithm = 'SHA256'
        KeyUsage = 'DigitalSignature', 'KeyEncipherment'
        TextExtension = @(
            "2.5.29.37={text}1.3.6.1.5.5.7.3.1",  # Server Authentication
            "2.5.29.17={text}$($sanList -join '&')"  # Subject Alternative Name
        )
        KeyExportPolicy = 'Exportable'
        NotAfter = (Get-Date).AddDays($ValidityDays)
        CertStoreLocation = 'Cert:\CurrentUser\My'
    }

    $cert = New-SelfSignedCertificate @certParams

    # Export certificate
    $certPath = "$CertPath\certs\$ServerName.crt"
    Export-Certificate -Cert $cert -FilePath $certPath -Type CERT | Out-Null

    # Export private key (PEM format)
    $keyPath = "$CertPath\private\$ServerName.key"
    $password = ConvertTo-SecureString -String "cert_password_change_me" -Force -AsPlainText
    $pfxPath = "$CertPath\private\$ServerName.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

    # Convert to PEM (requires OpenSSL)
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        openssl pkcs12 -in $pfxPath -nocerts -nodes -out $keyPath -password pass:cert_password_change_me
        openssl pkcs12 -in $pfxPath -clcerts -nokeys -out $certPath -password pass:cert_password_change_me
    }

    Write-SSLLog "Server certificate created: $certPath" -Level Success

    return @{
        Certificate = $cert
        CertPath = $certPath
        KeyPath = $keyPath
    }
}

function New-TraefikSSLConfig {
    param($Certificates)

    Write-SSLLog "Creating Traefik SSL configuration..." -Level Info

    $traefikSSLConfig = @"
tls:
  certificates:
"@

    foreach ($cert in $Certificates) {
        $traefikSSLConfig += @"

    - certFile: /certificates/certs/$($cert.ServerName).crt
      keyFile: /certificates/private/$($cert.ServerName).key
"@
    }

    $traefikSSLConfig += @"

  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
      curvePreferences:
        - CurveP521
        - CurveP384
      sniStrict: false
"@

    $configPath = "$CertPath\traefik-tls.yml"
    Set-Content -Path $configPath -Value $traefikSSLConfig

    Write-SSLLog "Traefik SSL config created: $configPath" -Level Success
}

function Install-CACertificate {
    param($CACertPath)

    Write-SSLLog "Installing CA certificate to trust store..." -Level Info

    try {
        # Import to Trusted Root Certification Authorities
        Import-Certificate -FilePath $CACertPath -CertStoreLocation 'Cert:\LocalMachine\Root' | Out-Null

        Write-SSLLog "CA certificate installed successfully" -Level Success
    } catch {
        Write-SSLLog "Failed to install CA certificate: $_" -Level Error
        Write-SSLLog "Manual installation required: Import $CACertPath to Trusted Root CA" -Level Warning
    }
}

function New-LetsEncryptConfig {
    Write-SSLLog "Configuring Let's Encrypt..." -Level Info

    $letsEncryptConfig = @"
certificatesResolvers:
  letsencrypt:
    acme:
      email: $Email
      storage: /certificates/acme.json
      httpChallenge:
        entryPoint: web
"@

    $configPath = "$CertPath\letsencrypt.yml"
    Set-Content -Path $configPath -Value $letsEncryptConfig

    # Create acme.json with proper permissions
    $acmeJsonPath = "$CertPath\acme.json"
    Set-Content -Path $acmeJsonPath -Value "{}"

    Write-SSLLog "Let's Encrypt config created: $configPath" -Level Success
    Write-SSLLog "IMPORTANT: Configure DNS to point to this server for Let's Encrypt to work" -Level Warning
}

function Test-CertificateValidity {
    param([string]$CertPath)

    Write-SSLLog "Validating certificate..." -Level Info

    try {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertPath)

        $now = Get-Date
        $notBefore = $cert.NotBefore
        $notAfter = $cert.NotAfter

        if ($now -lt $notBefore) {
            Write-SSLLog "Certificate not yet valid (valid from: $notBefore)" -Level Warning
            return $false
        }

        if ($now -gt $notAfter) {
            Write-SSLLog "Certificate expired (expired on: $notAfter)" -Level Error
            return $false
        }

        $daysUntilExpiry = ($notAfter - $now).Days
        Write-SSLLog "Certificate valid (expires in $daysUntilExpiry days)" -Level Success

        return $true
    } catch {
        Write-SSLLog "Failed to validate certificate: $_" -Level Error
        return $false
    }
}

function New-CertificateRenewalTask {
    Write-SSLLog "Creating certificate renewal scheduled task..." -Level Info

    $action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
        -Argument "-ExecutionPolicy Bypass -File `"$PSScriptRoot\ssl-setup.ps1`" -CertificateType $CertificateType"

    $trigger = New-ScheduledTaskTrigger -Daily -At 3am

    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    $task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Renew Project-Nyra SSL certificates"

    Register-ScheduledTask -TaskName "Project-Nyra-SSL-Renewal" -InputObject $task -Force | Out-Null

    Write-SSLLog "Renewal task created: Daily at 3am" -Level Success
}

function Show-SSLSummary {
    param($Certificates)

    Write-SSLLog "" -Level Info
    Write-SSLLog "===== SSL SETUP SUMMARY =====" -Level Success
    Write-SSLLog "Certificate Type: $CertificateType" -Level Info
    Write-SSLLog "Domain: $Domain" -Level Info
    Write-SSLLog "Certificate Path: $CertPath" -Level Info
    Write-SSLLog "" -Level Info

    Write-SSLLog "Generated Certificates:" -Level Info
    foreach ($cert in $Certificates) {
        Write-SSLLog "  - $($cert.ServerName)" -Level Success
        Write-SSLLog "    Certificate: $($cert.CertPath)" -Level Info
        Write-SSLLog "    Private Key: $($cert.KeyPath)" -Level Info
    }

    Write-SSLLog "" -Level Info
    Write-SSLLog "Next Steps:" -Level Info
    Write-SSLLog "  1. Update Traefik configuration to use certificates" -Level Info
    Write-SSLLog "  2. Restart Traefik: docker restart nyra-traefik" -Level Info
    Write-SSLLog "  3. Access services via HTTPS" -Level Info

    if ($CertificateType -eq 'self-signed') {
        Write-SSLLog "" -Level Info
        Write-SSLLog "IMPORTANT: Self-signed CA certificate needs to be trusted:" -Level Warning
        Write-SSLLog "  Import $CertPath\ca\ca.crt to 'Trusted Root Certification Authorities'" -Level Warning
    }

    Write-SSLLog "=============================" -Level Success
}

# Main execution
try {
    Write-SSLLog "Project-Nyra SSL Setup" -Level Info
    Write-SSLLog "Certificate Type: $CertificateType" -Level Info

    # Create directories
    New-CertificateDirectories

    if ($CertificateType -eq 'self-signed') {
        # Create CA
        $ca = New-SelfSignedCA

        # Install CA certificate
        Install-CACertificate -CACertPath "$CertPath\ca\ca.crt"

        # Create server certificates
        $serverNames = @(
            "*.$Domain",
            "orchestrator-mini",
            "worker-rtx3090ti",
            "worker-rtx3060",
            "worker-rtx5090"
        )

        $certificates = @()
        foreach ($serverName in $serverNames) {
            $cert = New-ServerCertificate -CA $ca -ServerName $serverName
            $certificates += @{
                ServerName = $serverName
                CertPath = $cert.CertPath
                KeyPath = $cert.KeyPath
            }
        }

        # Create Traefik config
        New-TraefikSSLConfig -Certificates $certificates

        # Validate certificates
        foreach ($cert in $certificates) {
            Test-CertificateValidity -CertPath $cert.CertPath
        }

        # Create renewal task
        New-CertificateRenewalTask

        # Show summary
        Show-SSLSummary -Certificates $certificates

    } elseif ($CertificateType -eq 'letsencrypt') {
        # Configure Let's Encrypt
        New-LetsEncryptConfig

        Write-SSLLog "Let's Encrypt configured" -Level Success
        Write-SSLLog "Certificates will be automatically obtained when Traefik starts" -Level Info
        Write-SSLLog "Ensure DNS records point to this server" -Level Warning
    }

    Write-SSLLog "SSL setup completed successfully!" -Level Success

} catch {
    Write-SSLLog "SSL setup failed: $_" -Level Error
    exit 1
}
