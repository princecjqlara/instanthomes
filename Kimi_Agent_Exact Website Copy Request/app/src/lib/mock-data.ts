import { buildFunnelUrl } from '@/lib/links';
import type { AdminUserRecord, FunnelRecord, TenantRecord } from '@/types/platform';

const bennettFunnels: FunnelRecord[] = [
  {
    id: 'funnel_laurel_ridge',
    uniqueId: 'fnl_laurel_ridge',
    tenantId: 'tenant_bennett',
    tenantName: 'Bennett Local Group',
    tenantSlug: 'bennett-local-group',
    name: 'Laurel Ridge Launch',
    slug: 'laurel-ridge-drive',
    templateKey: 'kimi-exact-v1',
    status: 'published',
    headline: 'Tour 1848 Laurel Ridge Drive before it hits the wider market.',
    subheadline: 'Luxury Austin inventory presented inside a tenant-branded sales funnel.',
    primaryCtaLabel: 'Book a private showing',
    propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
    propertyPrice: '$1,485,000',
    branding: {
      primaryColor: '#00853E',
      lightColor: '#D8E8D8',
      darkColor: '#003D1F',
      accentColor: '#F7C948',
      backgroundColor: '#F9F5E9',
      logoUrl: null,
    },
    instantMeeting: {
      enabled: true,
      mode: 'inline',
      headline: 'Instant Meeting is live for this funnel',
      description: 'Show buyers a booking-ready meeting block anywhere the template supports CTA placement.',
      ctaLabel: 'Open instant meeting widget',
    },
    media: [],
    customFields: [],
  },
  {
    id: 'funnel_modern_oaks',
    uniqueId: 'fnl_modern_oaks',
    tenantId: 'tenant_bennett',
    tenantName: 'Bennett Local Group',
    tenantSlug: 'bennett-local-group',
    name: 'Modern Oaks Prelaunch',
    slug: 'modern-oaks-prelaunch',
    templateKey: 'kimi-exact-v1',
    status: 'draft',
    headline: 'Preview Modern Oaks before public launch week.',
    subheadline: 'A private prelaunch funnel for high-intent buyers and investor partners.',
    primaryCtaLabel: 'Join the prelaunch list',
    propertyAddress: '901 Modern Oaks Lane, Austin, TX 78746',
    propertyPrice: '$2,240,000',
    branding: {
      primaryColor: '#0B5FFF',
      lightColor: '#DBE7FF',
      darkColor: '#0E214D',
      accentColor: '#FFD166',
      backgroundColor: '#F5F9FF',
      logoUrl: null,
    },
    instantMeeting: {
      enabled: true,
      mode: 'sticky',
      headline: 'Meeting widget ready for launch day',
      description: 'Keep the scheduling flow armed before publishing the next property drop.',
      ctaLabel: 'Preview meeting CTA',
    },
    media: [],
    customFields: [],
  },
];

const tenants: TenantRecord[] = [
  {
    id: 'tenant_bennett',
    name: 'Bennett Local Group',
    slug: 'bennett-local-group',
    ownerName: 'Maya Bennett',
    ownerEmail: 'maya@bennettlocal.com',
    status: 'active',
    funnels: bennettFunnels,
  },
  {
    id: 'tenant_northshore',
    name: 'Northshore Advisory',
    slug: 'northshore-advisory',
    ownerName: 'Liam Porter',
    ownerEmail: 'liam@northshoreadvisory.com',
    status: 'invited',
    funnels: [
      {
        id: 'funnel_harbor_view',
        uniqueId: 'fnl_harbor_view',
        tenantId: 'tenant_northshore',
        tenantName: 'Northshore Advisory',
        tenantSlug: 'northshore-advisory',
        name: 'Harbor View Invite Funnel',
        slug: 'harbor-view-preview',
        templateKey: 'kimi-exact-v1',
        status: 'draft',
        headline: 'Invite-only access for Harbor View buyers.',
        subheadline: 'Use a tenant-branded landing page before listing inventory publicly.',
        primaryCtaLabel: 'Request preview access',
        propertyAddress: '42 Harbor View Circle, Miami, FL 33133',
        propertyPrice: '$3,950,000',
        branding: {
          primaryColor: '#14532D',
          lightColor: '#DCFCE7',
          darkColor: '#052E16',
          accentColor: '#FBBF24',
          backgroundColor: '#F0FDF4',
          logoUrl: null,
        },
        instantMeeting: {
          enabled: false,
          mode: 'inline',
          headline: 'Widget disabled',
          description: 'Activate when the client is ready to accept meetings.',
          ctaLabel: 'Widget disabled',
        },
        media: [],
        customFields: [],
      },
    ],
  },
];

const adminUsers: AdminUserRecord[] = [
  {
    id: 'user_admin_1',
    fullName: 'Instant Homes Admin',
    email: 'admin@instanthomes.com',
    role: 'admin',
  },
  {
    id: 'user_maya',
    fullName: 'Maya Bennett',
    email: 'maya@bennettlocal.com',
    role: 'tenant_user',
    tenantName: 'Bennett Local Group',
  },
  {
    id: 'user_liam',
    fullName: 'Liam Porter',
    email: 'liam@northshoreadvisory.com',
    role: 'tenant_user',
    tenantName: 'Northshore Advisory',
  },
];

export function listTenants() {
  return tenants;
}

export function listAdminUsers() {
  return adminUsers;
}

export function getPrimaryTenant() {
  return tenants[0];
}

export function getTenantBySlug(tenantSlug: string) {
  return tenants.find((tenant) => tenant.slug === tenantSlug);
}

export function getFunnelByRoute(tenantSlug: string, funnelSlug: string) {
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    return undefined;
  }

  return tenant.funnels.find((funnel) => funnel.slug === funnelSlug);
}

export function getFunnelUrl(funnel: FunnelRecord) {
  return buildFunnelUrl(funnel.tenantSlug, funnel.slug);
}
