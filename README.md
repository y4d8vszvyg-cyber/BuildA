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
- `marketing/` – Postkarten-Aktion: Werkzeug (`postkarten.html`), Anleitung, Kundenliste, Beispiel-PDF
- `vorschau/` – Entwurfs-Websites für die Postkarten (nach 30 Tagen löschen)
- `assets/vendor/qrcode.js` – QR-Code-Bibliothek (MIT, Kazuhiko Arase)

## Design

- **Passend zur Branche** (Standard): Jede Branche hat ein eigenes Farb- und Schriftpaar aus der UI/UX-Pro-Max-Datenbank, z. B. Petrol und Grün mit Figtree für Praxen, Grau und Signalorange für Handwerker, dunkel mit Barlow Condensed für Fitness. Die übrigen elf Stile (u. a. Luxus, Pastell, Kräftig, Retro) bleiben wählbar. Neue Branchen: Bäckerei, Tattoo, Immobilien, Kanzlei, Hundesalon, Ferienwohnung, Nachhilfe/Musikschule, Garten- & Landschaftsbau.
- **Kontrast:** Akzentfarben, auch eine eigene Farbe des Kunden, werden automatisch so angepasst, dass Text mindestens 4,5:1 erreicht (WCAG AA).
- **Mobil und barrierearm:** Menü auf dem Handy, sichtbarer Tastaturfokus, „Zum Inhalt springen“, Formular mit sichtbaren Feldbeschriftungen, Tippflächen ab 44 px, Rücksicht auf „Bewegung reduzieren“ und den unteren Bildschirmrand beim iPhone.

## 3D-Erlebnis

Im Design-Schritt wählbar, sobald das Unternehmen ausführlich beschrieben ist (mindestens 400 Zeichen in „Wer seid ihr?“, „Was macht euch besonders?“ und „Ablauf“ zusammen; der Builder zeigt einen Zähler).

- Eine 3D-Szene (Three.js, WebGL) in den Farben des Designs. Sie liegt hinter dem Startbereich und den Story-Kapiteln und bewegt sich beim Scrollen: Das Objekt wechselt die Seite, verformt sich und ordnet sich neu an.
- Vier Motive: Fließende Form, Partikel, Geometrie, Ringe. Standard je nach Branche, z. B. Partikel für Restaurants und Ringe für Fitness.
- Story-Kapitel als Glas-Karten. Die KI schreibt sie aus der Beschreibung; ohne KI werden die eigenen Worte des Kunden verwendet.
- Inhalte blenden beim Scrollen mit leichter 3D-Kippung ein; Karten neigen sich mit der Maus.
- Rücksichtsvoll: Bei „Bewegung reduzieren“ gibt es keine Animationen, nur ein ruhiges Bild. Ohne WebGL oder wenn Three.js nicht lädt, erscheint ein Farbverlauf. Am Handy wird mit weniger Details gerendert, und die Szene pausiert, sobald die Story vorbei oder der Tab im Hintergrund ist.
- Three.js 0.147 wird von jsDelivr geladen und per Subresource Integrity geprüft.

## Buchen- und Kaufen-Buttons

Im Schritt „Leistungen & Preise“ wählt der Kunde den Button, der bei jeder Leistung erscheint: Anfragen, Termin buchen, Jetzt buchen, Reservieren, Probetermin, Angebot anfordern, Rückruf, Kaufen, Bestellen oder Gutschein. Vorschlag je nach Branche, z. B. „Termin buchen“ für Friseure und „Reservieren“ für Restaurants.

- **Mit Link** (Treatwell, Shore, Calendly, Doctolib, OpenTable, Stripe- oder PayPal-Zahlungslink): Alle Buttons öffnen diesen Link, auf dem Handy kommt er zusätzlich in die Leiste unten. Für Google wird er als Buchungs- bzw. Kaufaktion (Schema.org) hinterlegt.
- **Ohne Link:** Der Button führt zum Kontaktformular, und die Leistung steht schon in der Nachricht, z. B. „Ich möchte einen Termin buchen: Haarschnitt“.

Erlaubt sind nur http(s)-Links; „calendly.com/name“ wird automatisch zu „https://calendly.com/name“.

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
