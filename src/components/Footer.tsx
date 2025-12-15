import Link from "next/link";
import Image from "next/image";

const FOOTER_LOGO_SRC = "/branding/recalc-logo.gif";
const FOOTER_LOGO_ALT = "Recalc Scholarship";

/**
 * Pie de página que muestra enlaces a las páginas legales y la leyenda de
 * derechos de autor.  Se incluye al final de la aplicación para que los
 * usuarios puedan acceder siempre a los Términos y la Política de
 * Privacidad.  También muestra la versión actual de la aplicación.
 */
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={FOOTER_LOGO_SRC}
              alt={FOOTER_LOGO_ALT}
              width={160}
              height={56}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
            <Link
              href="/legal/terms"
              className="hover:text-slate-900 underline-offset-4 hover:underline"
            >
              Términos
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              href="/legal/privacy"
              className="hover:text-slate-900 underline-offset-4 hover:underline"
            >
              Privacidad
            </Link>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Powered by ReLead©
          <span className="ml-1 text-[10px] align-baseline">V2.1.0</span>
        </div>
      </div>
    </footer>
  );
}
