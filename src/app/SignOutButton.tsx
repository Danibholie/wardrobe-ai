"use client";

import { useFormStatus } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-error transition-colors px-2.5 py-1 rounded-lg hover:bg-surface-container-high cursor-pointer disabled:opacity-70 disabled:cursor-wait"
      title="Sign out"
    >
      {pending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </>
      )}
    </button>
  );
}
