import Image from "next/image";
import Link from "next/link";

const CORNER_LOGO_SRC = "/branding/recalc-logo.gif";
const CORNER_LOGO_ALT = "Recalc Scholarship";

export function CornerLogo() {
  return (
    <Link
      href="/"
      aria-label="Inicio"
      className="fixed bottom-4 right-4 z-50 hidden rounded-full bg-white/80 p-2 shadow-lg backdrop-blur transition hover:bg-white sm:block"
    >
      <Image
        src={CORNER_LOGO_SRC}
        alt={CORNER_LOGO_ALT}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-contain"
      />
    </Link>
  );
}

