# Herramientas de comprobación (scripts)

Este directorio contiene utilidades para ayudar a verificar la
configuración de tu base de datos (Neon/PostgreSQL) y de Cloudinary.

## Comprobar el esquema de la base de datos

El script `check-neon-schema-ui.ts` compara el esquema de tu base de
datos con el contrato esperado por la interfaz de usuario de
ReLead.  Esto te permite detectar tablas o columnas faltantes que
puedan causar errores en tiempo de ejecución (por ejemplo, al
actualizar el perfil de usuario).

### Uso

1. Instala las dependencias si no las tienes ya:

   ```bash
   npm install pg
   ```

2. Define la variable de entorno `DATABASE_URL` con la cadena de
   conexión a tu base de datos Neon.  Por ejemplo, en Linux puedes
   ejecutar:

   ```bash
   export DATABASE_URL="postgres://usuario:contraseña@host:puerto/dbname"
   ```

3. Ejecuta el script con ts-node:

   ```bash
   npx ts-node scripts/check-neon-schema-ui.ts
   ```

El resultado mostrará por cada tabla si existe o no, y para cada
columna si coincide el tipo de dato.  Ajusta el objeto
`expectedSchema` dentro del script si cambias la estructura de tus
tablas.

## Comprobar Cloudinary

El script `check-cloudinary.ts` realiza una llamada de ping a
Cloudinary para verificar que las credenciales y la conectividad son
correctas.

### Uso

1. Instala la dependencia:

   ```bash
   npm install cloudinary
   ```

2. Define las variables de entorno `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` con los valores de tu
   cuenta de Cloudinary.

3. Ejecuta el script:

   ```bash
   npx ts-node scripts/check-cloudinary.ts
   ```

Si todo está correctamente configurado, verás un mensaje similar a
`Cloudinary OK: { status: 'ok', ... }`.  Si no, revisa tus credenciales
y la conexión a Internet.