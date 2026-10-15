"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { signOutAction } from "@/app/actions/auth";

interface SignOutButtonProps {
  className?: string;
  showIcon?: boolean;
  variant?: "ghost" | "desktop" | "menu";
  label?: string;
  onSignedOut?: () => void;
}

export function SignOutButton({
  className = "",
  showIcon = true,
  variant = "ghost",
  label = "Sign out",
  onSignedOut,
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      if (onSignedOut) onSignedOut();
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.warn("Client signOut failed, falling back to server action:", err);
      try {
        await signOutAction();
      } catch (err2) {
        console.error("Server action signOut failed, redirecting:", err2);
        window.location.href = "/api/auth/signout";
      }
    }
  }

  let baseStyles =
    "inline-flex items-center gap-1.5 text-body-sm transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-wait font-medium";

  if (variant === "desktop") {
    baseStyles =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 border border-transparent hover:border-error/20 transition-all duration-150 cursor-pointer font-medium disabled:opacity-70 disabled:cursor-wait";
  } else if (variant === "menu") {
    baseStyles =
      "w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-body-sm text-error hover:bg-error-container/20 transition-all duration-150 cursor-pointer font-medium disabled:opacity-70 disabled:cursor-wait text-left";
  } else {
    baseStyles =
      "inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-error transition-colors px-2.5 py-1 rounded-lg hover:bg-surface-container-high cursor-pointer disabled:opacity-70 disabled:cursor-wait";
  }

  return (
    <button
      type="button"
      id="sign-out-btn"
      onClick={handleSignOut}
      disabled={loading}
      className={`${baseStyles} ${className}`.trim()}
      title="Sign out of Wardrobe AI"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
          <span>Signing out...</span>
        </>
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 shrink-0" />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
