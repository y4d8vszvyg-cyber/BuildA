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
    dunkel: { label: "Dunkel", primary: "#e5c07b", accent: "#e5c07b", bg: "#121212", soft: "#1c1c1c", text: "#ededed", head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", font: "Space+Grotesk:wght@500;700&family=Inter:wght@400;600", radius: "4px" },
  };

  const LAYOUTS = {
    split: "Text links, Foto rechts",
    center: "Zentriert, nur Schrift",
    photo: "Großes Foto im Hintergrund",
  };

  const SECTIONS = {
    about: "Über uns",
    services: "Leistungen & Preise",
    gallery: "Fotogalerie",
    reviews: "Kundenstimmen",
    faq: "Häufige Fragen",
    contact: "Kontakt & Öffnungszeiten",
  };

  // Lesbare Textfarbe auf einer Hintergrundfarbe
  function onColor(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#ffffff";
    const n = parseInt(m[1], 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#111111" : "#ffffff";
  }

  // ---------- Vorlagentexte ----------
  function generateCopy(d) {
    const ind = INDUSTRIES[d.industry] || INDUSTRIES.sonstiges;
    const t = d.tone || ind.tone;
    const name = d.name || "Ihr Unternehmen";
    const city = d.city || "";
    const services = (d.services || []).filter((s) => s.title);

    const about = d.about
      ? [d.about]
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
    const base = STYLES[d.style] || STYLES.klar;
    const custom = /^#[0-9a-f]{6}$/i.test(d.accent || "") ? d.accent : "";
    const s = custom ? { ...base, primary: custom, accent: custom } : base;
    const btnText = onColor(s.primary);
    const sec = { ...Object.fromEntries(Object.keys(SECTIONS).map((k) => [k, true])), ...(d.sections || {}) };

    const photos = (d.photos || []).filter(isImg);
    const logo = isImg(d.logo) ? d.logo : "";
    const layout = LAYOUTS[d.layout] ? d.layout : "split";
    const heroPhoto = photos[0] || "";
    const aboutPhoto = photos[1] || "";
    const gallery = photos.slice(heroPhoto && aboutPhoto ? 2 : heroPhoto ? 1 : 0);
    const reviews = (d.reviews || []).filter((r) => r && r.text && r.text.trim());

    const phone = (d.phone || "").trim();
    const email = (d.email || "").trim();
    const whatsapp = (d.whatsapp || "").trim();
    const insta = (d.instagram || "").trim();
    const address = (d.address || "").trim();
    const hours = splitHours(d.hours);
    const fullAddress = [address, c.city].filter(Boolean).join(", ");
    const mapsHref = fullAddress ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.name + " " + fullAddress) : "";
    const ctaHref = sec.contact ? "#kontakt" : phone ? telHref(phone) : email ? "mailto:" + email : "#";

    const showPrices = d.showPrices !== false && c.services.some((x) => x.price);
    const year = new Date().getFullYear();
    const sie = c.tone === "sie";

    const navItems = [
      sec.about && ["ueber-uns", "Über uns"],
      sec.services && c.services.length && ["leistungen", showPrices ? "Leistungen & Preise" : "Leistungen"],
      sec.gallery && gallery.length && ["galerie", "Galerie"],
      sec.faq && ["faq", "FAQ"],
      sec.contact && ["kontakt", "Kontakt"],
    ].filter(Boolean);

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
<div class="actions"><a class="btn" href="${ctaHref}">${esc(c.cta)}</a>${phone ? `<a class="btn ghost" href="${telHref(phone)}">${ICON.phone} ${esc(phone)}</a>` : ""}</div>`;

    let hero;
    if (layout === "photo" && heroPhoto) {
      hero = `<section class="hero hero-photo" style="background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.35)),url('${heroPhoto}')"><div class="wrap">${heroText}</div></section>`;
    } else if (layout === "center") {
      hero = `<section class="hero hero-center"><div class="wrap">${heroText}</div></section>`;
    } else {
      const media = heroPhoto
        ? `<img class="hero-img" src="${heroPhoto}" alt="${esc(c.name)}">`
        : `<div class="hero-block"><span>${esc(c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3))}</span></div>`;
      hero = `<section class="hero hero-split"><div class="wrap split"><div>${heroText}</div>${media}</div></section>`;
    }

    const facts = [
      fullAddress && `<a href="${mapsHref}" target="_blank" rel="noopener">${ICON.pin}<span>${esc(fullAddress)}</span></a>`,
      hours[0] && `<span>${ICON.clock}<span>${esc(hours[0])}${hours.length > 1 ? " …" : ""}</span></span>`,
      phone && `<a href="${telHref(phone)}">${ICON.phone}<span>${esc(phone)}</span></a>`,
    ].filter(Boolean);

    const servicesHtml = c.services
      .map(
        (x, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(x.title)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : ""}</div>${showPrices ? `<span class="price">${esc(x.price)}</span>` : ""}</li>`
      )
      .join("");

    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.seoTitle)}</title>
