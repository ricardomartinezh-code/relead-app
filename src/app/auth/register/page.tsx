// src/app/auth/register/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        {/*
          Configure the Clerk SignUp component using the newer `fallbackRedirectUrl` prop
          and a single `elements` object. Avoid nesting `elements` within another
          `elements` object as that will cause a syntax error during compilation.

          We provide two style overrides here:
          - `formButton` tweaks the base button that Clerk renders (e.g. the social login button)
          - `formButtonPrimary` adjusts the primary action button used in the form

          These styles ensure the buttons integrate nicely with the overall color scheme.
        */}
        <SignUp
          path="/auth/register"
          routing="path"
          signInUrl="/auth/login"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButton: {
                backgroundColor: "#1877f2",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                height: "40px",
                padding: "0 24px",
              },
              formButtonPrimary: "bg-slate-900 hover:bg-slate-800 text-white",
            },
          }}
        />
      </div>
    </div>
  );
}
