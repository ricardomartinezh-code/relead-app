const PrivacyPage = () => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Política de privacidad</h1>

        <div className="prose prose-slate">
          <p className="uppercase tracking-wide text-sm text-slate-600">Legal</p>
          <h1>Política de Privacidad — ReLead Digital</h1>
          <p>
            <strong>Última actualización:</strong> noviembre 2025
          </p>
          <p>
            En ReLead Digital (relead.com.mx y sus subdominios) nos comprometemos a
            proteger la información personal de nuestros usuarios. Esta Política describe cómo
            recopilamos, usamos, almacenamos y protegemos tus datos.
          </p>

          <h2>1. Información que recopilamos</h2>
          <p>Podemos recopilar:</p>

          <h3>1.1 Información proporcionada voluntariamente</h3>
          <ul>
            <li>Nombre</li>
            <li>Correo electrónico</li>
            <li>Número telefónico</li>
            <li>Información enviada mediante formularios o mensajes directos</li>
            <li>Archivos o datos enviados para evaluaciones, cotizaciones o proyectos</li>
          </ul>

          <h3>1.2 Información recopilada automáticamente</h3>
          <ul>
            <li>Dirección IP y navegador</li>
            <li>Datos de cookies</li>
            <li>Actividad en la página</li>
            <li>Ubicación aproximada (derivada de IP)</li>
            <li>Identificadores de dispositivo</li>
          </ul>

          <h3>1.3 Información de comunicación</h3>
          <p>
            Cuando nos contactas mediante WhatsApp, redes sociales o correo, almacenamos la
            conversación para fines de seguimiento y servicio.
          </p>

          <h2>2. Cómo procesamos tu información</h2>
          <p>Utilizamos la información para:</p>
          <ol>
            <li>Proveer servicios digitales (branding, contenido y diseño).</li>
            <li>Responder consultas, dar seguimiento y procesar solicitudes.</li>
            <li>Enviar información relevante (propuestas, actualizaciones o notificaciones).</li>
            <li>Mejorar la experiencia del usuario mediante análisis estadísticos.</li>
            <li>Cumplir obligaciones legales, en caso de requerimiento.</li>
          </ol>

          <h2>3. Motivos por los cuales recopilamos datos</h2>
          <p>Recopilamos información para:</p>
          <ul>
            <li>Prestación de servicios contratados.</li>
            <li>Comunicación efectiva con clientes.</li>
            <li>Personalización de experiencias digitales.</li>
            <li>Análisis, seguridad y prevención de fraude.</li>
            <li>Generación de insights sobre comportamiento del usuario.</li>
          </ul>
          <p>No vendemos, intercambiamos ni rentamos datos personales a terceros.</p>

          <h2>4. Cookies y tecnologías similares</h2>
          <p>Utilizamos cookies para:</p>
          <ul>
            <li>Recordar preferencias.</li>
            <li>Analizar patrones de navegación.</li>
            <li>Mejorar velocidad de carga.</li>
            <li>Personalizar contenido.</li>
          </ul>
          <p>El usuario puede desactivar cookies desde su navegador.</p>

          <h2>5. Transferencias de datos</h2>
          <p>Podemos compartir información con proveedores externos únicamente para:</p>
          <ul>
            <li>Hosting</li>
            <li>Analítica (p. ej. Google Analytics)</li>
            <li>Servicios de correo</li>
            <li>Almacenamiento seguro</li>
          </ul>
          <p>Estos proveedores deben cumplir con estándares razonables de privacidad y seguridad.</p>

          <h2>6. Seguridad de los datos</h2>
          <p>
            Implementamos medidas técnicas, administrativas y físicas para proteger tu información,
            incluyendo:
          </p>
          <ul>
            <li>Cifrado SSL (cuando aplique)</li>
            <li>Servidores con acceso controlado</li>
            <li>Contraseñas seguras</li>
            <li>Protocolos básicos de prevención de intrusiones</li>
          </ul>

          <h2>7. Conservación de la información</h2>
          <p>
            Los datos se conservarán únicamente durante el tiempo necesario para cumplir la
            finalidad para la que fueron obtenidos, o por obligaciones legales aplicables.
          </p>

          <h2>8. Derechos del usuario</h2>
          <p>Puedes solicitar:</p>
          <ul>
            <li>Acceso a tu información personal.</li>
            <li>Rectificación de datos incorrectos o desactualizados.</li>
            <li>Eliminación de datos cuando ya no sean necesarios.</li>
            <li>Limitación u oposición al tratamiento en casos específicos.</li>
            <li>Revocación de tu consentimiento cuando el tratamiento se base en él.</li>
          </ul>

          <h2>9. ¿Cómo solicitar que borremos tus datos?</h2>
          <p>
            Escríbenos a <a href="mailto:privacidad@relead.com.mx">privacidad@relead.com.mx</a> o
            <a href="mailto:contacto@relead.com.mx">contacto@relead.com.mx</a> con el asunto
            “Solicitud de eliminación de datos”.
          </p>

          <h2>10. Cambios a esta política</h2>
          <p>
            ReLead Digital puede modificar esta Política de Privacidad para adaptarse a cambios
            legales, técnicos o de negocio. La fecha de actualización siempre será visible al inicio
            del documento.
          </p>

          <h2>11. Contacto</h2>
          <p>
            Para dudas relacionadas con privacidad, escribe a
            <a href="mailto:privacidad@relead.com.mx">privacidad@relead.com.mx</a>.
          </p>
          <p className="text-slate-700">Este documento es de carácter informativo y no constituye asesoría legal. Consulta con un profesional para casos específicos.</p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;
