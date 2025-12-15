"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ClerkCtaButtons(props: {
  signInVariant?: React.ComponentProps<typeof Button>["variant"];
  signInSize?: React.ComponentProps<typeof Button>["size"];
  signInClassName?: string;
  signUpVariant?: React.ComponentProps<typeof Button>["variant"];
  signUpSize?: React.ComponentProps<typeof Button>["size"];
  signUpClassName?: string;
}) {
  const {
    signInVariant = "ghost",
    signInSize = "sm",
    signInClassName,
    signUpVariant = "default",
    signUpSize = "sm",
    signUpClassName,
  } = props;

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            type="button"
            variant={signInVariant}
            size={signInSize}
            className={signInClassName}
          >
            Ingresar
          </Button>
        </SignInButton>

        <SignUpButton mode="modal">
          <Button
            type="button"
            variant={signUpVariant}
            size={signUpSize}
            className={signUpClassName}
          >
            Crear mi página
          </Button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        <Button asChild size={signUpSize} variant={signUpVariant} className={signUpClassName}>
          <Link href="/dashboard">Ir al panel</Link>
        </Button>
      </SignedIn>
    </>
  );
}

