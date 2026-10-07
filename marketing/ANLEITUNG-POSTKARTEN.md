# Postkarten-Aktion: „Ihre Website ist schon fertig“

**Ziel:** 20 Karten an Betriebe ohne Website verschicken, daraus 1–3 Kunden gewinnen.
**Aufwand:** ca. 1 Tag · **Kosten:** ca. 30–45 € für 20 Karten (Druck + Porto)

> Keine Rechtsberatung. Die Hinweise unten sind der übliche Stand für Werbung per Post an Unternehmen. Lass deine Datenschutzerklärung einmal prüfen (z. B. mit dem Generator von eRecht24).

---

## Schritt 1: 20 Betriebe finden (ca. 1 Stunde)

1. Öffne Google Maps und suche z. B. „Friseur [deine Stadt]“, „Kosmetik …“, „Kfz-Werkstatt …“, „Imbiss …“.
2. Öffne die Profile. Interessant sind Betriebe, die
   - **keinen „Website“-Button** haben, oder nur Facebook/Instagram verlinken, oder eine veraltete Seite,
   - **mindestens 10 Bewertungen** haben (der Betrieb ist aktiv und hat Kunden),
   - eine **vollständige Adresse** angeben.
3. Trag sie in `betriebe-vorlage.csv` ein (mit Excel, Numbers oder LibreOffice öffnen). Die Spalte „Status“ hilft dir beim Nachfassen.

**Tipp:** Nimm am Anfang nur 1–2 Branchen. So wiederholen sich Leistungen und Texte, und du bist schneller.

## Schritt 2: Für jeden Betrieb einen Entwurf bauen (ca. 5 Minuten pro Betrieb)

1. Öffne den Builder auf deiner Netlify-Seite.
2. Übernimm aus dem Google-Profil: Name, Adresse, Telefon, Öffnungszeiten, Leistungen.
   - **Preise nur eintragen, wenn sie öffentlich angegeben sind**, z. B. auf einem Foto der Preisliste (Foto-Scan). Sonst leer lassen, dann erscheinen die Leistungen ohne Preis.
   - **Keine Fotos oder Logos aus dem Google-Profil verwenden.** Die Rechte liegen beim Betrieb oder beim Fotografen. Der Entwurf sieht auch ohne Fotos gut aus.
   - **Keine Kundenstimmen** eintragen. Die kommen später vom Betrieb selbst.
3. Am Ende auf **„Als Entwurf für Postkarte“** klicken. Die Datei heißt dann z. B. `hair-studio-muenchen.html`.
   Sie enthält oben den Hinweis „Unverbindlicher Entwurf … nicht die offizielle Website“ und ist für Google unsichtbar.

## Schritt 3: Entwürfe online stellen (ca. 5 Minuten)

1. Öffne dein Repository auf github.com und dann den Ordner **`vorschau`**.
2. Klicke **„Add file → Upload files“**, zieh alle Entwurfs-Dateien hinein und klicke **„Commit changes“**.
3. Nach 1–2 Minuten hat Netlify sie veröffentlicht: `https://DEINE-SEITE.netlify.app/vorschau/hair-studio-muenchen.html`.
4. **Öffne 2–3 Links zur Kontrolle.**

## Schritt 4: Postkarten erstellen (ca. 10 Minuten)

1. Öffne `https://DEINE-SEITE.netlify.app/marketing/postkarten.html`.
2. Trag deinen **Absender** ein (Name, Anschrift, Telefon, E-Mail) und die **Adresse deiner Website**.
3. Klicke **„Liste einfügen (CSV)“** und kopiere die Zeilen aus deiner Tabelle hinein (Firmenname; Branche; Stadt; Straße; PLZ Ort).
4. Prüf die Vorschau. Die Texte kannst du links anpassen.
5. **Scanne 2–3 QR-Codes mit dem Handy.** Jeder muss den passenden Entwurf öffnen.
6. Klicke **„Drucken / als PDF speichern“**.

## Schritt 5: Drucken

