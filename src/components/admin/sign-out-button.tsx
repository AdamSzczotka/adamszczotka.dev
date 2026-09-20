"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={async () => {
        setSigningOut(true);
        try {
          await authClient.signOut();
          router.replace("/admin/login");
          router.refresh();
        } catch {
          setSigningOut(false);
        }
      }}
      className="w-full flex items-center gap-3 px-3 py-2 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
    >
      {label}
    </button>
  );
}
