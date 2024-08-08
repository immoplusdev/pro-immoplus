export function toLocalCurrency(amount: number, fractionDigits = 2) {
  return parseFloat(amount.toFixed(fractionDigits));
}
