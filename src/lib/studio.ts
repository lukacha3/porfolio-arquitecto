export interface StudioContentInput {
  about?: string | null;
  services?: (string | null | undefined)[] | null;
}

/**
 * Splits `about` into non-empty trimmed paragraphs.
 */
export function getStudioParagraphs(about?: string | null): string[] {
  if (!about) return [];
  return about
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Normalizes `services` into up to 3 non-empty trimmed strings.
 */
export function getStudioServices(
  services?: (string | null | undefined)[] | null
): string[] {
  if (!Array.isArray(services)) return [];
  return services
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * Returns true when Sanity `siteSettings` has at least one non-empty
 * Studion field (`about` or `services`).
 */
export function hasStudioContent(
  siteSettings?: StudioContentInput | null
): boolean {
  if (!siteSettings) return false;
  return (
    getStudioParagraphs(siteSettings.about).length > 0 ||
    getStudioServices(siteSettings.services).length > 0
  );
}
