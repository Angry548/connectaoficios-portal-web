$ErrorActionPreference = 'Stop'
$javaRoot = (Resolve-Path "$PSScriptRoot/../../../../connectaoficios-api-java").Path
$state = "$PSScriptRoot/.local"
$secrets = Get-Content "$PSScriptRoot/local.secrets.json" -Raw | ConvertFrom-Json
if (-not (Test-Path "$state/java-classpath.txt")) {
  Push-Location $javaRoot
  try {
    $mavenCache = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.m2/repository'
    & ./mvnw.cmd -o dependency:build-classpath "-Dmaven.repo.local=$mavenCache" '-Dmdep.includeScope=test' "-Dmdep.outputFile=$state/java-classpath.txt"
    if ($LASTEXITCODE -ne 0) { throw 'Prepare cached Maven dependencies before starting the local E2E API' }
  } finally { Pop-Location }
}
$cp = (Get-Content "$state/java-classpath.txt" -Raw).Trim()
$env:DB_URL = 'jdbc:h2:mem:connectaoficios_e2e;MODE=MySQL;DB_CLOSE_DELAY=-1'
$env:DB_USERNAME = 'sa'
$env:DB_PASSWORD = ''
$env:JWT_SECRET = $secrets.jwtKey
$env:JWT_ISSUER = 'connectaoficios-e2e-local'
$env:JWT_AUDIENCE = 'connectaoficios-e2e-local'
$env:CLOUDINARY_URL = 'cloudinary://local:local@e2e-local'
$env:CORS_ALLOWED_ORIGINS = 'http://127.0.0.1:5173,http://localhost:5173'
$env:PORT = '8081'
$argsFile = "$state/java.args"
$classpath = "$javaRoot/target/classes;" + $cp
@('-cp', ('"' + $classpath.Replace('\','/') + '"'), 'com.connectaoficios.api.ConnectaoficiosApiJavaApplication', '--spring.profiles.active=local', '--spring.datasource.driver-class-name=org.h2.Driver', '--spring.jpa.hibernate.ddl-auto=create-drop', '--spring.devtools.restart.enabled=false') | Set-Content $argsFile -Encoding ASCII
$process = Start-Process -FilePath 'java' -ArgumentList @("@$argsFile") -WorkingDirectory $javaRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput "$state/java.log" -RedirectStandardError "$state/java-error.log"
$process.Id | Set-Content "$state/java.pid"
$deadline = (Get-Date).AddSeconds(120)
while ($true) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8081/api/health' -TimeoutSec 2
    if ($response.StatusCode -eq 200) { break }
  } catch { }
  if ($process.HasExited -or (Get-Date) -gt $deadline) { throw 'Local Java startup failed; inspect ignored logs' }
  Start-Sleep -Seconds 1
}
Write-Output 'Java started on localhost:8081 with a fresh in-memory H2 testing database.'
