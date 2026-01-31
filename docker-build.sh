# Build y run con Podman/Docker
# Uso: ./docker-build.sh

# Cargar variables de entorno
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build con build args
podman build \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_API_BCP="$NEXT_PUBLIC_API_BCP" \
  --build-arg NEXT_PUBLIC_BCP_USERNAME="$NEXT_PUBLIC_BCP_USERNAME" \
  --build-arg NEXT_PUBLIC_BCP_PASSWORD="$NEXT_PUBLIC_BCP_PASSWORD" \
  -t dispensador-central-front .

echo "Build completado. Para correr el contenedor:"
echo "podman run -d -p 3002:3002 --name dispensador-front dispensador-central-front"
