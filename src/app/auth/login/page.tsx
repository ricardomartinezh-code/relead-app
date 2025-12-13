// src/app/auth/login/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-50">
            Inicia sesión en ReLead
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Accede a tu panel para crear y gestionar tus páginas de enlaces.
          </p>
        </header>

        <SignIn
          routing="path"
          path="/auth/login"
          signUpUrl="/auth/register"
          // `redirectUrl` has been deprecated in newer versions of Clerk.  Use
          // `fallbackRedirectUrl` instead to avoid runtime warnings.  See
          // https://clerk.com/docs/guides/custom-redirects#redirect-url-props for details.
          fallbackRedirectUrl="/dashboard"
          appearance={clerkAuthAppearance}
        />
      </div>
    </main>
  );
}
