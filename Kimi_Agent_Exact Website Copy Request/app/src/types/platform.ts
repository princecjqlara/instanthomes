export type FunnelStatus = 'draft' | 'published';

export type UserRole = 'admin' | 'tenant_user';

export interface BrandTheme {
  primaryColor: string;
  lightColor: string;
  darkColor: string;
  accentColor: string;
  backgroundColor: string;
  logoUrl: string | null;
}

export interface InstantMeetingConfig {
  enabled: boolean;
  mode: 'inline' | 'sticky';
  headline: string;
  description: string;
  ctaLabel: string;
  // IM-linked fields
  meetingUrl?: string;
  widgetKey?: string;
  embedType?: 'booking' | 'live' | 'both';
  showWidget?: boolean;
  autoBooking?: boolean;
  liveBroadcast?: boolean;
}

export interface FunnelMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
}

export interface FunnelCustomField {
  id?: string;
  label: string;
  value: string;
  fieldType: 'text' | 'textarea' | 'number' | 'url';
  sortOrder: number;
}

export interface FunnelRecord {
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
  branding: BrandTheme;
  instantMeeting: InstantMeetingConfig;
  media: FunnelMediaItem[];
  customFields: FunnelCustomField[];
}

export interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: 'active' | 'invited';
  funnels: FunnelRecord[];
}

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantName?: string;
}

export interface IntegrationStatus {
  linked: boolean;
  imUsername?: string;
  imEmail?: string;
  imUserId?: string;
  linkedAt?: string;
  features: {
    meetingEmbed: boolean;
    websiteWidget: boolean;
    liveBroadcast: boolean;
    visitorPresence: boolean;
  };
}
