# Guía de Despliegue en cPanel con Node.js

Esta guía te ayudará a desplegar tu aplicación Next.js en un servidor cPanel que soporta Node.js.

## Requisitos Previos

1. Un hosting con cPanel que soporte aplicaciones Node.js
2. Acceso SSH al servidor (recomendado pero no siempre necesario)
3. Las credenciales de WooCommerce configuradas

## Paso 1: Preparar la Aplicación

1. En tu entorno de desarrollo local, ejecuta:
   \`\`\`bash
   npm run build
   \`\`\`

2. Comprime todo el proyecto en un archivo ZIP, incluyendo:
   - La carpeta `.next`
   - El archivo `package.json`
   - El archivo `package-lock.json` o `yarn.lock`
   - La carpeta `public`
   - Cualquier otro archivo necesario para la aplicación

## Paso 2: Configurar la Aplicación en cPanel

1. Inicia sesión en tu cPanel
2. Busca la sección "Setup Node.js App" o "Configurar Aplicación Node.js"
3. Haz clic en "Create Application" o "Crear Aplicación"
4. Completa el formulario:
   - **Node.js version**: Selecciona la versión 18.x o superior
   - **Application mode**: Production
   - **Application root**: Directorio donde se alojará la aplicación (ej: `woocommerce-orders`)
   - **Application URL**: URL donde se accederá a la aplicación
   - **Application startup file**: `node_modules/.bin/next start -p ${PORT}`

## Paso 3: Subir los Archivos

1. Una vez creada la aplicación, ve a la sección "File Manager" o "Administrador de Archivos" en cPanel
2. Navega hasta el directorio que configuraste como "Application root"
3. Sube el archivo ZIP que creaste
4. Extrae el archivo ZIP en ese directorio

## Paso 4: Instalar Dependencias

Hay dos formas de instalar las dependencias:

### Opción 1: Usando el Terminal de cPanel
1. En cPanel, busca la sección "Terminal" o "SSH/Terminal"
2. Navega hasta el directorio de tu aplicación: `cd woocommerce-orders`
3. Ejecuta: `npm install --production`

### Opción 2: Configurando el Script de Instalación
1. En la sección "Setup Node.js App", configura el "NPM Install Command" como:
   \`\`\`
   npm install --production
   \`\`\`
2. Guarda los cambios y reinicia la aplicación

## Paso 5: Configurar Variables de Entorno

1. En la sección "Setup Node.js App", busca la opción "Environment Variables" o "Variables de Entorno"
2. Añade las siguientes variables:
   - `WOOCOMMERCE_URL`: URL de tu tienda WooCommerce
   - `WOOCOMMERCE_CONSUMER_KEY`: Tu clave de consumidor de WooCommerce
   - `WOOCOMMERCE_CONSUMER_SECRET`: Tu secreto de consumidor de WooCommerce
   - `NODE_ENV`: production

## Paso 6: Iniciar la Aplicación

1. En la sección "Setup Node.js App", busca tu aplicación
2. Haz clic en "Start Application" o "Iniciar Aplicación"
3. Espera a que la aplicación se inicie (puede tardar unos minutos)

## Paso 7: Configurar el Dominio (Opcional)

Si quieres usar un dominio o subdominio específico:

1. Ve a la sección "Domains" o "Dominios" en cPanel
2. Añade un dominio o subdominio
3. Configúralo para que apunte al directorio de tu aplicación

## Solución de Problemas

### La aplicación no se inicia
- Verifica los logs de la aplicación en la sección "Setup Node.js App"
- Asegúrate de que todas las dependencias se instalaron correctamente
- Verifica que las variables de entorno estén configuradas correctamente

### Errores de conexión con WooCommerce
- Verifica que las credenciales de WooCommerce sean correctas
- Asegúrate de que la URL de WooCommerce sea accesible desde el servidor

### Problemas de rendimiento
- Considera aumentar la memoria asignada a la aplicación Node.js en cPanel
- Optimiza las consultas a la API de WooCommerce para reducir el tiempo de carga

## Mantenimiento

Para actualizar la aplicación:

1. Realiza los cambios en tu entorno de desarrollo local
2. Ejecuta `npm run build`
3. Comprime los archivos actualizados
4. Sube y extrae el archivo en el servidor
5. Reinicia la aplicación en cPanel
