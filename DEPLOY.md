# Instrucciones de Despliegue en cPanel

Sigue estos pasos para desplegar la aplicación precompilada en tu servidor cPanel con Node.js.

## Paso 1: Preparar los Archivos

1. Descarga el archivo ZIP con la versión precompilada
2. Descomprime el archivo en tu ordenador local para verificar su contenido
3. Asegúrate de que contiene:
   - Carpeta `.next`
   - Archivo `package.json`
   - Archivo `start.js`
   - Carpeta `public` (si existe)
   - Archivo `next.config.js`

## Paso 2: Configurar la Aplicación Node.js en cPanel

1. Inicia sesión en tu cPanel
2. Busca la sección "Setup Node.js App" o "Configurar Aplicación Node.js"
3. Haz clic en "Create Application" o "Crear Aplicación"
4. Completa el formulario con estos datos:
   - **Node.js version**: Selecciona 19.x (o la versión disponible más reciente)
   - **Application mode**: Production
   - **Application root**: Elige un directorio para tu aplicación (ej: `woocommerce-orders`)
   - **Application URL**: URL donde se accederá a la aplicación (ej: `tudominio.com/orders`)
   - **Application startup file**: `start.js`

## Paso 3: Subir los Archivos

1. Una vez creada la aplicación, ve a la sección "File Manager" o "Administrador de Archivos" en cPanel
2. Navega hasta el directorio que configuraste como "Application root"
3. Sube el archivo ZIP con la versión precompilada
4. Extrae el archivo ZIP en ese directorio usando la opción "Extract" o "Extraer" del menú contextual (clic derecho)

## Paso 4: Configurar la Instalación de Dependencias

1. En la sección "Setup Node.js App", busca tu aplicación
2. Haz clic en "Edit" o "Editar"
3. Busca la opción "NPM Run Build Command" o similar y configúrala como:
   \`\`\`
   npm install --production
   \`\`\`
4. Guarda los cambios

## Paso 5: Configurar Variables de Entorno

1. En la misma pantalla de edición de la aplicación, busca la sección "Environment Variables" o "Variables de Entorno"
2. Añade las siguientes variables:
   - `WOOCOMMERCE_URL`: URL de tu tienda WooCommerce (ej: `https://tutienda.com`)
   - `WOOCOMMERCE_CONSUMER_KEY`: Tu clave de consumidor de WooCommerce
   - `WOOCOMMERCE_CONSUMER_SECRET`: Tu secreto de consumidor de WooCommerce
   - `NODE_ENV`: production

## Paso 6: Iniciar la Aplicación

1. Guarda todos los cambios en la configuración
2. Haz clic en "Start Application" o "Iniciar Aplicación"
3. Espera a que la aplicación se inicie (puede tardar unos minutos)
4. Verifica los logs para asegurarte de que no hay errores

## Paso 7: Acceder a la Aplicación

1. Una vez iniciada la aplicación, accede a la URL que configuraste
2. Deberías ver la pantalla de inicio de sesión de la aplicación
3. Utiliza las credenciales predeterminadas:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Solución de Problemas

### La aplicación muestra "It works! NodeJS x.x.x"

Esto significa que Node.js está funcionando pero la aplicación no se ha iniciado correctamente. Posibles soluciones:

1. Verifica los logs de la aplicación en la sección de Node.js en cPanel
2. Asegúrate de que el archivo `start.js` está en la raíz del directorio
3. Comprueba que las dependencias se han instalado correctamente

### Error "Cannot find module 'next'"

Este error indica que las dependencias no se han instalado correctamente. Soluciones:

1. En la sección de Node.js en cPanel, asegúrate de que el comando de instalación se ha ejecutado
2. Si es posible, intenta ejecutar manualmente `npm install --production` a través de la terminal de cPanel
3. Verifica que el archivo `package.json` está en la raíz del directorio

### La aplicación no es accesible

Si la aplicación se inicia pero no puedes acceder a ella:

1. Verifica la URL configurada en cPanel
2. Comprueba si el puerto está bloqueado por el firewall
3. Consulta con tu proveedor de hosting si necesitas configuración adicional
