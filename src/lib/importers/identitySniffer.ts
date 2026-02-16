/**
 * Identity Importer Utility — extracts external property IDs from listing URLs
 * for 3NF identity vault (corelogicId, reaGroupId, domainId, etc.).
 */

export type SniffedIds = {
  reaGroupId?: string;
  domainId?: string;
};

/**
 * Extract REA Group ID (9 digits) from realestate.com.au URLs.
 * Example: realestate.com.au/property-house-Qld-ringfield-123456789 → "123456789"
 */
const REA_URL_PATTERN = /realestate\.com\.au\/[^/]*?-(\d{9})(?:\/|$|\?)/i;

/**
 * Extract Domain listing ID from domain.com.au URLs.
 * Example: domain.com.au/20123456 or domain.com.au/property/20123456 → "20123456"
 */
const DOMAIN_URL_PATTERN = /domain\.com\.au\/(?:property\/)?(\d{7,10})(?:\/|$|\?)/i;

/**
 * Extract Domain ID from property-profile URLs.
 * Example: domain.com.au/property-profile/address-123456 → "123456"
 */
const DOMAIN_PROPERTY_PROFILE_PATTERN = /domain\.com\.au\/property-profile\/[^/]+-(\d{6,10})(?:\/|$|\?)/i;

/**
 * Sniff external IDs from a pasted URL and return any found for the identity vault.
 * - REA: 9-digit ID from realestate.com.au paths
 * - Domain: numeric ID from domain.com.au paths
 */
export function sniffIds(url: string): SniffedIds {
  const trimmed = (url || "").trim();
  if (!trimmed) return {};

  const result: SniffedIds = {};

  const reaMatch = trimmed.match(REA_URL_PATTERN);
  if (reaMatch?.[1]) result.reaGroupId = reaMatch[1];

  const domainMatch = trimmed.match(DOMAIN_URL_PATTERN);
  if (domainMatch?.[1]) result.domainId = domainMatch[1];

  // Also try property-profile style: domain.com.au/property-profile/address-123456
  if (!result.domainId) {
    const profileMatch = trimmed.match(DOMAIN_PROPERTY_PROFILE_PATTERN);
    if (profileMatch?.[1]) result.domainId = profileMatch[1];
  }

  return result;
}

/**
 * Placeholder for future integration with data.qld.gov.au (or other state data)
 * for lot/plan lookup. Used for UI integration and PropertyEntry.
 */
export function fetchStateData(): void {
  // eslint-disable-next-line no-console
  console.log("Searching data.qld.gov.au for lot/plan for UI integration and PropertyEntry.tsx");
}
