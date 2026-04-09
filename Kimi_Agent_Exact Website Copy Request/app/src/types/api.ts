import type { BrandTheme, FunnelCustomField, FunnelMediaItem, FunnelStatus, InstantMeetingConfig, UserRole } from '@/types/platform';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantSlug?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface AdminTenantSummary {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: 'active' | 'invited' | 'paused' | 'expired';
  subscriptionEndsAt?: string;
  forcedLogoutAt?: string;
  funnels: Array<{
    id: string;
    name: string;
    slug: string;
    status: FunnelStatus;
    publicUrl: string;
  }>;
}

export interface AdminTenantsResponse {
  tenants: AdminTenantSummary[];
}

export interface AdminUsersResponse {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    demoPassword?: string;
    role: UserRole;
    tenantSlug?: string;
  }>;
}

export interface TenantFunnelsResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    status: 'active' | 'invited' | 'paused' | 'expired';
    subscriptionEndsAt?: string;
  };
  funnels: Array<{
    id: string;
    name: string;
    slug: string;
    status: FunnelStatus;
    templateKey: string;
    headline: string;
    propertyAddress: string;
    propertyPrice: string;
    publicUrl: string;
  }>;
}

export interface TenantFunnelDetailResponse {
  funnel: {
    id: string;
    uniqueId: string;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    name: string;
    slug: string;
    templateKey: string;
    status: FunnelStatus;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    propertyAddress: string;
    propertyPrice: string;
    publicUrl: string;
  };
  branding: BrandTheme | null;
  instantMeeting: InstantMeetingConfig | null;
  media: FunnelMediaItem[];
  customFields: FunnelCustomField[];
}

export interface PublicExpiredResponse {
  expired: true;
  tenant: {
    name: string;
    slug: string;
  };
  branding: BrandTheme;
  supportUrl: string;
  paymentQrUrl: string;
}

export interface PublicFunnelDetailResponse {
  funnel: {
    id: string;
    uniqueId: string;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    name: string;
    slug: string;
    templateKey: string;
    status: FunnelStatus;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    propertyAddress: string;
    propertyPrice: string;
    publicUrl: string;
    branding: BrandTheme;
  };
  instantMeeting: InstantMeetingConfig;
  media: FunnelMediaItem[];
  customFields: FunnelCustomField[];
}

export type PublicFunnelResponse = PublicFunnelDetailResponse | PublicExpiredResponse;

export interface PaymentSubmissionSummary {
  id: string;
  tenantName: string;
  ownerName: string;
  email: string;
  messengerHandle?: string;
  notes?: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedTenantSlug?: string;
  supportUrl: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AdminPaymentSubmissionsResponse {
  submissions: PaymentSubmissionSummary[];
}

export interface PaymentSubmissionResponse {
  submission: PaymentSubmissionSummary;
}

export interface CreateTenantResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    status?: 'active' | 'invited' | 'paused' | 'expired';
  };
  funnel: {
    id: string;
    slug: string;
    publicUrl: string;
  };
}

export interface UpdateTenantStatusResponse {
  tenant: AdminTenantSummary;
}

export interface MediaListResponse {
  media: FunnelMediaItem[];
}

export interface MediaItemResponse {
  media: FunnelMediaItem;
}
