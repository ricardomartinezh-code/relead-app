import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUserForClerk } from "./db";

export type AppUser = {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  profileId?: string | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    null;
  const name = clerkUser?.fullName || clerkUser?.username || email || null;
  const username = clerkUser?.username || (email ? email.split("@")[0] : null);

  const dbUser = await ensureUserForClerk({
    clerkUserId: userId,
    email,
    name,
    username,
  });

  return {
    id: dbUser.id,
    clerkId: userId,
    email: dbUser.email ?? email ?? null,
    name: dbUser.name ?? name ?? null,
    profileId: dbUser.profileId ?? null,
  };
}

export async function getSession() {
  const user = await getCurrentUser();
  return user ? { user } : null;
}
