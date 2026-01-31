# Configuración de Variables de Entorno

## Overview

Este proyecto utiliza variables de entorno para configurar las APIs externas y servicios necesarios. La configuración centralizada se encuentra en [`app/lib/env-config.ts`](app/lib/env-config.ts).

## Variables Requeridas

### `.env.local` (desarrollo)

Copia el contenido de `.env.example` y llena las variables:

```bash
cp .env.example .env.local
```

### Variables de Configuración

#### `NEXT_PUBLIC_API_URL` (Requerida)

- **Descripción**: URL base del backend Dispensador (NestJS)
- **Defecto**: `http://localhost:3001`
- **Ejemplo**: `http://localhost:3001`
- **Visible en cliente**: Sí (prefijo `NEXT_PUBLIC_`)

#### `API_BCP` (Requerida)

- **Descripción**: URL de la API externa BCP para consultas y transacciones
- **Defecto**: No tiene defecto (debe configurarse)
- **Ejemplo**: `https://api.bcp.com/v1`
- **Visible en cliente**: No (solo servidor)
- **Uso**: Se utiliza en acciones de servidor para consumir servicios BCP

#### `AUTH_SECRET` (Requerida en Producción)

- **Descripción**: Clave secreta para encriptar sesiones NextAuth
- **Generar**: `openssl rand -base64 32`
- **Visible en cliente**: No

#### `AUTH_URL` (Opcional)

- **Descripción**: URL base para NextAuth
- **Defecto**: `http://localhost:3000/api/auth`

## Acceso a Variables de Entorno

### Opción 1: Usar la configuración centralizada (Recomendado)

```typescript
import { ENV_CONFIG } from "@/app/lib/env-config";

export async function miAccion() {
  const apiUrl = ENV_CONFIG.NEXT_PUBLIC_API_URL;
  const bcpApi = ENV_CONFIG.API_BCP;

  // Tu código aquí
}
```

### Opción 2: Acceso directo (Desaconsejado)

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const bcpApi = process.env.API_BCP;
```

## Validación de Variables

Puedes validar que todas las variables requeridas estén configuradas:

```typescript
import { validateEnv } from "@/app/lib/env-config";

if (!validateEnv()) {
  console.error("Faltan variables de entorno requeridas");
}
```

## Desarrollo

### Arrancar la aplicación con variables configuradas

```bash
# Asegúrate de tener .env.local con las variables
pnpm dev
```

El servidor debería mostrar advertencias si hay variables faltantes.

## Producción

En Vercel o tu hosting:

1. Ve al dashboard del proyecto
2. Settings → Environment Variables
3. Agrega las siguientes variables:
   - `NEXT_PUBLIC_API_URL`
   - `API_BCP`
   - `AUTH_SECRET`
   - `AUTH_URL`

## Troubleshooting

### "API_BCP no está configurada"

- Verifica que `.env.local` contiene `API_BCP=tu_url`
- Reinicia el servidor (`pnpm dev`)
- Revisa la consola para mensajes de advertencia

### Variables no se actualizan

- Next.js cachea variables de entorno al iniciar
- Reinicia el servidor: `Ctrl+C` y `pnpm dev`

### Error: "API_BCP está vacío"

- En desarrollo: Asegúrate de que `.env.local` tiene la URL
- En producción: Configura la variable en el hosting
