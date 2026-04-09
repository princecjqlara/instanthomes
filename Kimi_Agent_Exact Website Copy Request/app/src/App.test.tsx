import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

interface MockApiResponse {
  status: number;
  body?: unknown;
}

function createFetchResponse(response: MockApiResponse) {
  return new Response(response.body === undefined ? null : JSON.stringify(response.body), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

let mockApiRoutes: Record<string, MockApiResponse>;

describe('App routing shell', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');

    mockApiRoutes = {
      '/api/auth/me': {
        status: 401,
        body: { error: 'Authentication required' },
      },
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? new URL(input.url).pathname : String(input);
      const response = mockApiRoutes[url];

      if (!response) {
        throw new Error(`Unhandled fetch request for ${url}`);
      }

      return createFetchResponse(response);
    });
  });

  it('renders the login experience on the login route', async () => {
    window.history.pushState({}, '', '/login');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /sign in to instant homes/i })).toBeTruthy();
    expect(screen.getByText(/admins manage tenants and tenant teams manage funnels/i)).toBeTruthy();
  });

  it('renders the promo landing page on the default logged-out route', async () => {
    render(<App />);

    expect(await screen.findByText(/offer ends in/i)).toBeTruthy();
    expect(await screen.findByText(/p699/i)).toBeTruthy();
    expect(screen.getAllByText(/\/month/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/p3499\/month/i)).toBeTruthy();
    expect(screen.getByText(/unlimited visitors/i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /join now/i })).toHaveLength(2);
    expect(screen.queryByText(/payment step/i)).toBeNull();
    expect(screen.queryByLabelText(/business or tenant name/i)).toBeNull();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /view public funnel/i })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /tenant dashboard/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /admin console/i })).toBeNull();
  });

  it('submits signup details and shows manual messenger receipt instructions with the facebook page link', async () => {
    mockApiRoutes['/api/public/payment-submissions'] = {
      status: 201,
      body: {
        submission: {
          id: 'submission_1',
          tenantName: 'Ares Prime Realty',
          ownerName: 'Ares Prime Realty',
          email: 'sales@aresprime.com',
          status: 'pending',
          supportUrl: 'https://www.facebook.com/aresmediaph',
          receiptUrl: '/uploads/payment-submissions/receipt.png',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
      },
    };

    render(<App />);

    expect(screen.queryByAltText(/gcash qr code/i)).toBeNull();
    fireEvent.click((await screen.findAllByRole('button', { name: /join now/i }))[0]);

    expect(await screen.findByAltText(/gcash qr code/i)).toBeTruthy();
    fireEvent.change(await screen.findByLabelText(/business or tenant name/i), { target: { value: 'Ares Prime Realty' } });
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Ares Prime Sales' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'sales@aresprime.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'aresprime123' } });
    fireEvent.change(screen.getByLabelText(/facebook name/i), { target: { value: 'Ares Prime Sales' } });
    expect(screen.queryByLabelText(/receipt screenshot/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /continue to messenger instructions/i }));

    expect(await screen.findByText(/details received/i)).toBeTruthy();
    expect(screen.getByText(/send your receipt manually in messenger/i)).toBeTruthy();
    expect(screen.getByText(/wait for approval to get access to your account/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /open facebook page/i }).getAttribute('href')).toBe('https://www.facebook.com/aresmediaph');
  });

  it('renders the join now modal as a scrollable dialog on small screens', async () => {
    render(<App />);

    fireEvent.click((await screen.findAllByRole('button', { name: /join now/i }))[0]);

    const dialog = await screen.findByRole('dialog', { name: /join now payment form/i });

    expect(dialog.className).toContain('overflow-y-auto');
    expect(dialog.className).toContain('max-h-');
  });

  it('renders a public funnel route with its unique share link', async () => {
    mockApiRoutes['/api/public/funnels/bennett-local-group/laurel-ridge-drive-001'] = {
      status: 200,
      body: {
        funnel: {
          id: 'funnel_laurel_ridge',
          uniqueId: 'fnl_laurel_ridge',
          tenantId: 'tenant_bennett',
          tenantName: 'Bennett Local Group',
          tenantSlug: 'bennett-local-group',
          name: 'Laurel Ridge Launch',
          slug: 'laurel-ridge-drive',
          templateKey: 'kimi-exact-v1',
          status: 'published',
          propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
          propertyPrice: '$1,485,000',
          publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
          branding: {
            primaryColor: '#00853E',
            lightColor: '#D8E8D8',
            darkColor: '#003D1F',
            accentColor: '#F7C948',
            backgroundColor: '#F9F5E9',
          },
        },
        instantMeeting: {
          enabled: true,
          mode: 'inline',
          headline: 'Instant Meeting is live for this funnel',
          description: 'Show buyers a booking-ready meeting block anywhere the template supports CTA placement.',
          ctaLabel: 'Open instant meeting widget',
        },
      },
    };

    window.history.pushState({}, '', '/bennett-local-group/laurel-ridge-drive-001');

    render(<App />);

    expect(await screen.findByText(/unique funnel link/i)).toBeTruthy();
    expect(screen.getByText('https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001')).toBeTruthy();
  });

  it('redirects unauthenticated tenant routes to login', async () => {
    window.history.pushState({}, '', '/tenant/funnels');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /sign in to instant homes/i })).toBeTruthy();
  });

  it('renders the tenant dashboard from authenticated API data', async () => {
    mockApiRoutes['/api/auth/me'] = {
      status: 200,
      body: {
        user: {
          id: 'user_maya',
          fullName: 'Maya Bennett',
          email: 'maya@bennettlocal.com',
          role: 'tenant_user',
          tenantSlug: 'bennett-local-group',
        },
      },
    };
    mockApiRoutes['/api/tenant/funnels/bennett-local-group'] = {
      status: 200,
      body: {
        tenant: {
          id: 'tenant_bennett',
          name: 'Bennett Local Group',
          slug: 'bennett-local-group',
        },
        funnels: [
          {
            id: 'funnel_laurel_ridge',
            name: 'Laurel Ridge Launch',
            slug: 'laurel-ridge-drive',
            status: 'published',
            templateKey: 'kimi-exact-v1',
            propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
            propertyPrice: '$1,485,000',
            publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
          },
        ],
      },
    };

    window.history.pushState({}, '', '/tenant/funnels');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /your funnels/i })).toBeTruthy();
    expect(await screen.findByText(/laurel ridge launch/i)).toBeTruthy();
    expect(screen.getByText('https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001')).toBeTruthy();
  });

  it('renders the admin tenant list from authenticated API data', async () => {
    mockApiRoutes['/api/auth/me'] = {
      status: 200,
      body: {
        user: {
          id: 'user_admin_1',
          fullName: 'Instant Homes Admin',
          email: 'admin@instanthomes.com',
          role: 'admin',
        },
      },
    };
    mockApiRoutes['/api/admin/tenants'] = {
      status: 200,
      body: {
        tenants: [
          {
            id: 'tenant_bennett',
            name: 'Bennett Local Group',
            slug: 'bennett-local-group',
            ownerName: 'Maya Bennett',
            ownerEmail: 'maya@bennettlocal.com',
            status: 'active',
            subscriptionEndsAt: '2026-05-09T00:00:00.000Z',
            funnels: [
              {
                id: 'funnel_laurel_ridge',
                name: 'Laurel Ridge Launch',
                slug: 'laurel-ridge-drive',
                status: 'published',
                publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
              },
            ],
          },
        ],
      },
    };
    mockApiRoutes['/api/admin/payment-submissions'] = {
      status: 200,
      body: {
        submissions: [
          {
            id: 'submission_1',
            tenantName: 'Ares Prime Realty',
            ownerName: 'Ares Prime Realty',
            email: 'sales@aresprime.com',
            status: 'pending',
            supportUrl: 'https://www.facebook.com/aresmediaph',
            receiptUrl: '/uploads/payment-submissions/receipt.png',
            createdAt: '2026-04-09T00:00:00.000Z',
          },
        ],
      },
    };

    window.history.pushState({}, '', '/admin/tenants');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /all tenants/i })).toBeTruthy();
    expect(await screen.findByText(/maya bennett/i)).toBeTruthy();
    expect(screen.getByText('https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001')).toBeTruthy();
    expect(await screen.findByRole('button', { name: /pause tenant/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /force sign out/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /delete tenant/i })).toBeTruthy();
    expect(await screen.findByText(/pending payment approvals/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /approve account/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /reject request/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /delete request/i })).toBeTruthy();
  });

  it('shows admin-visible demo credentials for users when the API provides them', async () => {
    mockApiRoutes['/api/auth/me'] = {
      status: 200,
      body: {
        user: {
          id: 'user_admin_1',
          fullName: 'Instant Homes Admin',
          email: 'admin@instanthomes.com',
          role: 'admin',
        },
      },
    };
    mockApiRoutes['/api/admin/users'] = {
      status: 200,
      body: {
        users: [
          {
            id: 'user_maya',
            fullName: 'Maya Bennett',
            email: 'maya@bennettlocal.com',
            role: 'tenant_user',
            tenantSlug: 'bennett-local-group',
            demoPassword: 'maya12345',
          },
        ],
      },
    };

    window.history.pushState({}, '', '/admin/users');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /all users/i })).toBeTruthy();
    expect(await screen.findByText(/demo password: maya12345/i)).toBeTruthy();
  });

  it('renders the tenant funnel editor with template, branding, and meeting settings', async () => {
    mockApiRoutes['/api/auth/me'] = {
      status: 200,
      body: {
        user: {
          id: 'user_maya',
          fullName: 'Maya Bennett',
          email: 'maya@bennettlocal.com',
          role: 'tenant_user',
          tenantSlug: 'bennett-local-group',
        },
      },
    };
    mockApiRoutes['/api/tenant/funnels/bennett-local-group/laurel-ridge-drive'] = {
      status: 200,
      body: {
        funnel: {
          id: 'funnel_laurel_ridge',
          uniqueId: 'fnl_laurel_ridge',
          tenantId: 'tenant_bennett',
          tenantName: 'Bennett Local Group',
          tenantSlug: 'bennett-local-group',
          name: 'Laurel Ridge Launch',
          slug: 'laurel-ridge-drive',
          templateKey: 'instant-listing-v2',
          status: 'published',
          headline: 'A faster path into Laurel Ridge luxury inventory.',
          subheadline: 'Switch templates, update branding, and keep the same unique link.',
          primaryCtaLabel: 'Reserve a private tour',
          propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
          propertyPrice: '$1,525,000',
          publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
        },
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
          mode: 'sticky',
          headline: 'Concierge scheduling coming soon',
          description: 'The team will enable booking after seller approval.',
          ctaLabel: 'Join waitlist',
        },
      },
    };

    window.history.pushState({}, '', '/tenant/funnels/laurel-ridge-drive/edit');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /edit funnel/i })).toBeTruthy();
    expect(screen.getByDisplayValue(/a faster path into laurel ridge luxury inventory/i)).toBeTruthy();
    expect(screen.getByDisplayValue(/instant-listing-v2/i)).toBeTruthy();
    expect(screen.getByText(/^Branding$/i)).toBeTruthy();
    expect(screen.getByText(/^Instant Meeting$/i)).toBeTruthy();
    expect(screen.getByText(/live preview/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /phone/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /tablet/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /laptop/i })).toBeTruthy();
    const previewRegion = screen.getByLabelText(/editor live preview/i);
    expect(previewRegion.getAttribute('data-preview-device')).toBe('laptop');
    fireEvent.click(screen.getByRole('button', { name: /phone/i }));
    expect(previewRegion.getAttribute('data-preview-device')).toBe('phone');
    fireEvent.click(screen.getByRole('button', { name: /tablet/i }));
    expect(previewRegion.getAttribute('data-preview-device')).toBe('tablet');
    fireEvent.change(screen.getByLabelText(/^Headline$/i), { target: { value: 'Preview updates before save' } });
    expect(screen.getByText(/preview updates before save/i)).toBeTruthy();
  });

  it('renders the alternate public template when a funnel switches template', async () => {
    mockApiRoutes['/api/public/funnels/bennett-local-group/laurel-ridge-drive-001'] = {
      status: 200,
      body: {
        funnel: {
          id: 'funnel_laurel_ridge',
          uniqueId: 'fnl_laurel_ridge',
          tenantId: 'tenant_bennett',
          tenantName: 'Bennett Local Group',
          tenantSlug: 'bennett-local-group',
          name: 'Laurel Ridge Investor Launch',
          slug: 'laurel-ridge-drive',
          templateKey: 'instant-listing-v2',
          status: 'published',
          headline: 'A faster path into Laurel Ridge luxury inventory.',
          subheadline: 'Switch templates, update branding, and keep the same unique link.',
          primaryCtaLabel: 'Reserve a private tour',
          propertyAddress: '1848 Laurel Ridge Drive, Austin, TX 78704',
          propertyPrice: '$1,525,000',
          publicUrl: 'https://funnels.instanthomes.dev/bennett-local-group/laurel-ridge-drive-001',
          branding: {
            primaryColor: '#14532D',
            lightColor: '#DCFCE7',
            darkColor: '#052E16',
            accentColor: '#FBBF24',
            backgroundColor: '#F0FDF4',
            logoUrl: null,
          },
        },
        instantMeeting: {
          enabled: false,
          mode: 'sticky',
          headline: 'Concierge scheduling coming soon',
          description: 'The team will enable booking after seller approval.',
          ctaLabel: 'Join waitlist',
        },
      },
    };

    window.history.pushState({}, '', '/bennett-local-group/laurel-ridge-drive-001');

    render(<App />);

    expect(await screen.findByText(/market-ready listing funnel/i)).toBeTruthy();
    expect(screen.getByText(/reserve a private tour/i)).toBeTruthy();
  });

  it('renders a branded expired page when a tenant subscription has ended', async () => {
    mockApiRoutes['/api/public/funnels/bennett-local-group/laurel-ridge-drive-001'] = {
      status: 200,
      body: {
        expired: true,
        tenant: {
          name: 'Bennett Local Group',
          slug: 'bennett-local-group',
        },
        branding: {
          primaryColor: '#00853E',
          lightColor: '#D8E8D8',
          darkColor: '#003D1F',
          accentColor: '#F7C948',
          backgroundColor: '#F9F5E9',
        },
        supportUrl: 'https://www.facebook.com/aresmediaph',
        paymentQrUrl: '/gcash-qr.jpg',
      },
    };

    window.history.pushState({}, '', '/bennett-local-group/laurel-ridge-drive-001');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /subscription expired/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /contact support/i }).getAttribute('href')).toBe('https://www.facebook.com/aresmediaph');
    expect(screen.getByText(/gcash/i)).toBeTruthy();
  });
});
