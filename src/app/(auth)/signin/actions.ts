"use server";

import { signIn } from "@/auth";

export async function handleGoogleSignIn(callbackUrl?: string) {
  await signIn("google", {
    redirectTo:
      typeof callbackUrl === "string" && callbackUrl
        ? callbackUrl
        : "/wardrobe",
  });
}
