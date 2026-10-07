// BuildA – kleiner Server ohne Abhängigkeiten außer dem Anthropic-SDK.
// Liefert die statischen Seiten aus und stellt POST /api/generate bereit.
//   ANTHROPIC_API_KEY=sk-ant-... npm start   →   http://localhost:3000
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleGenerate } from "./api/copy.mjs";
import { handleScan } from "./api/menu.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const PUBLIC = new Set(["/index.html", "/builder.html", "/assets/app.css", "/assets/generator.js", "/assets/config.js"]);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "x-content-type-options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readJson(req, limit = 10_000) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > limit) throw new Error("too large");
  }
  return JSON.parse(raw || "{}");
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/api/generate") {
      if (req.method !== "POST") return send(res, 405, { error: "Nur POST" });
      let body;
      try {
        body = await readJson(req);
      } catch {
        return send(res, 400, { error: "Ungültige Anfrage" });
      }
      const [status, out] = await handleGenerate(body, req.socket.remoteAddress || "?");
      return send(res, status, out);
    }

    if (url.pathname === "/api/scan-menu") {
      if (req.method !== "POST") return send(res, 405, { error: "Nur POST" });
      let body;
      try {
        body = await readJson(req, 8_000_000);
      } catch {
        return send(res, 400, { error: "Ungültige Anfrage oder Foto zu groß" });
      }
      const [status, out] = await handleScan(body, req.socket.remoteAddress || "?");
      return send(res, status, out);
    }

    const file = url.pathname === "/" ? "/index.html" : url.pathname;
    const allowed = PUBLIC.has(file) || /^\/vorschau\/[a-z0-9-]+\.html$/.test(file) || file === "/marketing/postkarten.html" || file === "/assets/vendor/qrcode.js";
    if (req.method !== "GET" || !allowed) return send(res, 404, "Nicht gefunden", "text/plain; charset=utf-8");
    try {
      send(res, 200, await readFile(path.join(ROOT, file)), TYPES[path.extname(file)]);
    } catch {
      send(res, 404, "Nicht gefunden", "text/plain; charset=utf-8");
    }
  })
  .listen(PORT, () => {
    const ai = process.env.ANTHROPIC_API_KEY ? "KI aktiv" : "ohne KI (ANTHROPIC_API_KEY fehlt → Vorlagentexte)";
    console.log(`BuildA läuft auf http://localhost:${PORT} – ${ai}`);
  });
