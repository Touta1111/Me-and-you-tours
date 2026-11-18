// Everything the page needs in one read: all conversations and settings, plus what this installation can do.
import { allowed, redis, send, hasStore } from "../lib/store.js";
export default async function handler(req, res) {
  if (!allowed(req, res, { store: false })) return;
  // without connected storage the page keeps its data on the device itself
  if (!hasStore()) return send(res, 200, { docs: {}, local: true, ai: !!process.env.ANTHROPIC_API_KEY, at: new Date().toISOString() });
  try {
    const paths = (await redis("SMEMBERS", "ls:paths")) || [];
    const vals = paths.length ? await redis("MGET", ...paths.map((p) => `ls:doc:${p}`)) : [];
    const docs = {};
    paths.forEach((p, i) => { if (vals[i] != null) { try { docs[p] = JSON.parse(vals[i]); } catch {} } });
    send(res, 200, { docs, ai: !!process.env.ANTHROPIC_API_KEY, at: new Date().toISOString() });
  } catch (e) { send(res, 503, { error: "STORAGE", message: "De opslag is even niet bereikbaar. Probeer het zo opnieuw." }); }
}
