import type {
  AdminPaymentSubmissionsResponse,
  AdminTenantsResponse,
  AdminUsersResponse,
  AuthResponse,
  CreateTenantResponse,
  MediaItemResponse,
  MediaListResponse,
  PaymentSubmissionResponse,
  PublicFunnelResponse,
  TenantFunnelDetailResponse,
  TenantFunnelsResponse,
  UpdateTenantStatusResponse,
} from '@/types/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    credentials: 'include',
    headers,
    ...init,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | { error?: string }) : undefined;

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data && typeof data.error === 'string' ? data.error : 'Request failed';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function getSession() {
  return apiFetch<AuthResponse>('/api/auth/me');
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export function getAdminTenants() {
  return apiFetch<AdminTenantsResponse>('/api/admin/tenants');
}

export function getAdminUsers() {
  return apiFetch<AdminUsersResponse>('/api/admin/users');
}

export function getAdminPaymentSubmissions() {
  return apiFetch<AdminPaymentSubmissionsResponse>('/api/admin/payment-submissions');
}

export function createTenant(name: string, email: string, password: string) {
  return apiFetch<CreateTenantResponse>('/api/admin/tenants', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function updateAdminTenantStatus(tenantSlug: string, status: 'active' | 'invited' | 'paused' | 'expired', subscriptionEndsAt?: string | null) {
  return apiFetch<UpdateTenantStatusResponse>(`/api/admin/tenants/${tenantSlug}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, subscriptionEndsAt: subscriptionEndsAt ?? null }),
  });
}

export function forceLogoutTenant(tenantSlug: string) {
  return apiFetch<{ success: boolean }>(`/api/admin/tenants/${tenantSlug}/force-logout`, {
    method: 'POST',
  });
}

export function deleteTenant(tenantSlug: string) {
  return apiFetch<{ success: boolean }>(`/api/admin/tenants/${tenantSlug}`, {
    method: 'DELETE',
  });
}

export function approvePaymentSubmission(submissionId: string) {
  return apiFetch<CreateTenantResponse>(`/api/admin/payment-submissions/${submissionId}/approve`, {
    method: 'POST',
  });
}

export function rejectPaymentSubmission(submissionId: string) {
  return apiFetch<{ success: boolean }>(`/api/admin/payment-submissions/${submissionId}/reject`, {
    method: 'POST',
  });
}

export function deletePaymentSubmission(submissionId: string) {
  return apiFetch<{ success: boolean }>(`/api/admin/payment-submissions/${submissionId}`, {
    method: 'DELETE',
  });
}

export function getTenantFunnels(tenantSlug: string) {
  return apiFetch<TenantFunnelsResponse>(`/api/tenant/funnels/${tenantSlug}`);
}

export function getTenantFunnelDetail(tenantSlug: string, funnelSlug: string) {
  return apiFetch<TenantFunnelDetailResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}`);
}

export function updateTenantFunnel(tenantSlug: string, funnelSlug: string, payload: Record<string, unknown>) {
  return apiFetch<TenantFunnelDetailResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function uploadTenantFunnelLogo(tenantSlug: string, funnelSlug: string, logoFile: File) {
  const formData = new FormData();
  formData.append('logo', logoFile);

  return apiFetch<{ logoUrl: string }>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/logo`, {
    method: 'POST',
    body: formData,
  });
}

export function getPublicFunnel(tenantSlug: string, funnelSlug: string) {
  return apiFetch<PublicFunnelResponse>(`/api/public/funnels/${tenantSlug}/${funnelSlug}`);
}

export function createPaymentSubmission(formData: FormData) {
  return apiFetch<PaymentSubmissionResponse>('/api/public/payment-submissions', {
    method: 'POST',
    body: formData,
  });
}

// --- Media API ---

export function getFunnelMedia(tenantSlug: string, funnelSlug: string) {
  return apiFetch<MediaListResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/media`);
}

export function uploadFunnelMedia(tenantSlug: string, funnelSlug: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<MediaItemResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/media`, {
    method: 'POST',
    body: formData,
  });
}

export function reorderFunnelMedia(tenantSlug: string, funnelSlug: string, mediaIds: string[]) {
  return apiFetch<MediaListResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/media/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ mediaIds }),
  });
}

export function updateFunnelMediaCaption(tenantSlug: string, funnelSlug: string, mediaId: string, caption: string | null) {
  return apiFetch<MediaItemResponse>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/media/${mediaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ caption }),
  });
}

export function deleteFunnelMedia(tenantSlug: string, funnelSlug: string, mediaId: string) {
  return apiFetch<{ success: boolean }>(`/api/tenant/funnels/${tenantSlug}/${funnelSlug}/media/${mediaId}`, {
    method: 'DELETE',
  });
}

// --- Integration API ---

export interface IntegrationStatusResponse {
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

export function getIntegrationStatus() {
  return apiFetch<IntegrationStatusResponse>('/api/integrations/instant-meeting/status');
}

export function linkInstantMeeting(email: string, password: string) {
  return apiFetch<IntegrationStatusResponse>('/api/integrations/instant-meeting/link', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function disconnectInstantMeeting() {
  return apiFetch<{ success: boolean }>('/api/integrations/instant-meeting/disconnect', {
    method: 'POST',
  });
}

export function refreshInstantMeetingConnection() {
  return apiFetch<IntegrationStatusResponse>('/api/integrations/instant-meeting/refresh', {
    method: 'POST',
  });
}

