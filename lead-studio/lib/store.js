// Shared helpers for the Lead Studio API on Vercel: access check and storage (Upstash Redis over REST, no packages).
import crypto from "node:crypto";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const PATH_RX = /^(opps|config)\/[A-Za-z0-9_.\-:@+~]{1,120}$/;

export function send(res, status, body) { res.status(status).setHeader("Cache-Control", "no-store").json(body); }

/** every request carries the secret access key from the private link */
// The password is stored only as a SHA-256 fingerprint. An ACCESS_KEY set in Vercel replaces it when present.
const PW_HASH = "54b67c1805b95919a022531c82823c46e4e3aa50dbf855c8efb72b32507bb9c0";
const sha = (s) => crypto.createHash("sha256").update(s).digest();
export function allowed(req, res) {
  const got = String(req.headers["x-access-key"] || "");
  const env = process.env.ACCESS_KEY || "";
  const want = env.length >= 8 ? sha(env) : Buffer.from(PW_HASH, "hex");
  if (!got || !crypto.timingSafeEqual(sha(got), want)) { send(res, 401, { error: "NO_ACCESS", message: "Dit wachtwoord klopt niet." }); return false; }
  if (!URL_ || !TOKEN) { send(res, 500, { error: "SETUP", message: "Bijna klaar: koppel nog de opslag. Ga in Vercel naar je project → Storage → Create Database → Upstash for Redis (gratis) → Connect, en daarna Deployments → ⋯ → Redeploy." }); return false; }
  return true;
}

export async function redis(...cmd) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `storage ${r.status}`);
  return j.result;
}
