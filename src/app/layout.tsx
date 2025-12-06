import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MetaSdkProvider } from "./providers/MetaSdkProvider";

export const metadata: Metadata = {
  title: "ReLead | Link in bio sencillo",
  description: "Crea y comparte tu landing de links con ReLead",
};

const chatbaseHost = process.env.NEXT_PUBLIC_CHATBASE_HOST ?? "https://www.chatbase.co/";
const chatbotId = process.env.NEXT_PUBLIC_CHATBOT_ID ?? "";
const shouldLoadChatbase = Boolean(chatbotId);
const normalizedChatbaseHost = chatbaseHost.endsWith("/") ? chatbaseHost : `${chatbaseHost}/`;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <MetaSdkProvider>
          {children}
          <Analytics />
          <SpeedInsights />
          {shouldLoadChatbase ? (
            <Script id="chatbase-embed" strategy="afterInteractive">
              {`
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
                    const normalizedHost = ${JSON.stringify(normalizedChatbaseHost)};
                    script.src = normalizedHost + "embed.min.js";
                    script.id = ${JSON.stringify(chatbotId)};
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
              `}
            </Script>
          ) : null}
        </MetaSdkProvider>
      </body>
    </html>
  );
}
