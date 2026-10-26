/** Whole cents to a display string, using integer arithmetic only: 5997 -> "59.97". */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = (abs % 100).toString().padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}

/** Whole cents to US dollars: 264000 -> "$2,640.00". The API is single-currency (USD). */
export function formatUsd(cents: number): string {
  const text = formatCents(Math.abs(cents));
  return cents < 0 ? `-$${text}` : `$${text}`;
}
