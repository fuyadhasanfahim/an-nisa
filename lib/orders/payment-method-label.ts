export function paymentMethodLabel(method: string): string {
  switch (method) {
    case "cod":
      return "COD";
    case "bkash":
      return "bKash";
    case "nagad":
      return "Nagad";
    case "card":
      return "Card";
    case "bank_transfer":
      return "Bank transfer";
    case "other":
      return "Other";
    default:
      return method || "—";
  }
}
