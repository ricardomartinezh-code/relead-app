// src/app/auth/register/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-50">
            Crea tu cuenta en ReLead
          </h1>
        </header>
        
          <SignUp
          path="/auth/register"
          routing="path"
          signInUrl="/auth/login"
          // Clerk deprecated `redirectUrl`, use `fallbackRedirectUrl` instead.  See docs for details.
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium",
              card: "bg-transparent shadow-none p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-slate-800 hover:bg-slate-700 border border-slate-700",
            },
          }}
        />
      </div>
    </main>
  );
}