| Weg | Format im Werkzeug | Hinweise | Kosten (ca.) |
|---|---|---|---|
| **Online-Druckerei** (z. B. Flyeralarm, Saxoprint, WIRmachenDRUCK) | „Postkarte A6“ | Produkt „Postkarte DIN A6, 4/4-farbig, 300 g“, PDF hochladen. Lieferung 3–5 Tage. | 15–25 € für 50 Stück |
| **Eigener Drucker** | „4 Karten pro A4-Blatt“ | Dickes Papier (250–300 g), beidseitig drucken, **an der kurzen Kante wenden**. Vorher 1 Testblatt drucken. Dann an den gestrichelten Linien schneiden. | ca. 5 € Papier |

## Schritt 6: Verschicken

- Briefmarke drauf und ab in den Briefkasten. Das aktuelle Porto für Postkarten findest du bei der Deutschen Post.
- **Nicht** an Betriebe schicken, die „Keine Werbung“ angebracht oder dir schon einmal abgesagt haben.

## Schritt 7: Nachfassen (der wichtigste Schritt)

- Nach **5–7 Tagen**: **persönlich vorbeigehen**, wenn wenig los ist. Zum Beispiel: „Guten Tag, ich habe Ihnen letzte Woche eine Postkarte mit Ihrem Website-Entwurf geschickt. Darf ich Ihnen den kurz zeigen?“ Dann den Entwurf auf dem Handy zeigen.
- **Keine kalten Anrufe oder Werbe-E-Mails.** Ohne Einwilligung sind die auch bei Unternehmen abmahnfähig (§ 7 UWG). Persönlich vorbeigehen ist erlaubt.
- Trag das Ergebnis in die Spalte „Status“ ein.

## Schritt 8: Wenn jemand zusagt

1. Termin machen und gemeinsam im Builder **Fotos, echte Preise und Texte** ergänzen. Den Foto-Scan der Preisliste kannst du direkt vor Ort machen.
2. Normal herunterladen (**ohne** „Entwurf“), eigene Domain einrichten, Stripe-Link schicken.
3. Den Entwurf aus `vorschau/` löschen.

## Schritt 9: Nach 30 Tagen aufräumen

Auf der Karte steht, dass der Entwurf nach 30 Tagen gelöscht wird. **Halte dich daran:** Lösch nicht genutzte Dateien aus dem Ordner `vorschau/` auf GitHub.

---

## Rechtliches in Kürze

- **Werbung per Post an Unternehmen** ist grundsätzlich erlaubt, solange der Empfänger nicht widersprochen hat (z. B. Aufkleber „Keine Werbung“ oder eine Absage an dich).
- **Absender angeben:** Name und Anschrift stehen auf der Karte. Das Werkzeug prüft das vor dem Drucken.
- **Datenschutz (DSGVO):** Geschäftsadressen aus öffentlichen Verzeichnissen darfst du für Werbung an Unternehmen in der Regel auf Basis des berechtigten Interesses (Art. 6 Abs. 1 lit. f) nutzen. Du musst aber über die **Herkunft der Daten** und das **Widerspruchsrecht** informieren. Ein kurzer Hinweis steht auf jeder Karte. Ausführlicher gehört das in deine Datenschutzerklärung.
- **Widersprüche notieren:** Wer keine Post mehr möchte, kommt auf eine Sperrliste und bekommt nichts mehr.
- **Entwurf klar kennzeichnen:** Der Hinweis „Unverbindlicher Entwurf … nicht die offizielle Website“ und das `noindex` für Google sind eingebaut. Gib dich nie als der Betrieb aus und verwende keine fremden Logos oder Fotos.

## Was du erwarten kannst

Bei einer gut gemachten Aktion mit persönlichem Nachfassen sind **1–3 Kunden aus 20 Karten** ein realistisches Ziel. Ohne Nachfassen deutlich weniger. Mit 1 Kunden im Pro-Tarif hast du die Aktion nach rund 2 Monaten wieder drin, jeder weitere ist Gewinn.
