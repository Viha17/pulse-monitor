import { deleteChannel, toggleChannel } from "@/app/actions";
import { ChannelForm } from "@/components/channel-form";
import { ChannelTestButton } from "@/components/channel-test-button";
import { getChannels } from "@/lib/queries";

export const metadata = { title: "Alerts" };

const typeLabel = { discord: "Discord", slack: "Slack", webhook: "Webhook" } as const;

function maskUrl(url: string) {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname.slice(0, 18)}…`;
  } catch {
    return "invalid URL";
  }
}

export default async function SettingsPage() {
  const channels = await getChannels();

  return (
    <div className="max-w-5xl">
      <header className="border-b border-ink pb-8">
        <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">Alert channels</h1>
        <p className="mt-4 max-w-[60ch] text-ink-2">
          Pulse posts here when a monitor goes down, when it recovers, and when an SSL certificate has 14 days or less left.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="add-heading">
        <h2 id="add-heading" className="caps mb-4">
          Add a channel
        </h2>
        <ChannelForm />
        <p className="mt-4 max-w-[75ch] text-[13px] text-ink-3">
          Discord: Server settings › Integrations › Webhooks. Slack: create an Incoming Webhook. Webhook sends a JSON payload to any HTTPS endpoint.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="channels-heading">
        <h2 id="channels-heading" className="caps border-b border-ink pb-3">
          Channels <span className="num ml-2 text-ink-3">{channels.length}</span>
        </h2>
        {channels.length === 0 ? (
          <p className="py-6 text-[14px] text-ink-2">No channels yet. Until you add one, alerts only appear in the worker log.</p>
        ) : (
          <ul>
            {channels.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule py-4">
                <span aria-hidden className={`inline-block size-2 ${c.enabled ? "bg-ink" : "bg-paused"}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {c.name}
                    {!c.enabled && <span className="caps ml-3 text-ink-3">Disabled</span>}
                  </div>
                  <div className="num truncate text-[11px] text-ink-3">
                    {typeLabel[c.type]} · {maskUrl(c.url)}
                  </div>
                </div>
                <ChannelTestButton id={c.id} />
                <form action={toggleChannel.bind(null, c.id, !c.enabled)}>
                  <button className="control control-sm">{c.enabled ? "Disable" : "Enable"}</button>
                </form>
                <form action={deleteChannel.bind(null, c.id)}>
                  <button className="control-danger control-sm">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
