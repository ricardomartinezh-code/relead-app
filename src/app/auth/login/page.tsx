// src/app/auth/login/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        {/* Encabezado personalizado */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-50">
            Inicia sesión en ReLead
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Accede a tu panel para crear y gestionar tus páginas de enlaces.
          </p>
        </header>

        {/* Clerk SignIn incrustado en tu layout */}
        <SignIn
          routing="path"
          path="/auth/login"
          appearance={{
            elements: {
              // Botón principal
              formButtonPrimary:
                "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium",

              // Quitar el “card” blanco de Clerk y usar el tuyo
              card: "bg-transparent shadow-none p-0",

              // Opcional: ocultar títulos internos de Clerk
              headerTitle: "hidden",
              headerSubtitle: "hidden",

              // Estilos de los botones sociales (Google, etc.)
              socialButtonsBlockButton:
                "bg-slate-800 hover:bg-slate-700 border border-slate-700",
            },
          }}
        />
      </div>
    </main>
  );
}
