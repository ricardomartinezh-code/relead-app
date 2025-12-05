import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { MetaSdkProvider } from "./providers/MetaSdkProvider";

export const metadata: Metadata = {
  title: "ReLead | Link in bio sencillo",
  description: "Crea y comparte tu landing de links con ReLead",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <MetaSdkProvider>
          {children}
          <SpeedInsights />
        </MetaSdkProvider>
      </body>
    </html>
  );
}
