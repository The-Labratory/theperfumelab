export const THE_PERFUME_LAB_BASE_URL = "https://www.lenzohariri.com";

export function buildReferralCodeLink(referralCode: string) {
  const safeCode = encodeURIComponent(referralCode.trim());
  return `${THE_PERFUME_LAB_BASE_URL}?ref=${safeCode}`;
}

export function buildAffiliateLandingLink(affiliateSlug: string, campaignSlug?: string) {
  const safeSlug = encodeURIComponent(affiliateSlug.trim());
  const base = `${THE_PERFUME_LAB_BASE_URL}/r/${safeSlug}`;
  return campaignSlug ? `${base}/${encodeURIComponent(campaignSlug.trim())}` : base;
}
