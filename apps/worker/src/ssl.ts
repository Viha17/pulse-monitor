import net from "node:net";
import tls from "node:tls";

/** Returns when the site's TLS certificate expires, or null if it can't be read. */
export function getCertificateExpiry(url: string, timeoutMs = 10_000): Promise<Date | null> {
  const { protocol, hostname, port } = new URL(url);
  if (protocol !== "https:") return Promise.resolve(null);

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: Number(port) || 443,
        servername: net.isIP(hostname) ? undefined : hostname,
        // We only want to read the certificate, even if it's expired or self-signed.
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve(cert?.valid_to ? new Date(cert.valid_to) : null);
      },
    );
    socket.once("error", () => resolve(null));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(null);
    });
  });
}
