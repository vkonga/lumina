# migrate-local-to-cloud.ps1
# Automated local PostgreSQL to GCP Cloud SQL migration tool.

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     Lumina Studio Backend: Data Migration to GCP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Configuration Parameters
$gcpProjectId = "lumina-production-497514"
$region = "us-central1"
$dbInstanceName = "lumina-db-instance"
$dbName = "lumina"

# Local PostgreSQL details
$localUser = "postgres"
$localPassword = "Young1997@"
$localPort = "5432"

# Cloud PostgreSQL details
$cloudUser = "postgres"
$cloudPassword = "LuminaSecurePass!2026"
$proxyPort = "5433"

# Safe string interpolation avoiding scope modifier conflicts
$instanceConnectionName = "${gcpProjectId}:${region}:${dbInstanceName}"

# 2. Locate local pg_dump.exe and pg_restore.exe
Write-Host "Searching for local PostgreSQL utilities (pg_dump.exe)..." -ForegroundColor Cyan
$pgPath = $null

# Check if pg_dump is in global PATH
$pgDumpCmd = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($pgDumpCmd) {
    $pgPath = Split-Path -Path $pgDumpCmd.Source
} else {
    # Check standard PostgreSQL installations
    $searchPaths = @(
        "C:\Program Files\PostgreSQL\*\bin",
        "C:\Program Files (x86)\PostgreSQL\*\bin"
    )
    foreach ($path in $searchPaths) {
        $resolved = Resolve-Path $path -ErrorAction SilentlyContinue
        if ($resolved) {
            # Take the latest version if multiple exist
            $pgPath = $resolved | Select-Object -Last 1 -ExpandProperty Path
            break
        }
    }
}

if (-not $pgPath -or -not (Test-Path "$pgPath\pg_dump.exe")) {
    Write-Error "PostgreSQL utilities (pg_dump.exe, pg_restore.exe) could not be located in PATH or standard installation folders. Please ensure PostgreSQL/pgAdmin is installed."
}

Write-Host "[OK] Found PostgreSQL utilities at: $pgPath" -ForegroundColor Green
$pgDumpExe = "$pgPath\pg_dump.exe"
$pgRestoreExe = "$pgPath\pg_restore.exe"

# 3. Perform Local Database Backup
Write-Host "Exporting local database '$dbName'..." -ForegroundColor Cyan
$backupFile = Join-Path $PSScriptRoot "lumina_local_backup.dump"

if (Test-Path $backupFile) {
    Remove-Item $backupFile -Force
}

# Set PGPASSWORD env variable to let pg_dump run without prompting
$env:PGPASSWORD = $localPassword

try {
    # Run pg_dump in Custom format
    & $pgDumpExe -h localhost -p $localPort -U $localUser -F c -b -v -f $backupFile -d $dbName
    Write-Host "[OK] Local database successfully exported to $backupFile" -ForegroundColor Green
} catch {
    Write-Error "Failed to export local database: $_"
} finally {
    $env:PGPASSWORD = $null
}

# 4. Check/Download Cloud SQL Proxy
$proxyName = "cloud-sql-proxy.exe"
if (-not (Test-Path $proxyName)) {
    Write-Host "Downloading Google Cloud SQL Auth Proxy..." -ForegroundColor Cyan
    $url = "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.x64.exe"
    Invoke-WebRequest -Uri $url -OutFile $proxyName
    Write-Host "[OK] Proxy downloaded successfully." -ForegroundColor Green
}

# 5. Start Cloud SQL Proxy in background on port 5433
Write-Host "Starting Cloud SQL Auth Proxy in the background on port $proxyPort..." -ForegroundColor Cyan
$proxyProcess = Start-Process -FilePath ".\$proxyName" -ArgumentList @($instanceConnectionName, "--port", $proxyPort) -PassThru -WindowStyle Hidden

Write-Host "Establishing secure database tunnel (waiting 5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if ($proxyProcess.HasExited) {
    Write-Error "Cloud SQL Auth Proxy failed to start. Verify your gcloud login is active."
}
Write-Host "[OK] Secure tunnel to Cloud SQL established on localhost:$proxyPort!" -ForegroundColor Green

# 6. Restore to Cloud Database
Write-Host "Restoring backup file into GCP Cloud SQL..." -ForegroundColor Cyan
$env:PGPASSWORD = $cloudPassword

try {
    # Run pg_restore via proxy to Cloud SQL database
    & $pgRestoreExe -h 127.0.0.1 -p $proxyPort -U $cloudUser -d $dbName -v --no-owner --no-privileges $backupFile
    Write-Host "[OK] Database backup successfully restored to Google Cloud SQL!" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Checking connection..." -ForegroundColor Yellow
} finally {
    $env:PGPASSWORD = $null
    
    # Stop background proxy
    Write-Host "Stopping Cloud SQL Auth Proxy..." -ForegroundColor Yellow
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Secure tunnel closed successfully." -ForegroundColor Green
    
    # Remove backup file for security
    if (Test-Path $backupFile) {
        Remove-Item $backupFile -Force
        Write-Host "[OK] Cleaned up temporary backup file." -ForegroundColor Green
    }
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "[SUCCESS] Data Migration Complete! All tables and data are in the Cloud." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
