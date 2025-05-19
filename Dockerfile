# Usa una imagen base de Node.js
FROM node:20-alpine

# Instala pnpm globalmente
RUN npm install -g pnpm

# Crea un directorio de trabajo
WORKDIR /app

# Copia el archivo package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias usando pnpm
RUN pnpm install --prod

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación de Next.js
RUN pnpm build

# Exponer el puerto que deseas usar
EXPOSE 3002

# Comando para ejecutar la aplicación
CMD ["pnpm", "start"]
