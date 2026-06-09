export function normalizeVariantAttributes(attributes: Record<string, string>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
        .map(([key, value]) => [key.trim().toLowerCase(), String(value).trim().toLowerCase()])
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}
