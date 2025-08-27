export function formatPrice(value) {
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
}
