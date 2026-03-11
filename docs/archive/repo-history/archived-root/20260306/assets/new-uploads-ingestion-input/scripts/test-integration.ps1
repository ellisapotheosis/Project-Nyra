# Integration Testing Script for Project-Nyra
# End-to-end workflow validation across all services
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [switch]$CleanupAfter,
    [string]$ReportPath = "reports\integration-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

Write-TestHeader "Project-Nyra Integration Testing"

$testResults = @()
$testData = @{}

# ============================================================================
# TEST DATA SETUP
# ============================================================================

Write-ColorOutput "`nPreparing test data..." -Color Cyan

$testLead = @{
    firstName = "John"
    lastName = "TestUser"
    email = "john.test@example.com"
    phone = "+1234567890"
    loanAmount = 250000
    propertyValue = 350000
    creditScore = 720
    employmentStatus = "employed"
    annualIncome = 85000
}

$testData.Lead = $testLead
$testData.TestId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-TestLog "Test ID: $($testData.TestId)" -Level "INFO"

# ============================================================================
# [1] RATEHUNTER: CREATE LEAD
# ============================================================================

Write-ColorOutput "`n[1/8] RateHunter: Create Test Lead..." -Color Cyan

$rateHunterUrl = "http://192.168.1.100:8001"

$startTime = Get-Date

try {
    # Create lead via RateHunter API
    $leadPayload = $testLead | ConvertTo-Json
    $createLeadResponse = Invoke-RestMethod -Uri "$rateHunterUrl/api/leads" -Method Post -Body $leadPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop

    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($createLeadResponse.id) {
        $testData.LeadId = $createLeadResponse.id
        $testResults += Write-TestResult -TestName "RateHunter: Create Lead" -Passed $true -Details "Lead ID: $($createLeadResponse.id)" -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "RateHunter: Create Lead" -Passed $false -Details "No lead ID returned" -Duration $duration
    }
} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    $testResults += Write-TestResult -TestName "RateHunter: Create Lead" -Passed $false -Details $_.Exception.Message -Duration $duration
}

# ============================================================================
# [2] NYRA ASSISTANT: QUALIFY LEAD
# ============================================================================

Write-ColorOutput "`n[2/8] Nyra Assistant: Qualify Lead..." -Color Cyan

$nyraAssistantUrl = "http://192.168.1.101:8003"

