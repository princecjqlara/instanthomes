const slugPattern = /[^a-z0-9]+/g;

// Client-side: always use the current browser origin so links resolve correctly
// regardless of which Vercel deployment (production vs preview) is being viewed.
export const APP_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://instanthomes.vercel.app';

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(slugPattern, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
}

export function createUniqueSlug(label: string, existingSlugs: string[]) {
  const normalized = slugify(label) || 'tenant';

  if (!existingSlugs.includes(normalized)) {
    return normalized;
  }

  let counter = 2;

  while (existingSlugs.includes(`${normalized}-${counter}`)) {
    counter += 1;
  }

  return `${normalized}-${counter}`;
}

export function buildFunnelPath(tenantSlug: string, funnelSlug: string) {
  return `/t/${tenantSlug}/f/${funnelSlug}`;
}

export function buildFunnelUrl(tenantSlug: string, funnelSlug: string) {
  return `${APP_ORIGIN}${buildFunnelPath(tenantSlug, funnelSlug)}`;
}
