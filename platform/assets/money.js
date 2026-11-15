// Copy of src/money.js (kept identical by test/money_migrations.test.js) so prices show before the booking system has started.
// All amounts are integers in minor units (piastres for EGP). No floating point anywhere.

export class PriceError extends Error {
  constructor(msg) { super(msg); this.code = "PRICE_INVALID"; }
}

/** basis-point percentage with round-half-up on integers */
export function pct(amount, bp) {
  if (!Number.isSafeInteger(amount) || !Number.isInteger(bp)) throw new PriceError("non-integer amount");
  return Math.floor((amount * bp + 5000) / 10000);
}

/**
 * Server-side price calculation. The browser never decides the price; it only displays this result.
 * @param {object} price  row from activity_prices
 * @param {{adults:number, children:number}} party
 * @param {object} activity  { min_participants, max_capacity }
 */
export function calculatePrice(price, party, activity = {}) {
  const adults = Number(party.adults), children = Number(party.children || 0);
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 0 || children < 0) throw new PriceError("invalid party size");
  const persons = adults + children;
  if (persons < 1) throw new PriceError("at least one participant");
  if (adults < 1 && children > 0) throw new PriceError("children must travel with an adult");
  if (activity.min_participants && persons < activity.min_participants) throw new PriceError(`minimum ${activity.min_participants} participants`);
  if (activity.max_capacity && persons > activity.max_capacity) throw new PriceError(`maximum ${activity.max_capacity} participants`);

  const lines = [];
  if (adults) lines.push({ code: "ADULT", qty: adults, unit_minor: price.adult_minor, amount_minor: adults * price.adult_minor });
  if (children) lines.push({ code: "CHILD", qty: children, unit_minor: price.child_minor, amount_minor: children * price.child_minor });
  for (const s of price.surcharges || []) {
    const qty = s.per === "PERSON" ? persons : 1;
    if (!Number.isSafeInteger(s.amount_minor) || s.amount_minor < 0) throw new PriceError("invalid surcharge");
    lines.push({ code: s.code, label: s.label, qty, unit_minor: s.amount_minor, amount_minor: qty * s.amount_minor });
  }
  const subtotal = lines.reduce((a, l) => a + l.amount_minor, 0);
  const tax = pct(subtotal, price.tax_rate_bp || 0);
  const total = subtotal + tax;
  let deposit = pct(total, price.deposit_rate_bp ?? 10000);
  if (deposit > total) deposit = total;
  if (!Number.isSafeInteger(total)) throw new PriceError("amount too large");
  return {
    price_id: price.id,
    currency: price.currency,
    adults, children,
    lines,
    subtotal_minor: subtotal,
    tax_rate_bp: price.tax_rate_bp || 0,
    tax_minor: tax,
    total_minor: total,
    deposit_minor: deposit,
    balance_minor: total - deposit,
  };
}

/** refund amount according to a cancellation policy snapshot: rules sorted by hours_before desc */
export function refundDue(paidMinor, rules, hoursBeforeStart) {
  const sorted = [...(rules || [])].sort((a, b) => b.hours_before - a.hours_before);
  for (const r of sorted) if (hoursBeforeStart >= r.hours_before) return pct(paidMinor, r.refund_bp);
  return 0;
}

export function formatMinor(minor, currency) {
  return `${currency} ${(minor / 100).toFixed(2)}`;
}
