// src/app/auth/register/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-50">
            Crea tu cuenta en ReLead
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Regístrate para empezar a crear y medir tus enlaces.
          </p>
        </header>
        <SignUp
          path="/auth/register"
          routing="path"
          signInUrl="/auth/login"
          fallbackRedirectUrl="/dashboard"
          appearance={clerkAuthAppearance}
        />
      </div>
    </main>
  );
}
