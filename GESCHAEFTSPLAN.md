# 💰 BuildA – Geschäftsplan: Mit „Website in 5 Minuten“ Geld verdienen

> Hinweis: Das ist eine praktische Anleitung, keine Rechts- oder Steuerberatung. Für Gewerbe, Steuern und AGB lohnt sich eine einmalige Stunde beim Steuerberater bzw. eine Vorlage vom Anwalt (z. B. IT-Recht Kanzlei, Händlerbund).

---

## 1. Erstmal ehrlich: Wo stehst du?

**Konkurrenz gibt es:** Wix (ADI), Jimdo, Hostinger AI, Durable, 10Web. Die sind groß, aber:

- Sie sind **Baukästen**: Am Ende sitzt der Friseur doch wieder vor Drag-and-Drop und gibt auf.
- Sie sind **international und unpersönlich**: Englische Texte, komplizierte Tarife, Support im Chat-Labyrinth.
- Sie **verkaufen nichts nach**, was dem Kunden wirklich Kunden bringt.

**Deine Lücke (Positionierung):**

> **„Die Website, die dir Kunden bringt. Für lokale Unternehmen in Deutschland. Fertig in 5 Minuten. Mit einem echten Menschen per WhatsApp.“**

Du verkaufst also **keine Website**. Du verkaufst: *„Du wirst bei Google gefunden und bekommst Anfragen.“* Die Website ist nur das Werkzeug.

---

## 2. Was du jetzt schon hast (in diesem Repo)

| Datei | Was es ist |
|---|---|
| `index.html` | Verkaufsseite: Hero mit Live-Demo, Features, 3 Tarife, Add-ons, **Einnahmen-Rechner**, FAQ |
| `builder.html` | Der Generator: 6 Fragen → „KI baut…“ → Live-Vorschau (Desktop/Tablet/Handy) → Upsell-Fenster → Download |
| `assets/generator.js` | Erstellt die komplette Kunden-Website: Start, Über uns, Leistungen, Preise, FAQ, Kontakt, SEO-Meta, Google-Schema-Daten (LocalBusiness + FAQ), Mobile Design, CTA, Anruf-Button |
| `assets/app.css` | Design der Plattform |
| `api/copy.mjs` + `server.mjs` | **Echte KI-Texte** über die Claude API, mit Vorlagen als Rückfallebene (Anleitung in `README.md`) |

**Zum Ansehen:** `npm install`, dann `ANTHROPIC_API_KEY=… npm start` und `http://localhost:3000` aufrufen. Ohne Schlüssel funktioniert alles mit Vorlagentexten.

Damit kannst du **ab morgen** Kunden die Demo zeigen. Bezahlen und Veröffentlichen machst du am Anfang **von Hand** (siehe Phase 1). Das ist Absicht: Erst verkaufen, dann automatisieren.

---

## 3. Der Plan in 4 Phasen

### Phase 0 – Grundlagen (Woche 1, ca. 100–300 €)

- [ ] **Gewerbe anmelden** (Online beim Gewerbeamt, ca. 20–60 €). Tätigkeit: „Erstellung und Betrieb von Websites, Online-Dienstleistungen“.
- [ ] **Fragebogen zur steuerlichen Erfassung** (ELSTER) ausfüllen. Überleg dir die **Kleinunternehmerregelung** (§ 19 UStG: Vorjahr unter 25.000 €, laufendes Jahr unter 100.000 €). Dann stellst du keine MwSt. in Rechnung, das ist einfacher. Mit dem Steuerberater klären.
- [ ] **Geschäftskonto** (z. B. Kontist, Qonto, N26 Business).
- [ ] **Domain** für deine Marke (z. B. `builda.de` oder `website-in-5-minuten.de`), prüfen, ob der Name frei ist (DPMA-Markenrecherche!).
- [ ] **Rechtstexte:** Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung. Wichtig: Du **verarbeitest Daten im Auftrag** deiner Kunden (Kontaktformulare!), also brauchst du einen **AV-Vertrag** mit deinen Kunden und mit deinem Hoster.
- [ ] **Stripe-Konto** anlegen und Payment Links für Start/Pro/Business + Add-ons erstellen (dauert 15 Minuten, ohne Programmieren).

### Phase 1 – Die ersten 10 zahlenden Kunden (Woche 2–6)

**Ziel: 10 Kunden, nicht 1.000 Besucher.** Alles von Hand, damit du lernst, was Kunden wirklich wollen.

