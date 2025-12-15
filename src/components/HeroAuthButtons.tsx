"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroAuthButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SignedOut>
        <SignUpButton
          mode="modal"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        >
          <Button type="button" size="lg" className="flex items-center gap-2">
            Crear mi página
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SignUpButton>

        <SignInButton
          mode="modal"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        >
          <Button type="button" size="lg" variant="outline" className="border-slate-200 bg-white">
            Ir al panel
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Button asChild size="lg" className="flex items-center gap-2">
          <Link href="/dashboard">
            Ir al panel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </SignedIn>
    </div>
  );
}
