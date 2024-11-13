export function constructUpiUrl(scheme: string, params: {
  pa: string;  // UPI ID
  pn: string;  // Payee name
  am?: string; // Amount (optional)
  tn?: string; // Transaction note (optional)
}) {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${scheme}?${queryString}`;
} 