// A short lease on one conversation so two colleagues never change it at the same moment.
import { allowed, redis, send, PATH_RX } from "../lib/store.js";
export default async function handler(req, res) {
  if (!allowed(req, res)) return;
  const path = String(req.body?.path || ""), holder = String(req.body?.holder || "").slice(0, 80);
  const ttl = Math.min(60000, Math.max(1000, Number(req.body?.ttlMs) || 8000));
  if (!PATH_RX.test(path) || !holder) return send(res, 400, { error: "invalid_argument" });
  try {
    const key = `ls:lock:${path}`;
    const got = await redis("SET", key, holder, "NX", "PX", String(ttl));
    if (got === "OK") return send(res, 200, { acquired: true });
    const cur = await redis("GET", key);
    if (cur === holder) { await redis("PEXPIRE", key, String(ttl)); return send(res, 200, { acquired: true }); }
    send(res, 200, { acquired: false });
  } catch { send(res, 503, { error: "unavailable" }); }
}
