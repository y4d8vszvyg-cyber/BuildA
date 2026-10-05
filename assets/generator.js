/* BuildA – Website-Generator
 * Erzeugt aus den Wizard-Antworten eine komplette, responsive One-Page-Website
 * (Startseite, Über uns, Leistungen, Preise, FAQ, Kontakt, SEO, CTA).
 * Läuft komplett im Browser. Später kann `generateCopy` durch einen KI-Aufruf
 * (z. B. Claude API über eine Serverless-Funktion) ersetzt werden.
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

  const list = (s) =>
    String(s || "")
      .split(/[,;\n]+/)
      .map((x) => x.trim())
      .filter(Boolean);

  const slug = (s) =>
    String(s || "website")
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "website";

  // ---------- Branchen ----------
  const INDUSTRIES = {
    friseur: {
      label: "Friseur / Beauty",
      emoji: "💇",
      schema: "HairSalon",
      noun: "Salon",
      hero: "Dein neuer Lieblingslook wartet",
      promise: "Schnitte, Farben und Stylings, die zu dir passen – und lange halten.",
      cta: "Termin buchen",
      priceBase: [35, 75, 45, 25, 60, 30],
      usp: ["Persönliche Beratung vor jedem Termin", "Hochwertige, schonende Produkte", "Termine auch am Abend & Samstag"],
      faq: [
        ["Muss ich vorher einen Termin vereinbaren?", "Wir empfehlen eine Buchung, damit wir uns ausreichend Zeit für dich nehmen können. Spontane Besuche sind je nach Auslastung möglich."],
        ["Wie lange dauert eine Farbbehandlung?", "Je nach Länge und Technik zwischen 1,5 und 3 Stunden – inklusive Beratung."],
        ["Welche Produkte verwendet ihr?", "Ausschließlich professionelle, haarschonende Marken. Gern empfehlen wir dir passende Pflege für zuhause."],
      ],
    },
    restaurant: {
      label: "Restaurant / Café",
      emoji: "🍝",
      schema: "Restaurant",
      noun: "Restaurant",
      hero: "Genuss, der in Erinnerung bleibt",
      promise: "Frische Zutaten, ehrliche Küche und eine Atmosphäre zum Wohlfühlen.",
      cta: "Tisch reservieren",
      priceBase: [12, 18, 9, 7, 24, 6],
      usp: ["Frische, regionale Zutaten", "Hausgemacht mit Liebe", "Ideal für Gruppen & Feiern"],
      faq: [
        ["Kann ich einen Tisch reservieren?", "Ja, telefonisch oder über das Kontaktformular. Für Gruppen ab 8 Personen bitten wir um Voranmeldung."],
        ["Gibt es vegetarische oder vegane Gerichte?", "Selbstverständlich – unsere Karte bietet täglich mehrere vegetarische und vegane Optionen."],
        ["Bietet ihr auch Catering an?", "Ja, sprich uns gern auf dein Event an – wir erstellen dir ein individuelles Angebot."],
      ],
    },
    handwerk: {
      label: "Handwerk",
      emoji: "🔧",
      schema: "HomeAndConstructionBusiness",
      noun: "Betrieb",
      hero: "Handwerk, auf das du dich verlassen kannst",
      promise: "Saubere Arbeit, faire Preise und Termine, die eingehalten werden.",
      cta: "Kostenloses Angebot anfordern",
      priceBase: [65, 120, 89, 49, 150, 55],
      usp: ["Meisterbetrieb mit Erfahrung", "Festpreis-Angebote ohne Überraschungen", "Schnelle Termine in der Region"],
      faq: [
        ["Ist das Angebot kostenlos?", "Ja, die Besichtigung vor Ort und das Angebot sind für dich unverbindlich und kostenfrei."],
        ["Wie schnell könnt ihr kommen?", "In der Regel innerhalb weniger Tage, bei Notfällen oft noch am selben Tag."],
        ["Gebt ihr Garantie auf eure Arbeit?", "Ja, auf alle Arbeiten gibt es die gesetzliche Gewährleistung – auf viele Leistungen zusätzlich eine eigene Garantie."],
      ],
    },
    fitness: {
      label: "Fitness / Coaching",
      emoji: "💪",
      schema: "HealthClub",
      noun: "Studio",
      hero: "Werde die stärkste Version von dir",
      promise: "Individuelles Training, echte Motivation und Ergebnisse, die du sehen kannst.",
      cta: "Probetraining sichern",
      priceBase: [39, 69, 55, 15, 99, 29],
      usp: ["Individuelle Trainingspläne", "Erfahrene, zertifizierte Trainer", "Kostenloses Probetraining"],
      faq: [
        ["Brauche ich Vorerfahrung?", "Nein. Wir holen dich genau dort ab, wo du gerade stehst – egal ob Einsteiger oder Profi."],
        ["Gibt es eine Mindestlaufzeit?", "Wir bieten flexible Mitgliedschaften – auch monatlich kündbar."],
        ["Wie läuft das Probetraining ab?", "Du lernst uns, das Studio und einen Trainer kennen. Gemeinsam besprechen wir deine Ziele."],
      ],
    },
    fotograf: {
      label: "Fotografie / Kreativ",
      emoji: "📸",
      schema: "ProfessionalService",
      noun: "Studio",
      hero: "Momente, die für immer bleiben",
      promise: "Natürliche, emotionale Bilder – mit Gefühl für Licht und Persönlichkeit.",
      cta: "Shooting anfragen",
      priceBase: [149, 990, 249, 89, 390, 120],
      usp: ["Entspannte Shootings ohne Stress", "Professionelle Bildbearbeitung", "Online-Galerie zum Teilen"],
      faq: [
        ["Wann bekomme ich meine Bilder?", "In der Regel innerhalb von 7–14 Tagen in einer privaten Online-Galerie."],
        ["Kann ich vorher Kleidung abstimmen?", "Unbedingt! Du erhältst vorab einen kleinen Styling-Guide von uns."],
        ["Fotografierst du auch vor Ort?", "Ja – im Studio, outdoor oder direkt bei dir. Ganz wie du möchtest."],
      ],
    },
    praxis: {
      label: "Praxis / Gesundheit",
      emoji: "🩺",
      schema: "MedicalBusiness",
      noun: "Praxis",
      hero: "Ihre Gesundheit in besten Händen",
      promise: "Kompetente Behandlung, persönliche Betreuung und kurze Wartezeiten.",
      cta: "Termin vereinbaren",
      priceBase: [60, 90, 75, 40, 120, 50],
      usp: ["Erfahrenes, einfühlsames Team", "Moderne Ausstattung", "Kurzfristige Termine möglich"],
      faq: [
        ["Nehmt ihr neue Patient:innen auf?", "Ja, wir freuen uns über neue Patient:innen. Vereinbaren Sie einfach einen Ersttermin."],
        ["Werden die Kosten übernommen?", "Viele Leistungen werden von der Krankenkasse übernommen. Zu Selbstzahlerleistungen beraten wir Sie transparent."],
        ["Gibt es Parkmöglichkeiten?", "Ja, in unmittelbarer Nähe der Praxis stehen Parkplätze zur Verfügung."],
      ],
    },
    beratung: {
      label: "Beratung / Dienstleistung",
      emoji: "💼",
      schema: "ProfessionalService",
      noun: "Kanzlei",
      hero: "Klarheit für deine nächsten Schritte",
      promise: "Fundierte Beratung, klare Empfehlungen und messbare Ergebnisse.",
      cta: "Erstgespräch vereinbaren",
      priceBase: [120, 490, 290, 0, 890, 150],
      usp: ["Kostenloses Erstgespräch", "Transparente Festpreise", "Persönlicher Ansprechpartner"],
      faq: [
        ["Was kostet das Erstgespräch?", "Das Erstgespräch ist kostenlos und unverbindlich – wir lernen uns und dein Anliegen kennen."],
        ["Arbeitet ihr auch remote?", "Ja, Termine sind persönlich vor Ort oder per Video möglich."],
        ["Für wen ist eure Beratung geeignet?", "Für Selbstständige, kleine und mittlere Unternehmen, die effizient wachsen möchten."],
      ],
    },
    sonstiges: {
      label: "Etwas anderes",
      emoji: "✨",
      schema: "LocalBusiness",
      noun: "Unternehmen",
      hero: "Willkommen bei uns",
      promise: "Qualität, Leidenschaft und Service, der begeistert.",
      cta: "Jetzt Kontakt aufnehmen",
      priceBase: [29, 59, 49, 19, 99, 39],
      usp: ["Persönlicher Service", "Faire Preise", "Begeisterte Kund:innen"],
      faq: [
        ["Wie kann ich euch erreichen?", "Ganz einfach per Telefon, E-Mail oder über das Kontaktformular auf dieser Seite."],
        ["Wo finde ich euch?", "Alle Infos zu Adresse und Öffnungszeiten findest du im Kontaktbereich."],
        ["Bietet ihr Beratung an?", "Ja, wir beraten dich gern persönlich und unverbindlich."],
      ],
    },
  };

  // ---------- Stile ----------
  const STYLES = {
    modern: { label: "Modern", primary: "#4f46e5", accent: "#06b6d4", bg: "#ffffff", soft: "#f4f5ff", text: "#111827", head: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", font: "Inter:wght@400;600;800", radius: "16px" },
    elegant: { label: "Elegant", primary: "#1f1b16", accent: "#b08d57", bg: "#fffdf9", soft: "#f6f0e6", text: "#1f1b16", head: "'Playfair Display', Georgia, serif", body: "'Lato', system-ui, sans-serif", font: "Playfair+Display:wght@600;800&family=Lato:wght@400;700", radius: "4px" },
    verspielt: { label: "Verspielt", primary: "#ec4899", accent: "#f59e0b", bg: "#fffafc", soft: "#fff0f7", text: "#3b0a28", head: "'Fredoka', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", font: "Fredoka:wght@500;700&family=Nunito:wght@400;700", radius: "28px" },
    minimal: { label: "Minimal", primary: "#111111", accent: "#111111", bg: "#ffffff", soft: "#f5f5f5", text: "#111111", head: "'DM Sans', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif", font: "DM+Sans:wght@400;500;700", radius: "0px" },
    natur: { label: "Natürlich", primary: "#2f6b4f", accent: "#d9a441", bg: "#fbfaf6", soft: "#eef3ec", text: "#1d2b22", head: "'Fraunces', Georgia, serif", body: "'Work Sans', system-ui, sans-serif", font: "Fraunces:wght@600;800&family=Work+Sans:wght@400;600", radius: "12px" },
    bold: { label: "Bold / Dunkel", primary: "#facc15", accent: "#f97316", bg: "#0b0b0f", soft: "#17171f", text: "#f5f5f5", head: "'Space Grotesk', system-ui, sans-serif", body: "'Space Grotesk', system-ui, sans-serif", font: "Space+Grotesk:wght@400;600;700", radius: "10px" },
  };

  const SERVICE_ICONS = ["✦", "◆", "●", "▲", "★", "❖", "✚", "◉"];

  // ---------- Texte (Template-"KI") ----------
  function generateCopy(d) {
    const ind = INDUSTRIES[d.industry] || INDUSTRIES.sonstiges;
    const services = list(d.services);
    if (!services.length) services.push("Beratung", "Service", "Betreuung");
    const name = d.name || "Dein Unternehmen";
    const city = d.city || "deiner Stadt";
    const audience = d.audience || "alle, die Wert auf Qualität legen";

    const serviceItems = services.slice(0, 8).map((s, i) => ({
      title: s,
      text: `${s} bei ${name}: individuell abgestimmt, professionell umgesetzt und mit viel Liebe zum Detail – genau so, wie du es dir wünschst.`,
      icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
    }));

    const priceItems = services.slice(0, 6).map((s, i) => {
      const p = ind.priceBase[i % ind.priceBase.length];
      return { title: s, price: p === 0 ? "kostenlos" : `ab ${p} €` };
    });

    const about = [
      `${name} ist dein ${ind.noun} in ${city}. Wir stehen für ${ind.usp[0].toLowerCase()}, ehrliche Beratung und Ergebnisse, die überzeugen.`,
      `Unsere Kund:innen – vor allem ${audience} – schätzen, dass wir uns Zeit nehmen, zuhören und mit Leidenschaft bei der Sache sind. Bei uns bist du keine Nummer, sondern Gast.`,
    ];

    const seoTitle = `${name} – ${services.slice(0, 2).join(" & ")} in ${city}`;
    const seoDesc = `${name} in ${city}: ${services.slice(0, 3).join(", ")}. ${ind.usp[0]}. ${ind.cta} – schnell & unkompliziert.`;
    const keywords = [...services.map((s) => `${s} ${city}`), `${ind.label.split(" /")[0]} ${city}`, name].join(", ");

    const faq = [
      ...ind.faq,
      [`Wo finde ich ${name}?`, `Du findest uns in ${city}. Alle Kontaktdaten und die Anfahrt stehen unten im Kontaktbereich.`],
    ];

    return {
      ind,
      name,
      city,
      tagline: d.tagline || ind.promise,
      hero: ind.hero,
      cta: ind.cta,
      about,
      usp: ind.usp,
      services: serviceItems,
      prices: priceItems,
      faq,
      seoTitle,
      seoDesc,
      keywords,
    };
  }

  // ---------- HTML-Ausgabe ----------
  function buildSite(d) {
    const c = generateCopy(d);
    const s = STYLES[d.style] || STYLES.modern;
    const dark = d.style === "bold";
    const btnText = dark ? "#0b0b0f" : "#ffffff";
    const phone = d.phone || "+49 89 123 456 78";
    const email = d.email || `hallo@${slug(c.name)}.de`;
    const address = d.address || c.city;
    const hours = d.hours || "Mo–Fr 9–19 Uhr · Sa 9–15 Uhr";
    const year = new Date().getFullYear();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": c.ind.schema,
      name: c.name,
      description: c.seoDesc,
      telephone: phone,
      email,
      address: { "@type": "PostalAddress", streetAddress: address, addressLocality: c.city, addressCountry: "DE" },
      openingHours: hours,
      makesOffer: c.services.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.title } })),
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    };
    const ld = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

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
<meta name="theme-color" content="${s.primary}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${s.font}&display=swap" rel="stylesheet">
<script type="application/ld+json">${ld(jsonLd)}</script>
<script type="application/ld+json">${ld(faqLd)}</script>
<style>
:root{--p:${s.primary};--a:${s.accent};--bg:${s.bg};--soft:${s.soft};--t:${s.text};--r:${s.radius};--btn:${btnText}}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:${s.body};color:var(--t);background:var(--bg);line-height:1.65}
h1,h2,h3{font-family:${s.head};line-height:1.15}
a{color:inherit}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid color-mix(in srgb,var(--t) 8%,transparent)}
nav{display:flex;align-items:center;justify-content:space-between;height:68px}
.logo{font-family:${s.head};font-weight:800;font-size:1.25rem;text-decoration:none}
.logo span{color:var(--a)}
.links{display:flex;gap:26px;list-style:none}
.links a{text-decoration:none;font-weight:500;opacity:.8}
.links a:hover{opacity:1;color:var(--a)}
.btn{display:inline-block;background:var(--p);color:var(--btn);padding:14px 26px;border-radius:var(--r);text-decoration:none;font-weight:700;border:2px solid var(--p);transition:transform .15s,box-shadow .15s;cursor:pointer;font-size:1rem}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px -10px var(--p)}
.btn.ghost{background:transparent;color:var(--t);border-color:color-mix(in srgb,var(--t) 25%,transparent)}
.hero{padding:110px 0 90px;background:radial-gradient(circle at 85% 10%,color-mix(in srgb,var(--a) 22%,transparent),transparent 45%),radial-gradient(circle at 10% 90%,color-mix(in srgb,var(--p) 14%,transparent),transparent 40%)}
.badge{display:inline-block;background:var(--soft);color:var(--a);font-weight:700;padding:6px 14px;border-radius:999px;font-size:.85rem;margin-bottom:18px}
.hero h1{font-size:clamp(2.3rem,6vw,4.2rem);max-width:820px;margin-bottom:18px}
.hero p{font-size:1.2rem;max-width:620px;opacity:.8;margin-bottom:32px}
.hero .actions{display:flex;gap:14px;flex-wrap:wrap}
.trust{display:flex;gap:28px;flex-wrap:wrap;margin-top:48px;opacity:.75;font-size:.95rem}
section{padding:90px 0}
section.alt{background:var(--soft)}
.eyebrow{color:var(--a);font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-size:.8rem;margin-bottom:10px}
h2{font-size:clamp(1.8rem,4vw,2.7rem);margin-bottom:18px}
.lead{max-width:640px;opacity:.8;font-size:1.08rem}
.grid{display:grid;gap:22px;margin-top:44px}
.g3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.card{background:var(--bg);border:1px solid color-mix(in srgb,var(--t) 9%,transparent);border-radius:var(--r);padding:30px;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -24px color-mix(in srgb,var(--t) 40%,transparent)}
.icon{width:48px;height:48px;border-radius:var(--r);background:var(--soft);color:var(--a);display:grid;place-items:center;font-size:1.3rem;margin-bottom:16px}
.card h3{font-size:1.25rem;margin-bottom:8px}
.card p{opacity:.75}
.about{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.about p{margin-bottom:14px;opacity:.85}
.usps{list-style:none;display:grid;gap:14px}
.usps li{background:var(--bg);padding:18px 20px;border-radius:var(--r);border-left:4px solid var(--a);font-weight:600}
.prices{max-width:720px;margin:44px auto 0;background:var(--bg);border-radius:var(--r);border:1px solid color-mix(in srgb,var(--t) 9%,transparent);overflow:hidden}
.prow{display:flex;justify-content:space-between;gap:16px;padding:20px 26px;border-bottom:1px dashed color-mix(in srgb,var(--t) 14%,transparent)}
.prow:last-child{border-bottom:0}
.prow b{color:var(--a);white-space:nowrap}
.note{text-align:center;opacity:.6;font-size:.9rem;margin-top:16px}
details{background:var(--bg);border-radius:var(--r);padding:20px 24px;border:1px solid color-mix(in srgb,var(--t) 9%,transparent);margin-bottom:12px}
summary{font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between}
summary::after{content:"+";color:var(--a);font-size:1.4rem;line-height:1}
details[open] summary::after{content:"–"}
details p{margin-top:12px;opacity:.8}
.faq{max-width:760px;margin:44px auto 0}
.contact{display:grid;grid-template-columns:1fr 1fr;gap:44px}
.info div{margin-bottom:20px}
.info small{display:block;opacity:.6;text-transform:uppercase;letter-spacing:.1em;font-size:.75rem}
form{display:grid;gap:14px}
input,textarea{width:100%;padding:14px 16px;border-radius:var(--r);border:1px solid color-mix(in srgb,var(--t) 18%,transparent);background:var(--bg);color:var(--t);font:inherit}
input:focus,textarea:focus{outline:2px solid var(--a);border-color:transparent}
.cta{background:var(--p);color:var(--btn);text-align:center;border-radius:calc(var(--r) * 1.5);padding:70px 30px;margin:0 20px}
.cta h2{color:var(--btn)}
.cta .btn{background:var(--btn);color:var(--p);border-color:var(--btn);margin-top:22px}
footer{padding:40px 0;text-align:center;opacity:.6;font-size:.9rem}
footer a{margin:0 8px}
.fab{position:fixed;right:18px;bottom:18px;background:var(--a);color:#fff;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-size:1.5rem;text-decoration:none;box-shadow:0 10px 30px -8px var(--a);z-index:20}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s,transform .7s}
.reveal.in{opacity:1;transform:none}
@media(max-width:800px){.links{display:none}.navcta{display:none}.about,.contact{grid-template-columns:1fr}.hero{padding:70px 0 60px}section{padding:64px 0}}
</style>
</head>
<body>
<header><nav class="wrap">
<a class="logo" href="#top">${esc(c.name)}<span>.</span></a>
<ul class="links"><li><a href="#ueber-uns">Über uns</a></li><li><a href="#leistungen">Leistungen</a></li><li><a href="#preise">Preise</a></li><li><a href="#faq">FAQ</a></li><li><a href="#kontakt">Kontakt</a></li></ul>
<a class="btn navcta" href="#kontakt" style="padding:10px 18px">${esc(c.cta)}</a>
</nav></header>

<main id="top">
<section class="hero"><div class="wrap">
<span class="badge">${c.ind.emoji} ${esc(c.ind.label.split(" /")[0])} in ${esc(c.city)}</span>
<h1>${esc(c.hero)} – bei ${esc(c.name)}</h1>
<p>${esc(c.tagline)}</p>
<div class="actions"><a class="btn" href="#kontakt">${esc(c.cta)}</a><a class="btn ghost" href="#leistungen">Leistungen ansehen</a></div>
<div class="trust"><span>📍 ${esc(c.city)}</span><span>✓ ${esc(c.usp[1])}</span><span>✓ ${esc(c.usp[2])}</span></div>
</div></section>

<section id="ueber-uns" class="alt reveal"><div class="wrap about">
<div><p class="eyebrow">Über uns</p><h2>Mehr als nur ein ${esc(c.ind.noun)}</h2>${c.about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
<ul class="usps">${c.usp.map((u) => `<li>✓ ${esc(u)}</li>`).join("")}</ul>
</div></section>

<section id="leistungen" class="reveal"><div class="wrap">
<p class="eyebrow">Leistungen</p><h2>Was wir für dich tun</h2>
<p class="lead">Jede Leistung wird individuell auf dich abgestimmt – für ein Ergebnis, das begeistert.</p>
<div class="grid g3">${c.services.map((x) => `<div class="card"><div class="icon">${x.icon}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join("")}</div>
</div></section>

<section id="preise" class="alt reveal"><div class="wrap">
<p class="eyebrow" style="text-align:center">Preise</p><h2 style="text-align:center">Transparent &amp; fair</h2>
<div class="prices">${c.prices.map((p) => `<div class="prow"><span>${esc(p.title)}</span><b>${esc(p.price)}</b></div>`).join("")}</div>
<p class="note">Alle Preise inkl. MwSt. Individuelle Angebote auf Anfrage.</p>
</div></section>

<section id="faq" class="reveal"><div class="wrap">
<p class="eyebrow" style="text-align:center">FAQ</p><h2 style="text-align:center">Häufige Fragen</h2>
<div class="faq">${c.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
</div></section>

<section id="kontakt" class="alt reveal"><div class="wrap contact">
<div class="info"><p class="eyebrow">Kontakt</p><h2>Wir freuen uns auf dich</h2>
<div><small>Telefon</small><a href="tel:${esc(phone.replace(/\s/g, ""))}">${esc(phone)}</a></div>
<div><small>E-Mail</small><a href="mailto:${esc(email)}">${esc(email)}</a></div>
<div><small>Adresse</small>${esc(address)}${address === c.city ? "" : ", " + esc(c.city)}</div>
<div><small>Öffnungszeiten</small>${esc(hours)}</div></div>
<form onsubmit="event.preventDefault();this.innerHTML='<h3>Danke! Wir melden uns schnellstmöglich. 🙌</h3>'">
<input required name="name" placeholder="Dein Name" aria-label="Name">
<input required type="email" name="email" placeholder="Deine E-Mail" aria-label="E-Mail">
<input name="tel" placeholder="Telefon (optional)" aria-label="Telefon">
<textarea name="msg" rows="5" placeholder="Deine Nachricht" aria-label="Nachricht"></textarea>
<button class="btn" type="submit">${esc(c.cta)}</button>
</form>
</div></section>

<section><div class="cta reveal">
<h2>Bereit? ${esc(c.cta)}!</h2>
<p>${esc(c.name)} · ${esc(c.city)} · ${esc(hours)}</p>
<a class="btn" href="tel:${esc(phone.replace(/\s/g, ""))}">📞 Jetzt anrufen</a>
</div></section>
</main>

<footer><div class="wrap">© ${year} ${esc(c.name)} · <a href="#">Impressum</a><a href="#">Datenschutz</a><br><small>Erstellt mit BuildA – Website in 5 Minuten</small></div></footer>
<a class="fab" href="tel:${esc(phone.replace(/\s/g, ""))}" aria-label="Anrufen">📞</a>
<script>
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
</script>
</body>
</html>`;
  }

  global.BuildA = { INDUSTRIES, STYLES, buildSite, generateCopy, slug };
})(window);
