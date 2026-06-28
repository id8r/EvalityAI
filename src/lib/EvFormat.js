/* src/lib/EvFormat.js | Locale-aware money formatting — single source of truth for Ev money | Sree | 2026-06-28 */

// Currency → locale so grouping follows the CURRENCY, not the browser: Indian lakh/crore for INR, western for
// USD/EUR/etc. Unknown currencies fall back to western grouping (en-US). One place to format money across Jobs,
// Candidates, application sheets, tables, and future reports — never inline this in a page/component.
const LOCALE_BY_CURRENCY = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
  JPY: "ja-JP",
};

function localeFor(currency) {
  return LOCALE_BY_CURRENCY[currency] ?? "en-US";
}
/* - - - - - - - - - - - - - - - - */

// formatMoney(2850000, "INR")              -> "₹28,50,000"
// formatMoney(2850000, "INR", {compact})   -> "₹28.5L"   (₹2.9Cr for crores)
// formatMoney(285000, "USD")               -> "$285,000" ($285K compact)
export function formatMoney(value, currency = "INR", { compact = false } = {}) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const options = compact
    ? { style: "currency", currency, notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }
    : { style: "currency", currency, maximumFractionDigits: 0 };
  try {
    return new Intl.NumberFormat(localeFor(currency), options).format(value);
  } catch {
    return `${currency} ${new Intl.NumberFormat("en-US").format(value)}`;
  }
}

// formatSalaryRange({ min, max, currency }) -> "₹28.5L – ₹36L" (compact by default — ranges read tighter).
// Pass { compact: false } for precise grouping (₹28,50,000 – ₹36,00,000) in detail/sheet views.
export function formatSalaryRange(range, { compact = true } = {}) {
  if (!range || (range.min == null && range.max == null)) return "—";
  const currency = range.currency || "INR";
  const min = range.min != null ? formatMoney(range.min, currency, { compact }) : null;
  const max = range.max != null ? formatMoney(range.max, currency, { compact }) : null;
  if (min && max) return `${min} – ${max}`;
  return min ? `${min}+` : max;
}
/* - - - - - - - - - - - - - - - - */
