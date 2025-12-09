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

export const metadata: Metadata = {
  title: "ReLead | Link en bio listo para producción",
  description:
    "Crea y mide tu página de enlaces con un diseño pulido y analíticas claras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
        >
          {children}
          {/* Añadimos el pie de página al final del documento */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
