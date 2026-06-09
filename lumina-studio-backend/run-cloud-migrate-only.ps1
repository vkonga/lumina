# run-cloud-migrate-only.ps1
# Runs ONLY migrate.js against the GCP Cloud SQL instance (no seed).
$ErrorActionPreference = "Stop"

$gcpProjectId   = "lumina-production-497514"
$region         = "us-central1"
$dbInstanceName = "lumina-db-instance"
$dbName         = "lumina"
$cloudUser      = "postgres"
$cloudPassword  = "LuminaSecurePass!2026"
$proxyPort      = "5433"

$instanceConnectionName = "${gcpProjectId}:${region}:${dbInstanceName}"
$proxyName = "cloud-sql-proxy.exe"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Lumina Studio: Cloud SQL Migration Runner" -ForegroundColor Cyan
Write-Host "   Instance : $instanceConnectionName" -ForegroundColor Cyan
Write-Host "   Database : $dbName   User: $cloudUser" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $proxyName)) {
    Write-Host "[!] Proxy not found. Downloading..." -ForegroundColor Yellow
    $url = "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.x64.exe"
    Invoke-WebRequest -Uri $url -OutFile $proxyName
    Write-Host "Downloaded $proxyName" -ForegroundColor Green
}

Write-Host "Starting Cloud SQL Auth Proxy on port $proxyPort..." -ForegroundColor Yellow
$proxyArgs = @($instanceConnectionName, "--port", $proxyPort)
$proxyProcess = Start-Process -FilePath ".\$proxyName" -ArgumentList $proxyArgs -PassThru -WindowStyle Hidden

Write-Host "Waiting 5 seconds for tunnel to establish..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if ($proxyProcess.HasExited) {
    Write-Error "Proxy failed to start. Run: gcloud auth login"
}
Write-Host "Tunnel ready on 127.0.0.1:$proxyPort" -ForegroundColor Green

$env:DB_USER     = $cloudUser
$env:DB_PASSWORD = $cloudPassword
$env:DB_HOST     = "127.0.0.1"
$env:DB_PORT     = $proxyPort
$env:DB_NAME     = $dbName

try {
    Write-Host "Running migrate.js on GCP Cloud SQL..." -ForegroundColor Cyan
    node scripts/migrate.js
    Write-Host "GCP migration completed successfully!" -ForegroundColor Green
} finally {
    $env:DB_USER     = $null
    $env:DB_PASSWORD = $null
    $env:DB_HOST     = $null
    $env:DB_PORT     = $null
    $env:DB_NAME     = $null

    Write-Host "Stopping Cloud SQL Auth Proxy..." -ForegroundColor Yellow
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Proxy stopped." -ForegroundColor Green
}
