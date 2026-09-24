const WINDOW_SECONDS = 60 * 60;

// Minimaler Ausschnitt der Cloudflare-KV-API, damit lib/ keine Workers-Typen braucht.
export type CounterStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expiration?: number }): Promise<void>;
};

// Ohne KV (lokal): im Speicher der jeweiligen Instanz.
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

// KV ist nicht atomar; für ein Missbrauchs-Limit reicht das, einzelne Überschreitungen sind egal.
async function allowInStore(store: CounterStore, key: string, limit: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const stored = await store.get(key);
  const entry = stored ? (JSON.parse(stored) as { count: number; resetAt: number }) : null;
  const fresh = !entry || entry.resetAt <= now;
  const count = fresh ? 1 : entry.count + 1;
  const resetAt = fresh ? now + WINDOW_SECONDS : entry.resetAt;
  if (count > limit) return false;
  // KV verlangt mindestens 60 s bis zum Ablauf.
  await store.put(key, JSON.stringify({ count, resetAt }), { expiration: Math.max(resetAt, now + 60) });
  return true;
}

// true = Anfrage erlaubt. Max. `limit` Anfragen pro Stunde und Schlüssel.
export async function allowRequest(key: string, limit: number, store?: CounterStore): Promise<boolean> {
  if (!store) return allowInMemory(key, limit);
  try {
    return await allowInStore(store, `rl:${key}`, limit);
  } catch (error) {
    // Lieber eine Anmeldung zu viel durchlassen als alle blockieren, wenn KV hängt.
    console.error("Rate-Limit: KV nicht erreichbar, Anfrage wird zugelassen.", error);
    return true;
  }
}
