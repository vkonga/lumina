# run-cloud-db-setup.ps1
# Automates the setup and seeding/migrations of your GCP Cloud SQL PostgreSQL database from your laptop.

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     Lumina Studio Backend: Cloud SQL Initializer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Prompt for GCP and Database configuration
$gcpProjectId = Read-Host "Enter your Google Cloud Project ID (e.g., lumina-studio-415822)"
if ([string]::IsNullOrWhiteSpace($gcpProjectId)) {
    Write-Error "GCP Project ID is required!"
}

$dbUser = Read-Host "Enter your database username [lumina_user]"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "lumina_user"
}

$dbPassword = Read-Host "Enter your database password"
if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    Write-Error "Database password is required!"
}

$dbName = Read-Host "Enter your database name [lumina]"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "lumina"
}

$region = Read-Host "Enter your database region [us-central1]"
if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "us-central1"
}

$instanceConnectionName = "$gcpProjectId`:$region`:lumina-db-instance"

Write-Host "`nConnecting to instance: $instanceConnectionName" -ForegroundColor Yellow

# 2. Check for Cloud SQL Proxy
$proxyName = "cloud-sql-proxy.exe"
if (-not (Test-Path $proxyName)) {
    Write-Host "`n[!] Cloud SQL Auth Proxy not found in the current folder." -ForegroundColor Yellow
    Write-Host "Downloading the official Cloud SQL Auth Proxy for Windows (64-bit)..." -ForegroundColor Cyan
    
    $url = "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.x64.exe"
    try {
        Invoke-WebRequest -Uri $url -OutFile $proxyName
        Write-Host "✔ Successfully downloaded $proxyName" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download Cloud SQL Auth Proxy. Please check your internet connection or download it manually from: $url"
    }
} else {
    Write-Host "✔ Cloud SQL Auth Proxy is present." -ForegroundColor Green
}

# 3. Start Cloud SQL Proxy in the background
Write-Host "`nStarting Cloud SQL Auth Proxy in the background..." -ForegroundColor Cyan
$proxyProcess = Start-Process -FilePath ".\$proxyName" -ArgumentList @($instanceConnectionName, "--port", "5432") -PassThru -WindowStyle Hidden

# Give the proxy 4 seconds to start up and establish connection
Write-Host "Waiting 4 seconds for connection tunnel to establish..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

# Verify proxy is still running
if ($proxyProcess.HasExited) {
    Write-Error "Cloud SQL Auth Proxy failed to start or exited unexpectedly. Ensure you are authenticated in your terminal via: gcloud auth login"
}
Write-Host "✔ Secure tunnel to Cloud SQL established on localhost:5432!" -ForegroundColor Green

# 4. Set temporary environment variables and run seed/migrate
$oldEnv = @{}
$tempEnv = @{
    "DB_USER"     = $dbUser
    "DB_PASSWORD" = $dbPassword
    "DB_HOST"     = "127.0.0.1"
    "DB_PORT"     = "5432"
    "DB_NAME"     = $dbName
}

# Store original environment variables
foreach ($key in $tempEnv.Keys) {
    $oldEnv[$key] = [System.Environment]::GetEnvironmentVariable($key, "Process")
    [System.Environment]::SetEnvironmentVariable($key, $tempEnv[$key], "Process")
}

try {
    # Run npm run seed
    Write-Host "`n==============================================" -ForegroundColor Gray
    Write-Host "🚀 Running Database Seeding (seed.js)..." -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Gray
    npm run seed
    
    # Run npm run migrate
    Write-Host "`n==============================================" -ForegroundColor Gray
    Write-Host "🚀 Running Database Migrations (migrate.js)..." -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Gray
    npm run migrate
    
    Write-Host "`n✔ Database successfully initialized and seeded!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Error occurred during seeding/migrations: $_" -ForegroundColor Red
} finally {
    # Restore original environment variables
    foreach ($key in $oldEnv.Keys) {
        [System.Environment]::SetEnvironmentVariable($key, $oldEnv[$key], "Process")
    }
    
    # Stop background proxy
    Write-Host "`nStopping Cloud SQL Auth Proxy..." -ForegroundColor Yellow
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✔ Tunnel closed successfully." -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "Setup Completed! You can now proceed to push your code." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
