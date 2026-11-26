"use client";

import { useActionState, useEffect, useRef } from "react";
import { createChannel } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function ChannelForm() {
  const [state, action] = useActionState(createChannel, {});
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 lg:grid-cols-[1fr_150px_2fr_auto] lg:items-start">
      <div>
        <input name="name" placeholder="Team Discord" className="field" aria-label="Channel name" required />
        {e.name && <p className="mt-1.5 text-[13px] text-down">{e.name}</p>}
      </div>
      <select name="type" className="field" aria-label="Channel type" defaultValue="discord">
        <option value="discord">Discord</option>
        <option value="slack">Slack</option>
        <option value="webhook">Webhook</option>
      </select>
      <div>
        <input name="url" type="url" placeholder="https://discord.com/api/webhooks/…" className="field num" aria-label="Webhook URL" required />
        {e.url && <p className="mt-1.5 text-[13px] text-down">{e.url}</p>}
      </div>
      <SubmitButton pendingText="Adding">Add channel</SubmitButton>
      {state.message && <p className="caps text-ink-2 lg:col-span-4" role="status">{state.message}</p>}
    </form>
  );
}
