import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";

const PrivacyPage = () => {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Legal
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Política de privacidad</h1>
            <p className="text-sm text-slate-500">Última actualización: noviembre 2025</p>
          </div>
          <Link
            href="/dashboard/legal/terms"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Ver términos
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
  <div className="prose prose-slate max-w-none">
    <p className="uppercase tracking-wide text-sm text-slate-600">Protección de datos personales</p>
    <h1>Política de Privacidad de ReLead</h1>
    <p>
      <strong>Última actualización:</strong> noviembre 2025
    </p>

    <p>
      Esta Política de Privacidad describe la forma en que ReLead trata los datos personales de las
      personas usuarias que acceden a la plataforma, crean cuentas de administración o navegan por las
      páginas públicas generadas mediante el Servicio. El tratamiento se realiza conforme a principios de
      licitud, lealtad, transparencia, minimización de datos y responsabilidad proactiva.
    </p>

    <h2>1. Responsable y categorías de datos tratados</h2>
    <p>
      ReLead actúa como responsable del tratamiento respecto de los datos necesarios para operar el
      panel de administración, las páginas de enlaces y las integraciones asociadas. Para la fase de
      autenticación, se emplea un proveedor especializado (actualmente, Clerk), que actúa como
      encargado o corresponsable del tratamiento según corresponda.
    </p>
    <p>En términos generales, se tratan las siguientes categorías de datos:</p>
    <ul>
      <li>Datos identificativos: nombre, alias público, identificadores de cuenta y correos electrónicos.</li>
      <li>
        Datos de configuración: preferencias de diseño, enlaces publicados, parámetros de medición y
        metadatos asociados a las páginas.
      </li>
      <li>
        Datos de uso: información de analítica básica (por ejemplo, visitas a páginas, clics en enlaces,
        país aproximado e información de dispositivo).
      </li>
      <li>
        Datos derivados de comunicación: mensajes enviados mediante formularios o canales de contacto
        habilitados por la persona usuaria.
      </li>
    </ul>

    <h2>2. Finalidades del tratamiento y bases de legitimación</h2>
    <p>Los datos se tratan para las siguientes finalidades principales:</p>
    <ol>
      <li>Permitir la creación y administración de cuentas de usuario y páginas de enlaces.</li>
      <li>Garantizar la seguridad y funcionamiento adecuado del Servicio, incluyendo prevención de abuso.</li>
      <li>Proporcionar soporte técnico y comunicarnos sobre cambios relevantes o incidencias.</li>
      <li>Analizar, de manera agregada, el uso de la plataforma para mejorar su desempeño.</li>
    </ol>
    <p>
      Dependiendo del contexto, las bases de legitimación incluyen: (i) la ejecución de un contrato
      (prestación del Servicio), (ii) el cumplimiento de obligaciones legales aplicables y (iii) el
      interés legítimo de ReLead en mejorar y proteger la plataforma. En los casos en los que resulte
      necesario, se solicitará el consentimiento expreso de la persona usuaria.
    </p>

    <h2>3. Conservación y seguridad de la información</h2>
    <p>
      Los datos se conservarán únicamente durante el tiempo necesario para cumplir con las finalidades
      antes descritas o durante los plazos exigidos por la normativa aplicable. Con carácter general,
      la información asociada a la cuenta se mantiene mientras esta permanezca activa y se elimina o
      anonimiza cuando la persona usuaria solicita su cancelación, salvo que exista una obligación
      legal de conservación.
    </p>
    <p>
      ReLead implementa medidas técnicas y organizativas razonables para proteger la información frente
      a accesos no autorizados, pérdida, alteración o divulgación indebida, incluyendo controles de
      acceso, cifrado en tránsito cuando sea aplicable y revisiones periódicas de la infraestructura.
    </p>

    <h2>4. Comunicación de datos y transferencias</h2>
    <p>
      Los datos pueden compartirse con proveedores que prestan servicios de infraestructura, análisis,
      envío de comunicaciones, autenticación o almacenamiento, siempre bajo contratos que incluyen
      obligaciones de confidencialidad y seguridad. Cuando dichos proveedores se ubiquen fuera del
      país de residencia de la persona usuaria, se adoptarán las salvaguardas adecuadas exigidas por
      la normativa aplicable.
    </p>

    <h2>5. Derechos de las personas usuarias</h2>
    <p>
      De conformidad con la normativa de protección de datos aplicable, las personas usuarias pueden
      ejercer, entre otros, los derechos de acceso, rectificación, cancelación o supresión, oposición,
      limitación del tratamiento y portabilidad, en la medida en que resulten procedentes.
    </p>
    <p>
      Para ejercer estos derechos o formular consultas relacionadas con privacidad, se podrá remitir
      una solicitud al canal de contacto indicado en la plataforma, aportando información suficiente
      para acreditar la identidad de la persona solicitante.
    </p>

    <h2>6. Actualizaciones de esta Política</h2>
    <p>
      ReLead podrá actualizar esta Política cuando se introduzcan nuevas funcionalidades, cambien los
      proveedores tecnológicos o se modifiquen los requisitos legales aplicables. En caso de cambios
      sustanciales, se procurará notificarlo a las personas usuarias registradas a través del panel o
      de los medios de contacto disponibles.
    </p>

    <p className="text-sm text-slate-700">
      <em>
        Esta Política de Privacidad tiene un carácter general y orientativo. No constituye asesoría
        legal individualizada. Para interpretar su alcance en contextos específicos, se recomienda
        consultar con una persona profesional especializada en derecho de datos personales.
      </em>
    </p>
  </div>
</div>
</div>
    </DashboardLayout>
  );
};

export default PrivacyPage;
