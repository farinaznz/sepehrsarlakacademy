export function normalizeIranianPhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "");
  let normalized = digits;

  if (normalized.startsWith("0098")) normalized = `+98${normalized.slice(4)}`;
  if (normalized.startsWith("98") && !normalized.startsWith("+")) {
    normalized = `+${normalized}`;
  }
  if (normalized.startsWith("09")) normalized = `+98${normalized.slice(1)}`;

  return /^\+989\d{9}$/.test(normalized) ? normalized : null;
}