if ($testData.LeadId) {
    $startTime = Get-Date

    try {
        # Trigger Nyra Assistant qualification
        $qualifyPayload = @{
            leadId = $testData.LeadId
            mode = "automated"
        } | ConvertTo-Json

        $qualifyResponse = Invoke-RestMethod -Uri "$nyraAssistantUrl/api/qualify" -Method Post -Body $qualifyPayload -ContentType "application/json" -TimeoutSec 30 -ErrorAction Stop

        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($qualifyResponse.status -eq "qualified" -or $qualifyResponse.status -eq "pending") {
            $testData.QualificationId = $qualifyResponse.id
            $testResults += Write-TestResult -TestName "Nyra Assistant: Qualify Lead" -Passed $true -Details "Status: $($qualifyResponse.status)" -Duration $duration
        } else {
            $testResults += Write-TestResult -TestName "Nyra Assistant: Qualify Lead" -Passed $false -Details "Unexpected status: $($qualifyResponse.status)" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Nyra Assistant: Qualify Lead" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Nyra Assistant: Qualify Lead" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [3] MORTGAGE CRM: VERIFY LEAD IMPORT
# ============================================================================

Write-ColorOutput "`n[3/8] Mortgage CRM: Verify Lead Import..." -Color Cyan

$mortgageCrmUrl = "http://192.168.1.100:8002"

if ($testData.LeadId) {
    # Wait a bit for async processing
    Write-ColorOutput "  Waiting 5 seconds for async processing..." -Color Gray
    Start-Sleep -Seconds 5

    $startTime = Get-Date

    try {
        # Check if lead appears in CRM
        $crmLeadResponse = Invoke-RestMethod -Uri "$mortgageCrmUrl/api/leads/$($testData.LeadId)" -Method Get -TimeoutSec 10 -ErrorAction Stop

        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($crmLeadResponse.id -eq $testData.LeadId) {
            $testResults += Write-TestResult -TestName "Mortgage CRM: Lead Import" -Passed $true -Details "Lead found in CRM" -Duration $duration

            # Verify lead data integrity
            $dataMatch = $crmLeadResponse.email -eq $testLead.email
            $testResults += Write-TestResult -TestName "Mortgage CRM: Data Integrity" -Passed $dataMatch -Details "Email match: $dataMatch" -Duration 0
        } else {
            $testResults += Write-TestResult -TestName "Mortgage CRM: Lead Import" -Passed $false -Details "Lead not found in CRM" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Mortgage CRM: Lead Import" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Mortgage CRM: Lead Import" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [4] DOCUMENT UPLOAD & OCR
# ============================================================================

Write-ColorOutput "`n[4/8] Document Upload & OCR Processing..." -Color Cyan

$doclingOcrUrl = "http://192.168.1.102:8004"

if ($testData.LeadId) {
    $startTime = Get-Date

    try {
        # Create a test PDF document
        $testDocContent = @"
TEST DOCUMENT
==============
Name: $($testLead.firstName) $($testLead.lastName)
Loan Amount: $($testLead.loanAmount)
Annual Income: $($testLead.annualIncome)
Credit Score: $($testLead.creditScore)

This is a test document for integration testing.
"@

        $testDocPath = [System.IO.Path]::GetTempFileName() + ".txt"
        $testDocContent | Out-File -FilePath $testDocPath -Encoding UTF8

        # Upload document
        $uploadPayload = @{
            leadId = $testData.LeadId
            documentType = "income_verification"
            file = Get-Content $testDocPath -Raw
        } | ConvertTo-Json

        $uploadResponse = Invoke-RestMethod -Uri "$doclingOcrUrl/api/upload" -Method Post -Body $uploadPayload -ContentType "application/json" -TimeoutSec 30 -ErrorAction Stop

        Remove-Item $testDocPath -ErrorAction SilentlyContinue

        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($uploadResponse.status -eq "success" -or $uploadResponse.status -eq "processing") {
            $testData.DocumentId = $uploadResponse.documentId
            $testResults += Write-TestResult -TestName "Document Upload" -Passed $true -Details "Document ID: $($uploadResponse.documentId)" -Duration $duration

            # Wait for OCR processing
            Write-ColorOutput "  Waiting for OCR processing..." -Color Gray
            Start-Sleep -Seconds 3

            # Check OCR results
            try {
                $ocrResponse = Invoke-RestMethod -Uri "$doclingOcrUrl/api/documents/$($uploadResponse.documentId)/ocr" -Method Get -TimeoutSec 10 -ErrorAction Stop

                if ($ocrResponse.text) {
                    $testResults += Write-TestResult -TestName "OCR Processing" -Passed $true -Details "Text extracted: $($ocrResponse.text.Length) chars" -Duration 0
                } else {
                    $testResults += Write-TestResult -TestName "OCR Processing" -Passed $false -Details "No text extracted" -Duration 0
                }
            } catch {
                $testResults += Write-TestResult -TestName "OCR Processing" -Passed $false -Details "Cannot retrieve OCR results: $_" -Duration 0
            }
        } else {
            $testResults += Write-TestResult -TestName "Document Upload" -Passed $false -Details "Upload failed: $($uploadResponse.status)" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Document Upload" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Document Upload" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [5] COMPLIANCE VALIDATION
# ============================================================================

Write-ColorOutput "`n[5/8] Compliance Validation..." -Color Cyan

if ($testData.LeadId) {
    $startTime = Get-Date

    try {
        # Trigger compliance check
        $compliancePayload = @{
            leadId = $testData.LeadId
            documentId = $testData.DocumentId
        } | ConvertTo-Json

        $complianceResponse = Invoke-RestMethod -Uri "$mortgageCrmUrl/api/compliance/validate" -Method Post -Body $compliancePayload -ContentType "application/json" -TimeoutSec 20 -ErrorAction Stop

        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($complianceResponse.status -eq "pass" -or $complianceResponse.status -eq "pending") {
            $testResults += Write-TestResult -TestName "Compliance Validation" -Passed $true -Details "Status: $($complianceResponse.status)" -Duration $duration

            if ($complianceResponse.checks) {
                $passedChecks = ($complianceResponse.checks | Where-Object { $_.result -eq "pass" }).Count
                $totalChecks = $complianceResponse.checks.Count
                $testResults += Write-TestResult -TestName "Compliance Checks" -Passed $true -Details "Passed: $passedChecks / $totalChecks" -Duration 0
            }
        } else {
            $testResults += Write-TestResult -TestName "Compliance Validation" -Passed $false -Details "Validation failed: $($complianceResponse.status)" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Compliance Validation" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Compliance Validation" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [6] DATABASE CONSISTENCY CHECK
# ============================================================================

Write-ColorOutput "`n[6/8] Database Consistency Check..." -Color Cyan

if ($testData.LeadId) {
    $startTime = Get-Date

    try {
        # Query PostgreSQL to verify data consistency
        $env:PGPASSWORD = $env:POSTGRES_PASSWORD
        $query = "SELECT COUNT(*) FROM leads WHERE id = '$($testData.LeadId)';"
        $count = & psql -h 192.168.1.100 -U postgres -d nyra_db -t -c $query 2>&1
        Remove-Item Env:\PGPASSWORD

        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($count -and $count.Trim() -eq "1") {
            $testResults += Write-TestResult -TestName "Database: Lead Exists" -Passed $true -Details "Lead found in database" -Duration $duration

            # Check related records
            $env:PGPASSWORD = $env:POSTGRES_PASSWORD
            $relatedQuery = "SELECT COUNT(*) FROM lead_qualifications WHERE lead_id = '$($testData.LeadId)';"
            $relatedCount = & psql -h 192.168.1.100 -U postgres -d nyra_db -t -c $relatedQuery 2>&1
            Remove-Item Env:\PGPASSWORD

            if ($relatedCount -and [int]$relatedCount.Trim() -gt 0) {
                $testResults += Write-TestResult -TestName "Database: Related Records" -Passed $true -Details "Qualification records found" -Duration 0
            } else {
                $testResults += Write-TestResult -TestName "Database: Related Records" -Passed $false -Details "No qualification records" -Duration 0
            }
        } else {
            $testResults += Write-TestResult -TestName "Database: Lead Exists" -Passed $false -Details "Lead not found in database" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Database Consistency" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Database Consistency" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [7] REDIS CACHE VALIDATION
# ============================================================================

Write-ColorOutput "`n[7/8] Redis Cache Validation..." -Color Cyan

if ($testData.LeadId) {
    $startTime = Get-Date

    try {
        # Check if lead is cached in Redis
        if (Test-CommandExists "redis-cli") {
            $cacheKey = "lead:$($testData.LeadId)"
            $cacheCmd = if ($env:REDIS_PASSWORD) {
                "redis-cli -h 192.168.1.100 -a $env:REDIS_PASSWORD GET $cacheKey"
            } else {
                "redis-cli -h 192.168.1.100 GET $cacheKey"
            }

            $cacheValue = Invoke-Expression $cacheCmd 2>&1

            $duration = ((Get-Date) - $startTime).TotalMilliseconds

            if ($cacheValue -and $cacheValue -ne "(nil)") {
                $testResults += Write-TestResult -TestName "Redis Cache: Lead Data" -Passed $true -Details "Lead data cached" -Duration $duration
            } else {
                $testResults += Write-TestResult -TestName "Redis Cache: Lead Data" -Passed $true -Details "Lead not cached (optional)" -Duration $duration
            }
        } else {
            $testResults += Write-TestResult -TestName "Redis Cache" -Passed $true -Details "redis-cli not available (skipped)" -Duration 0
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Redis Cache" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Redis Cache" -Passed $false -Details "No lead ID available" -Duration 0
}

# ============================================================================
# [8] CLEANUP (if requested)
# ============================================================================

Write-ColorOutput "`n[8/8] Cleanup Test Data..." -Color Cyan

if ($CleanupAfter -and $testData.LeadId) {
    Write-ColorOutput "  Cleaning up test lead..." -Color Gray

    try {
        # Delete test lead via API
        $deleteResponse = Invoke-RestMethod -Uri "$rateHunterUrl/api/leads/$($testData.LeadId)" -Method Delete -TimeoutSec 10 -ErrorAction Stop

        $testResults += Write-TestResult -TestName "Cleanup: Delete Test Lead" -Passed $true -Details "Test data cleaned up" -Duration 0
    } catch {
        $testResults += Write-TestResult -TestName "Cleanup: Delete Test Lead" -Passed $false -Details $_.Exception.Message -Duration 0
    }
} else {
    if ($testData.LeadId) {
        Write-ColorOutput "  Cleanup skipped. Test lead ID: $($testData.LeadId)" -Color Yellow
        $testResults += Write-TestResult -TestName "Cleanup" -Passed $true -Details "Skipped (use -CleanupAfter to enable)" -Duration 0
    } else {
        $testResults += Write-TestResult -TestName "Cleanup" -Passed $true -Details "No test data to clean" -Duration 0
    }
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "Integration Test Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Tests:  $totalTests" -Color White
Write-ColorOutput "Passed:       $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Failed:       $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

Write-ColorOutput "`nTest Lead ID: $($testData.LeadId)" -Color Cyan

# Integration health assessment
if ($passRate -eq 100) {
    Write-ColorOutput "`nIntegration Status: PERFECT - All workflows operational" -Color Green
} elseif ($passRate -ge 80) {
    Write-ColorOutput "`nIntegration Status: GOOD - Minor issues detected" -Color Green
} elseif ($passRate -ge 60) {
    Write-ColorOutput "`nIntegration Status: FAIR - Some workflows broken" -Color Yellow
} else {
    Write-ColorOutput "`nIntegration Status: CRITICAL - Major integration failures" -Color Red
}

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "Integration Test Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    Export-TestResultsJSON -TestResults $testResults -OutputPath $jsonPath
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nIntegration Test $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Red" })

exit $exitCode
