import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";

const TermsPage = () => {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Legal
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Términos y condiciones</h1>
            <p className="text-sm text-slate-500">Última actualización: noviembre 2025</p>
          </div>
          <Link
            href="/dashboard/legal/privacy"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Ver privacidad
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
  <div className="prose prose-slate max-w-none">
    <p className="uppercase tracking-wide text-sm text-slate-600">Marco contractual</p>
    <h1>Términos y Condiciones de Uso de la Plataforma ReLead</h1>
    <p>
      <strong>Última actualización:</strong> noviembre 2025
    </p>

    <p>
      El presente documento establece los términos y condiciones (en adelante, los
      <strong>“Términos”</strong>) que regulan el acceso y uso de la plataforma ReLead
      (en conjunto, el <strong>“Servicio”</strong>). Al crear una cuenta, acceder al panel de
      administración o utilizar cualquiera de las funcionalidades vinculadas a la gestión de
      páginas de enlaces, declaras que has leído, entendido y aceptado íntegramente estos
      Términos.
    </p>

    <h2>1. Objeto y alcance del Servicio</h2>
    <p>
      ReLead es una plataforma digital que permite a personas físicas y morales crear, administrar
      y analizar páginas de enlaces, así como conectar integraciones de terceros (por ejemplo,
      herramientas de mensajería o redes sociales). El Servicio se ofrece exclusivamente en
      modalidad <em>software as a service</em> (SaaS) y se limita a las funcionalidades descritas
      en la interfaz y documentación oficial.
    </p>

    <h2>2. Registro de cuenta y autenticación</h2>
    <p>
      La autenticación de usuarios se gestiona mediante un proveedor externo especializado
      (actualmente, Clerk). Los datos esenciales de autenticación (como correo electrónico e
      identificadores únicos de usuario) son tratados por dicho proveedor, mientras que ReLead
      conserva únicamente la información necesaria para vincular la cuenta con los perfiles, páginas
      y configuraciones creadas en la plataforma.
    </p>
    <p>
      Eres responsable de la veracidad de los datos que proporciones al registrarte y de mantener la
      confidencialidad de tus credenciales de acceso. Cualquier actividad realizada desde tu cuenta
      se presumirá efectuada por ti o por personas autorizadas bajo tu responsabilidad.
    </p>

    <h2>3. Uso permitido y comportamiento del usuario</h2>
    <p>El uso del Servicio debe ajustarse a fines lícitos y compatibles con estos Términos. En particular, se prohíbe:</p>
    <ul>
      <li>Utilizar ReLead para publicar contenido ilícito, engañoso, difamatorio o que infrinja derechos de terceros.</li>
      <li>Intentar vulnerar la seguridad, integridad o disponibilidad de la plataforma o de sus bases de datos.</li>
      <li>Automatizar el acceso o la creación de cuentas sin autorización expresa de ReLead.</li>
      <li>Utilizar el Servicio de forma que pueda dañar la reputación comercial de ReLead o de sus clientes.</li>
    </ul>

    <h2>4. Contenido generado por el usuario</h2>
    <p>
      Eres titular del contenido que publiques en tus páginas (textos, imágenes, enlaces y marcas,
      entre otros). Al utilizar el Servicio, concedes a ReLead una licencia limitada, no exclusiva,
      mundial y revocable para alojar, mostrar y procesar dicho contenido únicamente con la finalidad
      de prestar el Servicio y mejorar su funcionamiento.
    </p>
    <p>
      Garantizas que cuentas con los derechos necesarios para utilizar y publicar el contenido
      incorporado en la plataforma y te comprometes a mantener indemne a ReLead frente a cualquier
      reclamación de terceros derivada de dicho contenido.
    </p>

    <h2>5. Planes, modificaciones y disponibilidad del Servicio</h2>
    <p>
      ReLead podrá introducir nuevas características, modificar o descontinuar funcionalidades,
      así como actualizar precios o planes de suscripción. En caso de cambios sustanciales que afecten
      de manera relevante el uso del Servicio, se procurará notificar a las personas usuarias con una
      antelación razonable a través de los medios de contacto registrados.
    </p>
    <p>
      Aunque se aplican medidas técnicas y organizativas para asegurar la continuidad del Servicio,
      ReLead no garantiza disponibilidad ininterrumpida ni ausencia total de errores o interrupciones.
    </p>

    <h2>6. Responsabilidad y limitación de daños</h2>
    <p>
      En la medida permitida por la legislación aplicable, ReLead no será responsable por daños
      indirectos, incidentales, especiales, punitivos o consecuenciales derivados del uso o la
      imposibilidad de uso del Servicio. La responsabilidad total acumulada de ReLead frente a una
      persona usuaria, por cualquier concepto, se limitará al monto efectivamente pagado por dicha
      persona en los últimos doce (12) meses previos al hecho generador del daño.
    </p>

    <h2>7. Protección de datos personales</h2>
    <p>
      El tratamiento de datos personales se rige por la Política de Privacidad de ReLead, la cual forma
      parte integrante de estos Términos. Al utilizar el Servicio, reconoces que has leído y aceptado
      dicha Política y que comprendes cómo se tratan tus datos, incluidos los que se almacenan en
      proveedores externos de autenticación y de infraestructura.
    </p>

    <h2>8. Propiedad intelectual</h2>
    <p>
      ReLead y sus licenciantes conservan todos los derechos de propiedad intelectual sobre el código,
      la marca, la interfaz visual y los materiales asociados con la plataforma. Nada en estos Términos
      deberá interpretarse como una cesión de derechos de propiedad intelectual, más allá de las
      licencias limitadas necesarias para el uso del Servicio.
    </p>

    <h2>9. Terminación y suspensión de cuentas</h2>
    <p>
      ReLead podrá suspender o cancelar el acceso al Servicio cuando detecte incumplimientos graves o
      reiterados de estos Términos, uso fraudulento o actividades que comprometan la seguridad de la
      plataforma o de terceros. En tales casos, se procurará notificar a la persona usuaria, salvo que
      exista una prohibición legal o un riesgo grave que lo impida.
    </p>

    <h2>10. Legislación aplicable y resolución de controversias</h2>
    <p>
      Estos Términos se interpretarán conforme a la legislación aplicable en materia mercantil y de
      comercio electrónico del país en el que ReLead tenga su domicilio principal, sin perjuicio de las
      normas de derecho internacional privado que puedan resultar aplicables.
    </p>
    <p>
      Cualquier controversia derivada de la interpretación o ejecución de estos Términos se procurará
      resolver en primera instancia mediante negociación de buena fe. Si no se alcanza un acuerdo, las
      partes podrán someter la disputa a los tribunales competentes del domicilio de ReLead.
    </p>

    <p className="text-sm text-slate-700">
      <em>
        Este documento tiene carácter informativo y general. Para situaciones específicas o de alta
        complejidad jurídica, se recomienda obtener asesoría legal independiente.
      </em>
    </p>
  </div>
</div>
</div>
    </DashboardLayout>
  );
};

export default TermsPage;
