const TermsPage = () => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="sr-only">Documento legal de términos y condiciones de ReLead Digital.</p>
        <a className="skip-link" href="#contenido-principal">
          Saltar al contenido principal
        </a>

        <h1 className="text-3xl font-semibold mb-6">Términos y condiciones</h1>

        <div id="contenido-principal" className="prose prose-slate">
          <p className="uppercase tracking-wide text-sm text-gray-500">Legal</p>
          <h1>Términos y Condiciones de Uso — ReLead Digital</h1>
          <p>
            <strong>Última actualización:</strong> noviembre 2025
          </p>

          <p>
            Estos Términos y Condiciones regulan el acceso y uso del sitio web de ReLead Digital
            (relead.com.mx y sus subdominios), así como las interacciones básicas relacionadas con
            la solicitud de información y de servicios digitales.
          </p>

          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder, navegar o utilizar este sitio, aceptas quedar vinculado por estos Términos y
            Condiciones. Si no estás de acuerdo con alguna de las disposiciones aquí descritas, te
            pedimos que no utilices el sitio.
          </p>

          <h2>2. Uso permitido del sitio</h2>
          <p>El uso del sitio se limita a fines personales y/o profesionales legítimos, como:</p>
          <ul>
            <li>Consultar información sobre servicios de branding, diseño y comunicación digital.</li>
            <li>Contactar a ReLead Digital para solicitar información, cotizaciones o colaboraciones.</li>
            <li>Navegar el portafolio y contenidos publicados.</li>
          </ul>
          <p>No está permitido:</p>
          <ul>
            <li>Utilizar el sitio para actividades ilegales, fraudulentas o que vulneren derechos de terceros.</li>
            <li>Intentar acceder a áreas restringidas sin autorización.</li>
            <li>Enviar spam, contenido malicioso o automatizar el acceso al sitio sin permiso.</li>
          </ul>

          <h2>3. Contenido y propiedad intelectual</h2>
          <p>
            Salvo que se indique lo contrario, todos los textos, diseños, logotipos, imágenes, piezas
            gráficas y demás contenidos del sitio pertenecen a ReLead Digital o se utilizan con
            autorización.
          </p>
          <p>
            No se permite reproducir, distribuir, modificar o explotar el contenido con fines
            comerciales sin autorización previa por escrito.
          </p>

          <h2>4. Información sobre servicios</h2>
          <p>
            La información publicada sobre servicios, alcances, plazos y entregables es de carácter
            general. Cada proyecto se define de manera individual a través de propuestas, cotizaciones
            o contratos específicos.
          </p>
          <p>
            ReLead Digital se reserva el derecho de actualizar, modificar o retirar servicios del sitio
            sin previo aviso.
          </p>

          <h2>5. Enlaces externos</h2>
          <p>
            El sitio puede contener enlaces a sitios de terceros (por ejemplo, redes sociales,
            herramientas de mensajería o plataformas externas). ReLead Digital no controla ni garantiza
            el contenido ni las prácticas de privacidad de dichos sitios.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            Aunque se busca mantener la información actualizada y el sitio disponible, no se garantiza
            que el contenido esté libre de errores o que el sitio funcione sin interrupciones.
          </p>
          <p>
            En la medida permitida por la legislación aplicable, ReLead Digital no será responsable por
            daños directos, indirectos o consecuenciales derivados del uso o la imposibilidad de uso del sitio.
          </p>

          <h2>7. Privacidad y datos personales</h2>
          <p>
            El tratamiento de datos personales se regula por la
            <a href="politica-de-privacidad.html">Política de Privacidad</a> de ReLead Digital. Te
            recomendamos leerla cuidadosamente para entender cómo se recopila, utiliza y protege tu
            información.
          </p>

          <h2>8. Comunicaciones</h2>
          <p>
            Cuando nos contactas a través de formularios, correo electrónico o WhatsApp, aceptas
            recibir respuestas relacionadas con tu consulta, propuestas de trabajo o seguimiento de
            proyectos.
          </p>

          <h2>9. Modificaciones a estos términos</h2>
          <p>
            ReLead Digital puede actualizar estos Términos y Condiciones en cualquier momento. La
            versión vigente será la que esté publicada en esta página, indicando la fecha de última actualización.
          </p>

          <h2>10. Legislación aplicable</h2>
          <p>
            En términos generales, estos Términos y Condiciones se interpretan de acuerdo con la
            legislación aplicable en el país desde el cual opera ReLead Digital. Para cuestiones
            específicas o contratos formales, se podrán establecer acuerdos adicionales por escrito.
          </p>

          <h2>11. Contacto</h2>
          <p>
            Si tienes dudas sobre estos Términos y Condiciones, puedes escribir a:<br />
            <a href="mailto:contacto@relead.com.mx">contacto@relead.com.mx</a>
          </p>

          <p className="text-gray-600">
            <em>Este texto tiene fines informativos y generales. No sustituye asesoría legal personalizada.</em>
          </p>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
