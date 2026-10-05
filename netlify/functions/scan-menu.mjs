// Netlify-Funktion für POST /api/scan-menu (Preisliste vom Foto lesen).
import { handleScan } from "../../api/menu.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return Response.json({ error: "Nur POST" }, { status: 405 });
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  const [status, out] = await handleScan(body, context.ip || "?");
  return Response.json(out, { status });
};

export const config = { path: "/api/scan-menu" };
