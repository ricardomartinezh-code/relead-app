import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
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
          <Script id="chatbase-embed" strategy="afterInteractive">{`
            (function() {
              if (!window.chatbase || window.chatbase("getState") !== "initialized") {
                window.chatbase = (...arguments) => {
                  if (!window.chatbase.q) {
                    window.chatbase.q = [];
                  }
                  window.chatbase.q.push(arguments);
                };
                window.chatbase = new Proxy(window.chatbase, {
                  get(target, prop) {
                    if (prop === "q") {
                      return target.q;
                    }
                    return (...args) => target(prop, ...args);
                  },
                });
              }
              const onLoad = function() {
                const script = document.createElement("script");
                const host = "${process.env.NEXT_PUBLIC_CHATBASE_HOST ?? "https://www.chatbase.co/"}";
                const normalizedHost = host.endsWith("/") ? host : `${host}/`;
                script.src = `${normalizedHost}embed.min.js`;
                script.id = "${process.env.NEXT_PUBLIC_CHATBOT_ID ?? ""}";
                try {
                  script.domain = new URL(normalizedHost).hostname;
                } catch {
                  script.domain = "www.chatbase.co";
                }
                document.body.appendChild(script);
              };
              if (document.readyState === "complete") {
                onLoad();
              } else {
                window.addEventListener("load", onLoad);
              }
            })();
          `}</Script>
        </MetaSdkProvider>
      </body>
    </html>
  );
}
