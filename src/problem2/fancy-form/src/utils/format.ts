export function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

// keep only digits and a single dot
export function sanitizeAmount(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}
