"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <SignUp
          redirectUrl="/dashboard"
          appearance={{ elements: { formButtonPrimary: "bg-slate-900 hover:bg-slate-800" } }}
        />
      </div>
    </div>
  );
}
