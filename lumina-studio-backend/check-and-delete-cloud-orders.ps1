# run-cloud-delete-orders.ps1
# Deletes all test orders from GCP Cloud SQL and resets sequences.

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
Write-Host "   Lumina: Delete Test Orders from GCP Cloud SQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "Starting Cloud SQL Auth Proxy on port $proxyPort..." -ForegroundColor Yellow
$proxyArgs = @($instanceConnectionName, "--port", $proxyPort)
$proxyProcess = Start-Process -FilePath ".\$proxyName" -ArgumentList $proxyArgs -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

if ($proxyProcess.HasExited) { Write-Error "Proxy failed to start. Run: gcloud auth login" }
Write-Host "Tunnel ready on 127.0.0.1:$proxyPort" -ForegroundColor Green

$env:DB_USER     = $cloudUser
$env:DB_PASSWORD = $cloudPassword
$env:DB_HOST     = "127.0.0.1"
$env:DB_PORT     = $proxyPort
$env:DB_NAME     = $dbName

try {
    Write-Host "Running delete-orders.js on GCP..." -ForegroundColor Cyan
    node scripts/delete-orders.js
    Write-Host "Cloud order cleanup done!" -ForegroundColor Green
} finally {
    $env:DB_USER     = $null
    $env:DB_PASSWORD = $null
    $env:DB_HOST     = $null
    $env:DB_PORT     = $null
    $env:DB_NAME     = $null

    Write-Host "Stopping proxy..." -ForegroundColor Yellow
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Proxy stopped." -ForegroundColor Green
}
