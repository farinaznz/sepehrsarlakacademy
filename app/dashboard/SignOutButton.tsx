"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      className="button button-ghost"
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        window.location.assign("/");
      }}
    >
      {pending ? "در حال خروج…" : "خروج از حساب"}
    </button>
  );
}
