/**
 * MX Record checker using Cloudflare DNS-over-HTTPS (free, no API key).
 *
 * Usage:
 *   const result = await checkMx("boulangerie-martin.fr");
 *   // { valid: true, records: ["mx1.ovh.net", "mx2.ovh.net"] }
 *
 * How it works:
 *   1. Send HTTPS GET to Cloudflare's DoH endpoint with ?type=MX
 *   2. If we get MX records back → domain can receive email → valid
 *   3. If empty or error → domain has no mail server → invalid
 */

export interface MxResult {
  domain: string;
  valid: boolean;
  records: string[];
  checkedAt: string;
}

const DOH_URL = "https://cloudflare-dns.com/dns-query";

export async function checkMx(domain: string): Promise<MxResult> {
  const now = new Date().toISOString();

  if (!domain || domain.length < 3) {
    return { domain, valid: false, records: [], checkedAt: now };
  }

  try {
    const url = `${DOH_URL}?name=${encodeURIComponent(domain)}&type=MX`;
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
    });

    if (!res.ok) {
      return { domain, valid: false, records: [], checkedAt: now };
    }

    const data = await res.json();

    // data.Answer contains MX records if they exist
    const mxRecords: string[] = (data.Answer || [])
      .filter((r: { type: number }) => r.type === 15) // type 15 = MX
      .map((r: { data: string }) => {
        // MX data format: "10 mx1.example.com." → extract the hostname
        const parts = r.data.split(" ");
        return parts.length >= 2
          ? parts[1].replace(/\.$/, "") // remove trailing dot
          : r.data;
      });

    return {
      domain,
      valid: mxRecords.length > 0,
      records: mxRecords,
      checkedAt: now,
    };
  } catch {
    return { domain, valid: false, records: [], checkedAt: now };
  }
}

/**
 * Batch check multiple domains. Runs in parallel with concurrency limit.
 */
export async function checkMxBatch(
  domains: string[],
  concurrency = 5
): Promise<MxResult[]> {
  const results: MxResult[] = [];
  const queue = [...domains];

  async function worker() {
    while (queue.length > 0) {
      const domain = queue.shift()!;
      results.push(await checkMx(domain));
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, domains.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
}