Ablauf pro Kunde:
1. Kunde füllt den Builder aus (oder du machst es mit ihm zusammen).
2. Er zahlt über den Stripe-Link (in `builder.html` beim Button „Weiter zur Zahlung“ eintragen, die Stelle ist mit `TODO` markiert).
3. Du lädst die HTML herunter, verfeinerst die Texte mit Claude/ChatGPT, fügst **echte Fotos** ein (ganz wichtig!) und stellst sie über **Netlify / Cloudflare Pages** online (kostenlos, mit eigener Domain).
4. Domain kaufst du über INWX, Namecheap oder IONOS (ca. 5–12 €/Jahr), ist im Pro-Tarif inklusive.
5. Impressum und Datenschutz für den Kunden: Generator von eRecht24 oder Datenschutz-Generator.de verlinken.

➡️ Zeitaufwand pro Kunde am Anfang ca. 30–60 Minuten. Bei 49 € + 19,99 €/Monat lohnt sich das trotzdem, weil der Kunde **jeden Monat** zahlt.

### Phase 2 – Automatisieren (Monat 2–4)

Erst wenn 10–20 Kunden zahlen, baust du die Technik aus:

| Baustein | Empfehlung | Kosten |
|---|---|---|
| Echte KI-Texte | ✅ **schon eingebaut** (`api/copy.mjs`), nur `ANTHROPIC_API_KEY` setzen | ca. 5–10 Cent pro Website |
| Login & Datenbank | Supabase (Auth + Postgres, EU-Region) | 0–25 €/Monat |
| Zahlungen & Abos | Stripe Billing + Kundenportal (Kündigen, Rechnungen) | 1,5 % + 0,25 € pro Zahlung |
| Hosting der Kunden-Websites | Cloudflare Pages / „Cloudflare for SaaS“ (eigene Kunden-Domains automatisch mit SSL) | ca. 0,10 € pro Kunde |
| Domains automatisch kaufen | INWX- oder Namecheap-API | Einkaufspreis |
| E-Mails | Brevo oder Resend | 0–20 €/Monat |
| Formular-Benachrichtigungen | eigene Funktion → Mail/WhatsApp an den Kunden | – |
| Änderungen per Chat | „Mach die Preise größer“ → Claude ändert das HTML | Cent-Beträge |

**Marge:** Ein Pro-Kunde kostet dich unter 1 €/Monat an Technik. Bei 19,99 € bleiben dir also **über 90 %**.

### Phase 3 – Skalieren und zur Plattform werden (ab Monat 4)

Die Upsells aus deiner Idee, jeweils als eigenes Modul:

| Modul | Preis | Was es tut | Warum Kunden zahlen |
|---|---|---|---|
| ⭐ Review-Booster | +14,99 €/M | QR-Code-Aufsteller + Link nach dem Termin: „Wie war's?“ Bei 5 Sternen geht's zu Google, bei Kritik zu einem privaten Formular | Mehr Bewertungen = besser bei Google Maps |
| 📲 Auto-Instagram | +19,99 €/M | KI erstellt aus Website-Infos 3 Posts pro Woche, der Kunde gibt sie per WhatsApp frei | Spart 3–5 Stunden pro Woche |
| 🤖 KI-Chatbot | +9,99 €/M | Beantwortet FAQ, Öffnungszeiten, Preise und nimmt Anfragen an | Anfragen auch nachts |
| 📅 Terminbuchung | +9,99 €/M | Einfacher Kalender auf der Website | Weniger Telefon |
| 🗺️ Google-Profil-Setup | 79 € einmalig | Du optimierst das Google-Unternehmensprofil | Sofort sichtbarer Erfolg |
| 🎨 KI-Logo | 29 € einmalig | Logo passend zur Website | Impulskauf direkt nach der Erstellung |
| 📊 Monatsreport | in Pro inklusive | „Deine Website hatte 412 Besucher und 9 Anfragen“ | **Senkt Kündigungen massiv**, weil der Kunde sieht, dass es wirkt |

---

## 4. 🎯 Kunden gewinnen – kreative Strategien

### 🔥 Strategie 1: „Die Website existiert schon“ (dein stärkster Hebel)

1. Such auf Google Maps in deiner Stadt nach Betrieben **ohne Website** (es gibt erstaunlich viele: Friseure, Imbisse, Handwerker, Kosmetikstudios).
2. Erstelle mit deinem Builder **für jeden schon eine fertige Website** (dauert 5 Minuten).
3. Stell sie unter einer Vorschau-Adresse online: `hair-studio-xy.builda.de`.
4. Schick einen **Brief oder eine Postkarte** mit QR-Code: *„Wir haben Ihre Website schon gebaut. Scannen und ansehen. Gefällt sie Ihnen, gehört sie Ihnen ab 49 €.“*

