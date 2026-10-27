/* BuildA – Website-Generator
 * Erzeugt aus den Wizard-Antworten eine komplette, responsive One-Page-Website.
 * Läuft im Browser. Die Texte kommen von der Claude API (`/api/generate`, siehe api/copy.mjs);
 * ist die KI nicht erreichbar, nutzt `generateCopy` die eingebauten Branchen-Vorlagen.
 * Preise, Kontaktdaten, Fotos und Kundenstimmen kommen immer vom Kunden selbst.
 */
(function (global) {
  "use strict";

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const slug = (s) =>
    String(s || "website")
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "website";

  // "{dich|Sie}" → je nach Ansprache
  const tone = (str, t) => String(str).replace(/\{([^|}]*)\|([^}]*)\}/g, (_, du, sie) => (t === "sie" ? sie : du));

  const isImg = (s) => typeof s === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(s);

  // ---------- Branchen ----------
  // Texte bewusst schlicht gehalten: konkrete Aussagen statt Werbefloskeln.
  const INDUSTRIES = {
    friseur: {
      label: "Friseur", schema: "HairSalon", tone: "du",
      hero: "Schnitt, Farbe und Styling in {deinem|Ihrem} Viertel",
      promise: "Wir nehmen uns Zeit für die Beratung und schneiden so, dass die Frisur auch zu Hause gut fällt.",
      cta: "Termin buchen",
      usp: ["Beratung vor jedem Schnitt", "Termine auch abends", "Professionelle Pflegeprodukte"],
      services: ["Haarschnitt", "Färben", "Balayage", "Styling", "Hochsteckfrisur", "Bartpflege"],
      desc: {
        haarschnitt: "Waschen, Schneiden, Föhnen – mit kurzer Beratung vorab.",
        "färben": "Ansatz oder komplette Farbe, abgestimmt auf Hautton und Pflegezustand.",
        balayage: "Weiche, handgemalte Strähnen mit natürlichem Übergang.",
        styling: "Föhnfrisur oder Locken für den Alltag oder einen besonderen Anlass.",
        hochsteckfrisur: "Für Hochzeiten, Abschlussbälle und Feiern – gern mit Probetermin.",
        bartpflege: "Konturen, Kürzen und Pflege mit warmem Tuch.",
      },
      faq: [
        ["Muss ich einen Termin machen?", "Am besten ja, dann haben wir genug Zeit für {dich|Sie}. Spontan klappt es oft trotzdem – einfach anrufen."],
        ["Wie lange dauert eine Farbbehandlung?", "Je nach Haarlänge und Technik zwischen anderthalb und drei Stunden."],
        ["Kann ich vorher eine Beratung bekommen?", "Ja, ein kurzes Beratungsgespräch ist kostenlos."],
      ],
    },
    kosmetik: {
      label: "Kosmetik / Nails", schema: "BeautySalon", tone: "du",
      hero: "Kosmetik und Nägel mit ruhiger Hand",
      promise: "Behandlungen in entspannter Atmosphäre – sorgfältig, hygienisch und ohne Zeitdruck.",
      cta: "Termin buchen",
      usp: ["Hygiene nach Studiostandard", "Hochwertige Produkte", "Ruhige Atmosphäre"],
      services: ["Gesichtsbehandlung", "Maniküre", "Gelnägel", "Pediküre", "Wimpernlifting", "Augenbrauen"],
      desc: {
        gesichtsbehandlung: "Reinigung, Peeling, Maske und Pflege passend zum Hauttyp.",
        "maniküre": "Nägel in Form, Nagelhaut pflegen, auf Wunsch mit Lack.",
        "gelnägel": "Haltbare Modellage oder Auffüllen, natürlich oder mit Design.",
        "pediküre": "Fußbad, Hornhaut, Nägel und Pflege.",
        wimpernlifting: "Natürlicher Schwung für sechs bis acht Wochen.",
        augenbrauen: "Zupfen, Formen und Färben.",
      },
      faq: [
        ["Wie lange hält eine Gelmodellage?", "In der Regel drei bis vier Wochen, dann empfehlen wir das Auffüllen."],
        ["Kann ich mit empfindlicher Haut kommen?", "Ja. Sag{|en Sie} uns vorher Bescheid, dann wählen wir passende Produkte."],
        ["Wie kann ich einen Termin absagen?", "Bitte mindestens 24 Stunden vorher telefonisch oder per Nachricht."],
      ],
    },
    restaurant: {
      label: "Restaurant / Café", schema: "Restaurant", tone: "du",
      hero: "Frisch gekocht, gern serviert",
      promise: "Saisonale Küche, faire Preise und ein Tisch, an dem man gern sitzen bleibt.",
      cta: "Tisch reservieren",
      usp: ["Täglich frisch gekocht", "Vegetarische Gerichte", "Platz für Gruppen"],
      services: ["Mittagstisch", "Abendkarte", "Frühstück", "Catering", "Feiern & Events"],
      desc: {
        mittagstisch: "Wechselnde Tagesgerichte, schnell serviert.",
        abendkarte: "Unsere Karte mit Klassikern und saisonalen Gerichten.",
        "frühstück": "Am Wochenende auch ausgiebig.",
        catering: "Für Büro, Familienfeier oder Firmenevent – sprich uns an.",
        "feiern & events": "Geburtstage, Jubiläen, Weihnachtsfeiern – auf Wunsch mit eigenem Menü.",
      },
      faq: [
        ["Kann ich reservieren?", "Ja, telefonisch oder über das Kontaktformular. Für Gruppen ab acht Personen bitte vorher anmelden."],
        ["Gibt es vegetarische oder vegane Gerichte?", "Ja, jeden Tag mehrere."],
        ["Kann ich auch mitnehmen?", "Die meisten Gerichte gibt es auch zum Mitnehmen."],
      ],
    },
    handwerk: {
      label: "Handwerk", schema: "HomeAndConstructionBusiness", tone: "sie",
      hero: "Saubere Arbeit, verlässliche Termine",
      promise: "Wir sagen vorher, was es kostet, und halten uns daran.",
      cta: "Angebot anfragen",
      usp: ["Festpreis-Angebote", "Kurzfristige Termine", "Sauberer Arbeitsplatz"],
      services: ["Reparaturen", "Sanierung", "Montage", "Wartung", "Notdienst"],
      desc: {
        reparaturen: "Schnelle Hilfe bei Schäden und Defekten.",
        sanierung: "Von der Planung bis zur Übergabe aus einer Hand.",
        montage: "Fachgerechter Einbau inklusive Entsorgung des Altmaterials.",
        wartung: "Regelmäßige Prüfung, damit nichts ausfällt.",
        notdienst: "Auch außerhalb der Geschäftszeiten erreichbar.",
      },
      faq: [
        ["Ist das Angebot kostenlos?", "Ja, Besichtigung und Angebot sind unverbindlich."],
        ["Wie schnell können Sie kommen?", "Meist innerhalb weniger Tage, bei Notfällen oft am selben Tag."],
        ["In welchem Gebiet arbeiten Sie?", "In der Stadt und im Umland – fragen Sie einfach nach."],
      ],
    },
    kfz: {
      label: "Kfz-Werkstatt", schema: "AutoRepair", tone: "sie",
      hero: "Ihre Werkstatt für alle Marken",
      promise: "Inspektion, Reparatur und HU – mit klarer Ansage zu Kosten und Dauer.",
      cta: "Termin vereinbaren",
      usp: ["Alle Marken", "Kostenvoranschlag vorab", "Ersatzwagen auf Anfrage"],
      services: ["Inspektion", "HU / AU", "Reifenservice", "Bremsen", "Klimaservice", "Unfallreparatur"],
      desc: {
        inspektion: "Nach Herstellervorgaben, die Garantie bleibt erhalten.",
        "hu / au": "Hauptuntersuchung direkt bei uns im Haus.",
        reifenservice: "Wechsel, Einlagerung und Neureifen.",
        bremsen: "Prüfung und Austausch von Belägen und Scheiben.",
        klimaservice: "Desinfektion und Befüllung der Klimaanlage.",
        unfallreparatur: "Karosserie und Lack, Abwicklung mit der Versicherung.",
      },
      faq: [
        ["Verliere ich die Herstellergarantie?", "Nein. Wir warten nach Herstellervorgaben und stempeln das Serviceheft."],
        ["Bekomme ich vorher einen Preis?", "Ja, Sie erhalten vor jeder Reparatur einen Kostenvoranschlag."],
        ["Wie lange dauert eine Inspektion?", "In der Regel ist Ihr Auto am selben Tag fertig."],
      ],
    },
    fitness: {
      label: "Fitness / Coaching", schema: "HealthClub", tone: "du",
      hero: "Training, das in {deinen|Ihren} Alltag passt",
      promise: "Wir starten da, wo {du stehst|Sie stehen}, und bauen Schritt für Schritt auf.",
      cta: "Probetraining vereinbaren",
      usp: ["Individueller Trainingsplan", "Betreuung durch Trainer", "Flexible Laufzeiten"],
      services: ["Personal Training", "Gruppenkurse", "Ernährungsberatung", "Online-Coaching"],
      desc: {
        "personal training": "Eins-zu-eins-Training mit festem Trainer.",
        gruppenkurse: "Kleine Gruppen, feste Zeiten, gute Stimmung.",
        "ernährungsberatung": "Alltagstaugliche Pläne ohne Verbote.",
        "online-coaching": "Plan und Betreuung per App und Videocall.",
      },
      faq: [
        ["Brauche ich Vorerfahrung?", "Nein, das Training wird an {deinen|Ihren} Stand angepasst."],
        ["Gibt es eine Mindestlaufzeit?", "Es gibt auch monatlich kündbare Mitgliedschaften."],
        ["Wie läuft das Probetraining ab?", "Kennenlernen, kurze Analyse, gemeinsames Training – etwa eine Stunde."],
      ],
    },
    fotograf: {
      label: "Fotografie", schema: "ProfessionalService", tone: "du",
      hero: "Fotos, auf denen {du dich|Sie sich} wiedererkenn{st|en}",
      promise: "Entspannte Shootings, natürliches Licht und Bilder, die bleiben.",
      cta: "Shooting anfragen",
      usp: ["Entspannte Shootings", "Sorgfältige Bildbearbeitung", "Online-Galerie"],
      services: ["Portraits", "Hochzeiten", "Business-Fotos", "Familienshooting", "Produktfotos"],
      desc: {
        portraits: "Im Studio oder draußen, etwa eine Stunde.",
        hochzeiten: "Von der Trauung bis zum ersten Tanz.",
        "business-fotos": "Für Website, LinkedIn und Presse.",
        familienshooting: "Locker und mit Zeit für die Kinder.",
        produktfotos: "Freisteller und Bilder im Einsatz für Shop und Social Media.",
      },
      faq: [
        ["Wann bekomme ich meine Bilder?", "Innerhalb von ein bis zwei Wochen in einer privaten Online-Galerie."],
        ["Was soll ich anziehen?", "Vorab gibt es einen kurzen Styling-Leitfaden."],
        ["Fotografierst du auch vor Ort?", "Ja, im Studio, draußen oder bei {dir|Ihnen}."],
      ],
    },
    praxis: {
      label: "Praxis / Therapie", schema: "MedicalBusiness", tone: "sie",
      hero: "Behandlung mit Zeit und Sorgfalt",
      promise: "Wir hören zu, erklären verständlich und behandeln mit Erfahrung.",
      cta: "Termin vereinbaren",
      usp: ["Kurze Wartezeiten", "Verständliche Erklärungen", "Barrierefreier Zugang"],
      services: ["Erstgespräch", "Behandlung", "Physiotherapie", "Massage", "Hausbesuche"],
      desc: {
        "erstgespräch": "Wir besprechen Beschwerden, Vorgeschichte und Ziele.",
        physiotherapie: "Auf Rezept oder als Selbstzahler.",
        massage: "Klassische Massage zur Entspannung der Muskulatur.",
        hausbesuche: "Wenn der Weg in die Praxis nicht möglich ist.",
      },
      faq: [
        ["Nehmen Sie neue Patienten auf?", "Ja. Vereinbaren Sie einfach einen ersten Termin."],
        ["Werden die Kosten übernommen?", "Viele Leistungen übernimmt die Krankenkasse. Zu Selbstzahlerleistungen beraten wir Sie vorab."],
        ["Gibt es Parkplätze?", "Ja, in der Nähe der Praxis."],
      ],
    },
    reinigung: {
      label: "Reinigung / Service", schema: "HomeAndConstructionBusiness", tone: "sie",
      hero: "Sauber, pünktlich, zuverlässig",
      promise: "Feste Ansprechpartner, feste Zeiten und ein Ergebnis, das man sieht.",
      cta: "Angebot anfragen",
      usp: ["Feste Ansprechpartner", "Versichert", "Flexible Intervalle"],
      services: ["Büroreinigung", "Treppenhausreinigung", "Fensterreinigung", "Grundreinigung", "Privathaushalt"],
      desc: {
        "büroreinigung": "Täglich, wöchentlich oder nach Bedarf.",
        treppenhausreinigung: "Für Hausverwaltungen und Eigentümergemeinschaften.",
        fensterreinigung: "Inklusive Rahmen und Fensterbänken.",
        grundreinigung: "Nach Umzug, Renovierung oder einfach mal gründlich.",
        privathaushalt: "Regelmäßige Hilfe im Haushalt.",
      },
      faq: [
        ["Wie entsteht der Preis?", "Nach einer kurzen Besichtigung erhalten Sie ein festes Angebot."],
        ["Sind Sie versichert?", "Ja, wir haben eine Betriebshaftpflichtversicherung."],
        ["Bringen Sie Reinigungsmittel mit?", "Ja, Material und Geräte bringen wir mit."],
      ],
    },
    beratung: {
      label: "Beratung / Büro", schema: "ProfessionalService", tone: "sie",
      hero: "Klare Antworten für Ihre nächsten Schritte",
      promise: "Wir hören zu, sortieren und sagen ehrlich, was sinnvoll ist.",
      cta: "Erstgespräch vereinbaren",
      usp: ["Kostenloses Erstgespräch", "Transparente Honorare", "Fester Ansprechpartner"],
      services: ["Erstberatung", "Strategie", "Workshops", "Coaching", "Begleitung"],
      desc: {
        erstberatung: "30 Minuten zum Kennenlernen, unverbindlich.",
        workshops: "Für Teams vor Ort oder online.",
        coaching: "Einzelsitzungen mit klaren Zielen.",
      },
      faq: [
        ["Was kostet das Erstgespräch?", "Nichts. Wir lernen uns und Ihr Anliegen kennen."],
        ["Arbeiten Sie auch online?", "Ja, Termine sind vor Ort oder per Video möglich."],
        ["Für wen ist Ihr Angebot gedacht?", "Für Selbstständige sowie kleine und mittlere Unternehmen."],
      ],
    },
    baeckerei: {
      label: "Bäckerei / Konditorei", schema: "Bakery", tone: "du",
      hero: "Jeden Morgen frisch aus dem Ofen",
      promise: "Brot, Brötchen und Kuchen aus unserer Backstube – mit Zeit gebacken und am selben Tag verkauft.",
      cta: "Jetzt vorbestellen",
      usp: ["Täglich frisch gebacken", "Eigene Backstube", "Torten auf Bestellung"],
      services: ["Brot & Brötchen", "Kuchen & Gebäck", "Torten auf Bestellung", "Frühstück", "Snacks to go", "Catering"],
      desc: {
        "brot & brötchen": "Klassiker und wechselnde Sorten, morgens als Erstes fertig.",
        "kuchen & gebäck": "Blechkuchen, Teilchen und Saisonales aus der eigenen Backstube.",
        "torten auf bestellung": "Für Geburtstag, Hochzeit oder Firmenfeier – nach {deinen|Ihren} Wünschen.",
        "frühstück": "Belegte Brötchen und Kaffee, auch zum Mitnehmen.",
        "snacks to go": "Herzhaftes für die Mittagspause.",
        catering: "Brötchenplatten und Kuchen für Büro und Feiern.",
      },
      faq: [
        ["Kann ich vorbestellen?", "Ja, telefonisch oder über das Formular – am besten einen Tag vorher."],
        ["Wie früh muss ich eine Torte bestellen?", "Meist reichen drei bis vier Tage. Für Hochzeitstorten bitte früher anfragen."],
        ["Wo finde ich Angaben zu Allergenen?", "{Frag|Fragen Sie} uns im Laden, wir geben {dir|Ihnen} zu jedem Produkt Auskunft."],
      ],
    },
    tattoo: {
      label: "Tattoo / Piercing", schema: "TattooParlor", tone: "du",
      hero: "Tattoos, die zu {dir|Ihnen} passen",
      promise: "Wir nehmen uns Zeit für {deine|Ihre} Idee, zeichnen den Entwurf individuell und arbeiten sauber nach Hygienestandard.",
      cta: "Termin anfragen",
      usp: ["Individuelle Entwürfe", "Saubere Arbeitsweise", "Ehrliche Beratung"],
      services: ["Beratung", "Individuelles Tattoo", "Cover-up", "Fine Line", "Piercing", "Nachsorge"],
      desc: {
        beratung: "Motiv, Größe, Stelle und Preis besprechen – unverbindlich.",
        "individuelles tattoo": "Entwurf nach {deiner|Ihrer} Idee, kein Motiv von der Stange.",
        "cover-up": "Alte Tattoos überdecken oder auffrischen.",
        "fine line": "Feine Linien und kleine Motive.",
        piercing: "Mit sterilem Einwegmaterial.",
        nachsorge: "Pflegeanleitung und Nachstechen bei Bedarf.",
      },
      faq: [
        ["Kann ich meine eigene Idee mitbringen?", "Ja, gern – Fotos, Skizzen oder eine Beschreibung reichen für den Anfang."],
        ["Wie bereite ich mich auf den Termin vor?", "Ausgeschlafen kommen, vorher gut essen und keinen Alkohol trinken. Alles Weitere besprechen wir vorab."],
        ["Wie lange dauert die Heilung?", "Oberflächlich meist zwei bis drei Wochen. {Du bekommst|Sie bekommen} von uns eine Pflegeanleitung."],
      ],
    },
    immobilien: {
      label: "Immobilien", schema: "RealEstateAgent", tone: "sie",
      hero: "{Deine|Ihre} Immobilie in guten Händen",
      promise: "Wir bewerten realistisch, vermarkten mit guten Unterlagen und begleiten bis zum Notartermin.",
      cta: "Bewertung anfragen",
      usp: ["Realistische Bewertung", "Vermarktung mit Exposé", "Begleitung bis zum Notar"],
      services: ["Immobilienbewertung", "Verkauf", "Vermietung", "Exposé & Fotos", "Besichtigungen", "Beratung für Käufer"],
      desc: {
        immobilienbewertung: "Marktgerechter Preis auf Basis von Lage, Zustand und Vergleichsobjekten.",
        verkauf: "Von der Preisfindung bis zur Schlüsselübergabe.",
        vermietung: "Mieterauswahl, Mietvertrag und Übergabe.",
        "exposé & fotos": "Aussagekräftige Unterlagen, damit Interessenten gut vorbereitet kommen.",
        "besichtigungen": "Wir organisieren Termine und führen durch das Objekt.",
        "beratung für käufer": "Hilfe beim Prüfen von Angeboten und Unterlagen.",
      },
      faq: [
        ["Wie lange dauert ein Verkauf?", "Das hängt von Lage, Zustand und Preis ab. Nach der Bewertung bekommen {du|Sie} eine ehrliche Einschätzung."],
        ["Wer zahlt die Provision?", "Beim Verkauf von Wohnungen und Einfamilienhäusern an Privatkäufer wird sie in der Regel geteilt. Die Details erklären wir vorab."],
        ["Gibt es auch Hilfe bei der Vermietung?", "Ja, von der Mieterauswahl bis zur Übergabe."],
      ],
    },
    kanzlei: {
      label: "Kanzlei (Recht / Steuern)", schema: "ProfessionalService", tone: "sie",
      hero: "Klare Beratung in rechtlichen und steuerlichen Fragen",
      promise: "Wir erklären verständlich, was möglich ist, was es kostet und was als Nächstes zu tun ist.",
      cta: "Erstgespräch vereinbaren",
      usp: ["Verständliche Sprache", "Kosten vorab besprochen", "Fester Ansprechpartner"],
      services: ["Erstberatung", "Vertragsprüfung", "Arbeitsrecht", "Steuererklärung", "Buchhaltung", "Vertretung"],
      desc: {
        erstberatung: "Wir klären {dein|Ihr} Anliegen und die nächsten Schritte.",
        "vertragsprüfung": "Verträge lesen, Risiken erklären, Änderungen vorschlagen.",
        arbeitsrecht: "Bei Kündigung, Abmahnung oder Arbeitsvertrag.",
        "steuererklärung": "Für Privatpersonen und Selbstständige.",
        buchhaltung: "Laufende Buchführung und Abschlüsse.",
        vertretung: "Gegenüber Behörden, Gegnern und vor Gericht.",
      },
      faq: [
        ["Was kostet eine Erstberatung?", "Die Kosten nennen wir vorab. So {weißt du|wissen Sie} vor dem Termin, woran {du bist|Sie sind}."],
        ["Ist ein Termin auch per Telefon oder Video möglich?", "Ja, viele Anliegen lassen sich so gut besprechen."],
        ["Welche Unterlagen soll ich mitbringen?", "Alles, was zum Anliegen gehört, z. B. Verträge, Bescheide oder Schriftverkehr."],
      ],
    },
    tier: {
      label: "Hundesalon / Tierpflege", schema: "LocalBusiness", tone: "du",
      hero: "Pflege für {deinen|Ihren} Hund – mit Ruhe und Geduld",
      promise: "Wir nehmen uns Zeit, damit sich {dein|Ihr} Tier wohlfühlt – vom ersten Bad bis zum fertigen Schnitt.",
      cta: "Termin buchen",
      usp: ["Ruhige Atmosphäre", "Geduld mit ängstlichen Tieren", "Schonende Pflegeprodukte"],
      services: ["Baden & Föhnen", "Schneiden & Scheren", "Trimmen", "Krallenpflege", "Welpen-Eingewöhnung", "Tierbetreuung"],
      desc: {
        "baden & föhnen": "Mit mildem Shampoo, passend zu Fell und Haut.",
        "schneiden & scheren": "Rassetypisch oder pflegeleicht für den Alltag.",
        trimmen: "Für Rauhaarrassen, von Hand gezupft.",
        krallenpflege: "Kürzen und Feilen, auch ohne Termin für den Rest.",
        "welpen-eingewöhnung": "Kurze erste Termine, damit Pflege später entspannt bleibt.",
        tierbetreuung: "Stundenweise oder tagsüber.",
      },
      faq: [
        ["Wie lange dauert ein Termin?", "Je nach Größe und Fell zwischen einer und drei Stunden."],
        ["Kann ich dabei bleiben?", "{Sprich|Sprechen Sie} uns an – manche Tiere sind ohne Halter in der Nähe entspannter."],
        ["Was ist, wenn mein Hund ängstlich ist?", "Dann planen wir mehr Zeit und Pausen ein."],
      ],
    },
    unterkunft: {
      label: "Ferienwohnung / Pension", schema: "LodgingBusiness", tone: "sie",
      hero: "Ankommen, auspacken, durchatmen",
      promise: "Saubere, ruhige Zimmer und persönliche Tipps für {deinen|Ihren} Aufenthalt in der Umgebung.",
      cta: "Verfügbarkeit anfragen",
      usp: ["Persönlicher Kontakt", "Tipps für die Umgebung", "Unkomplizierte Buchung"],
      services: ["Doppelzimmer", "Ferienwohnung", "Frühstück", "Parkplatz", "Fahrradverleih", "Langzeitaufenthalt"],
      desc: {
        doppelzimmer: "Mit eigenem Bad und Platz zum Ankommen.",
        ferienwohnung: "Mit Küche – ideal für Familien und längere Aufenthalte.",
        "frühstück": "Auf Wunsch morgens zubuchbar.",
        parkplatz: "Direkt am Haus.",
        fahrradverleih: "Für Ausflüge in die Umgebung.",
        langzeitaufenthalt: "Für Monteure, Projekte oder Zwischenlösungen – {sprich|sprechen Sie} uns an.",
      },
      faq: [
        ["Wann sind Check-in und Check-out?", "Die Zeiten stehen in der Buchungsbestätigung. Bei früherer oder späterer Ankunft finden wir meist eine Lösung."],
        ["Sind Haustiere erlaubt?", "Bitte vorher fragen – wir sagen {dir|Ihnen} gern, was möglich ist."],
        ["Wie kann ich bezahlen?", "Die Zahlungsmöglichkeiten nennen wir bei der Buchung."],
      ],
    },
    unterricht: {
      label: "Nachhilfe / Musikschule", schema: "EducationalOrganization", tone: "du",
      hero: "Lernen mit Geduld und Plan",
      promise: "Wir schauen, wo {du stehst|Sie stehen}, und üben in kleinen Schritten – bis es sitzt.",
      cta: "Probestunde vereinbaren",
      usp: ["Einzel- und Gruppenunterricht", "Feste Lehrkraft", "Flexible Termine"],
      services: ["Nachhilfe Mathe", "Nachhilfe Sprachen", "Prüfungsvorbereitung", "Klavierunterricht", "Gitarrenunterricht", "Online-Unterricht"],
      desc: {
        "nachhilfe mathe": "Von Grundlagen bis Abitur, im eigenen Tempo.",
        "nachhilfe sprachen": "Deutsch, Englisch und weitere Sprachen.",
        "prüfungsvorbereitung": "Gezielt üben vor Klassenarbeit, Abschluss oder Aufnahmeprüfung.",
        klavierunterricht: "Für Anfänger und Wiedereinsteiger jeden Alters.",
        gitarrenunterricht: "Akustik oder E-Gitarre, mit Songs, die Spaß machen.",
        "online-unterricht": "Per Videocall mit derselben Lehrkraft.",
      },
      faq: [
        ["Gibt es eine Probestunde?", "Ja, zum Kennenlernen und um den Stand einzuschätzen."],
        ["Wie oft sollte man kommen?", "Meist einmal pro Woche – vor Prüfungen auch öfter."],
        ["Gibt es auch Online-Unterricht?", "Ja, per Videocall."],
      ],
    },
    garten: {
      label: "Garten- & Landschaftsbau", schema: "HomeAndConstructionBusiness", tone: "sie",
      hero: "Gärten, die man gern benutzt",
      promise: "Wir planen, bauen und pflegen – mit festem Angebot und sauberer Baustelle.",
      cta: "Angebot anfragen",
      usp: ["Planung und Ausführung", "Festpreis-Angebote", "Pflege übers Jahr"],
      services: ["Gartenpflege", "Gartengestaltung", "Pflasterarbeiten", "Rasen & Rollrasen", "Baum- & Heckenschnitt", "Zäune & Sichtschutz"],
      desc: {
        gartenpflege: "Regelmäßig oder einmalig, inklusive Entsorgung.",
        gartengestaltung: "Vom Entwurf bis zur fertigen Bepflanzung.",
        pflasterarbeiten: "Wege, Terrassen und Einfahrten.",
        "rasen & rollrasen": "Neuanlage, Vertikutieren und Nachsaat.",
        "baum- & heckenschnitt": "Fachgerecht und zur richtigen Jahreszeit.",
        "zäune & sichtschutz": "Holz, Metall oder begrünt.",
      },
      faq: [
        ["Kommen Sie für ein Angebot vorbei?", "Ja, wir sehen uns den Garten vor Ort an und schicken danach ein Angebot."],
        ["Übernehmen Sie auch die regelmäßige Pflege?", "Ja, auf Wunsch mit festen Terminen übers Jahr."],
        ["Wer entsorgt Grünschnitt und Material?", "Das übernehmen wir und weisen es im Angebot aus."],
      ],
    },
    sonstiges: {
      label: "Etwas anderes", schema: "LocalBusiness", tone: "du",
      hero: "Schön, dass {du hier bist|Sie hier sind}",
      promise: "Persönlicher Service von Menschen, die ihr Handwerk verstehen.",
      cta: "Kontakt aufnehmen",
      usp: ["Persönliche Beratung", "Faire Preise", "Kurze Wege"],
      services: ["Beratung", "Service", "Lieferung"],
      desc: {},
      faq: [
        ["Wie erreiche ich euch?", "Per Telefon, E-Mail oder über das Formular auf dieser Seite."],
        ["Wo finde ich euch?", "Adresse und Öffnungszeiten stehen unten im Kontaktbereich."],
      ],
    },
  };

  // ---------- Stile ----------
  const STYLES = {
    klar: { label: "Klar", primary: "#111827", accent: "#2563eb", bg: "#ffffff", soft: "#f3f4f6", text: "#111827", head: "'Manrope', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif", font: "Manrope:wght@400;600;800", radius: "8px" },
    elegant: { label: "Elegant", primary: "#1f1b16", accent: "#a8834b", bg: "#fffdf9", soft: "#f4eee4", text: "#1f1b16", head: "'Playfair Display', Georgia, serif", body: "'Lato', system-ui, sans-serif", font: "Playfair+Display:wght@500;700&family=Lato:wght@400;700", radius: "2px" },
    warm: { label: "Warm", primary: "#9a3412", accent: "#c2410c", bg: "#fbf7f2", soft: "#f3e9dd", text: "#2b1d14", head: "'Fraunces', Georgia, serif", body: "'Work Sans', system-ui, sans-serif", font: "Fraunces:wght@500;700&family=Work+Sans:wght@400;600", radius: "6px" },
    natur: { label: "Natürlich", primary: "#2f5d46", accent: "#2f5d46", bg: "#f8f7f2", soft: "#e9eee6", text: "#1d2b22", head: "'Libre Baskerville', Georgia, serif", body: "'Source Sans 3', system-ui, sans-serif", font: "Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;600", radius: "4px" },
    minimal: { label: "Minimal", primary: "#111111", accent: "#111111", bg: "#ffffff", soft: "#f4f4f4", text: "#111111", head: "'DM Sans', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif", font: "DM+Sans:wght@400;500;700", radius: "0px" },
    freundlich: { label: "Freundlich", primary: "#be185d", accent: "#be185d", bg: "#fffafb", soft: "#fcecf2", text: "#3b0a1f", head: "'Nunito', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", font: "Nunito:wght@400;700;800", radius: "14px" },
    luxus: { label: "Luxus", primary: "#1c1917", accent: "#a16207", bg: "#faf7f2", soft: "#f1ebe1", text: "#1c1917", head: "'Cormorant', Georgia, serif", body: "'Montserrat', system-ui, sans-serif", font: "Cormorant:wght@500;700&family=Montserrat:wght@400;600", radius: "0px" },
    pastell: { label: "Pastell", primary: "#6d4fc2", accent: "#6d4fc2", bg: "#fdf8ff", soft: "#f1ecfb", text: "#3b2f5c", head: "'Varela Round', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", font: "Varela+Round&family=Nunito+Sans:wght@400;700", radius: "18px" },
    kraeftig: { label: "Kräftig", primary: "#111111", accent: "#b91c1c", bg: "#ffffff", soft: "#fef08a", text: "#111111", head: "'Bebas Neue', Impact, sans-serif", body: "'Source Sans 3', system-ui, sans-serif", font: "Bebas+Neue&family=Source+Sans+3:wght@400;600", radius: "0px" },
    retro: { label: "Retro", primary: "#c2410c", accent: "#0f766e", bg: "#fdf6e3", soft: "#f3e5c0", text: "#2d2a26", head: "'Abril Fatface', Georgia, serif", body: "'Merriweather', Georgia, serif", font: "Abril+Fatface&family=Merriweather:wght@400;700", radius: "10px" },
    dunkel: { label: "Dunkel", primary: "#e5c07b", accent: "#e5c07b", bg: "#121212", soft: "#1c1c1c", text: "#ededed", head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", font: "Space+Grotesk:wght@500;700&family=Inter:wght@400;600", radius: "4px" },
  };

  // ---------- Branchen-Design ----------
  // Farben und Schriften aus der UI/UX-Pro-Max-Datenbank (Produkttyp → Palette, Schriftpaar).
  // Akzent = Markenfarbe der Palette, primary = deren CTA-Farbe; Töne, die auf Weiß unter 4,5:1 lagen, sind abgedunkelt.
  const INDUSTRY_STYLES = {
    // Beauty/Spa/Wellness: Rosa + Lavendel, Playfair Display / Inter
    beauty: { primary: "#7c3aed", accent: "#be185d", bg: "#fdf2f8", soft: "#f1eef5", text: "#831843", head: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif", font: "Playfair+Display:wght@500;700&family=Inter:wght@400;600", radius: "12px" },
    // Bakery/Cafe: warmes Braun + Creme, Playfair Display SC / Karla
    restaurant: { primary: "#92400e", accent: "#92400e", bg: "#fffbeb", soft: "#fef3c7", text: "#78350f", head: "'Playfair Display SC', Georgia, serif", body: "'Karla', system-ui, sans-serif", font: "Playfair+Display+SC:wght@700&family=Karla:wght@400;600", radius: "6px" },
    // Construction: Industriegrau + Signalorange, Poppins / Open Sans
    handwerk: { primary: "#c2410c", accent: "#475569", bg: "#f8fafc", soft: "#ebf0f5", text: "#334155", head: "'Poppins', system-ui, sans-serif", body: "'Open Sans', system-ui, sans-serif", font: "Poppins:wght@600;700&family=Open+Sans:wght@400;600", radius: "4px" },
    // Automotive: dunkles Blaugrau + Signalrot, Outfit / Rubik
    kfz: { primary: "#dc2626", accent: "#b91c1c", bg: "#f8fafc", soft: "#e9edf1", text: "#0f172a", head: "'Outfit', system-ui, sans-serif", body: "'Rubik', system-ui, sans-serif", font: "Outfit:wght@600;700&family=Rubik:wght@400;500", radius: "6px" },
    // Fitness/Gym: dunkel, Energie-Orange + Grün, Barlow Condensed / Barlow
    fitness: { primary: "#22c55e", accent: "#f97316", bg: "#1f2937", soft: "#374151", text: "#f8fafc", head: "'Barlow Condensed', system-ui, sans-serif", body: "'Barlow', system-ui, sans-serif", font: "Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600", radius: "6px" },
    // Photography Studio: Schwarz + Weiß, Archivo / Space Grotesk
    fotograf: { primary: "#f8fafc", accent: "#d4d4d8", bg: "#000000", soft: "#181818", text: "#fafafa", head: "'Archivo', system-ui, sans-serif", body: "'Space Grotesk', system-ui, sans-serif", font: "Archivo:wght@600;800&family=Space+Grotesk:wght@400;500", radius: "0px" },
    // Medical Clinic: Petrol + Grün, Figtree / Noto Sans
    praxis: { primary: "#15803d", accent: "#0e7490", bg: "#f0fdfa", soft: "#e8f1f6", text: "#134e4a", head: "'Figtree', system-ui, sans-serif", body: "'Noto Sans', system-ui, sans-serif", font: "Figtree:wght@600;700&family=Noto+Sans:wght@400;600", radius: "10px" },
    // Service: Navy + Blau, Outfit / Work Sans
    reinigung: { primary: "#0369a1", accent: "#0369a1", bg: "#f8fafc", soft: "#e8ecf1", text: "#020617", head: "'Outfit', system-ui, sans-serif", body: "'Work Sans', system-ui, sans-serif", font: "Outfit:wght@600;700&family=Work+Sans:wght@400;600", radius: "8px" },
    // B2B Service: Navy + Blau, EB Garamond / Lato
    beratung: { primary: "#0369a1", accent: "#0369a1", bg: "#f8fafc", soft: "#e8ecf1", text: "#020617", head: "'EB Garamond', Georgia, serif", body: "'Lato', system-ui, sans-serif", font: "EB+Garamond:wght@500;700&family=Lato:wght@400;700", radius: "4px" },
    // Real Estate/Property: Petrol + Blau, Cinzel / Josefin Sans
    immobilien: { primary: "#0369a1", accent: "#0f766e", bg: "#f0fdfa", soft: "#e8f0f3", text: "#134e4a", head: "'Cinzel', Georgia, serif", body: "'Josefin Sans', system-ui, sans-serif", font: "Cinzel:wght@600;700&family=Josefin+Sans:wght@400;600", radius: "4px" },
    // Legal Services: Navy + Gold, EB Garamond / Lato
    kanzlei: { primary: "#b45309", accent: "#1e3a8a", bg: "#f8fafc", soft: "#e9eef5", text: "#0f172a", head: "'EB Garamond', Georgia, serif", body: "'Lato', system-ui, sans-serif", font: "EB+Garamond:wght@500;700&family=Lato:wght@400;700", radius: "2px" },
    // Veterinary Clinic: Petrol + warmes Orange, Varela Round / Nunito Sans
    tier: { primary: "#c2410c", accent: "#0f766e", bg: "#f0fdfa", soft: "#e8f1f4", text: "#134e4a", head: "'Varela Round', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", font: "Varela+Round&family=Nunito+Sans:wght@400;700", radius: "16px" },
    // Hotel/Hospitality: Navy + Gold, Playfair Display SC / Karla
    unterkunft: { primary: "#a16207", accent: "#1e3a8a", bg: "#f8fafc", soft: "#e9eef5", text: "#1e3a8a", head: "'Playfair Display SC', Georgia, serif", body: "'Karla', system-ui, sans-serif", font: "Playfair+Display+SC:wght@700&family=Karla:wght@400;600", radius: "6px" },
    // Educational: Indigo + Orange, Baloo 2 (Fließtext Nunito Sans statt Comic Neue)
    unterricht: { primary: "#c2410c", accent: "#4f46e5", bg: "#eef2ff", soft: "#e0e7ff", text: "#1e1b4b", head: "'Baloo 2', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", font: "Baloo+2:wght@600;700&family=Nunito+Sans:wght@400;700", radius: "14px" },
    // Natur: Grün + Sonnengelb, Outfit / Work Sans (kein eigener Treffer für Garten)
    garten: { primary: "#15803d", accent: "#b45309", bg: "#f0fdf4", soft: "#e3f1e7", text: "#0f172a", head: "'Outfit', system-ui, sans-serif", body: "'Work Sans', system-ui, sans-serif", font: "Outfit:wght@600;700&family=Work+Sans:wght@400;600", radius: "8px" },
  };
  INDUSTRY_STYLES.friseur = INDUSTRY_STYLES.beauty;
  INDUSTRY_STYLES.baeckerei = INDUSTRY_STYLES.restaurant; // gleicher Treffer: Bakery/Cafe
  INDUSTRY_STYLES.tattoo = INDUSTRY_STYLES.fotograf; // kein eigener Treffer, Schwarz-Weiß passt
  INDUSTRY_STYLES.kosmetik = INDUSTRY_STYLES.beauty;

  // "branche" = Design passend zur Branche, sonst einer der festen Stile
  function resolveStyle(style, industry) {
    if (STYLES[style]) return STYLES[style];
    return { label: "Passend zur Branche", ...(INDUSTRY_STYLES[industry] || STYLES.klar) };
  }

  const LAYOUTS = {
    split: "Text links, Foto rechts",
    splitrev: "Foto links, Text rechts",
    center: "Zentriert, nur Schrift",
    photo: "Großes Foto im Hintergrund",
  };

  // ---------- 3D-Erlebnis ----------
  const SCENES = { flow: "Fließende Form", partikel: "Partikel", geometrie: "Geometrie", ringe: "Ringe" };
  const DEFAULT_SCENE = {
    friseur: "flow", kosmetik: "flow", praxis: "flow", tier: "flow", sonstiges: "flow",
    restaurant: "partikel", baeckerei: "partikel", reinigung: "partikel", unterkunft: "partikel",
    handwerk: "geometrie", kfz: "geometrie", beratung: "geometrie", kanzlei: "geometrie", immobilien: "geometrie", garten: "geometrie",
    fitness: "ringe", fotograf: "ringe", tattoo: "ringe", unterricht: "ringe",
  };
  // Schalter in assets/config.js (features.threeD). Ausgeschaltet bleibt der Code erhalten, wird aber nicht genutzt.
  const threeDEnabled = () => !!(global.BUILDA_CONFIG && global.BUILDA_CONFIG.features && global.BUILDA_CONFIG.features.threeD);
  // Three.js (UMD-Build) von jsDelivr, abgesichert per Subresource Integrity
  const THREE_SRC = "https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js";
  const THREE_SRI = "sha384-vV17nr/rMaJqmeZkFUzXLpHdQ+ME5QHKdydaqqN+3Ga39RJlNrTatJxHwGV4ml2C";

  // Läuft auf der fertigen Kundenseite: wird per toString() eingebettet, darf also nichts von außen benutzen.
  function sceneRuntime(C) {
    var root = document.documentElement;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Inhalte beim Scrollen einblenden
    if (!reduce && "IntersectionObserver" in window) {
      root.classList.add("anim");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      document.querySelectorAll(".block h2, .block .label, .services li, .steps li, .reviews blockquote, .gallery img, .faq details, .about > *, .contact > *, .chapter .glass")
        .forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
    }
    // Karten kippen leicht mit der Maus
    if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".steps li, .reviews blockquote, .chapter .glass").forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
          el.style.transition = "transform .15s ease-out";
          el.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
        });
        el.addEventListener("pointerleave", function () { el.style.transition = "transform .5s ease"; el.style.transform = ""; });
      });
    }

    var cv = document.querySelector(".scene");
    var T = window.THREE, renderer;
    if (!cv || !T) { root.classList.add("no3d"); return; }
    try {
      renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { root.classList.add("no3d"); return; }

    var small = window.matchMedia("(max-width: 860px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 0, 7);
    var group = new T.Group();
    scene.add(group);
    var c1 = new T.Color(C.p), c2 = new T.Color(C.a);
    var rim = new T.Color(0xffffff).lerp(c2, 0.25);
    var anim;

    function lights() {
      scene.add(new T.HemisphereLight(0xffffff, c2.clone().multiplyScalar(0.4), C.dark ? 0.7 : 1));
      var key = new T.DirectionalLight(0xffffff, 1.2);
      key.position.set(3, 4, 5);
      scene.add(key);
      var glow = new T.PointLight(c2.getHex(), 2.4, 20);
      glow.position.set(-3, -1, 3);
      scene.add(glow);
    }

    var NOISE = [
      "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
      "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
      "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}",
      "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
      "float snoise(vec3 v){",
      "const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);",
      "vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);",
      "vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);",
      "vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);",
      "vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));",
      "float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);",
      "vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);",
      "vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));",
      "vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;",
      "vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);",
      "vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;",
      "vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;",
      "return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}",
    ].join("\n");
    var ease = function (x) { return 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))); };

    if (C.kind === "partikel") {
      // Punktwolke: Kugel → Welle → Galaxie
      var N = small ? 3500 : 9000, side = Math.ceil(Math.sqrt(N));
      var A = new Float32Array(N * 3), B = new Float32Array(N * 3), G = new Float32Array(N * 3), R = new Float32Array(N);
      for (var i = 0; i < N; i++) {
        var k = i + 0.5, phi = Math.acos(1 - (2 * k) / N), th = Math.PI * (1 + Math.sqrt(5)) * k;
        A[i * 3] = 1.5 * Math.cos(th) * Math.sin(phi); A[i * 3 + 1] = 1.5 * Math.cos(phi); A[i * 3 + 2] = 1.5 * Math.sin(th) * Math.sin(phi);
        var u = ((i % side) / (side - 1)) * 2 - 1, v = (Math.floor(i / side) / (side - 1)) * 2 - 1;
        B[i * 3] = u * 2.8; B[i * 3 + 1] = Math.sin(u * 3.2) * 0.35 + Math.cos(v * 4) * 0.25; B[i * 3 + 2] = v * 2.8;
        var rr = Math.pow(Math.random(), 0.6) * 2.3, ang = rr * 2.4 + (i % 3) * 2.094 + (Math.random() - 0.5) * 0.4;
        G[i * 3] = Math.cos(ang) * rr; G[i * 3 + 1] = (Math.random() - 0.5) * 0.2; G[i * 3 + 2] = Math.sin(ang) * rr;
        R[i] = Math.random();
      }
      var pg = new T.BufferGeometry();
      pg.setAttribute("position", new T.BufferAttribute(A, 3));
      pg.setAttribute("aB", new T.BufferAttribute(B, 3));
      pg.setAttribute("aC", new T.BufferAttribute(G, 3));
      pg.setAttribute("aR", new T.BufferAttribute(R, 1));
      var pm = new T.ShaderMaterial({
        transparent: true, depthWrite: false,
        blending: C.dark ? T.AdditiveBlending : T.NormalBlending,
        uniforms: { uTime: { value: 0 }, uM: { value: 0 }, uSize: { value: C.dark ? 34 : 30 }, uPR: { value: renderer.getPixelRatio() }, uC1: { value: c1 }, uC2: { value: c2 }, uAlpha: { value: C.dark ? 0.8 : 0.9 } },
        vertexShader: [
          "uniform float uTime,uM,uSize,uPR;attribute vec3 aB;attribute vec3 aC;attribute float aR;varying float vR;",
          "void main(){float s1=smoothstep(aR*.4,aR*.4+.6,clamp(uM,0.,1.));float s2=smoothstep(aR*.4,aR*.4+.6,clamp(uM-1.,0.,1.));",
          "vec3 p=mix(mix(position,aB,s1),aC,s2);",
          "p+=vec3(sin(uTime*.7+aR*20.),cos(uTime*.6+aR*13.),sin(uTime*.5+aR*7.))*.035;",
          "vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=uSize*uPR*(.6+aR*.8)/-mv.z;vR=aR;gl_Position=projectionMatrix*mv;}",
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 uC1,uC2;uniform float uAlpha;varying float vR;",
          "void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(mix(uC1,uC2,vR),smoothstep(.5,.1,d)*uAlpha);}",
        ].join("\n"),
      });
      var pts = new T.Points(pg, pm);
      group.add(pts);
      anim = function (t, seg) {
        pm.uniforms.uTime.value = t;
        pm.uniforms.uM.value = Math.min(seg, 2);
        pts.rotation.y = t * 0.05 + seg * 0.6;
        pts.rotation.x = 0.45 * ease(seg) - 0.2 * ease(seg - 1);
      };
    } else if (C.kind === "geometrie") {
      // Torusknoten mit kreisenden Körpern, die beim Scrollen auseinanderfliegen
      lights();
      var core = new T.Mesh(new T.TorusKnotGeometry(0.85, 0.27, small ? 160 : 260, small ? 20 : 36), new T.MeshStandardMaterial({ color: c1, metalness: 0.5, roughness: 0.28 }));
      group.add(core);
      var shapes = [new T.OctahedronGeometry(0.22), new T.BoxGeometry(0.3, 0.3, 0.3), new T.IcosahedronGeometry(0.2), new T.TetrahedronGeometry(0.25)];
      var bits = [];
      for (var b = 0; b < 14; b++) {
        var bm = new T.Mesh(shapes[b % 4], new T.MeshStandardMaterial({ color: b % 3 ? c2 : c1, metalness: 0.35, roughness: 0.35, flatShading: true }));
        bm.userData = { dir: new T.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.8, Math.random() - 0.5).normalize(), r: 1.6 + Math.random() * 0.7, sp: 0.3 + Math.random() * 0.6, ph: Math.random() * 6.28 };
        group.add(bm);
        bits.push(bm);
      }
      anim = function (t, seg) {
        core.rotation.x = t * 0.15 + seg * 0.6;
        core.rotation.y = t * 0.2 + seg * 0.9;
        var spread = 1 + 0.55 * ease(seg) - 0.3 * ease(seg - 2);
        bits.forEach(function (m) {
          var u = m.userData, a = u.ph + t * u.sp * 0.35 + seg * 0.5;
          var x = u.dir.x * u.r * spread, z = u.dir.z * u.r * spread;
          m.position.set(x * Math.cos(a) - z * Math.sin(a), u.dir.y * u.r * spread + Math.sin(t + u.ph) * 0.08, x * Math.sin(a) + z * Math.cos(a));
          m.rotation.x = m.rotation.y = t * u.sp + u.ph;
        });
      };
    } else if (C.kind === "ringe") {
      // Ineinander drehende Ringe wie ein Gyroskop
      lights();
      var rings = [];
      for (var r = 0; r < 4; r++) {
        var col = r % 2 ? c2 : c1;
        var ring = new T.Mesh(new T.TorusGeometry(0.95 + r * 0.36, 0.035 + 0.012 * (3 - r), 24, small ? 140 : 240), new T.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.25, emissive: col, emissiveIntensity: C.dark ? 0.25 : 0.06 }));
        group.add(ring);
        rings.push(ring);
      }
      var orb = new T.Mesh(new T.SphereGeometry(0.42, 48, 48), new T.MeshStandardMaterial({ color: c2, emissive: c2, emissiveIntensity: 0.35, roughness: 0.2 }));
      group.add(orb);
      anim = function (t, seg) {
        rings.forEach(function (m, n) {
          var dir = n % 2 ? 1 : -1;
          m.rotation.x = t * (0.2 + 0.07 * n) * dir + seg * (0.5 + 0.2 * n);
          m.rotation.y = t * (0.15 + 0.05 * n) + seg * 0.4 * n;
        });
        var s = 1 + 0.06 * Math.sin(t * 1.4);
        orb.scale.set(s, s, s);
      };
    } else {
      // Fließende Form: Kugel, deren Oberfläche mit Rauschen wogt
      var fm = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uAmp: { value: 0.22 }, uFreq: { value: 1.1 }, uC1: { value: c1 }, uC2: { value: c2 }, uRim: { value: rim } },
        vertexShader: [
          "uniform float uTime,uAmp,uFreq;varying float vN;varying vec3 vNormal;varying vec3 vView;",
          NOISE,
          "void main(){float n=snoise(normal*uFreq+vec3(uTime*.22));n+=snoise(normal*uFreq*2.3-vec3(uTime*.15))*.35;vN=n;",
          "vec4 mv=modelViewMatrix*vec4(position+normal*n*uAmp,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 uC1,uC2,uRim;varying float vN;varying vec3 vNormal;varying vec3 vView;",
          "void main(){float f=pow(1.-max(dot(vNormal,vView),0.),2.2);vec3 col=mix(uC1,uC2,smoothstep(-.5,.7,vNormal.y*.6+vN*.9));",
          "col+=pow(max(dot(reflect(-normalize(vec3(-.4,.6,.7)),vNormal),vView),0.),24.)*.35;gl_FragColor=vec4(mix(col,uRim,f*.55),1.);}",
        ].join("\n"),
      });
      var blob = new T.Mesh(new T.IcosahedronGeometry(1.25, small ? 36 : 72), fm);
      group.add(blob);
      anim = function (t, seg) {
        fm.uniforms.uTime.value = t;
        fm.uniforms.uAmp.value = 0.2 + 0.16 * ease(seg) - 0.08 * ease(seg - 2);
        fm.uniforms.uFreq.value = 1.05 + 0.22 * seg;
        blob.rotation.y = t * 0.06 + seg * 0.9;
        blob.rotation.x = seg * 0.35;
      };
    }

    // Scroll-Position → Kapitel-Index (0 = Startbereich, 1 = erstes Kapitel …)
    var marks = [], stopAt = 0, side = 1.6;
    function measure() {
      var els = [document.querySelector(".hero3d")].concat([].slice.call(document.querySelectorAll(".chapter"))).filter(Boolean);
      marks = els.map(function (el) { var b = el.getBoundingClientRect(); return b.top + window.scrollY + b.height / 2 - window.innerHeight / 2; });
      var st = document.querySelector(".story") || els[0];
      stopAt = st ? st.getBoundingClientRect().bottom + window.scrollY : window.innerHeight;
    }
    function segAt(y) {
      if (!marks.length || y <= marks[0]) return 0;
      for (var n = 1; n < marks.length; n++) if (y < marks[n]) return n - 1 + (y - marks[n - 1]) / Math.max(1, marks[n] - marks[n - 1]);
      return marks.length - 1;
    }
    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.position.z = cam.aspect < 1 ? 9.5 : 7;
      cam.updateProjectionMatrix();
      small = w <= 860;
      // Abstand zur Mitte: so weit außen, dass Text und Objekt sich kaum überlappen (halbe sichtbare Breite minus Objektradius)
      side = Math.max(1.4, Math.min(2.1, Math.tan((cam.fov * Math.PI) / 360) * cam.position.z * cam.aspect - 1.6));
    }

    var seg = 0, mx = 0, my = 0, clock = new T.Clock(), queued = false;
    window.addEventListener("pointermove", function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    function frame() {
      queued = false;
      var y = window.scrollY;
      if (y > stopAt || document.hidden) { cv.style.visibility = "hidden"; return; }
      cv.style.visibility = "";
      var target = segAt(y);
      seg += reduce ? target - seg : (target - seg) * 0.08;
      var t = reduce ? 0 : clock.getElapsedTime();
      anim(t, seg);
      // Objekt wechselt die Seite, gegenüber dem Text; am Handy oben bzw. mittig hinter der Karte
      var x = small ? 0 : side * Math.cos(seg * Math.PI);
      var yy = small ? 1.15 * (1 - ease(seg)) : 0;
      group.position.x += reduce ? x - group.position.x : (x - group.position.x) * 0.08;
      group.position.y = yy + (reduce ? 0 : Math.sin(t * 0.6) * 0.06);
      var sc = small ? 0.78 : 1;
      group.scale.set(sc, sc, sc);
      group.rotation.y += (mx * 0.35 - group.rotation.y) * 0.05;
      group.rotation.x += (my * 0.25 - group.rotation.x) * 0.05;
      renderer.render(scene, cam);
      if (!reduce) tick();
    }
    function tick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    resize();
    measure();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", function () { resize(); measure(); tick(); });
    window.addEventListener("load", function () { measure(); tick(); });
    document.addEventListener("visibilitychange", tick);
    tick();
  }

  // ---------- Buchen-/Kaufen-Button ----------
  // cta: Text für den Hauptbutton, btn: Button bei jeder Leistung, ask: Anfang der vorausgefüllten Nachricht
  const ACTIONS = {
    anfrage: { label: "Anfragen", btn: "Anfragen", ask: "Anfrage zu: " },
    termin: { label: "Termin buchen", btn: "Buchen", cta: "Termin buchen", ask: "Ich möchte einen Termin buchen: ", schema: "ReserveAction" },
    buchen: { label: "Jetzt buchen", btn: "Buchen", cta: "Jetzt buchen", ask: "Ich möchte buchen: ", schema: "ReserveAction" },
    reservieren: { label: "Reservieren", btn: "Reservieren", cta: "Tisch reservieren", ask: "Ich möchte reservieren: ", schema: "ReserveAction" },
    probe: { label: "Probetermin", btn: "Probetermin", cta: "Probetermin vereinbaren", ask: "Ich möchte einen Probetermin: ", schema: "ReserveAction" },
    angebot: { label: "Angebot anfordern", btn: "Angebot", cta: "Angebot anfordern", ask: "Ich hätte gern ein Angebot für: " },
    rueckruf: { label: "Rückruf", btn: "Rückruf", cta: "Rückruf anfordern", ask: "Bitte {ruft|rufen Sie} mich zurück wegen: " },
    kaufen: { label: "Kaufen", btn: "Kaufen", cta: "Jetzt kaufen", ask: "Ich möchte kaufen: ", schema: "BuyAction" },
    bestellen: { label: "Bestellen", btn: "Bestellen", cta: "Jetzt bestellen", ask: "Ich möchte bestellen: ", schema: "OrderAction" },
    gutschein: { label: "Gutschein", btn: "Gutschein", cta: "Gutschein kaufen", ask: "Ich möchte einen Gutschein für: ", schema: "BuyAction" },
  };
  const DEFAULT_ACTION = {
    friseur: "termin", kosmetik: "termin", kfz: "termin", fotograf: "termin", praxis: "termin", tattoo: "termin", tier: "termin", kanzlei: "termin",
    fitness: "probe", unterricht: "probe", restaurant: "reservieren", baeckerei: "bestellen", unterkunft: "buchen",
    handwerk: "angebot", garten: "angebot", reinigung: "angebot",
  };
  const defaultAction = (industry) => DEFAULT_ACTION[industry] || "anfrage";

  // Nur http(s)-Links mit echter Domain; "calendly.com/x" wird zu "https://calendly.com/x"
  function safeUrl(u) {
    let v = String(u || "").trim();
    if (!v) return "";
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(v) && !/^https?:\/\//i.test(v)) return "";
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try {
      const url = new URL(v);
      return /^https?:$/.test(url.protocol) && !url.username && /\.[a-z]{2,}$/i.test(url.hostname) ? url.href : "";
    } catch {
      return "";
    }
  }

  // Ab so vielen Zeichen Beschreibung (Wer, Besonderheiten, Ablauf) ist das 3D-Erlebnis möglich
  const DETAIL_MIN = 400;
  const detailLength = (d) => ["about", "special", "process"].reduce((n, k) => n + String((d && d[k]) || "").trim().length, 0);
  const lines = (v) => String(v || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
  // Ablauf: eine Zeile pro Schritt; steht alles in einer Zeile, wird nach Sätzen getrennt
  const steps = (v) => {
    const l = lines(v);
    return (l.length > 1 ? l : String(v || "").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean)).slice(0, 6);
  };

  const SECTIONS = {
    about: "Über uns",
    services: "Leistungen & Preise",
    process: "Ablauf",
    gallery: "Fotogalerie",
    reviews: "Kundenstimmen",
    faq: "Häufige Fragen",
    contact: "Kontakt & Öffnungszeiten",
  };

  // ---------- Kontrast (WCAG 2) ----------
  const rgb = (hex) => {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const toHex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  const lum = (hex) => {
    const [r, g, b] = rgb(hex).map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  // Lesbare Textfarbe auf einer Hintergrundfarbe
  function onColor(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return "#ffffff";
    return contrast(hex, "#ffffff") >= contrast(hex, "#111111") ? "#ffffff" : "#111111";
  }

  // Dunkelt bzw. hellt eine Farbe so weit ab, bis sie auf dem Hintergrund lesbar ist (4,5:1 für Text)
  function readable(hex, bg, min = 4.5) {
    if (contrast(hex, bg) >= min) return hex;
    const to = contrast(bg, "#000000") >= contrast(bg, "#ffffff") ? [0, 0, 0] : [255, 255, 255];
    const c = rgb(hex);
    for (let k = 0.05; k < 1; k += 0.05) {
      const mixed = toHex(c.map((v, i) => Math.round(v + (to[i] - v) * k)));
      if (contrast(mixed, bg) >= min) return mixed;
    }
    return toHex(to);
  }

  // ---------- Vorlagentexte ----------
  function generateCopy(d) {
    const ind = INDUSTRIES[d.industry] || INDUSTRIES.sonstiges;
    const t = d.tone || ind.tone;
    const name = d.name || "Ihr Unternehmen";
    const city = d.city || "";
    const services = (d.services || []).filter((s) => s.title);

    const about = d.about
      ? lines(d.about).slice(0, 4)
      : [tone(`${name}${city ? " in " + city : ""}: ${ind.promise}`, t),
         tone(`Ob {du zum ersten Mal kommst|Sie zum ersten Mal kommen} oder schon lange dabei {bist|sind} – wir freuen uns auf {dich|Sie}.`, t)];

    return {
      ind,
      tone: t,
      name,
      city,
      hero: tone(ind.hero, t),
      tagline: d.slogan || tone(ind.promise, t),
      cta: ind.cta,
      aboutTitle: d.about ? "Wer wir sind" : `${name} stellt sich vor`,
      about,
      usp: ind.usp,
      special: String(d.special || "").trim(),
      process: steps(d.process).map((text) => ({ title: "", text })),
      // Story-Kapitel fürs 3D-Erlebnis – ohne KI direkt aus den eigenen Worten des Kunden
      story: [
        d.about && { title: "Wer wir sind", text: lines(d.about).join(" ") },
        d.special && { title: "Was uns ausmacht", text: String(d.special).trim() },
        d.process && { title: "So läuft es ab", text: steps(d.process).join(" → ") },
        { title: tone("{Darauf kannst du dich verlassen|Darauf können Sie sich verlassen}", t), text: ind.usp.join(" · ") },
      ].filter(Boolean),
      services: services.map((s) => ({
        title: s.title,
        text: s.desc || tone(ind.desc[s.title.toLowerCase()] || "", t),
        price: s.price || "",
      })),
      faq: ind.faq.map(([q, a]) => [tone(q, t), tone(a, t)]),
      seoTitle: `${name}${city ? " – " + ind.label.split(" /")[0] + " in " + city : ""}`,
      seoDesc: `${name}${city ? " in " + city : ""}: ${services.slice(0, 3).map((s) => s.title).join(", ")}. ${tone(ind.promise, t)}`.slice(0, 158),
      keywords: services.map((s) => `${s.title} ${city}`.trim()).concat(name).join(", "),
    };
  }

  // Übernimmt KI-Texte (aus /api/generate) über die Vorlagentexte. Eigene Angaben des Kunden haben immer Vorrang.
  function mergeCopy(base, ai, d) {
    if (!ai || typeof ai !== "object") return base;
    const str = (v, fb) => (typeof v === "string" && v.trim() ? v.trim() : fb);
    const isStr = (x) => typeof x === "string" && x.trim();
    const aiServices = Array.isArray(ai.services) ? ai.services : [];
    const aiText = (title) => {
      const hit = aiServices.find((x) => x && isStr(x.title) && x.title.trim().toLowerCase() === title.toLowerCase());
      return hit && isStr(hit.text) ? hit.text.trim() : "";
    };
    const aiAbout = Array.isArray(ai.about) ? ai.about.filter(isStr) : [];
    const aiFaq = Array.isArray(ai.faq) ? ai.faq.filter((x) => x && isStr(x.q) && isStr(x.a)) : [];
    const aiUsp = Array.isArray(ai.usp) ? ai.usp.filter(isStr) : [];
    const aiSteps = (v) => (Array.isArray(v) ? v.filter((x) => x && isStr(x.text)).map((x) => ({ title: isStr(x.title) ? x.title.trim() : "", text: x.text.trim() })) : []);
    return {
      ...base,
      hero: str(ai.hero, base.hero),
      tagline: d.slogan || str(ai.tagline, base.tagline),
      cta: str(ai.cta, base.cta),
      aboutTitle: str(ai.aboutTitle, base.aboutTitle),
      about: aiAbout.length ? aiAbout.slice(0, 3) : base.about,
      usp: aiUsp.concat(base.usp).slice(0, 3),
      services: base.services.map((s, i) => {
        const own = (d.services || []).filter((x) => x.title)[i];
        return { ...s, text: (own && own.desc) || aiText(s.title) || s.text };
      }),
      faq: aiFaq.length ? aiFaq.slice(0, 6).map((x) => [x.q, x.a]) : base.faq,
      // Ablauf nur, wenn der Kunde selbst einen beschrieben hat – die KI formuliert ihn nur aus
      process: base.process.length && aiSteps(ai.process).length ? aiSteps(ai.process).slice(0, 6) : base.process,
      story: aiSteps(ai.story).length >= 2 ? aiSteps(ai.story).slice(0, 4) : base.story,
      seoTitle: str(ai.seoTitle, base.seoTitle),
      seoDesc: str(ai.seoDesc, base.seoDesc),
      keywords: Array.isArray(ai.keywords) && ai.keywords.some(isStr) ? ai.keywords.filter(isStr).join(", ") : base.keywords,
    };
  }

  // ---------- kleine SVG-Icons (statt Emojis) ----------
  const ICON = {
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    insta: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
  };

  const telHref = (p) => "tel:" + String(p).replace(/[^\d+]/g, "");
  const waHref = (p) => {
    let n = String(p).replace(/[^\d+]/g, "");
    if (n.startsWith("+")) n = n.slice(1);
    else if (n.startsWith("00")) n = n.slice(2);
    else if (n.startsWith("0")) n = "49" + n.slice(1);
    return "https://wa.me/" + n;
  };
  const instaHref = (h) => {
    const s = String(h).trim();
    if (/^https?:\/\//i.test(s)) return s;
    return "https://instagram.com/" + s.replace(/^@/, "").replace(/[^a-z0-9._]/gi, "");
  };
  const splitHours = (h) =>
    String(h || "")
      .split(/\n|;|,(?=\s*[A-ZÄÖÜ])/)
      .map((x) => x.trim())
      .filter(Boolean);

  // ---------- HTML-Ausgabe ----------
  function buildSite(d, ai) {
    d = d || {};
    const c = mergeCopy(generateCopy(d), ai, d);
    const base = resolveStyle(d.style, d.industry);
    const custom = /^#[0-9a-f]{6}$/i.test(d.accent || "") ? d.accent : "";
    const s = custom ? { ...base, primary: custom, accent: custom } : base;
    const btnText = onColor(s.primary);
    // Akzent wird für kleine Schrift genutzt (Labels, Icons) – muss auf Grund- und Wechselfarbe lesbar bleiben
    const accentText = readable(readable(s.accent, s.bg), s.soft);
    const dark = contrast(s.bg, "#ffffff") > contrast(s.bg, "#000000");
    const sec = { ...Object.fromEntries(Object.keys(SECTIONS).map((k) => [k, true])), ...(d.sections || {}) };

    const photos = (d.photos || []).filter(isImg);
    const logo = isImg(d.logo) ? d.logo : "";
    const layout = LAYOUTS[d.layout] ? d.layout : "split";
    // 3D nur, wenn eingeschaltet (assets/config.js) und mit ausführlicher Beschreibung – sonst fehlt der Stoff für die Story-Kapitel
    const use3d = threeDEnabled() && d.effect === "3d" && detailLength(d) >= DETAIL_MIN;
    const sceneKind = SCENES[d.scene] ? d.scene : DEFAULT_SCENE[d.industry] || "flow";
    const heroPhoto = use3d ? "" : photos[0] || "";
    // Im 3D-Modus ersetzt die Szene das Foto oben: erstes Foto zu „Über uns“, der Rest in die Galerie
    const aboutPhoto = photos[use3d ? 0 : 1] || "";
    const gallery = use3d ? photos.slice(aboutPhoto ? 1 : 0) : photos.slice(heroPhoto && aboutPhoto ? 2 : heroPhoto ? 1 : 0);
    const reviews = (d.reviews || []).filter((r) => r && r.text && r.text.trim());

    const phone = (d.phone || "").trim();
    const email = (d.email || "").trim();
    const whatsapp = (d.whatsapp || "").trim();
    const insta = (d.instagram || "").trim();
    const address = (d.address || "").trim();
    const hours = splitHours(d.hours);
    const fullAddress = [address, c.city].filter(Boolean).join(", ");
    const mapsHref = fullAddress ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.name + " " + fullAddress) : "";
    const action = ACTIONS[d.action] ? d.action : defaultAction(d.industry);
    const act = ACTIONS[action];
    const bookUrl = safeUrl(d.bookingUrl);
    const ext = bookUrl ? ' target="_blank" rel="noopener"' : "";
    const ctaHref = bookUrl || (sec.contact ? "#kontakt" : phone ? telHref(phone) : email ? "mailto:" + email : "#");
    // Eigene Wahl des Kunden schlägt den Branchen- bzw. KI-Text, die Standardaktion der Branche nicht
    const ctaText = act.cta && action !== defaultAction(d.industry) ? act.cta : c.cta;
    const pickHref = bookUrl || (sec.contact ? "#kontakt" : "");

    const showPrices = d.showPrices !== false && c.services.some((x) => x.price);
    const year = new Date().getFullYear();
    const sie = c.tone === "sie";

    const navItems = [
      use3d && ["geschichte", "Geschichte"],
      sec.about && ["ueber-uns", "Über uns"],
      sec.services && c.services.length && ["leistungen", showPrices ? "Leistungen & Preise" : "Leistungen"],
      sec.process && c.process.length && ["ablauf", "Ablauf"],
      sec.gallery && gallery.length && ["galerie", "Galerie"],
      sec.faq && ["faq", "FAQ"],
      sec.contact && ["kontakt", "Kontakt"],
    ].filter(Boolean);

    // Ab welcher Breite die Navigation ins Menü wandert: grob geschätzte Breite von Logo, Links und Button
    const navWidth = 44 + (logo ? 160 : c.name.length * 11) + navItems.reduce((n, [, l]) => n + l.length * 8.6 + 28, 0) + ctaText.length * 9 + 32 + 40;
    const navBreak = Math.max(860, Math.min(1400, Math.round(navWidth)));

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": c.ind.schema,
      name: c.name,
      description: c.seoDesc,
      ...(phone && { telephone: phone }),
      ...(email && { email }),
      ...(c.city && { address: { "@type": "PostalAddress", ...(address && { streetAddress: address }), addressLocality: c.city, addressCountry: "DE" } }),
      ...(hours.length && { openingHours: hours.join(", ") }),
      ...(insta && { sameAs: [instaHref(insta)] }),
      ...(bookUrl && act.schema && { potentialAction: { "@type": act.schema, target: bookUrl } }),
      ...(c.services.length && {
        makesOffer: c.services.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.title }, ...(showPrices && x.price && { description: x.price }) })),
      }),
    };
    const faqLd = sec.faq && {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    };
    const ld = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

    const brand = logo
      ? `<img src="${logo}" alt="${esc(c.name)}" class="logo-img">`
      : `<span>${esc(c.name)}</span>`;

    const heroLine = [c.ind.label.split(" /")[0], c.city].filter(Boolean).join(" · ");
    const heroText = `
<p class="kicker">${esc(heroLine)}</p>
<h1>${esc(c.hero)}</h1>
<p class="lead">${esc(c.tagline)}</p>
<div class="actions"><a class="btn" href="${esc(ctaHref)}"${ext}>${esc(ctaText)}</a>${phone ? `<a class="btn ghost" href="${telHref(phone)}">${ICON.phone} ${esc(phone)}</a>` : ""}</div>`;

    let hero;
    if (use3d) {
      hero = `<section class="hero hero3d"><div class="wrap"><div class="hero-copy">${heroText}</div></div><a class="scrollhint" href="#geschichte">Scrollen</a></section>`;
    } else if (layout === "photo" && heroPhoto) {
      hero = `<section class="hero hero-photo" style="background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.35)),url('${heroPhoto}')"><div class="wrap">${heroText}</div></section>`;
    } else if (layout === "center") {
      hero = `<section class="hero hero-center"><div class="wrap">${heroText}</div></section>`;
    } else {
      const media = heroPhoto
        ? `<img class="hero-img" src="${heroPhoto}" alt="${esc(c.name)}" fetchpriority="high">`
        : `<div class="hero-block"><span>${esc(c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3))}</span></div>`;
      hero = `<section class="hero hero-split${layout === "splitrev" ? " rev" : ""}"><div class="wrap split"><div>${heroText}</div>${media}</div></section>`;
    }

    const pad = (n) => String(n).padStart(2, "0");
    const story = use3d
      ? `<section class="story" id="geschichte" aria-label="Unsere Geschichte">${c.story
          .map((x, i) => `<div class="chapter ${i % 2 ? "left" : "right"}"><div class="wrap"><article class="glass"><span class="ch-n">${pad(i + 1)} / ${pad(c.story.length)}</span><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></article></div></div>`)
          .join("")}</section>`
      : "";

    const facts = [
      fullAddress && `<a href="${mapsHref}" target="_blank" rel="noopener">${ICON.pin}<span>${esc(fullAddress)}</span></a>`,
      hours[0] && `<span>${ICON.clock}<span>${esc(hours[0])}${hours.length > 1 ? " …" : ""}</span></span>`,
      phone && `<a href="${telHref(phone)}">${ICON.phone}<span>${esc(phone)}</span></a>`,
    ].filter(Boolean);

    const servicesHtml = c.services
      .map(
        (x, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(x.title)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : ""}</div>${showPrices || pickHref ? `<div class="buy">${showPrices ? `<span class="price">${esc(x.price)}</span>` : ""}${pickHref ? `<a class="btn ghost sm" href="${esc(pickHref)}"${ext} data-pick="${esc(x.title)}" aria-label="${esc(act.btn + ": " + x.title)}">${esc(act.btn)}</a>` : ""}</div>` : ""}</li>`
      )
      .join("");

    return `<!doctype html>
<html lang="de"${use3d ? ' class="x3d"' : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.seoTitle)}</title>
<meta name="description" content="${esc(c.seoDesc)}">
<meta name="keywords" content="${esc(c.keywords)}">
<meta property="og:title" content="${esc(c.seoTitle)}">
<meta property="og:description" content="${esc(c.seoDesc)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${s.bg}">
<meta name="color-scheme" content="${dark ? "dark" : "light"}">
${d.preview ? '<meta name="robots" content="noindex, nofollow">' : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${s.font}&display=swap" rel="stylesheet">
${use3d ? `<script src="${THREE_SRC}" integrity="${THREE_SRI}" crossorigin="anonymous" defer></script>` : ""}
<script type="application/ld+json">${ld(jsonLd)}</script>
${faqLd ? `<script type="application/ld+json">${ld(faqLd)}</script>` : ""}
<style>
:root{--p:${s.primary};--a:${accentText};--bg:${s.bg};--soft:${s.soft};--t:${s.text};--r:${s.radius};--btn:${btnText};--line:color-mix(in srgb,var(--t) 12%,transparent);--ease:cubic-bezier(.2,.7,.3,1);--mute:color-mix(in srgb,var(--t) 82%,var(--bg))}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:88px}
body{font-family:${s.body};color:var(--t);background:var(--bg);line-height:1.65;font-size:17px}
h1,h2,h3{font-family:${s.head};line-height:1.15;font-weight:700;text-wrap:balance}
p{text-wrap:pretty}
a{color:inherit}
img{display:block;max-width:100%}
:focus-visible{outline:2px solid var(--a);outline-offset:3px;border-radius:2px}
.skip{position:absolute;left:12px;top:-60px;z-index:50;background:var(--p);color:var(--btn);padding:10px 16px;border-radius:var(--r);text-decoration:none;font-weight:600}
.skip:focus{top:12px}
.wrap{max-width:1120px;margin:0 auto;padding:0 22px}
header{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line)}
nav{display:flex;align-items:center;justify-content:space-between;gap:20px;height:72px}
.logo{font-family:${s.head};font-weight:700;font-size:1.2rem;text-decoration:none;white-space:nowrap}
.logo-img{max-height:44px;width:auto}
.links{display:flex;gap:28px;list-style:none}
.links a{text-decoration:none;font-size:.95rem;white-space:nowrap;transition:color .2s var(--ease)}
.links a:hover{color:var(--a)}
.menu{display:none;width:44px;height:44px;align-items:center;justify-content:center;background:none;border:1px solid var(--line);border-radius:var(--r);color:var(--t);cursor:pointer}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;background:var(--p);color:var(--btn);padding:12px 24px;border-radius:var(--r);text-decoration:none;font-weight:600;border:1px solid var(--p);cursor:pointer;font:inherit;font-weight:600;white-space:nowrap;transition:filter .2s var(--ease),border-color .2s var(--ease),transform .15s var(--ease)}
.btn:hover{filter:brightness(1.08)}
.btn:active{transform:scale(.98)}
.btn.ghost{background:transparent;color:var(--t);border-color:var(--line)}
.btn.ghost:hover{border-color:var(--t)}
.navcta{padding:9px 16px;font-size:.92rem}
.hero{padding:96px 0 84px}
.kicker{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:600;color:var(--a);margin-bottom:18px}
.hero h1{font-size:clamp(2.2rem,5.2vw,3.9rem);margin-bottom:20px;max-width:16ch}
.hero .lead{font-size:1.15rem;max-width:52ch;color:var(--mute);margin-bottom:32px}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.split{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.rev .split{grid-template-columns:.9fr 1.1fr}
.rev .split>div:first-child{order:2}
.hero-img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--r)}
.hero-block{aspect-ratio:4/5;background:var(--soft);border-radius:var(--r);display:grid;place-items:center}
.hero-block span{font-family:${s.head};font-size:clamp(4rem,10vw,8rem);color:var(--a);opacity:.85}
.hero-center{text-align:center;border-bottom:1px solid var(--line)}
.hero-center h1,.hero-center .lead{margin-left:auto;margin-right:auto}
.hero-center .actions{justify-content:center}
.hero-photo{background-size:cover;background-position:center;color:#fff;padding:150px 0 130px}
.hero-photo .kicker,.hero-photo .lead{color:#fff}
.hero-photo .btn.ghost{color:#fff;border-color:rgba(255,255,255,.5)}
.facts{border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.facts .wrap{display:flex;flex-wrap:wrap;gap:12px 36px;padding-top:18px;padding-bottom:18px;font-size:.95rem}
.facts a,.facts span{display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.facts svg{color:var(--a);flex:none}
section.block{padding:88px 0}
section.alt{background:var(--soft)}
.label{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:600;color:var(--a);margin-bottom:12px}
h2{font-size:clamp(1.75rem,3.6vw,2.5rem);margin-bottom:20px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.about.single{grid-template-columns:1fr;max-width:760px}
.about p{margin-bottom:14px;color:var(--mute)}
.about img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--r)}
.usps{list-style:none;margin-top:24px;display:grid;gap:10px}
.usps li{padding-left:22px;position:relative}
.special{margin-top:28px;padding:20px 22px;background:var(--soft);border-left:3px solid var(--a);border-radius:var(--r)}
.special h3{font-size:1.05rem;margin-bottom:6px}
.special p{margin:0}
.steps{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-top:32px;counter-reset:s}
.steps li{padding:22px;border:1px solid var(--line);border-radius:var(--r);background:var(--bg)}
.step-n{display:block;font-family:${s.head};font-size:1.6rem;font-weight:700;color:var(--a);margin-bottom:8px}
.steps h3{font-size:1.1rem;margin-bottom:6px}
.steps p{color:var(--mute)}
.usps li::before{content:"";position:absolute;left:0;top:.62em;width:10px;height:2px;background:var(--a)}
.services{list-style:none;margin-top:36px;border-top:1px solid var(--line)}
.services li{display:grid;grid-template-columns:48px 1fr auto;gap:18px;padding:22px 0;border-bottom:1px solid var(--line);align-items:baseline}
.services .num{font-size:.85rem;color:var(--a);font-weight:600}
.services h3{font-size:1.15rem;margin-bottom:4px}
.services p{color:var(--mute);font-size:.98rem}
.services .price{font-weight:600;white-space:nowrap}
.services .buy{display:flex;align-items:center;gap:16px;align-self:center}
.btn.sm{padding:8px 16px;font-size:.92rem}
.note{color:var(--mute);font-size:.88rem;margin-top:16px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:32px}
.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r)}
.reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:32px}
.reviews blockquote{border-left:2px solid var(--a);padding:4px 0 4px 20px}
.reviews p{font-size:1.05rem;margin-bottom:10px}
.reviews cite{font-style:normal;color:var(--mute);font-size:.92rem}
.faq{max-width:780px;margin-top:28px}
details{border-bottom:1px solid var(--line);padding:18px 0}
summary{font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";color:var(--a);font-size:1.3rem;line-height:1}
details[open] summary::after{content:"−"}
details p{margin-top:10px;color:var(--mute)}
.contact{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.info{display:grid;gap:22px;align-content:start}
.info small{display:block;color:var(--mute);font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px}
.info a{text-decoration:none}
.info a:hover{color:var(--a)}
.hours{list-style:none}
.social{display:flex;gap:10px;flex-wrap:wrap}
form{display:grid;gap:12px}
input,textarea{width:100%;padding:13px 15px;border-radius:var(--r);border:1px solid color-mix(in srgb,var(--t) 22%,transparent);background:var(--bg);color:var(--t);font:inherit}
input:focus,textarea:focus{outline:2px solid var(--a);outline-offset:1px}
.field{display:grid;gap:6px;font-size:.9rem;font-weight:600}
.field span{color:var(--mute);font-weight:400}
.consent{font-size:.85rem;color:var(--mute);display:flex;gap:10px;align-items:flex-start}
.consent input{width:auto;margin-top:4px}
footer{padding:36px 0;border-top:1px solid var(--line);font-size:.9rem}
footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:var(--mute)}
footer a{margin-left:16px}
.callbar{display:none}
.links.open{display:flex}
.preview-bar{position:relative;z-index:11;background:#fef3c7;color:#78350f;font:500 14px/1.45 system-ui,sans-serif;padding:10px 22px;text-align:center}
.preview-bar a{color:#78350f;font-weight:700;margin-left:6px}
@media(max-width:${navBreak}px){
  .menu{display:inline-flex}
  .links{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;padding:8px 22px 16px;background:var(--bg);border-bottom:1px solid var(--line);box-shadow:0 12px 24px -16px rgba(0,0,0,.35)}
  .links.open{display:flex}
  .links a{display:flex;align-items:center;min-height:48px;font-size:1.05rem;border-bottom:1px solid var(--line)}
  .links li:last-child a{border-bottom:0}
}
@media(max-width:860px){
  .navcta{display:none}
  .facts a,.facts .wrap>span{min-height:44px}
  .split,.about,.contact{grid-template-columns:1fr}
  .split{gap:36px}
  .rev .split{grid-template-columns:1fr}
  .rev .split>div:first-child{order:0}
  .hero{padding:56px 0 56px}
  .hero-photo{padding:110px 0 90px}
  .hero-img,.hero-block{aspect-ratio:4/3}
  section.block{padding:64px 0}
  .services li{grid-template-columns:1fr auto}
  .services .num{display:none}
  .services .buy{flex-direction:column;align-items:flex-end;gap:8px}
  .callbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--bg);border-top:1px solid var(--line)}
  .callbar{padding-bottom:env(safe-area-inset-bottom)}
  .callbar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:0 14px;text-decoration:none;font-weight:600}
  .callbar a+a{border-left:1px solid var(--line)}
  body{padding-bottom:${phone || whatsapp || bookUrl ? "calc(56px + env(safe-area-inset-bottom))" : "0"}}
}
${use3d ? `.scene{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
main,footer{position:relative;z-index:1}
.x3d header{background:color-mix(in srgb,var(--bg) 78%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.x3d section.block,.x3d .facts,.x3d footer{background:var(--bg)}
.x3d section.alt{background:var(--soft)}
.hero3d{position:relative;min-height:calc(100svh - 72px);display:flex;align-items:center;padding:64px 0 96px}
.hero3d .wrap{width:100%}
.hero3d .hero-copy{max-width:600px}
.hero3d h1{font-size:clamp(2.6rem,6.4vw,5.2rem);max-width:13ch}
.scrollhint{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:var(--mute)}
.scrollhint::after{content:"";width:1px;height:40px;background:linear-gradient(var(--a),transparent);transform-origin:top;animation:hint 2.2s var(--ease) infinite}
@keyframes hint{0%{transform:scaleY(0)}50%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
.story{position:relative}
.chapter{min-height:100svh;display:flex;align-items:center;padding:12vh 0}
.chapter .wrap{width:100%;display:flex}
.chapter.right .wrap{justify-content:flex-end}
.glass{max-width:520px;padding:36px 34px;border-radius:calc(var(--r) + 8px);background:color-mix(in srgb,var(--bg) 82%,transparent);-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);border:1px solid color-mix(in srgb,var(--t) 14%,transparent);box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}
.ch-n{display:block;font-size:.8rem;letter-spacing:.16em;color:var(--a);font-weight:600;margin-bottom:14px}
.glass h2{font-size:clamp(1.8rem,3.6vw,2.6rem);margin-bottom:14px}
.glass p{color:var(--mute);font-size:1.08rem}
.x3d.anim .reveal{opacity:0;transform:perspective(1000px) translate3d(0,48px,0) rotateX(14deg);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.x3d.anim .reveal.in{opacity:1;transform:none}
.x3d.no3d .scene{display:none}
.x3d.no3d .hero3d{background:radial-gradient(60% 70% at 78% 45%,color-mix(in srgb,var(--p) 30%,transparent),transparent 70%),radial-gradient(50% 60% at 15% 85%,color-mix(in srgb,var(--a) 22%,transparent),transparent 70%)}
.x3d.no3d .story{background:radial-gradient(50% 40% at 20% 30%,color-mix(in srgb,var(--a) 14%,transparent),transparent 70%),radial-gradient(50% 40% at 80% 75%,color-mix(in srgb,var(--p) 16%,transparent),transparent 70%)}
@media(max-width:860px){
  .hero3d{align-items:flex-end;padding:38vh 0 72px}
  .hero3d .hero-copy{background:color-mix(in srgb,var(--bg) 72%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);padding:22px;border-radius:calc(var(--r) + 6px)}
  .chapter .wrap,.chapter.right .wrap{justify-content:center}
  .glass{padding:26px 22px}
}
` : ""}@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{transition:none!important;animation:none!important}
}
</style>
</head>
<body>
<a class="skip" href="#top">Zum Inhalt springen</a>
${use3d ? '<canvas class="scene" aria-hidden="true"></canvas>' : ""}
${d.preview ? `<div class="preview-bar">Unverbindlicher Entwurf, erstellt von ${esc(d.preview.by || "BuildA")} für ${esc(c.name)}. Dies ist nicht die offizielle Website des Unternehmens.${d.preview.contact ? ` <a href="${esc(d.preview.contact)}">Entwurf übernehmen</a>` : ""}</div>` : ""}
<header><nav class="wrap">
<a class="logo" href="#top">${brand}</a>
<ul class="links" id="menu">${navItems.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")}</ul>
<a class="btn navcta" href="${esc(ctaHref)}"${ext}>${esc(ctaText)}</a>
${navItems.length ? `<button class="menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen">${ICON.menu}</button>` : ""}
</nav></header>

<main id="top" tabindex="-1">
${hero}
${story}
${facts.length ? `<div class="facts"><div class="wrap">${facts.join("")}</div></div>` : ""}

${sec.about ? `<section id="ueber-uns" class="block"><div class="wrap about${aboutPhoto ? "" : " single"}">
<div><p class="label">Über uns</p><h2>${esc(c.aboutTitle)}</h2>${c.about.map((p) => `<p>${esc(p)}</p>`).join("")}
<ul class="usps">${c.usp.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>
${c.special ? `<div class="special"><h3>Was uns ausmacht</h3><p>${esc(c.special)}</p></div>` : ""}</div>
${aboutPhoto ? `<img src="${aboutPhoto}" alt="${esc(c.name)}" loading="lazy">` : ""}
</div></section>` : ""}

${sec.services && c.services.length ? `<section id="leistungen" class="block alt"><div class="wrap">
<p class="label">Leistungen</p><h2>${showPrices ? "Leistungen & Preise" : "Was wir anbieten"}</h2>
<ul class="services">${servicesHtml}</ul>
${showPrices ? `<p class="note">Alle Preise sind Endpreise.${sie ? " Gern erstellen wir Ihnen ein individuelles Angebot." : ""}</p>` : ""}
</div></section>` : ""}

${sec.process && c.process.length ? `<section id="ablauf" class="block"><div class="wrap">
<p class="label">Ablauf</p><h2>So läuft es ab</h2>
<ol class="steps">${c.process.map((x, i) => `<li class="reveal"><span class="step-n">${String(i + 1).padStart(2, "0")}</span>${x.title ? `<h3>${esc(x.title)}</h3>` : ""}<p>${esc(x.text)}</p></li>`).join("")}</ol>
</div></section>` : ""}

${sec.gallery && gallery.length ? `<section id="galerie" class="block"><div class="wrap">
<p class="label">Galerie</p><h2>Einblicke</h2>
<div class="gallery">${gallery.map((src, i) => `<img src="${src}" alt="${esc(c.name)} – Foto ${i + 1}" loading="lazy">`).join("")}</div>
</div></section>` : ""}

${sec.reviews && reviews.length ? `<section class="block${gallery.length && sec.gallery ? " alt" : ""}"><div class="wrap">
<p class="label">Kundenstimmen</p><h2>Das sagen unsere Kunden</h2>
<div class="reviews">${reviews.map((r) => `<blockquote><p>„${esc(r.text.trim())}“</p>${r.name ? `<cite>${esc(r.name)}</cite>` : ""}</blockquote>`).join("")}</div>
</div></section>` : ""}

${sec.faq ? `<section id="faq" class="block"><div class="wrap">
<p class="label">FAQ</p><h2>Häufige Fragen</h2>
<div class="faq">${c.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
</div></section>` : ""}

${sec.contact ? `<section id="kontakt" class="block alt"><div class="wrap contact">
<div class="info"><div><p class="label">Kontakt</p><h2>So ${sie ? "erreichen Sie" : "erreichst du"} uns</h2></div>
${phone ? `<div><small>Telefon</small><a href="${telHref(phone)}">${esc(phone)}</a></div>` : ""}
${email ? `<div><small>E-Mail</small><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ""}
${fullAddress ? `<div><small>Adresse</small><a href="${mapsHref}" target="_blank" rel="noopener">${esc(fullAddress)}</a></div>` : ""}
${hours.length ? `<div><small>Öffnungszeiten</small><ul class="hours">${hours.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
${whatsapp || insta ? `<div class="social">${whatsapp ? `<a class="btn ghost" href="${waHref(whatsapp)}" target="_blank" rel="noopener">${ICON.chat} WhatsApp</a>` : ""}${insta ? `<a class="btn ghost" href="${esc(instaHref(insta))}" target="_blank" rel="noopener">${ICON.insta} Instagram</a>` : ""}</div>` : ""}
</div>
<form aria-live="polite" onsubmit="event.preventDefault();this.innerHTML='<p><strong>Danke für ${sie ? "Ihre" : "deine"} Nachricht.</strong> Wir melden uns so schnell wie möglich.</p>'">
<label class="field">Name<input required name="name" autocomplete="name"></label>
<label class="field">E-Mail<input required type="email" name="email" autocomplete="email" inputmode="email"></label>
<label class="field"><span><b>Telefon</b> (optional)</span><input name="tel" type="tel" autocomplete="tel" inputmode="tel"></label>
<label class="field">${sie ? "Ihre" : "Deine"} Nachricht<textarea name="msg" id="msg" rows="5"></textarea></label>
<label class="consent"><input type="checkbox" required> <span>Ich bin einverstanden, dass meine Angaben zur Beantwortung der Anfrage gespeichert werden. Details in der <a href="#datenschutz">Datenschutzerklärung</a>.</span></label>
<button class="btn" type="submit">Nachricht senden</button>
</form>
</div></section>` : ""}
</main>

<footer><div class="wrap"><span>© ${year} ${esc(c.name)}</span><span><a href="#impressum">Impressum</a><a href="#datenschutz">Datenschutz</a></span></div></footer>
${navItems.length ? `<script>(function(){var b=document.querySelector(".menu"),m=document.getElementById("menu");function t(o){m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);b.setAttribute("aria-label",o?"Menü schließen":"Menü öffnen")}b.addEventListener("click",function(){t(!m.classList.contains("open"))});m.addEventListener("click",function(e){if(e.target.closest("a"))t(false)});document.addEventListener("keydown",function(e){if(e.key==="Escape"&&m.classList.contains("open")){t(false);b.focus()}})})()</script>` : ""}
${!bookUrl && sec.contact && pickHref && c.services.length && sec.services ? `<script>(function(){var m=document.getElementById("msg");if(!m)return;m.addEventListener("input",function(){delete m.dataset.auto});document.querySelectorAll("[data-pick]").forEach(function(a){a.addEventListener("click",function(){if(!m.value.trim()||m.dataset.auto){m.value=${JSON.stringify(tone(act.ask, c.tone)).replace(/</g, "\\u003c")}+a.dataset.pick;m.dataset.auto="1"}})})})()</script>` : ""}
${use3d ? `<script>document.addEventListener("DOMContentLoaded",function(){(${sceneRuntime.toString()})(${ld({ p: s.primary, a: accentText, dark, kind: sceneKind })})})</script>` : ""}
${phone || whatsapp || bookUrl ? `<div class="callbar">${bookUrl ? `<a href="${esc(bookUrl)}"${ext}>${ICON.cal} ${esc(act.btn)}</a>` : ""}${phone ? `<a href="${telHref(phone)}">${ICON.phone} Anrufen</a>` : ""}${whatsapp ? `<a href="${waHref(whatsapp)}" target="_blank" rel="noopener">${ICON.chat} WhatsApp</a>` : ""}</div>` : ""}
</body>
</html>`;
  }

  global.BuildA = { INDUSTRIES, STYLES, INDUSTRY_STYLES, LAYOUTS, SECTIONS, ACTIONS, SCENES, DETAIL_MIN, detailLength, threeDEnabled, defaultAction, safeUrl, resolveStyle, contrast, buildSite, generateCopy, mergeCopy, slug };
})(window);
