export function formatBdtFromCents(cents: number, currencyCode = "BDT") {
  const amount = cents / 100;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol =
    currencyCode === "USD"
      ? "$"
      : currencyCode === "BDT"
        ? "৳"
        : `${currencyCode} `;
  return `${symbol} ${formatted}`;
}
