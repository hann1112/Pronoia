import type { CounterStore } from "@/lib/rate-limit";
import { checkout } from "./routes/checkout";
import { confirm } from "./routes/confirm";
import { order } from "./routes/order";
import { subscribe } from "./routes/subscribe";
import { webhook } from "./routes/webhook";

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RATE_LIMIT?: CounterStore;
};

type Route = { method: string; path: string; handle: (request: Request, env: Env) => Promise<Response> };

const routes: Route[] = [
  { method: "POST", path: "/api/checkout", handle: (request) => checkout(request) },
  { method: "GET", path: "/api/order", handle: (request) => order(request) },
  { method: "POST", path: "/api/subscribe", handle: (request, env) => subscribe(request, env.RATE_LIMIT) },
  { method: "GET", path: "/api/subscribe/confirm", handle: (request) => confirm(request) },
  { method: "POST", path: "/api/webhooks/stripe", handle: (request) => webhook(request) },
];

// Seiten und Bilder kommen als statische Dateien; nur /api/* läuft durch diesen Worker.
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    const matches = routes.filter((route) => route.path === pathname.replace(/\/$/, ""));
    const route = matches.find((candidate) => candidate.method === request.method);
    if (route) return route.handle(request, env);
    if (matches.length > 0) {
      return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { Allow: matches.map((m) => m.method).join(", ") } });
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  },
};

export default worker;
