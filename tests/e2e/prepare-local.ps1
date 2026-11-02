$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/../..").Path
$dotnet = (Resolve-Path "$repo/../../connectaoficios-api-dotnet/ConnectaOficios").Path
$state = "$PSScriptRoot/.local"
New-Item -ItemType Directory -Force $state | Out-Null
$secretPath = "$PSScriptRoot/local.secrets.json"
if (-not (Test-Path $secretPath)) {
  $bytes = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $secrets = @{
    correo = "e2e.principal.$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())@example.test"
    password = [Convert]::ToBase64String($bytes)
    jwtKey = [Convert]::ToBase64String($bytes) + [guid]::NewGuid().ToString('N')
  }
  $secrets | ConvertTo-Json | Set-Content $secretPath -Encoding UTF8
}
$secrets = Get-Content $secretPath -Raw | ConvertFrom-Json
# Separate database: never alter ConnectaOficiosNewman or any existing account.
sqlcmd -S '.\SQLEXPRESS' -E -C -b -Q "IF DB_ID('ConnectaOficiosE2E') IS NULL CREATE DATABASE ConnectaOficiosE2E;" -l 5
if ($LASTEXITCODE -ne 0) { throw 'Cannot prepare local SQL Server database' }
$exists = sqlcmd -S '.\SQLEXPRESS' -E -C -b -d ConnectaOficiosE2E -h -1 -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.tables WHERE name='Usuarios';"
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect the isolated E2E schema' }
if (($exists -join '').Trim() -eq '0') {
  sqlcmd -S '.\SQLEXPRESS' -E -C -b -d ConnectaOficiosE2E -i "$dotnet/InitialIdentitySchema.sql"
  if ($LASTEXITCODE -ne 0) { throw 'Schema preparation failed' }
}
sqlcmd -S '.\SQLEXPRESS' -E -C -b -d ConnectaOficiosE2E -Q "IF COL_LENGTH('Usuarios','PasswordResetTokenHash') IS NULL ALTER TABLE Usuarios ADD PasswordResetTokenHash nvarchar(255) NULL; IF COL_LENGTH('Usuarios','PasswordResetTokenExpiresAt') IS NULL ALTER TABLE Usuarios ADD PasswordResetTokenExpiresAt datetime2 NULL;"
if ($LASTEXITCODE -ne 0) { throw 'Cannot prepare E2E password-reset columns' }
$env:ConnectionStrings__DefaultConnection = 'Server=.\SQLEXPRESS;Database=ConnectaOficiosE2E;Trusted_Connection=True;TrustServerCertificate=True'
$env:Jwt__Key = $secrets.jwtKey
$env:Jwt__Issuer = 'connectaoficios-e2e-local'
$env:Jwt__Audience = 'connectaoficios-e2e-local'
$env:BootstrapAdmin__Nombre = 'E2E Principal'
$env:BootstrapAdmin__Correo = $secrets.correo
$env:BootstrapAdmin__Password = $secrets.password
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ASPNETCORE_URLS = 'http://127.0.0.1:8080'
$binary = "$dotnet/ConnectaOficios.Api/bin/Debug/net8.0/ConnectaOficios.Api.dll"
$process = Start-Process -FilePath 'dotnet' -ArgumentList @($binary) -WorkingDirectory "$dotnet/ConnectaOficios.Api" -WindowStyle Hidden -PassThru -RedirectStandardOutput "$state/dotnet.log" -RedirectStandardError "$state/dotnet-error.log"
$process.Id | Set-Content "$state/dotnet.pid"
$deadline = (Get-Date).AddSeconds(60)
while ($true) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/health' -TimeoutSec 2
    if ($response.StatusCode -eq 200) { break }
  } catch { }
  if ($process.HasExited -or (Get-Date) -gt $deadline) { throw 'Local .NET startup failed; inspect ignored logs' }
  Start-Sleep -Seconds 1
}
Write-Output 'Local SQL E2E database prepared; .NET started with isolated configuration. Secrets not displayed.'
