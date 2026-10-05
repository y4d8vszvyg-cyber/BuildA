/* BuildA – deine Einstellungen.
 * Hier trägst du deine Stripe-Zahlungslinks ein (Stripe Dashboard → Payment Links → Neu).
 * Solange ein Link leer ist, zeigt der Builder beim Bezahlen nur eine Demo-Meldung.
 */
window.BUILDA_CONFIG = {
  stripe: {
    start: "",    // z. B. "https://buy.stripe.com/abc123"  (9,99 €/Monat + 49 € Einrichtung)
    pro: "",      // z. B. "https://buy.stripe.com/def456"  (19,99 €/Monat)
    business: "", // z. B. "https://buy.stripe.com/ghi789"  (49 €/Monat)
  },
  // Kontakt für Rückfragen nach dem Kauf (wird im Builder angezeigt)
  supportEmail: "",
  supportWhatsApp: "",
};
