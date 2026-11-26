"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, action] = useActionState(login, {});
  const error = state.errors?.password;

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <form action={action} className="w-full max-w-sm">
        <Logo />
        <h1 className="display mt-12 text-5xl">Sign in</h1>
        <p className="mt-3 text-ink-2">Enter the admin password to manage monitors.</p>

        <label htmlFor="password" className="caps mt-10 block border-t border-rule pt-5 text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="field mt-3"
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
        />
        {error && (
          <p id="password-error" className="mt-2 text-[13px] text-down">
            {error}. Try again.
          </p>
        )}
        <SubmitButton pendingText="Signing in" className="control-primary mt-6 w-full">
          Sign in
        </SubmitButton>
      </form>
    </main>
  );
}
