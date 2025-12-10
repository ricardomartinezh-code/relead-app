"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <SignIn
          path="/auth/login"
          signUpUrl="/auth/register"
          // `redirectUrl` is deprecated; replace with `fallbackRedirectUrl` per Clerk docs
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
