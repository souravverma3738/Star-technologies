// Lightweight client-side currency detection + GBP-base conversion.
// Rates are static — fine for displaying indicative pricing.
const RATES = {
  GBP: { symbol: "£", rate: 1 },
  USD: { symbol: "$", rate: 1.27 },
  EUR: { symbol: "€", rate: 1.17 },
  INR: { symbol: "₹", rate: 105 },
  AUD: { symbol: "A$", rate: 1.93 },
  CAD: { symbol: "C$", rate: 1.72 },
  AED: { symbol: "AED ", rate: 4.66 },
};

const COUNTRY_TO_CURRENCY = {
  GB: "GBP", IE: "EUR", US: "USD", CA: "CAD", AU: "AUD",
  IN: "INR", AE: "AED",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  PL: "EUR", SE: "EUR", DK: "EUR", NO: "EUR",
};

const STORE_KEY = "st_currency_v1";

export async function detectCurrency() {
  const cached = sessionStorage.getItem(STORE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* ignore */ }
  }
  let code = "GBP";
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const cc = data?.country_code || data?.country;
      if (cc && COUNTRY_TO_CURRENCY[cc]) code = COUNTRY_TO_CURRENCY[cc];
    }
  } catch { /* fall back to GBP */ }
  const meta = { code, ...RATES[code] };
  sessionStorage.setItem(STORE_KEY, JSON.stringify(meta));
  return meta;
}

export function formatPrice(gbpValue, meta) {
  if (gbpValue == null) return "";
  const m = meta || RATES.GBP;
  const converted = gbpValue * m.rate;
  // round to nearest sensible bucket per currency
  let rounded;
  if (m.code === "INR") rounded = Math.round(converted / 100) * 100;
  else if (m.code === "GBP" || m.code === "USD" || m.code === "EUR" || m.code === "AUD" || m.code === "CAD") {
    rounded = converted >= 1000 ? Math.round(converted / 10) * 10 : Math.round(converted);
  } else rounded = Math.round(converted);
  const formatted = rounded.toLocaleString("en-US");
  return `${m.symbol}${formatted}`;
}
