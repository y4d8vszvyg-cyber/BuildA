// Netlify-Funktion für POST /api/generate. ANTHROPIC_API_KEY in Netlify unter
// Site configuration → Environment variables hinterlegen.
import { handleGenerate } from "../../api/copy.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return Response.json({ error: "Nur POST" }, { status: 405 });
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  const [status, out] = await handleGenerate(body, context.ip || "?");
  return Response.json(out, { status });
};

export const config = { path: "/api/generate" };