<meta name="description" content="${esc(c.seoDesc)}">
<meta name="keywords" content="${esc(c.keywords)}">
<meta property="og:title" content="${esc(c.seoTitle)}">
<meta property="og:description" content="${esc(c.seoDesc)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${s.bg}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${s.font}&display=swap" rel="stylesheet">
<script type="application/ld+json">${ld(jsonLd)}</script>
${faqLd ? `<script type="application/ld+json">${ld(faqLd)}</script>` : ""}
<style>
:root{--p:${s.primary};--a:${s.accent};--bg:${s.bg};--soft:${s.soft};--t:${s.text};--r:${s.radius};--btn:${btnText};--line:color-mix(in srgb,var(--t) 12%,transparent)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:${s.body};color:var(--t);background:var(--bg);line-height:1.65;font-size:17px}
h1,h2,h3{font-family:${s.head};line-height:1.15;font-weight:700}
a{color:inherit}
img{display:block;max-width:100%}
.wrap{max-width:1120px;margin:0 auto;padding:0 22px}
header{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line)}
nav{display:flex;align-items:center;justify-content:space-between;gap:20px;height:72px}
.logo{font-family:${s.head};font-weight:700;font-size:1.2rem;text-decoration:none;white-space:nowrap}
.logo-img{max-height:44px;width:auto}
.links{display:flex;gap:28px;list-style:none}
.links a{text-decoration:none;font-size:.95rem;white-space:nowrap}
.links a:hover{color:var(--a)}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--p);color:var(--btn);padding:13px 24px;border-radius:var(--r);text-decoration:none;font-weight:600;border:1px solid var(--p);cursor:pointer;font:inherit;font-weight:600;white-space:nowrap}
.btn:hover{filter:brightness(1.08)}
.btn.ghost{background:transparent;color:var(--t);border-color:var(--line)}
.btn.ghost:hover{border-color:var(--t)}
.navcta{padding:9px 16px;font-size:.92rem}
.hero{padding:96px 0 84px}
.kicker{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:600;color:var(--a);margin-bottom:18px}
.hero h1{font-size:clamp(2.2rem,5.2vw,3.9rem);margin-bottom:20px;max-width:16ch}
.hero .lead{font-size:1.15rem;max-width:52ch;opacity:.8;margin-bottom:32px}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.split{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.hero-img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--r)}
.hero-block{aspect-ratio:4/5;background:var(--soft);border-radius:var(--r);display:grid;place-items:center}
.hero-block span{font-family:${s.head};font-size:clamp(4rem,10vw,8rem);color:var(--a);opacity:.85}
.hero-center{text-align:center;border-bottom:1px solid var(--line)}
.hero-center h1,.hero-center .lead{margin-left:auto;margin-right:auto}
.hero-center .actions{justify-content:center}
.hero-photo{background-size:cover;background-position:center;color:#fff;padding:150px 0 130px}
.hero-photo .kicker{color:#fff;opacity:.85}
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
.about p{margin-bottom:14px;opacity:.88}
.about img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--r)}
.usps{list-style:none;margin-top:24px;display:grid;gap:10px}
.usps li{padding-left:22px;position:relative}
.usps li::before{content:"";position:absolute;left:0;top:.62em;width:10px;height:2px;background:var(--a)}
.services{list-style:none;margin-top:36px;border-top:1px solid var(--line)}
.services li{display:grid;grid-template-columns:48px 1fr auto;gap:18px;padding:22px 0;border-bottom:1px solid var(--line);align-items:baseline}
.services .num{font-size:.85rem;color:var(--a);font-weight:600}
.services h3{font-size:1.15rem;margin-bottom:4px}
.services p{opacity:.75;font-size:.98rem}
.services .price{font-weight:600;white-space:nowrap}
.note{opacity:.6;font-size:.88rem;margin-top:16px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:32px}
.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r)}
.reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:32px}
.reviews blockquote{border-left:2px solid var(--a);padding:4px 0 4px 20px}
.reviews p{font-size:1.05rem;margin-bottom:10px}
.reviews cite{font-style:normal;opacity:.65;font-size:.92rem}
.faq{max-width:780px;margin-top:28px}
details{border-bottom:1px solid var(--line);padding:18px 0}
summary{font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";color:var(--a);font-size:1.3rem;line-height:1}
details[open] summary::after{content:"−"}
details p{margin-top:10px;opacity:.8}
.contact{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.info{display:grid;gap:22px;align-content:start}
.info small{display:block;opacity:.6;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px}
.info a{text-decoration:none}
.info a:hover{color:var(--a)}
.hours{list-style:none}
.social{display:flex;gap:10px;flex-wrap:wrap}
form{display:grid;gap:12px}
input,textarea{width:100%;padding:13px 15px;border-radius:var(--r);border:1px solid color-mix(in srgb,var(--t) 22%,transparent);background:var(--bg);color:var(--t);font:inherit}
input:focus,textarea:focus{outline:2px solid var(--a);outline-offset:1px}
.consent{font-size:.85rem;opacity:.75;display:flex;gap:10px;align-items:flex-start}
.consent input{width:auto;margin-top:4px}
footer{padding:36px 0;border-top:1px solid var(--line);font-size:.9rem}
footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;opacity:.75}
footer a{margin-left:16px}
.callbar{display:none}
@media(max-width:860px){
  .links,.navcta{display:none}
  .split,.about,.contact{grid-template-columns:1fr}
  .split{gap:36px}
  .hero{padding:56px 0 56px}
  .hero-photo{padding:110px 0 90px}
  .hero-img,.hero-block{aspect-ratio:4/3}
  section.block{padding:64px 0}
  .services li{grid-template-columns:1fr auto}
  .services .num{display:none}
  .callbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--bg);border-top:1px solid var(--line)}
  .callbar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;text-decoration:none;font-weight:600}
  .callbar a+a{border-left:1px solid var(--line)}
  body{padding-bottom:${phone || whatsapp ? "56px" : "0"}}
}
</style>
</head>
<body>
<header><nav class="wrap">
<a class="logo" href="#top">${brand}</a>
<ul class="links">${navItems.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")}</ul>
<a class="btn navcta" href="${ctaHref}">${esc(c.cta)}</a>
</nav></header>

<main id="top">
${hero}
${facts.length ? `<div class="facts"><div class="wrap">${facts.join("")}</div></div>` : ""}

${sec.about ? `<section id="ueber-uns" class="block"><div class="wrap about${aboutPhoto ? "" : " single"}">
<div><p class="label">Über uns</p><h2>${esc(c.aboutTitle)}</h2>${c.about.map((p) => `<p>${esc(p)}</p>`).join("")}
<ul class="usps">${c.usp.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></div>
${aboutPhoto ? `<img src="${aboutPhoto}" alt="${esc(c.name)}" loading="lazy">` : ""}
</div></section>` : ""}

${sec.services && c.services.length ? `<section id="leistungen" class="block alt"><div class="wrap">
<p class="label">Leistungen</p><h2>${showPrices ? "Leistungen & Preise" : "Was wir anbieten"}</h2>
<ul class="services">${servicesHtml}</ul>
${showPrices ? `<p class="note">Alle Preise sind Endpreise.${sie ? " Gern erstellen wir Ihnen ein individuelles Angebot." : ""}</p>` : ""}
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
<form onsubmit="event.preventDefault();this.innerHTML='<p><strong>Danke für ${sie ? "Ihre" : "deine"} Nachricht.</strong> Wir melden uns so schnell wie möglich.</p>'">
<input required name="name" placeholder="Name" aria-label="Name">
<input required type="email" name="email" placeholder="E-Mail" aria-label="E-Mail">
<input name="tel" placeholder="Telefon (optional)" aria-label="Telefon">
<textarea name="msg" rows="5" placeholder="${sie ? "Ihre" : "Deine"} Nachricht" aria-label="Nachricht"></textarea>
<label class="consent"><input type="checkbox" required> <span>Ich bin einverstanden, dass meine Angaben zur Beantwortung der Anfrage gespeichert werden. Details in der <a href="#datenschutz">Datenschutzerklärung</a>.</span></label>
<button class="btn" type="submit">Nachricht senden</button>
</form>
</div></section>` : ""}
</main>

<footer><div class="wrap"><span>© ${year} ${esc(c.name)}</span><span><a href="#impressum">Impressum</a><a href="#datenschutz">Datenschutz</a></span></div></footer>
${phone || whatsapp ? `<div class="callbar">${phone ? `<a href="${telHref(phone)}">${ICON.phone} Anrufen</a>` : ""}${whatsapp ? `<a href="${waHref(whatsapp)}" target="_blank" rel="noopener">${ICON.chat} WhatsApp</a>` : ""}</div>` : ""}
</body>
</html>`;
  }

  global.BuildA = { INDUSTRIES, STYLES, LAYOUTS, SECTIONS, buildSite, generateCopy, mergeCopy, slug };
})(window);
