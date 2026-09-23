const WINDOW_SECONDS = 60 * 60;

// Ohne Upstash: im Speicher. Reicht bei einem durchgehend laufenden Server (Render, eine Instanz).
const memory = new Map<string, { count: number; resetAt: number }>();

function allowInMemory(key: string, limit: number): boolean {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [entryKey, entry] of memory) if (entry.resetAt <= now) memory.delete(entryKey);
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

async function allowInUpstash(url: string, token: string, key: string, limit: number): Promise<boolean> {
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["SET", key, "0", "EX", String(WINDOW_SECONDS), "NX"],
      ["INCR", key],
    ]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash antwortet mit ${response.status}.`);
  const results = (await response.json()) as { result?: unknown; error?: string }[];
  const count = results[1]?.result;
  if (typeof count !== "number") throw new Error(`Upstash-Antwort unerwartet: ${results[1]?.error ?? "kein Zähler"}`);
  return count <= limit;
}

// true = Anfrage erlaubt. Max. `limit` Anfragen pro Stunde und Schlüssel.
export async function allowRequest(key: string, limit: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return allowInMemory(key, limit);

  try {
    return await allowInUpstash(url, token, `pronoia:rl:${key}`, limit);
  } catch (error) {
    // Lieber eine Anmeldung zu viel durchlassen als alle blockieren, wenn Upstash hängt.
    console.error("Rate-Limit: Upstash nicht erreichbar, Anfrage wird zugelassen.", error);
    return true;
  }
}
