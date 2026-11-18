// Writes reply proposals and reads screenshots, only when an Anthropic API key is set in Vercel.
import { allowed, send } from "../lib/store.js";
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (!allowed(req, res, { store: false })) return;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return send(res, 400, { code: "not_granted", message: "Slimme hulp staat uit: er is geen API-sleutel ingesteld." });
  const prompt = String(req.body?.prompt || "").slice(0, 30000);
  const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 8) : [];
  if (!prompt) return send(res, 400, { code: "invalid_argument" });
  const content = [...images.filter((i) => /^data:image\/(jpeg|png|webp);base64,/.test(i)).map((i) => { const [, mt, b64] = i.match(/^data:(image\/\w+);base64,(.*)$/s); return { type: "image", source: { type: "base64", media_type: mt, data: b64 } }; }), { type: "text", text: prompt }];
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-haiku-5-5", max_tokens: 2000, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    if (r.status === 429) return send(res, 429, { code: "rate_limited", message: "Even te veel tegelijk." });
    if (!r.ok) return send(res, 502, { code: "unavailable", message: j?.error?.message || "De slimme hulp gaf een fout." });
    send(res, 200, { text: (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("") });
  } catch { send(res, 502, { code: "unavailable", message: "De slimme hulp is niet bereikbaar." }); }
}
