import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Importamos el pie de página que contendrá enlaces legales y versión
import { Footer } from "@/components/Footer";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = "https://relead.com.mx";
const defaultTitle = "ReLead | Link en bio listo para producción";
const defaultDescription =
  "Crea y mide tu página de enlaces con un diseño pulido y analíticas claras.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | ReLead",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    siteName: "ReLead",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "ReLead – panel de enlaces tipo link-in-bio",
      },
    ],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* Prefijo ogp.me para Open Graph */}
      <html lang="es" prefix="og: http://ogp.me/ns#">
        <body
          className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased`}
        >
          {children}
          {/* Añadimos el pie de página al final del documento */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
