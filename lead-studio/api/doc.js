// Read or write one document (a conversation under opps/, or a setting under config/).
import { allowed, redis, send, PATH_RX } from "../lib/store.js";
export default async function handler(req, res) {
  if (!allowed(req, res)) return;
  const path = String((req.method === "GET" ? req.query.path : req.body?.path) || "");
  if (!PATH_RX.test(path)) return send(res, 400, { error: "invalid_argument", message: "Ongeldig pad." });
  try {
    if (req.method === "GET") { const v = await redis("GET", `ls:doc:${path}`); return send(res, 200, { exists: v != null, data: v ? JSON.parse(v) : null }); }
    if (req.method === "POST") {
      const data = req.body?.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) return send(res, 400, { error: "invalid_argument", message: "Ongeldige gegevens." });
      const json = JSON.stringify(data);
      if (json.length > 250000) return send(res, 400, { error: "invalid_argument", message: "Te groot." });
      await redis("SET", `ls:doc:${path}`, json);
      await redis("SADD", "ls:paths", path);
      return send(res, 200, { ok: true });
    }
    if (req.method === "DELETE") { await redis("DEL", `ls:doc:${path}`); await redis("SREM", "ls:paths", path); return send(res, 200, { ok: true }); }
    send(res, 405, { error: "METHOD" });
  } catch (e) { send(res, 503, { error: "unavailable", message: "De opslag is even niet bereikbaar." }); }
}
