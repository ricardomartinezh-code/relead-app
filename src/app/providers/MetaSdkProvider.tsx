"use client";

import Script from "next/script";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MetaSdkContextValue {
  isReady: boolean;
  error: string | null;
  redirectUri: string | null;
}

const MetaSdkContext = createContext<MetaSdkContextValue | undefined>(undefined);

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_REDIRECT_URI = process.env.NEXT_PUBLIC_META_REDIRECT_URI;
const SDK_URL = "https://connect.facebook.net/en_US/sdk.js";

export function MetaSdkProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!META_APP_ID || !META_REDIRECT_URI) {
      setError(
        "Faltan las variables NEXT_PUBLIC_META_APP_ID o NEXT_PUBLIC_META_REDIRECT_URI para inicializar el SDK de Meta."
      );
    }
  }, []);

  useEffect(() => {
    if (!META_APP_ID || !META_REDIRECT_URI) return;

    (window as any).fbAsyncInit = () => {
      if (!(window as any).FB) {
        setError("El SDK de Meta no se cargó correctamente.");
        return;
      }

      (window as any).FB.init({
        appId: META_APP_ID,
        xfbml: false,
        version: "v19.0",
      });

      setIsReady(true);
    };

    return () => {
      delete (window as any).fbAsyncInit;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      isReady,
      error,
      redirectUri: META_REDIRECT_URI ?? null,
    }),
    [error, isReady]
  );

  return (
    <MetaSdkContext.Provider value={contextValue}>
      <Script
        src={SDK_URL}
        async
        defer
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof (window as any).fbAsyncInit === "function") {
            (window as any).fbAsyncInit();
          }
        }}
        onError={() =>
          setError(
            "No se pudo cargar el SDK de Meta. Revisa tu conexión o intenta nuevamente."
          )
        }
      />
      {children}
    </MetaSdkContext.Provider>
  );
}

export function useMetaSdk() {
  const context = useContext(MetaSdkContext);

  if (!context) {
    throw new Error("useMetaSdk debe usarse dentro de MetaSdkProvider");
  }

  return context;
}
