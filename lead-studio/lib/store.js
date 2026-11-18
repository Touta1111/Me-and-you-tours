// Shared helpers for the Lead Studio API on Vercel: access check and storage (Upstash Redis over REST, no packages).
import crypto from "node:crypto";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const PATH_RX = /^(opps|config)\/[A-Za-z0-9_.\-:@+~]{1,120}$/;

export function send(res, status, body) { res.status(status).setHeader("Cache-Control", "no-store").json(body); }

/** every request carries the secret access key from the private link */
export function allowed(req, res) {
  const want = process.env.ACCESS_KEY || "";
  const got = String(req.headers["x-access-key"] || "");
  if (want.length < 16) { send(res, 500, { error: "SETUP", message: "De toegangscode (ACCESS_KEY) is nog niet ingesteld in Vercel." }); return false; }
  const a = Buffer.from(want), b = Buffer.from(got);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) { send(res, 401, { error: "NO_ACCESS", message: "Deze link geeft geen toegang. Vraag de juiste link aan de beheerder." }); return false; }
  if (!URL_ || !TOKEN) { send(res, 500, { error: "SETUP", message: "De opslag is nog niet gekoppeld in Vercel (Storage → Upstash for Redis)." }); return false; }
  return true;
}

export async function redis(...cmd) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `storage ${r.status}`);
  return j.result;
}
