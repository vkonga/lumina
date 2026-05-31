# run-cloud-migrations.ps1
$ErrorActionPreference = "Stop"

$gcpProjectId = "lumina-production-497514"
$region = "us-central1"
$dbInstanceName = "lumina-db-instance"
$dbName = "lumina"

$cloudUser = "postgres"
$cloudPassword = "LuminaSecurePass!2026"
$proxyPort = "5433"

$instanceConnectionName = "$gcpProjectId`:$region`:$dbInstanceName"

$proxyName = "cloud-sql-proxy.exe"
if (-not (Test-Path $proxyName)) {
    Write-Host "Downloading Google Cloud SQL Auth Proxy..."
    $url = "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.x64.exe"
    Invoke-WebRequest -Uri $url -OutFile $proxyName
}

Write-Host "Starting Cloud SQL Auth Proxy..."
$proxyProcess = Start-Process -FilePath ".\$proxyName" -ArgumentList @($instanceConnectionName, "--port", $proxyPort) -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

$env:DB_USER = $cloudUser
$env:DB_PASSWORD = $cloudPassword
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = $proxyPort
$env:DB_NAME = $dbName

try {
    Write-Host "Running Database Migrations on GCP Cloud SQL..."
    node scripts/migrate.js
    Write-Host "Successfully completed cloud migrations!"
} finally {
    $env:DB_USER = $null
    $env:DB_PASSWORD = $null
    $env:DB_HOST = $null
    $env:DB_PORT = $null
    $env:DB_NAME = $null
    
    Write-Host "Stopping Cloud SQL Auth Proxy..."
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
}
