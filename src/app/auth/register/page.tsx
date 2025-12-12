
    import React from "react"; // Asegurando que React esté importado
    
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
    formButton: {
      backgroundColor: '#1877f2',
      color: '#fff',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      height: '40px',
      padding: '0 24px',
    },
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
