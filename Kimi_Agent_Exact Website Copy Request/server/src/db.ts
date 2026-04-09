import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function buildPublicFunnelSlug(funnelSlug: string) {
  return `${funnelSlug}-001`;
}

export function resolveFunnelSlugFromPublicSlug(publicFunnelSlug: string) {
  return publicFunnelSlug.replace(/-\d+$/, '');
}

export function buildFunnelUrl(tenantSlug: string, funnelSlug: string) {
  return `https://funnels.instanthomes.dev/${tenantSlug}/${buildPublicFunnelSlug(funnelSlug)}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
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

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function seedDatabase() {
  const adminEmail = 'admin@instanthomes.com';
  const adminPassword = 'admin123';
  const existingUsers = await prisma.user.count();
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.admin },
    select: { id: true },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        demoPassword: adminPassword,
      },
    });
  }

  if (existingUsers > 0) {
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          fullName: 'Instant Homes Admin',
          email: adminEmail,
          passwordHash: adminHash,
          demoPassword: adminPassword,
          role: UserRole.admin,
        },
      });
    }

    return;
  }

  const mayaHash = await bcrypt.hash('maya12345', 10);
  const liamHash = await bcrypt.hash('liam12345', 10);

  const bennettTenant = await prisma.tenant.create({
    data: {
      name: 'Bennett Local Group',
      slug: 'bennett-local-group',
      ownerName: 'Maya Bennett',
      ownerEmail: 'maya@bennettlocal.com',
      status: 'active',
      subscriptionEndsAt: addDays(30),
    },
  });

  const northshoreTenant = await prisma.tenant.create({
    data: {
      name: 'Northshore Advisory',
      slug: 'northshore-advisory',
      ownerName: 'Liam Porter',
      ownerEmail: 'liam@northshoreadvisory.com',
      status: 'invited',
      subscriptionEndsAt: addDays(14),
    },
  });

  await prisma.user.createMany({
    data: [
      {
        fullName: 'Instant Homes Admin',
        email: adminEmail,
        passwordHash: adminHash,
        demoPassword: adminPassword,
        role: UserRole.admin,
      },
      {
        fullName: 'Maya Bennett',
        email: 'maya@bennettlocal.com',
        passwordHash: mayaHash,
        demoPassword: 'maya12345',
        role: UserRole.tenant_user,
        tenantId: bennettTenant.id,
      },
      {
        fullName: 'Liam Porter',
        email: 'liam@northshoreadvisory.com',
        passwordHash: liamHash,
        demoPassword: 'liam12345',
        role: UserRole.tenant_user,
        tenantId: northshoreTenant.id,
      },
    ],
  });

  await prisma.funnel.create({
    data: {
      uniqueId: 'fnl_laurel_ridge',
      tenantId: bennettTenant.id,
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
        create: {
          primaryColor: '#00853E',
          lightColor: '#D8E8D8',
          darkColor: '#003D1F',
          accentColor: '#F7C948',
          backgroundColor: '#F9F5E9',
          logoUrl: null,
        },
      },
      instantMeeting: {
        create: {
          enabled: true,
          mode: 'inline',
          headline: 'Instant Meeting is live for this funnel',
          description: 'Show buyers a booking-ready meeting block anywhere the template supports CTA placement.',
          ctaLabel: 'Open instant meeting widget',
        },
      },
    },
  });

  await prisma.funnel.create({
    data: {
      uniqueId: 'fnl_modern_oaks',
      tenantId: bennettTenant.id,
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
        create: {
          primaryColor: '#0B5FFF',
          lightColor: '#DBE7FF',
          darkColor: '#0E214D',
          accentColor: '#FFD166',
          backgroundColor: '#F5F9FF',
          logoUrl: null,
        },
      },
      instantMeeting: {
        create: {
          enabled: true,
          mode: 'sticky',
          headline: 'Meeting widget ready for launch day',
          description: 'Keep the scheduling flow armed before publishing the next property drop.',
          ctaLabel: 'Preview meeting CTA',
        },
      },
    },
  });

  await prisma.funnel.create({
    data: {
      uniqueId: 'fnl_harbor_view',
      tenantId: northshoreTenant.id,
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
        create: {
          primaryColor: '#14532D',
          lightColor: '#DCFCE7',
          darkColor: '#052E16',
          accentColor: '#FBBF24',
          backgroundColor: '#F0FDF4',
          logoUrl: null,
        },
      },
      instantMeeting: {
        create: {
          enabled: false,
          mode: 'inline',
          headline: 'Widget disabled',
          description: 'Activate when the client is ready to accept meetings.',
          ctaLabel: 'Widget disabled',
        },
      },
    },
  });
}

export async function resetDatabase() {
  await prisma.funnelCustomField.deleteMany();
  await prisma.funnelMedia.deleteMany();
  await prisma.paymentSubmission.deleteMany();
  await prisma.instantMeetingConfig.deleteMany();
  await prisma.funnelBranding.deleteMany();
  await prisma.funnel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await seedDatabase();
}
