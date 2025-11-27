# ReLead Digital – Landing estática

Sitio estático listo para despliegue en Vercel. Incluye página principal y URLs secundarias para servicios, portafolio, contacto y documentos legales.

## Estructura
- `index.html`: landing principal con resumen de servicios y enlaces clave.
- `servicios.html`, `portafolio.html`, `sobre-mi.html`, `contacto.html`: páginas secundarias con información detallada.
- `terminos-condiciones.html`, `politica-de-privacidad.html`: documentos legales.
- `css/base.css`: estilos globales.
- `vercel.json`: configuración básica para Vercel (clean URLs y redirección a `index.html`).

## Despliegue en Vercel
1. Importa el repositorio en Vercel.
2. Selecciona framework **Other** (sitio estático) y establece la carpeta raíz del proyecto.
3. No requiere build ni comandos adicionales; el output es la raíz del repo.
4. Asegúrate de que `Output Directory` sea `.` y habilita **Clean URLs**.
5. Guarda e inicia el deploy.

## Desarrollo local
No hay dependencias de compilación. Basta con abrir `index.html` en el navegador o servir la carpeta con un servidor estático.
