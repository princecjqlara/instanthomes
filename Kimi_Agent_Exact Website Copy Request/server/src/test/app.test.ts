import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, resetDatabase } from '../app.js';
import * as media from '../media.js';
import { prisma } from '../db.js';

describe('Instant Homes server', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a health payload', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'instanthomes-server' });
  });

  it('rejects admin routes without a session', async () => {
    const app = createApp();

    const response = await request(app).get('/api/admin/users');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication required' });
  });

  it('authenticates a known admin and exposes the active session', async () => {
    const app = createApp();
    const agent = request.agent(app);

    const loginResponse = await agent.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user).toMatchObject({
      email: 'admin@instanthomes.com',
      role: 'admin',
    });

    const sessionResponse = await agent.get('/api/auth/me');

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.user).toMatchObject({
      email: 'admin@instanthomes.com',
      role: 'admin',
    });
  });

  it('rejects an invalid login', async () => {
    const app = createApp();

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid credentials' });
  });

  it('allows an admin session to read users and tenants', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const usersResponse = await agent.get('/api/admin/users');
    const tenantsResponse = await agent.get('/api/admin/tenants');

    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.users).toHaveLength(3);
    expect(usersResponse.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'maya@bennettlocal.com',
          demoPassword: 'maya12345',
        }),
        expect.objectContaining({
          email: 'admin@instanthomes.com',
          demoPassword: 'admin123',
        }),
      ])
    );
    expect(tenantsResponse.status).toBe(200);
    expect(tenantsResponse.body.tenants[0].slug).toBe('bennett-local-group');
    expect(tenantsResponse.body.tenants[0].funnels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'laurel-ridge-drive',
          publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
        }),
      ])
    );
  });

  it('prevents a tenant session from opening admin endpoints', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const response = await agent.get('/api/admin/users');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Admin access required' });
  });

  it('lets an admin pause a tenant, force logout the tenant, and resume access later', async () => {
    const app = createApp();
    const admin = request.agent(app);
    const tenant = request.agent(app);

    await admin.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    await tenant.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const pauseResponse = await admin.patch('/api/admin/tenants/bennett-local-group/status').send({
      status: 'paused',
    });

    expect(pauseResponse.status).toBe(200);
    expect(pauseResponse.body.tenant).toMatchObject({
      slug: 'bennett-local-group',
      status: 'paused',
    });

    const sessionAfterPause = await tenant.get('/api/auth/me');

    expect(sessionAfterPause.status).toBe(401);
    expect(sessionAfterPause.body).toEqual({ error: 'Session expired' });

    const pausedLogin = await request(app).post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    expect(pausedLogin.status).toBe(403);
    expect(pausedLogin.body).toEqual({ error: 'Tenant access is paused' });

    const resumeResponse = await admin.patch('/api/admin/tenants/bennett-local-group/status').send({
      status: 'active',
    });

    expect(resumeResponse.status).toBe(200);
    expect(resumeResponse.body.tenant).toMatchObject({
      slug: 'bennett-local-group',
      status: 'active',
    });

    const resumedLogin = await request(app).post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    expect(resumedLogin.status).toBe(200);

    const forceLogoutResponse = await admin.post('/api/admin/tenants/bennett-local-group/force-logout').send();

    expect(forceLogoutResponse.status).toBe(200);
    expect(forceLogoutResponse.body).toEqual({ success: true });
  });

  it('blocks expired tenants from logging in and shows an expired public funnel page payload', async () => {
    const app = createApp();
    const admin = request.agent(app);

    await admin.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const expireResponse = await admin.patch('/api/admin/tenants/bennett-local-group/status').send({
      status: 'expired',
    });

    expect(expireResponse.status).toBe(200);
    expect(expireResponse.body.tenant).toMatchObject({
      slug: 'bennett-local-group',
      status: 'expired',
    });

    const expiredLogin = await request(app).post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    expect(expiredLogin.status).toBe(403);
    expect(expiredLogin.body).toEqual({ error: 'Tenant subscription has ended' });

    const publicResponse = await request(app).get('/api/public/funnels/bennett-local-group/laurel-ridge-drive-001');

    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body).toMatchObject({
      expired: true,
      tenant: {
        slug: 'bennett-local-group',
        name: 'Bennett Local Group',
      },
      supportUrl: 'https://www.facebook.com/aresmediaph',
    });

    await resetDatabase();
  });

  it('lets an admin permanently delete a tenant and its public funnel access', async () => {
    const app = createApp();
    const admin = request.agent(app);

    await admin.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const deleteResponse = await admin.delete('/api/admin/tenants/northshore-advisory');

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ success: true });

    const tenantsResponse = await admin.get('/api/admin/tenants');

    expect(tenantsResponse.status).toBe(200);
    expect(tenantsResponse.body.tenants.find((tenant: { slug: string }) => tenant.slug === 'northshore-advisory')).toBeUndefined();

    const publicResponse = await request(app).get('/api/public/funnels/northshore-advisory/welcome-offer-001');

    expect(publicResponse.status).toBe(404);

    await resetDatabase();
  });

  it('stores signup details without a receipt upload and lets an admin approve the tenant account later', async () => {
    const app = createApp();
    const admin = request.agent(app);

    const submitResponse = await request(app)
      .post('/api/public/payment-submissions')
      .field('tenantName', 'Ares Prime Realty')
      .field('ownerName', 'Ares Prime Realty')
      .field('email', 'sales@aresprime.com')
      .field('password', 'aresprime123')
      .field('messengerHandle', 'Ares Prime Sales');

    expect(submitResponse.status).toBe(201);
    expect(submitResponse.body.submission).toMatchObject({
      tenantName: 'Ares Prime Realty',
      email: 'sales@aresprime.com',
      status: 'pending',
      supportUrl: 'https://www.facebook.com/aresmediaph',
      messengerHandle: 'Ares Prime Sales',
    });

    await admin.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const pendingResponse = await admin.get('/api/admin/payment-submissions');

    expect(pendingResponse.status).toBe(200);
    expect(pendingResponse.body.submissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'sales@aresprime.com',
          status: 'pending',
        }),
      ])
    );

    const submissionId = pendingResponse.body.submissions.find((submission: { email: string }) => submission.email === 'sales@aresprime.com').id;

    const approveResponse = await admin.post(`/api/admin/payment-submissions/${submissionId}/approve`).send();

    expect(approveResponse.status).toBe(201);
    expect(approveResponse.body.tenant).toMatchObject({
      slug: 'ares-prime-realty',
      ownerEmail: 'sales@aresprime.com',
      status: 'active',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'sales@aresprime.com',
      password: 'aresprime123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user).toMatchObject({
      email: 'sales@aresprime.com',
      role: 'tenant_user',
      tenantSlug: 'ares-prime-realty',
    });
  });

  it('lets an admin reject or delete a pending payment request', async () => {
    const app = createApp();
    const admin = request.agent(app);

    await request(app)
      .post('/api/public/payment-submissions')
      .field('tenantName', 'Ares Prime Realty')
      .field('ownerName', 'Test Owner')
      .field('email', 'sales@aresprime.com')
      .field('password', 'aresprime123')
      .field('messengerHandle', 'Ares Prime Sales');

    await request(app)
      .post('/api/public/payment-submissions')
      .field('tenantName', 'North Arc Realty')
      .field('ownerName', 'North Arc')
      .field('email', 'hello@northarc.com')
      .field('password', 'northarc123')
      .field('messengerHandle', 'North Arc Sales');

    await admin.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const pendingResponse = await admin.get('/api/admin/payment-submissions');
    const firstSubmissionId = pendingResponse.body.submissions.find((submission: { email: string }) => submission.email === 'sales@aresprime.com').id;
    const secondSubmissionId = pendingResponse.body.submissions.find((submission: { email: string }) => submission.email === 'hello@northarc.com').id;

    const rejectResponse = await admin.post(`/api/admin/payment-submissions/${firstSubmissionId}/reject`).send();

    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body).toEqual({ success: true });

    const deleteResponse = await admin.delete(`/api/admin/payment-submissions/${secondSubmissionId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ success: true });

    const afterResponse = await admin.get('/api/admin/payment-submissions');

    expect(afterResponse.status).toBe(200);
    expect(afterResponse.body.submissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'sales@aresprime.com',
          status: 'rejected',
        }),
      ])
    );
    expect(afterResponse.body.submissions.find((submission: { email: string }) => submission.email === 'hello@northarc.com')).toBeUndefined();
  });

  it('creates a tenant with a unique slug and persists it for later admin reads', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'admin@instanthomes.com',
      password: 'admin123',
    });

    const createResponse = await agent.post('/api/admin/tenants').send({
      name: 'Bennett Local Group',
      email: 'ops@bennettlocal.com',
      password: 'welcome123',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.tenant).toMatchObject({
      name: 'Bennett Local Group',
      slug: 'bennett-local-group-2',
      ownerEmail: 'ops@bennettlocal.com',
    });
    expect(createResponse.body.funnel).toMatchObject({
      slug: 'welcome-offer',
      publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group-2/welcome-offer-001',
    });

    const tenantsResponse = await agent.get('/api/admin/tenants');
    const usersResponse = await agent.get('/api/admin/users');

    expect(tenantsResponse.status).toBe(200);
    expect(tenantsResponse.body.tenants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'bennett-local-group-2',
        }),
      ])
    );
    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'ops@bennettlocal.com',
          demoPassword: 'welcome123',
        }),
      ])
    );
  });

  it('returns the funnel list for the authenticated tenant workspace', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const response = await agent.get('/api/tenant/funnels/bennett-local-group');

    expect(response.status).toBe(200);
    expect(response.body.tenant).toMatchObject({
      slug: 'bennett-local-group',
      name: 'Bennett Local Group',
    });
    expect(response.body.funnels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'laurel-ridge-drive',
          publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
        }),
      ])
    );
  });

  it('returns editable funnel detail for the authenticated tenant', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const response = await agent.get('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive');

    expect(response.status).toBe(200);
    expect(response.body.funnel).toMatchObject({
      slug: 'laurel-ridge-drive',
      name: 'Laurel Ridge Launch',
      templateKey: 'kimi-exact-v1',
      headline: 'Tour 1848 Laurel Ridge Drive before it hits the wider market.',
      subheadline: 'Luxury Austin inventory presented inside a tenant-branded sales funnel.',
      primaryCtaLabel: 'Book a private showing',
    });
    expect(response.body.branding).toMatchObject({
      primaryColor: '#00853E',
      logoUrl: null,
    });
    expect(response.body.instantMeeting).toMatchObject({
      enabled: true,
      mode: 'inline',
    });
    expect(response.body.media).toEqual([]);
    expect(response.body.customFields).toEqual([]);
  });

  it('updates funnel content, branding, meeting config, and template selection for the tenant', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const updateResponse = await agent.patch('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive').send({
      name: 'Laurel Ridge Investor Launch',
      templateKey: 'instant-listing-v2',
      status: 'published',
      headline: 'A faster path into Laurel Ridge luxury inventory.',
      subheadline: 'Switch templates, update branding, and keep the same unique link.',
      primaryCtaLabel: 'Reserve a private tour',
      propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
      propertyPrice: '$1,525,000',
      branding: {
        primaryColor: '#14532D',
        lightColor: '#DCFCE7',
        darkColor: '#052E16',
        accentColor: '#FBBF24',
        backgroundColor: '#F0FDF4',
      },
      instantMeeting: {
        enabled: false,
        mode: 'sticky',
        headline: 'Concierge scheduling coming soon',
        description: 'The team will enable booking after seller approval.',
        ctaLabel: 'Join waitlist',
      },
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.funnel).toMatchObject({
      name: 'Laurel Ridge Investor Launch',
      templateKey: 'instant-listing-v2',
      headline: 'A faster path into Laurel Ridge luxury inventory.',
      primaryCtaLabel: 'Reserve a private tour',
      propertyPrice: '$1,525,000',
    });
    expect(updateResponse.body.branding).toMatchObject({
      primaryColor: '#14532D',
      accentColor: '#FBBF24',
    });
    expect(updateResponse.body.instantMeeting).toMatchObject({
      enabled: false,
      mode: 'sticky',
      ctaLabel: 'Join waitlist',
    });
    expect(Array.isArray(updateResponse.body.media)).toBe(true);
    expect(Array.isArray(updateResponse.body.customFields)).toBe(true);

    const publicResponse = await request(app).get('/api/public/funnels/bennett-local-group/laurel-ridge-drive-001');

    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.funnel).toMatchObject({
      templateKey: 'instant-listing-v2',
      headline: 'A faster path into Laurel Ridge luxury inventory.',
      primaryCtaLabel: 'Reserve a private tour',
      propertyPrice: '$1,525,000',
    });
    expect(publicResponse.body.instantMeeting).toMatchObject({
      enabled: false,
      mode: 'sticky',
      ctaLabel: 'Join waitlist',
    });
    expect(Array.isArray(publicResponse.body.media)).toBe(true);
    expect(Array.isArray(publicResponse.body.customFields)).toBe(true);
  });

  it('uploads a tenant logo and returns a persistent public asset url', async () => {
    const app = createApp();
    const agent = request.agent(app);

    vi.spyOn(media, 'uploadBrandLogo').mockResolvedValue(
      'https://res.cloudinary.com/dxl0bubsq/image/upload/v1/tenant-logos/laurel-ridge-brand.png'
    );

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const uploadResponse = await agent
      .post('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/logo')
      .attach('logo', Buffer.from('fake image bytes'), 'brand-logo.png');

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.logoUrl).toBe(
      'https://res.cloudinary.com/dxl0bubsq/image/upload/v1/tenant-logos/laurel-ridge-brand.png'
    );

    const detailResponse = await agent.get('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive');

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.branding.logoUrl).toBe(uploadResponse.body.logoUrl);
  });

  it('blocks tenant access to another tenant workspace', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const response = await agent.get('/api/tenant/funnels/northshore-advisory');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Tenant access denied' });
  });

  it('returns a public funnel payload scoped by tenant slug and funnel slug', async () => {
    const app = createApp();

    const response = await request(app).get('/api/public/funnels/bennett-local-group/laurel-ridge-drive-001');

    expect(response.status).toBe(200);
    expect(response.body.funnel).toMatchObject({
      name: 'Laurel Ridge Investor Launch',
      tenantSlug: 'bennett-local-group',
      slug: 'laurel-ridge-drive',
      templateKey: 'instant-listing-v2',
      publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
      headline: 'A faster path into Laurel Ridge luxury inventory.',
      primaryCtaLabel: 'Reserve a private tour',
    });
    expect(response.body.instantMeeting).toMatchObject({
      enabled: false,
      mode: 'sticky',
      ctaLabel: 'Join waitlist',
    });
    expect(Array.isArray(response.body.media)).toBe(true);
    expect(Array.isArray(response.body.customFields)).toBe(true);
  });

  // --- Media CRUD tests ---

  it('uploads media, lists it, updates caption, reorders, and deletes it', async () => {
    const app = createApp();
    const agent = request.agent(app);

    vi.spyOn(media, 'uploadFunnelMedia').mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image/upload/v1/test-media.jpg',
      type: 'image',
      thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/v1/test-media-thumb.jpg',
      publicId: 'test-media',
    });

    vi.spyOn(media, 'deleteFunnelMedia').mockResolvedValue(undefined);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    // Upload first image
    const upload1 = await agent
      .post('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media')
      .attach('file', Buffer.from('fake image 1'), 'photo1.jpg');

    expect(upload1.status).toBe(201);
    expect(upload1.body.media).toMatchObject({
      type: 'image',
      url: 'https://res.cloudinary.com/test/image/upload/v1/test-media.jpg',
      sortOrder: 0,
      caption: null,
    });
    expect(upload1.body.media.id).toBeDefined();

    const mediaId1 = upload1.body.media.id;

    // Upload second image
    vi.spyOn(media, 'uploadFunnelMedia').mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image/upload/v1/test-media2.jpg',
      type: 'image',
      thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/v1/test-media2-thumb.jpg',
      publicId: 'test-media2',
    });

    const upload2 = await agent
      .post('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media')
      .attach('file', Buffer.from('fake image 2'), 'photo2.jpg');

    expect(upload2.status).toBe(201);
    expect(upload2.body.media.sortOrder).toBe(1);
    const mediaId2 = upload2.body.media.id;

    // List media
    const listResponse = await agent.get('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.media).toHaveLength(2);
    expect(listResponse.body.media[0].id).toBe(mediaId1);
    expect(listResponse.body.media[1].id).toBe(mediaId2);

    // Update caption
    const captionResponse = await agent
      .patch(`/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media/${mediaId1}`)
      .send({ caption: 'Front of property' });

    expect(captionResponse.status).toBe(200);
    expect(captionResponse.body.media.caption).toBe('Front of property');

    // Reorder: swap positions
    const reorderResponse = await agent
      .patch('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media/reorder')
      .send({ mediaIds: [mediaId2, mediaId1] });

    expect(reorderResponse.status).toBe(200);
    expect(reorderResponse.body.media).toHaveLength(2);
    expect(reorderResponse.body.media[0].id).toBe(mediaId2);
    expect(reorderResponse.body.media[1].id).toBe(mediaId1);

    // Delete first media
    const deleteResponse = await agent
      .delete(`/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media/${mediaId2}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ success: true });

    // Verify remaining
    const listAfterDelete = await agent.get('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media');

    expect(listAfterDelete.body.media).toHaveLength(1);
    expect(listAfterDelete.body.media[0].id).toBe(mediaId1);

    // Cleanup
    await agent.delete(`/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media/${mediaId1}`);
  });

  it('blocks media upload without auth', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media')
      .attach('file', Buffer.from('fake'), 'photo.jpg');

    expect(response.status).toBe(401);
  });

  it('blocks media access to another tenant workspace', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    const response = await agent.get('/api/tenant/funnels/northshore-advisory/harbor-view-preview/media');

    expect(response.status).toBe(403);
  });

  // --- Custom fields tests ---

  it('creates and updates custom fields through funnel patch', async () => {
    await resetDatabase();
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    // Create custom fields
    const createResponse = await agent.patch('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive').send({
      name: 'Laurel Ridge Launch',
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
      },
      instantMeeting: {
        enabled: true,
        mode: 'inline',
        headline: 'Instant Meeting is live for this funnel',
        description: 'Show buyers a booking-ready meeting block.',
        ctaLabel: 'Open instant meeting widget',
      },
      customFields: [
        { label: 'Bedrooms', value: '4', fieldType: 'number', sortOrder: 0 },
        { label: 'Lot Size', value: '0.5 acres', fieldType: 'text', sortOrder: 1 },
        { label: 'Year Built', value: '2022', fieldType: 'number', sortOrder: 2 },
      ],
    });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.customFields).toHaveLength(3);
    expect(createResponse.body.customFields[0]).toMatchObject({
      label: 'Bedrooms',
      value: '4',
      fieldType: 'number',
      sortOrder: 0,
    });
    expect(createResponse.body.customFields[1]).toMatchObject({
      label: 'Lot Size',
      value: '0.5 acres',
    });
    expect(createResponse.body.customFields[2]).toMatchObject({
      label: 'Year Built',
      value: '2022',
    });

    // Verify IDs were assigned
    const field1Id = createResponse.body.customFields[0].id;
    const field3Id = createResponse.body.customFields[2].id;
    expect(field1Id).toBeDefined();

    // Update: modify one, delete one, add one
    const updateResponse = await agent.patch('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive').send({
      name: 'Laurel Ridge Launch',
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
      },
      instantMeeting: {
        enabled: true,
        mode: 'inline',
        headline: 'Instant Meeting is live for this funnel',
        description: 'Show buyers a booking-ready meeting block.',
        ctaLabel: 'Open instant meeting widget',
      },
      customFields: [
        { id: field1Id, label: 'Bedrooms', value: '5', fieldType: 'number', sortOrder: 0 },
        // Lot Size removed
        { id: field3Id, label: 'Year Built', value: '2023', fieldType: 'number', sortOrder: 1 },
        { label: 'Garage', value: '3-car attached', fieldType: 'text', sortOrder: 2 },
      ],
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.customFields).toHaveLength(3);
    expect(updateResponse.body.customFields[0]).toMatchObject({
      id: field1Id,
      label: 'Bedrooms',
      value: '5',
    });
    expect(updateResponse.body.customFields[1]).toMatchObject({
      id: field3Id,
      label: 'Year Built',
      value: '2023',
    });
    expect(updateResponse.body.customFields[2]).toMatchObject({
      label: 'Garage',
      value: '3-car attached',
    });

    // Verify "Lot Size" was deleted from DB
    const remainingFields = await prisma.funnelCustomField.findMany({
      where: { funnel: { slug: 'laurel-ridge-drive' } },
      orderBy: { sortOrder: 'asc' },
    });
    expect(remainingFields.find((f) => f.label === 'Lot Size')).toBeUndefined();

    // Verify public endpoint also returns custom fields
    const publicResponse = await request(app).get('/api/public/funnels/bennett-local-group/laurel-ridge-drive-001');
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.customFields).toHaveLength(3);
    expect(publicResponse.body.customFields[0]).toMatchObject({ label: 'Bedrooms', value: '5' });
  });

  it('media shows in funnel detail response', async () => {
    const app = createApp();
    const agent = request.agent(app);

    vi.spyOn(media, 'uploadFunnelMedia').mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image/upload/v1/detail-test.jpg',
      type: 'image',
      thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/v1/detail-test-thumb.jpg',
      publicId: 'detail-test',
    });
    vi.spyOn(media, 'deleteFunnelMedia').mockResolvedValue(undefined);

    await agent.post('/api/auth/login').send({
      email: 'maya@bennettlocal.com',
      password: 'maya12345',
    });

    // Upload a media item
    const uploadRes = await agent
      .post('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media')
      .attach('file', Buffer.from('fake'), 'test.jpg');

    const mediaId = uploadRes.body.media.id;

    // It should appear in the funnel detail
    const detailRes = await agent.get('/api/tenant/funnels/bennett-local-group/laurel-ridge-drive');

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.media.length).toBeGreaterThanOrEqual(1);
    expect(detailRes.body.media).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: mediaId, type: 'image' }),
      ])
    );

    // Cleanup
    await agent.delete(`/api/tenant/funnels/bennett-local-group/laurel-ridge-drive/media/${mediaId}`);
  });
});
