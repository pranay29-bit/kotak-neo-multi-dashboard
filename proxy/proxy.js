// Minimal CORS proxy for Kotak Neo. Run on a VPS with a STATIC IP and whitelist that IP in Kotak.
// Usage: ALLOWED_ORIGIN=https://<user>.github.io PORT=8080 node proxy.js   (Node 18+)
// Put it behind HTTPS (Caddy/nginx), since GitHub Pages is https and blocks http calls.
const http = require("http");
const ORIGIN = process.env.ALLOWED_ORIGIN;               // required: your GitHub Pages origin, no trailing slash
const PORT = process.env.PORT || 8080;
if (!ORIGIN) { console.error("Set ALLOWED_ORIGIN"); process.exit(1); }

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Private-Network": "true",
  "Vary": "Origin",
};
const okHost = h => h === "kotaksecurities.com" || h.endsWith(".kotaksecurities.com");

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (req.url === "/health") {   // lets the dashboard show the IP to whitelist
    try { const ip = (await (await fetch("https://api.ipify.org")).text()).trim(); res.writeHead(200, { ...cors, "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: true, ip })); }
    catch (e) { res.writeHead(502, cors); return res.end("health error: " + e.message); }
  }
  if (req.headers.origin !== ORIGIN) { res.writeHead(403, cors); return res.end("Forbidden origin"); }
  try {
    const target = new URL(new URL(req.url, "http://x").searchParams.get("target"));
    if (target.protocol !== "https:" || !okHost(target.hostname)) { res.writeHead(400, cors); return res.end("Target not allowed"); }
    const chunks = []; for await (const c of req) chunks.push(c);
    const headers = { ...req.headers };
    for (const h of ["host", "origin", "referer", "content-length", "connection", "accept-encoding"]) delete headers[h];
    const body = req.method === "GET" ? undefined : Buffer.concat(chunks);
    const r = await fetch(target, { method: req.method, headers, body });
    const text = await r.text();
    res.writeHead(r.status, { ...cors, "Content-Type": r.headers.get("content-type") || "application/json" });
    res.end(text);
  } catch (e) { res.writeHead(502, cors); res.end("Proxy error: " + e.message); }
}).listen(PORT, () => console.log("Proxy on :" + PORT));
