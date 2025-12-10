// src/app/auth/register/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <SignUp
          path="/auth/register"
          routing="path"
          signInUrl="/auth/login"
          // Clerk deprecated `redirectUrl`, use `fallbackRedirectUrl` instead.  See docs for details.
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-slate-900 hover:bg-slate-800 text-white",
            },
          }}
        />
      </div>
    </div>
  );
}