Warum ein Brief? Werbung per Post ist in Deutschland erlaubt, **kalte Werbe-E-Mails und kalte Anrufe sind dagegen abmahnfähig (§ 7 UWG)**. Ein Brief mit fertiger Website fällt außerdem auf: Niemand wirft etwas weg, auf dem sein eigener Name steht.

💡 Erwartung: Bei 100 Briefen (ca. 100 € Porto + Druck) sind 3–8 Kunden realistisch. Das sind ca. 150–400 € einmalig plus 60–160 € jeden Monat.

### 🚶 Strategie 2: Die „5-Minuten-Challenge“ vor Ort

Geh mit Tablet oder Handy persönlich in Läden (vormittags, wenn wenig los ist):
> „Ich wette, ich baue Ihnen in 5 Minuten eine Website, hier vor Ihren Augen. Wenn sie Ihnen nicht gefällt, kostet es nichts.“

Den Builder gemeinsam ausfüllen, Vorschau zeigen, Stripe-Link per QR-Code. **Die Abschlussquote ist vor Ort am höchsten**, weil der Kunde sein Ergebnis sofort sieht.

### 🎬 Strategie 3: TikTok / Instagram Reels

Serien-Formate, die gut funktionieren:
- *„Ich baue Websites für zufällige Läden in [Stadt] (Teil 1–100)“*: Du filmst die Reaktion des Inhabers.
- *„Agentur wollte 3.000 €. Ich mach's in 5 Minuten.“*: Vorher/Nachher.
- *„Dieser Döner hat keine Website. Bis jetzt.“*
- *„Website-Roast“*: Du bewertest schlechte Websites von Zuschauern und baust sie neu.

### 🤝 Strategie 4: Partner, die deine Kunden schon kennen

Biete **30 % Provision, jeden Monat**, solange der Kunde bleibt:
- **Steuerberater und Gründungsberater**: Jeder Gründer braucht eine Website.
- **IHK / HWK-Gründerseminare**: Biete einen kostenlosen Vortrag an: „Online sichtbar in 1 Stunde“.
- **Druckereien** (Visitenkarten, Flyer): „Website zum Flyer dazu?“
- **Kassensystem-Anbieter, Barbershop-Großhändler, Friseurbedarf**
- **Coworking-Spaces** und Gründer-Facebook-Gruppen

### 🔎 Strategie 5: SEO-Seiten von selbst (passives Marketing)

Erstelle automatisch Landingpages für jede **Branche × Stadt**:
- `website-fuer-friseure-muenchen`
- `website-fuer-handwerker-koeln`
- `restaurant-website-erstellen-hamburg`

10 Branchen × 80 Städte = **800 Seiten**, die jeweils ein Beispiel aus deinem Generator zeigen. Genau das suchen deine Kunden bei Google.

### 🧲 Strategie 6: Kostenlose Lead-Magneten

- **„Website-Check“**: URL eingeben, du bekommst eine Note von 1–6 (Handy? SEO? Ladezeit? Impressum?). Wer schlecht abschneidet, bekommt direkt das Angebot.
- **Kostenloser Impressum-Generator** oder **Google-Bewertungs-QR-Code-Generator**: Gratis-Tool, das E-Mail-Adressen einsammelt (mit Einwilligung!).

### 🏷️ Strategie 7: Nische = mehr Geld

Statt „Websites für alle“ lieber: **„BuildA für Friseure“** mit Online-Buchung, Preisliste, Instagram-Galerie und Vorher/Nachher-Fotos. In einer Nische kannst du **29–39 €/Monat** verlangen und bekommst Empfehlungen innerhalb der Branche.

### 💸 Strategie 8: Schnelles Startkapital

- **„Gründer-Deal“ für die ersten 100 Kunden**: 2 Jahre Pro für 299 € einmalig. Das bringt sofort Geld für Werbung.
- **White-Label für Freelancer und Agenturen**: Sie verkaufen BuildA-Websites unter eigenem Namen für 99 €/Monat (20 Websites inklusive).

---

## 5. 📈 Die Zahlen

**Annahmen:** Ø Umsatz pro Kunde ca. 22 €/Monat (Mix aus Start, Pro und Add-ons), 4 % Kündigungen pro Monat.

