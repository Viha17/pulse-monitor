"use client";

import { useState, useTransition } from "react";
import { testChannel } from "@/app/actions";

export function ChannelTestButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <span className="inline-flex items-center gap-3">
      {result && (
        <span role="status" className={`text-[13px] ${result.ok ? "text-ink-2" : "text-down"}`}>
          {result.message}
        </span>
      )}
      <button type="button" disabled={pending} onClick={() => start(async () => setResult(await testChannel(id)))} className="control control-sm">
        {pending ? "Sending" : "Send test"}
      </button>
    </span>
  );
}
