"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

export function AuthButton() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50"
            aria-label="Sign in"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-violet-200",
            },
          }}
        />
      </Show>
    </>
  );
}