| Ziel | Aktive Kunden | Monatlicher Umsatz (MRR) | Jahresumsatz |
|---|---|---|---|
| Nebeneinkommen | 50 | ~1.100 € | ~13.000 € |
| Teilzeit-Gehalt | 150 | ~3.300 € | ~40.000 € |
| Vollzeit + | 400 | ~8.800 € | ~105.000 € |
| Kleines Unternehmen | 1.000 | ~22.000 € | ~264.000 € |

👉 Auf der Verkaufsseite (`index.html#partner`) gibt es einen **interaktiven Rechner**, mit dem du selbst spielen kannst.

**Die 3 Kennzahlen, die du jede Woche anschaust:**
1. **Builder gestartet → Website erstellt** (Ziel > 60 %)
2. **Website erstellt → bezahlt** (Ziel > 8 %)
3. **Kündigungsrate pro Monat** (Ziel < 4 %)

---

## 6. 🗓️ Dein 90-Tage-Plan

**Tag 1–7**
- [ ] Gewerbe anmelden, Konto eröffnen, Stripe einrichten
- [ ] Domain kaufen, `index.html` + `builder.html` auf Netlify/Cloudflare Pages online stellen
- [ ] Stripe-Link in `builder.html` eintragen (TODO-Stelle)
- [ ] Rechtstexte einbauen (Impressum/Datenschutz/AGB im Footer verlinken)
- [ ] Platzhalter-Testimonials auf der Startseite **entfernen** oder durch echte ersetzen

**Tag 8–30**
- [ ] 20 Websites für Betriebe ohne Website vorbauen → Briefe verschicken (Strategie 1)
- [ ] 2 Vormittage pro Woche „5-Minuten-Challenge“ vor Ort (Strategie 2)
- [ ] 3 Reels pro Woche posten (Strategie 3)
- [ ] **Ziel: 10 zahlende Kunden**, jeden Kunden fragen: „Was hätte dich fast abgehalten?“

**Tag 31–60**
- [x] Claude API für echte KI-Texte einbauen (erledigt – Schlüssel in Netlify eintragen und Ausgabenlimit setzen)
- [ ] Stripe Billing + Kundenportal (Abos automatisch)
- [ ] Partnerprogramm starten: 5 Steuerberater, 2 Druckereien anschreiben (per Brief oder persönlich)
- [ ] Erstes Add-on live: **Review-Booster** (am einfachsten zu bauen, sichtbarster Nutzen)
- [ ] **Ziel: 30 Kunden**

**Tag 61–90**
- [ ] Automatisches Veröffentlichen mit eigener Domain
- [ ] Monatsreport-E-Mail an alle Kunden
- [ ] 50 SEO-Landingpages (Branche × Stadt)
- [ ] KI-Chatbot als zweites Add-on
- [ ] **Ziel: 50–75 Kunden ≈ 1.100–1.650 € MRR**

---

## 7. ⚠️ Risiken und wie du sie umgehst

| Risiko | Lösung |
|---|---|
| Kunden kündigen nach 2 Monaten | Monatsreport („9 Anfragen über deine Website“), Jahresabo mit Rabatt, Add-ons binden |
| „Das kann Wix auch“ | Persönlicher WhatsApp-Support, deutsche Branchentexte, *fertig* statt *Baukasten* |
| Abmahnungen | Keine kalten E-Mails/Anrufe, keine erfundenen Bewertungen oder Zahlen, saubere Rechtstexte, Bildrechte prüfen (nur eigene oder lizenzfreie Fotos) |
| Zu viel Handarbeit | Erst ab ~20 Kunden automatisieren, Standard-Abläufe als Checkliste |
| KI schreibt Unsinn | Kunde sieht und bestätigt alles vor der Veröffentlichung, Preise immer vom Kunden bestätigen lassen |

---

## 8. Nächste Schritte im Code (wenn du so weit bist)

1. ✅ KI-Texte über die Claude API (erledigt).
2. Foto-Upload im Builder (Logo + 3–6 Bilder) für deutlich bessere Websites.
3. Impressum- und Datenschutz-Seiten automatisch mit den Kundendaten erzeugen.
4. „Änderungen per Chat“: Textfeld unter der Vorschau → KI ändert das HTML.
5. Kunden-Dashboard: Statistik, Anfragen, Add-ons buchen.

**Die wichtigste Regel:** Verkaufen > Programmieren. Die ersten 10 Kunden gewinnst du mit der Demo, die du jetzt schon hast. 🚀
