# Build y run con Podman/Docker en Windows
# Uso: .\docker-build.ps1

# Cargar variables de entorno desde .env.production
if (Test-Path .env.production) {
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Build con build args
podman build `
  --build-arg NEXT_PUBLIC_API_URL="$env:NEXT_PUBLIC_API_URL" `
  --build-arg NEXT_PUBLIC_API_BCP="$env:NEXT_PUBLIC_API_BCP" `
  --build-arg NEXT_PUBLIC_BCP_USERNAME="$env:NEXT_PUBLIC_BCP_USERNAME" `
  --build-arg NEXT_PUBLIC_BCP_PASSWORD="$env:NEXT_PUBLIC_BCP_PASSWORD" `
  -t dispensador-central-front .

Write-Host "Build completado. Para correr el contenedor:"
Write-Host "podman run -d -p 3002:3002 --name dispensador-front dispensador-central-front"
