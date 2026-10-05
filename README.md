# BuildA – Website in 5 Minuten

KI-Website-Generator für lokale Unternehmen: 6 Fragen beantworten → fertige, mobile Website mit SEO, Preisen, FAQ und Kontakt. Die Texte schreibt Claude (Anthropic).

- `index.html` – Verkaufsseite (Tarife, Add-ons, Einnahmen-Rechner)
- `builder.html` – Generator mit Live-Vorschau, „Texte neu schreiben“, Upsell und HTML-Download
- `assets/generator.js` – baut die Kunden-Website (Design, SEO, Schema.org) aus den KI-Texten
- `assets/config.js` – **hier deine Stripe-Zahlungslinks eintragen**
- `api/copy.mjs` – KI-Texte über die Claude API (strukturierte Ausgabe, Rate-Limit, Fehlerbehandlung)
- `api/menu.mjs` – liest Preislisten und Speisekarten vom Foto ab (`POST /api/scan-menu`)
- `server.mjs` – lokaler Server bzw. für einen eigenen Server/VPS
- `netlify/functions/` – beide APIs als Netlify-Funktionen
- `GESCHAEFTSPLAN.md` – Schritt für Schritt: So verdienst du damit Geld

## Bezahlung einrichten

1. In Stripe drei Zahlungslinks anlegen (Start, Pro, Business).
2. Die Links in `assets/config.js` eintragen.
3. Beim Kauf übergibt der Builder eine Referenz wie `pro__reviews-chatbot__hair-studio-muenchen` (Tarif, Add-ons, Firma). Du siehst sie im Stripe-Dashboard bei der Zahlung und weißt, was einzurichten ist. Add-ons rechnest du am Anfang per Rechnung oder eigenem Stripe-Link ab.

## Lokal starten

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # Schlüssel von https://console.anthropic.com
npm start                             # → http://localhost:3000
```

Ohne Schlüssel läuft alles trotzdem: Der Builder nutzt dann die eingebauten Branchen-Vorlagen und zeigt „Vorlagentexte“ an.

## Online stellen (Netlify)

1. Repo bei Netlify verbinden (Build-Befehl leer lassen, `netlify.toml` regelt den Rest).
2. Unter *Site configuration → Environment variables* `ANTHROPIC_API_KEY` eintragen.
3. Fertig – `/api/generate` läuft als Funktion, der Schlüssel bleibt auf dem Server.

## Einstellungen (Umgebungsvariablen)

| Variable | Standard | Bedeutung |
|---|---|---|
| `ANTHROPIC_API_KEY` | – | API-Schlüssel (Pflicht für KI-Texte) |
| `BUILDA_MODEL` | `claude-opus-5-5` | Claude-Modell |
| `BUILDA_RATE_LIMIT` | `10` | max. Generierungen bzw. Foto-Scans pro IP und Stunde |
| `PORT` | `3000` | Port für `server.mjs` |

**Kosten:** Ein Foto-Scan einer Preisliste kostet je nach Länge grob 2–5 Cent. Eine Website verbraucht ca. 1.000 Eingabe- und 2.000–4.000 Ausgabe-Tokens, also grob 5–10 Cent mit Claude Opus 5.5. Setz dir in der Anthropic Console ein monatliches Ausgabenlimit. Das Rate-Limit liegt im Arbeitsspeicher und gilt bei Netlify nur pro Funktionsinstanz, ist also ein Grundschutz und keine harte Grenze.
