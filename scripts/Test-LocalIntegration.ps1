param([string]$Correo = 'admin123@gmail.com')
$ErrorActionPreference = 'Stop'
$secure = Read-Host 'Contrasena original (entrada oculta)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $body = @{ correo = $Correo; password = $password } | ConvertTo-Json -Compress
    try {
        $login = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/api/users/login' -Method Post -ContentType 'application/json' -Body $body
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'sin conexion' }
        Write-Output "HTTP login .NET: $status; autenticado: no"
        Write-Output 'Un 401 no distingue por si solo usuario ausente, inactivo o password incorrecto. Contrastar con consulta local de solo lectura.'
        return
    } finally { $password = $null; $body = $null }
    $data = $login.Content | ConvertFrom-Json
    $token = $data.token
    Write-Output "HTTP login .NET: $($login.StatusCode); autenticado: $([bool]$token); ID: $($data.usuario.id); rol: $($data.usuario.rol); estado: $($data.usuario.estado)"
    if (-not $token) { return }
    $part = $token.Split('.')[1].Replace('-','+').Replace('_','/')
    $part = $part.PadRight($part.Length + (4 - $part.Length % 4) % 4, '=')
    $claims = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($part)) | ConvertFrom-Json
    foreach ($name in @('sub','http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier','role','http://schemas.microsoft.com/ws/2008/06/identity/claims/role','iss','aud','exp')) {
        if ($null -ne $claims.$name) { Write-Output "$name : $($claims.$name)" }
    }
    $payload = @{ usuarios = @(@{ usuarioId = [int]$data.usuario.id; rol = $data.usuario.rol }) } | ConvertTo-Json -Depth 4 -Compress
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8081/api/perfiles/fotos' -Method Post -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $payload
        Write-Output "HTTP Java perfiles/fotos: $($response.StatusCode); JWT aceptado: si"
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'sin conexion' }
        Write-Output "HTTP Java perfiles/fotos: $status"
    }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $secure.Dispose()
    $token = $null; $data = $null; $login = $null; $claims = $null
}
