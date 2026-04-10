import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import express from 'express';
import cookieSession from 'cookie-session';
import multer from 'multer';
import { UserRole } from '@prisma/client';
import { prisma, buildFunnelUrl, createUniqueSlug, resetDatabase, resolveFunnelSlugFromPublicSlug } from './db.js';
import * as media from './media.js';
import { z } from 'zod';
import { encrypt, decrypt } from './encryption.js';

interface SessionUser {
  id: string;
  role: UserRole;
  tenantId?: string;
  tenantSlug?: string;
  loggedInAt?: string;
}

const SUPPORT_URL = 'https://www.facebook.com/aresmediaph';
const PAYMENT_QR_URL = '/gcash-qr.jpg';
const PAYMENT_UPLOAD_DIR = join(process.cwd(), 'uploads', 'payment-submissions');

type TenantLifecycleStatus = 'active' | 'invited' | 'paused' | 'expired';
type SubmissionReviewStatus = 'pending' | 'approved' | 'rejected';

const createTenantSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateTenantStatusSchema = z.object({
  status: z.enum(['active', 'invited', 'paused', 'expired']),
  subscriptionEndsAt: z.string().datetime().nullable().optional(),
});

const paymentSubmissionSchema = z.object({
  tenantName: z.string().trim().min(1),
  ownerName: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  messengerHandle: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateFunnelSchema = z.object({
  name: z.string().trim().min(1),
  templateKey: z.string().trim().min(1),
  status: z.enum(['draft', 'published']),
  headline: z.string().trim().min(1),
  subheadline: z.string().trim().min(1),
  primaryCtaLabel: z.string().trim().min(1),
  propertyAddress: z.string().trim().min(1),
  propertyPrice: z.string().trim().min(1),
  branding: z.object({
    primaryColor: z.string().trim().min(1),
    lightColor: z.string().trim().min(1),
    darkColor: z.string().trim().min(1),
    accentColor: z.string().trim().min(1),
    backgroundColor: z.string().trim().min(1),
  }),
  instantMeeting: z.object({
    enabled: z.boolean(),
    mode: z.enum(['inline', 'sticky']),
    headline: z.string().trim().min(1),
    description: z.string().trim().min(1),
    ctaLabel: z.string().trim().min(1),
    embedType: z.enum(['booking', 'live', 'both']).default('booking'),
    showWidget: z.boolean().default(true),
    autoBooking: z.boolean().default(true),
    liveBroadcast: z.boolean().default(false),
  }),
  customFields: z.array(z.object({
    id: z.string().optional(),
    label: z.string().trim().min(1),
    value: z.string().trim(),
    fieldType: z.enum(['text', 'textarea', 'number', 'url']).default('text'),
    sortOrder: z.number().int().min(0),
  })).optional(),
});

const reorderMediaSchema = z.object({
  mediaIds: z.array(z.string().min(1)).min(1),
});

const updateMediaCaptionSchema = z.object({
  caption: z.string().trim().nullable(),
});

const upload = multer({
  storage: multer.memoryStorage(),
});

function resolveRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getEffectiveTenantStatus(tenant: { status: TenantLifecycleStatus; subscriptionEndsAt?: Date | null } | null | undefined) {
  if (!tenant) {
    return null;
  }

  if (tenant.status === 'paused' || tenant.status === 'expired') {
    return tenant.status;
  }

  if (tenant.subscriptionEndsAt && tenant.subscriptionEndsAt.getTime() < Date.now()) {
    return 'expired';
  }

  return tenant.status;
}

function getTenantStatusErrorMessage(status: TenantLifecycleStatus) {
  return status === 'paused' ? 'Tenant access is paused' : 'Tenant subscription has ended';
}

function wasForcedLogout(loggedInAt: string | undefined, forcedLogoutAt: Date | null | undefined) {
  if (!loggedInAt || !forcedLogoutAt) {
    return false;
  }

  return new Date(loggedInAt).getTime() < forcedLogoutAt.getTime();
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function savePaymentReceipt(file: Express.Multer.File) {
  await mkdir(PAYMENT_UPLOAD_DIR, { recursive: true });

  const extension = extname(file.originalname) || '.png';
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = join(PAYMENT_UPLOAD_DIR, fileName);

  await writeFile(filePath, file.buffer);

  return `/uploads/payment-submissions/${fileName}`;
}

function serializeBranding(branding: {
  primaryColor: string;
  lightColor: string;
  darkColor: string;
  accentColor: string;
  backgroundColor: string;
  logoUrl: string | null;
}) {
  return {
    primaryColor: branding.primaryColor,
    lightColor: branding.lightColor,
    darkColor: branding.darkColor,
    accentColor: branding.accentColor,
    backgroundColor: branding.backgroundColor,
    logoUrl: branding.logoUrl,
  };
}

function serializeInstantMeeting(config: {
  enabled: boolean;
  mode: 'inline' | 'sticky';
  headline: string;
  description: string;
  ctaLabel: string;
  meetingUrl?: string | null;
  widgetKey?: string | null;
  embedType?: string;
  showWidget?: boolean;
  autoBooking?: boolean;
  liveBroadcast?: boolean;
}) {
  return {
    enabled: config.enabled,
    mode: config.mode,
    headline: config.headline,
    description: config.description,
    ctaLabel: config.ctaLabel,
    meetingUrl: config.meetingUrl ?? undefined,
    widgetKey: config.widgetKey ?? undefined,
    embedType: (config.embedType ?? 'booking') as 'booking' | 'live' | 'both',
    showWidget: config.showWidget ?? true,
    autoBooking: config.autoBooking ?? true,
    liveBroadcast: config.liveBroadcast ?? false,
  };
}

function serializeMedia(mediaItem: {
  id: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
}) {
  return {
    id: mediaItem.id,
    type: mediaItem.type as 'image' | 'video',
    url: mediaItem.url,
    thumbnailUrl: mediaItem.thumbnailUrl,
    caption: mediaItem.caption,
    sortOrder: mediaItem.sortOrder,
  };
}

function serializeCustomField(field: {
  id: string;
  label: string;
  value: string;
  fieldType: string;
  sortOrder: number;
}) {
  return {
    id: field.id,
    label: field.label,
    value: field.value,
    fieldType: field.fieldType as 'text' | 'textarea' | 'number' | 'url',
    sortOrder: field.sortOrder,
  };
}

function serializeFunnelEditorPayload(funnel: {
  id: string;
  uniqueId: string;
  name: string;
  slug: string;
  templateKey: string;
  status: 'draft' | 'published';
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  propertyAddress: string;
  propertyPrice: string;
  tenant: { id: string; name: string; slug: string };
  branding: {
    primaryColor: string;
    lightColor: string;
    darkColor: string;
    accentColor: string;
    backgroundColor: string;
    logoUrl: string | null;
  } | null;
  instantMeeting: {
    enabled: boolean;
    mode: 'inline' | 'sticky';
    headline: string;
    description: string;
    ctaLabel: string;
    meetingUrl?: string | null;
    widgetKey?: string | null;
    embedType?: string;
    showWidget?: boolean;
    autoBooking?: boolean;
    liveBroadcast?: boolean;
  } | null;
  media: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    sortOrder: number;
  }>;
  customFields: Array<{
    id: string;
    label: string;
    value: string;
    fieldType: string;
    sortOrder: number;
  }>;
}) {
  return {
    funnel: {
      id: funnel.id,
      uniqueId: funnel.uniqueId,
      tenantId: funnel.tenant.id,
      tenantName: funnel.tenant.name,
      tenantSlug: funnel.tenant.slug,
      name: funnel.name,
      slug: funnel.slug,
      templateKey: funnel.templateKey,
      status: funnel.status,
      headline: funnel.headline,
      subheadline: funnel.subheadline,
      primaryCtaLabel: funnel.primaryCtaLabel,
      propertyAddress: funnel.propertyAddress,
      propertyPrice: funnel.propertyPrice,
      publicUrl: buildFunnelUrl(funnel.tenant.slug, funnel.slug),
    },
    branding: funnel.branding ? serializeBranding(funnel.branding) : null,
    instantMeeting: funnel.instantMeeting ? serializeInstantMeeting(funnel.instantMeeting) : null,
    media: funnel.media.map(serializeMedia),
    customFields: funnel.customFields.map(serializeCustomField),
  };
}

async function findTenantFunnel(tenantSlug: string, funnelSlug: string) {
  const resolvedFunnelSlug = resolveFunnelSlugFromPublicSlug(funnelSlug);

  return prisma.funnel.findFirst({
    where: {
      slug: resolvedFunnelSlug,
      tenant: { slug: tenantSlug },
    },
    include: {
      tenant: true,
      branding: true,
      instantMeeting: true,
      media: { orderBy: { sortOrder: 'asc' } },
      customFields: { orderBy: { sortOrder: 'asc' } },
    },
  });
}

function requireAuthenticated(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (!request.session?.user) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  next();
}

function requireAdmin(request: express.Request, response: express.Response, next: express.NextFunction) {
  const user = request.session?.user;
  if (!user) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role !== UserRole.admin) {
    response.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

function toUserPayload(user: {
  id: string;
  fullName: string;
  email: string;
  demoPassword?: string | null;
  role: UserRole;
  tenant?: { slug: string } | null;
}, options?: { includeDemoPassword?: boolean }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    demoPassword: options?.includeDemoPassword ? user.demoPassword ?? undefined : undefined,
    role: user.role,
    tenantSlug: user.tenant?.slug,
  };
}

function toTenantPayload(tenant: {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: TenantLifecycleStatus;
  subscriptionEndsAt: Date | null;
  forcedLogoutAt: Date | null;
  funnels: Array<{ id: string; name: string; slug: string; status: string }>;
}) {
  const effectiveStatus = getEffectiveTenantStatus(tenant) ?? tenant.status;

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    ownerName: tenant.ownerName,
    ownerEmail: tenant.ownerEmail,
    status: effectiveStatus,
    subscriptionEndsAt: tenant.subscriptionEndsAt?.toISOString(),
    forcedLogoutAt: tenant.forcedLogoutAt?.toISOString(),
    funnels: tenant.funnels.map((funnel) => ({
      id: funnel.id,
      name: funnel.name,
      slug: funnel.slug,
      status: funnel.status,
      publicUrl: buildFunnelUrl(tenant.slug, funnel.slug),
    })),
  };
}

function toPaymentSubmissionPayload(submission: {
  id: string;
  tenantName: string;
  ownerName: string;
  email: string;
  messengerHandle: string | null;
  notes: string | null;
  receiptUrl: string | null;
  status: SubmissionReviewStatus;
  approvedTenantSlug: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
}) {
  return {
    id: submission.id,
    tenantName: submission.tenantName,
    ownerName: submission.ownerName,
    email: submission.email,
    messengerHandle: submission.messengerHandle ?? undefined,
    notes: submission.notes ?? undefined,
    receiptUrl: submission.receiptUrl ?? undefined,
    status: submission.status,
    approvedTenantSlug: submission.approvedTenantSlug ?? undefined,
    supportUrl: SUPPORT_URL,
    createdAt: submission.createdAt.toISOString(),
    reviewedAt: submission.reviewedAt?.toISOString(),
  };
}

async function createTenantWorkspace(input: {
  tenantName: string;
  ownerName: string;
  email: string;
  password: string;
  status?: TenantLifecycleStatus;
  subscriptionEndsAt?: Date | null;
}) {
  const existingSlugs = (await prisma.tenant.findMany({ select: { slug: true } })).map((tenant) => tenant.slug);
  const tenantSlug = createUniqueSlug(input.tenantName, existingSlugs);
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.tenant.create({
    data: {
      name: input.tenantName,
      slug: tenantSlug,
      ownerName: input.ownerName,
      ownerEmail: input.email,
      status: input.status ?? 'active',
      subscriptionEndsAt: input.subscriptionEndsAt ?? addDays(30),
      users: {
        create: {
          fullName: input.ownerName,
          email: input.email,
          passwordHash,
          demoPassword: input.password,
          role: UserRole.tenant_user,
        },
      },
      funnels: {
        create: {
          name: `${input.tenantName} Welcome Funnel`,
          slug: 'welcome-offer',
          templateKey: 'kimi-exact-v1',
          status: 'draft',
          headline: `Welcome to ${input.tenantName}'s launch funnel`,
          subheadline: 'Customize this template, swap themes, and publish your unique funnel link.',
          primaryCtaLabel: 'Schedule a discovery call',
          propertyAddress: 'Template content pending',
          propertyPrice: 'Set asking price',
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
              enabled: false,
              mode: 'inline',
              headline: 'Instant Meeting is disabled until the tenant finishes setup',
              description: 'Enable widget automation after branding and scheduling settings are connected.',
              ctaLabel: 'Widget disabled',
            },
          },
        },
      },
    },
    include: { funnels: true },
  });
}

async function validateAuthenticatedSession(request: express.Request, response: express.Response) {
  const sessionUser = request.session?.user as SessionUser | undefined;
  if (!sessionUser) {
    response.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { tenant: true },
  });

  if (!user) {
    request.session = null;
    response.status(401).json({ error: 'Authentication required' });
    return null;
  }

  if (user.role === UserRole.tenant_user) {
    const tenantStatus = getEffectiveTenantStatus(user.tenant);

    if (wasForcedLogout(sessionUser.loggedInAt, user.tenant?.forcedLogoutAt) || tenantStatus === 'paused' || tenantStatus === 'expired') {
      request.session = null;
      response.status(401).json({ error: 'Session expired' });
      return null;
    }
  }

  return { sessionUser, user };
}

export { resetDatabase };

export function createApp() {
  const app = express();

  // Trust Vercel's reverse proxy so secure cookies work behind TLS termination
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use(
    cookieSession({
      name: 'instanthomes_session',
      keys: [process.env.SESSION_SECRET ?? 'instanthomes-dev-session-secret'],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'instanthomes-server' });
  });

  app.post('/api/auth/login', async (request, response) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid login payload', issues: parsed.error.flatten() });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { tenant: true },
    });

    if (!user) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!isValid) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.role === UserRole.tenant_user) {
      const tenantStatus = getEffectiveTenantStatus(user.tenant);

      if (tenantStatus === 'paused' || tenantStatus === 'expired') {
        response.status(403).json({ error: getTenantStatusErrorMessage(tenantStatus) });
        return;
      }
    }

    request.session!.user = {
      id: user.id,
      role: user.role,
      tenantId: user.tenantId ?? undefined,
      tenantSlug: user.tenant?.slug,
      loggedInAt: new Date().toISOString(),
    };

    response.json({ user: toUserPayload(user) });
  });

  app.get('/api/auth/me', async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);

    if (!validatedSession) {
      return;
    }

    response.json({ user: toUserPayload(validatedSession.user) });
  });

  app.post('/api/public/payment-submissions', upload.single('receipt'), async (request, response) => {
    const parsed = paymentSubmissionSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid payment submission payload', issues: parsed.error.flatten() });
      return;
    }

    const receiptUrl = request.file ? await savePaymentReceipt(request.file) : null;
    const submission = await prisma.paymentSubmission.create({
      data: {
        tenantName: parsed.data.tenantName,
        ownerName: parsed.data.ownerName,
        email: parsed.data.email,
        password: parsed.data.password,
        messengerHandle: parsed.data.messengerHandle || null,
        notes: parsed.data.notes || null,
        receiptUrl,
      },
    });

    response.status(201).json({ submission: toPaymentSubmissionPayload(submission) });
  });

  app.post('/api/auth/logout', (request, response) => {
    request.session = null;
    response.json({ success: true });
  });

  app.get('/api/admin/users', requireAdmin, async (_request, response) => {
    const users = await prisma.user.findMany({
      include: { tenant: true },
      orderBy: { email: 'asc' },
    });

    response.json({ users: users.map((user) => toUserPayload(user, { includeDemoPassword: true })) });
  });

  app.get('/api/admin/tenants', requireAdmin, async (_request, response) => {
    const tenants = await prisma.tenant.findMany({
      include: { funnels: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });

    response.json({ tenants: tenants.map(toTenantPayload) });
  });

  app.patch('/api/admin/tenants/:tenantSlug/status', requireAdmin, async (request, response) => {
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const parsed = updateTenantStatusSchema.safeParse(request.body);

    if (!tenantSlug) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid tenant status payload', issues: parsed.error.flatten() });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { funnels: { orderBy: { name: 'asc' } } },
    });

    if (!tenant) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        status: parsed.data.status,
        subscriptionEndsAt: parsed.data.subscriptionEndsAt ? new Date(parsed.data.subscriptionEndsAt) : tenant.subscriptionEndsAt,
        forcedLogoutAt: parsed.data.status === 'paused' || parsed.data.status === 'expired' ? new Date() : tenant.forcedLogoutAt,
      },
      include: { funnels: { orderBy: { name: 'asc' } } },
    });

    response.json({ tenant: toTenantPayload(updatedTenant) });
  });

  app.post('/api/admin/tenants/:tenantSlug/force-logout', requireAdmin, async (request, response) => {
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);

    if (!tenantSlug) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

    if (!tenant) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { forcedLogoutAt: new Date() },
    });

    response.json({ success: true });
  });

  app.delete('/api/admin/tenants/:tenantSlug', requireAdmin, async (request, response) => {
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);

    if (!tenantSlug) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

    if (!tenant) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    await prisma.tenant.delete({ where: { id: tenant.id } });

    response.json({ success: true });
  });

  app.get('/api/admin/payment-submissions', requireAdmin, async (_request, response) => {
    const submissions = await prisma.paymentSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    response.json({ submissions: submissions.map(toPaymentSubmissionPayload) });
  });

  app.post('/api/admin/payment-submissions/:submissionId/approve', requireAdmin, async (request, response) => {
    const submissionId = resolveRouteParam(request.params.submissionId);

    if (!submissionId) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    const submission = await prisma.paymentSubmission.findUnique({ where: { id: submissionId } });

    if (!submission) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    if (submission.status !== 'pending') {
      response.status(409).json({ error: 'Payment submission already reviewed' });
      return;
    }

    const tenant = await createTenantWorkspace({
      tenantName: submission.tenantName,
      ownerName: submission.ownerName,
      email: submission.email,
      password: submission.password,
      status: 'active',
      subscriptionEndsAt: addDays(30),
    });

    await prisma.paymentSubmission.update({
      where: { id: submission.id },
      data: {
        password: '',
        status: 'approved',
        reviewedAt: new Date(),
        approvedTenantSlug: tenant.slug,
      },
    });

    response.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        ownerEmail: tenant.ownerEmail,
        status: getEffectiveTenantStatus(tenant),
      },
      funnel: {
        id: tenant.funnels[0].id,
        slug: tenant.funnels[0].slug,
        publicUrl: buildFunnelUrl(tenant.slug, tenant.funnels[0].slug),
      },
    });
  });

  app.post('/api/admin/payment-submissions/:submissionId/reject', requireAdmin, async (request, response) => {
    const submissionId = resolveRouteParam(request.params.submissionId);

    if (!submissionId) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    const submission = await prisma.paymentSubmission.findUnique({ where: { id: submissionId } });

    if (!submission) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    if (submission.status !== 'pending') {
      response.status(409).json({ error: 'Payment submission already reviewed' });
      return;
    }

    await prisma.paymentSubmission.update({
      where: { id: submission.id },
      data: {
        password: '',
        status: 'rejected',
        reviewedAt: new Date(),
      },
    });

    response.json({ success: true });
  });

  app.delete('/api/admin/payment-submissions/:submissionId', requireAdmin, async (request, response) => {
    const submissionId = resolveRouteParam(request.params.submissionId);

    if (!submissionId) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    const submission = await prisma.paymentSubmission.findUnique({ where: { id: submissionId } });

    if (!submission) {
      response.status(404).json({ error: 'Payment submission not found' });
      return;
    }

    await prisma.paymentSubmission.delete({ where: { id: submission.id } });

    response.json({ success: true });
  });

  app.post('/api/admin/tenants', requireAdmin, async (request, response) => {
    const parsed = createTenantSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid tenant payload', issues: parsed.error.flatten() });
      return;
    }

    const tenant = await createTenantWorkspace({
      tenantName: parsed.data.name,
      ownerName: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      status: 'active',
    });

    response.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        ownerEmail: tenant.ownerEmail,
        status: getEffectiveTenantStatus(tenant),
      },
      funnel: {
        id: tenant.funnels[0].id,
        slug: tenant.funnels[0].slug,
        publicUrl: buildFunnelUrl(tenant.slug, tenant.funnels[0].slug),
      },
    });
  });

  app.get('/api/tenant/funnels/:tenantSlug/:funnelSlug', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel || !funnel.branding || !funnel.instantMeeting) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    response.json(serializeFunnelEditorPayload(funnel));
  });

  app.patch('/api/tenant/funnels/:tenantSlug/:funnelSlug', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const parsed = updateFunnelSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid funnel payload', issues: parsed.error.flatten() });
      return;
    }

    const existingFunnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!existingFunnel || !existingFunnel.branding || !existingFunnel.instantMeeting) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    // Sync custom fields if provided
    if (parsed.data.customFields) {
      const incomingFields = parsed.data.customFields;
      const existingFieldIds = existingFunnel.customFields.map((f) => f.id);
      const incomingFieldIds = incomingFields.filter((f) => f.id).map((f) => f.id as string);

      // Delete removed fields
      const toDelete = existingFieldIds.filter((id) => !incomingFieldIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.funnelCustomField.deleteMany({
          where: { id: { in: toDelete }, funnelId: existingFunnel.id },
        });
      }

      // Upsert existing and create new
      for (const field of incomingFields) {
        if (field.id && existingFieldIds.includes(field.id)) {
          await prisma.funnelCustomField.update({
            where: { id: field.id },
            data: { label: field.label, value: field.value, fieldType: field.fieldType, sortOrder: field.sortOrder },
          });
        } else {
          await prisma.funnelCustomField.create({
            data: {
              funnelId: existingFunnel.id,
              label: field.label,
              value: field.value,
              fieldType: field.fieldType,
              sortOrder: field.sortOrder,
            },
          });
        }
      }
    }

    const updatedFunnel = await prisma.funnel.update({
      where: { id: existingFunnel.id },
      data: {
        name: parsed.data.name,
        templateKey: parsed.data.templateKey,
        status: parsed.data.status,
        headline: parsed.data.headline,
        subheadline: parsed.data.subheadline,
        primaryCtaLabel: parsed.data.primaryCtaLabel,
        propertyAddress: parsed.data.propertyAddress,
        propertyPrice: parsed.data.propertyPrice,
        branding: {
          update: {
            primaryColor: parsed.data.branding.primaryColor,
            lightColor: parsed.data.branding.lightColor,
            darkColor: parsed.data.branding.darkColor,
            accentColor: parsed.data.branding.accentColor,
            backgroundColor: parsed.data.branding.backgroundColor,
          },
        },
        instantMeeting: {
          update: {
            enabled: parsed.data.instantMeeting.enabled,
            mode: parsed.data.instantMeeting.mode,
            headline: parsed.data.instantMeeting.headline,
            description: parsed.data.instantMeeting.description,
            ctaLabel: parsed.data.instantMeeting.ctaLabel,
            embedType: parsed.data.instantMeeting.embedType ?? 'booking',
            showWidget: parsed.data.instantMeeting.showWidget ?? true,
            autoBooking: parsed.data.instantMeeting.autoBooking ?? true,
            liveBroadcast: parsed.data.instantMeeting.liveBroadcast ?? false,
          },
        },
      },
      include: {
        tenant: true,
        branding: true,
        instantMeeting: true,
        media: { orderBy: { sortOrder: 'asc' } },
        customFields: { orderBy: { sortOrder: 'asc' } },
      },
    });

    response.json(serializeFunnelEditorPayload(updatedFunnel));
  });

  app.post('/api/tenant/funnels/:tenantSlug/:funnelSlug/logo', requireAuthenticated, upload.single('logo'), async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel || !funnel.branding) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (!request.file) {
      response.status(400).json({ error: 'Logo file is required' });
      return;
    }

    const logoUrl = await media.uploadBrandLogo(request.file.buffer, tenantSlug, funnelSlug, request.file.originalname);

    await prisma.funnelBranding.update({
      where: { funnelId: funnel.id },
      data: { logoUrl },
    });

    response.json({ logoUrl });
  });

  // --- Media endpoints ---

  app.get('/api/tenant/funnels/:tenantSlug/:funnelSlug/media', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    response.json({ media: funnel.media.map(serializeMedia) });
  });

  app.post('/api/tenant/funnels/:tenantSlug/:funnelSlug/media', requireAuthenticated, upload.single('file'), async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (!request.file) {
      response.status(400).json({ error: 'Media file is required' });
      return;
    }

    // File size limits: 10MB for images, 50MB for videos
    const extension = request.file.originalname.includes('.') ? request.file.originalname.slice(request.file.originalname.lastIndexOf('.') + 1).toLowerCase() : '';
    const isVideo = /^(mp4|mov|webm|avi|mkv)$/i.test(extension);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (request.file.size > maxSize) {
      response.status(400).json({ error: `File too large. Max ${isVideo ? '50MB' : '10MB'}.` });
      return;
    }

    // Max 20 media items per funnel
    if (funnel.media.length >= 20) {
      response.status(400).json({ error: 'Maximum 20 media items per funnel' });
      return;
    }

    try {
      const uploadResult = await media.uploadFunnelMedia(request.file.buffer, tenantSlug, funnelSlug, request.file.originalname);

      const nextSortOrder = funnel.media.length > 0 ? Math.max(...funnel.media.map((m) => m.sortOrder)) + 1 : 0;

      const mediaRecord = await prisma.funnelMedia.create({
        data: {
          funnelId: funnel.id,
          type: uploadResult.type,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          caption: null,
          sortOrder: nextSortOrder,
        },
      });

      response.status(201).json({ media: serializeMedia(mediaRecord) });
    } catch (error) {
      response.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  app.patch('/api/tenant/funnels/:tenantSlug/:funnelSlug/media/reorder', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const parsed = reorderMediaSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid reorder payload', issues: parsed.error.flatten() });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    // Update sort order based on array position
    for (let i = 0; i < parsed.data.mediaIds.length; i++) {
      await prisma.funnelMedia.updateMany({
        where: { id: parsed.data.mediaIds[i], funnelId: funnel.id },
        data: { sortOrder: i },
      });
    }

    const updatedMedia = await prisma.funnelMedia.findMany({
      where: { funnelId: funnel.id },
      orderBy: { sortOrder: 'asc' },
    });

    response.json({ media: updatedMedia.map(serializeMedia) });
  });

  app.patch('/api/tenant/funnels/:tenantSlug/:funnelSlug/media/:mediaId', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);
    const mediaId = resolveRouteParam(request.params.mediaId);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug || !mediaId) {
      response.status(404).json({ error: 'Media not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const parsed = updateMediaCaptionSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid caption payload', issues: parsed.error.flatten() });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    const mediaItem = funnel.media.find((m) => m.id === mediaId);

    if (!mediaItem) {
      response.status(404).json({ error: 'Media not found' });
      return;
    }

    const updated = await prisma.funnelMedia.update({
      where: { id: mediaId },
      data: { caption: parsed.data.caption },
    });

    response.json({ media: serializeMedia(updated) });
  });

  app.delete('/api/tenant/funnels/:tenantSlug/:funnelSlug/media/:mediaId', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);
    const mediaId = resolveRouteParam(request.params.mediaId);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug || !funnelSlug || !mediaId) {
      response.status(404).json({ error: 'Media not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    const mediaItem = funnel.media.find((m) => m.id === mediaId);

    if (!mediaItem) {
      response.status(404).json({ error: 'Media not found' });
      return;
    }

    // Delete from Cloudinary first, then DB
    try {
      await media.deleteFunnelMedia(mediaItem.url);
    } catch {
      // Continue even if Cloudinary delete fails
    }

    await prisma.funnelMedia.delete({ where: { id: mediaId } });

    response.json({ success: true });
  });

  app.get('/api/tenant/funnels/:tenantSlug', requireAuthenticated, async (request, response) => {
    const validatedSession = await validateAuthenticatedSession(request, response);
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);

    if (!validatedSession) {
      return;
    }

    if (!tenantSlug) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    if (validatedSession.user.role !== UserRole.admin && validatedSession.user.tenant?.slug !== tenantSlug) {
      response.status(403).json({ error: 'Tenant access denied' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { funnels: { orderBy: { name: 'asc' } } },
    });

    if (!tenant) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    response.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        ownerName: tenant.ownerName,
        ownerEmail: tenant.ownerEmail,
        status: getEffectiveTenantStatus(tenant),
        subscriptionEndsAt: tenant.subscriptionEndsAt?.toISOString(),
      },
      funnels: tenant.funnels.map((funnel) => ({
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        status: funnel.status,
        templateKey: funnel.templateKey,
        headline: funnel.headline,
        propertyAddress: funnel.propertyAddress,
        propertyPrice: funnel.propertyPrice,
        publicUrl: buildFunnelUrl(tenant.slug, funnel.slug),
      })),
    });
  });

  app.get('/api/public/funnels/:tenantSlug/:funnelSlug', async (request, response) => {
    const tenantSlug = resolveRouteParam(request.params.tenantSlug);
    const funnelSlug = resolveRouteParam(request.params.funnelSlug);

    if (!tenantSlug || !funnelSlug) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    const funnel = await findTenantFunnel(tenantSlug, funnelSlug);

    if (!funnel || !funnel.branding || !funnel.instantMeeting) {
      response.status(404).json({ error: 'Funnel not found' });
      return;
    }

    const tenantStatus = getEffectiveTenantStatus(funnel.tenant);

    if (tenantStatus === 'expired') {
      response.json({
        expired: true,
        tenant: {
          name: funnel.tenant.name,
          slug: funnel.tenant.slug,
        },
        branding: serializeBranding(funnel.branding),
        supportUrl: SUPPORT_URL,
        paymentQrUrl: PAYMENT_QR_URL,
      });
      return;
    }

    response.json({
      funnel: {
        id: funnel.id,
        uniqueId: funnel.uniqueId,
        tenantId: funnel.tenantId,
        tenantName: funnel.tenant.name,
        tenantSlug: funnel.tenant.slug,
        name: funnel.name,
        slug: funnel.slug,
        templateKey: funnel.templateKey,
        status: funnel.status,
        headline: funnel.headline,
        subheadline: funnel.subheadline,
        primaryCtaLabel: funnel.primaryCtaLabel,
        propertyAddress: funnel.propertyAddress,
        propertyPrice: funnel.propertyPrice,
        publicUrl: buildFunnelUrl(funnel.tenant.slug, funnel.slug),
        branding: serializeBranding(funnel.branding),
      },
      instantMeeting: serializeInstantMeeting(funnel.instantMeeting),
      media: funnel.media.map(serializeMedia),
      customFields: funnel.customFields.map(serializeCustomField),
    });
  });

  // ============================================================
  //  Integration API: InstantMeeting account linking
  // ============================================================

  const IM_API_URL = process.env.INSTANT_MEETING_API_URL ?? 'http://localhost:3000';
  const isImConfigured = IM_API_URL && !IM_API_URL.includes('localhost');

  // GET /api/integrations/instant-meeting/status — check link status
  app.get('/api/integrations/instant-meeting/status', requireAuthenticated, async (request, response) => {
    const sessionResult = await validateAuthenticatedSession(request, response);

    if (!sessionResult) {
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionResult.sessionUser.id },
    });

    if (!user) {
      response.status(404).json({ error: 'User not found' });
      return;
    }

    response.json({
      linked: user.imLinked,
      imUsername: user.imUsername ?? undefined,
      imEmail: user.imEmail ?? undefined,
      imUserId: user.imUserId ?? undefined,
      linkedAt: user.imLinkedAt?.toISOString(),
      features: {
        meetingEmbed: user.imLinked,
        websiteWidget: user.imLinked,
        liveBroadcast: user.imLinked,
        visitorPresence: user.imLinked,
      },
    });
  });

  // POST /api/integrations/instant-meeting/link — link IM account
  app.post('/api/integrations/instant-meeting/link', requireAuthenticated, async (request, response) => {
    const sessionResult = await validateAuthenticatedSession(request, response);

    if (!sessionResult) {
      return;
    }

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid credentials payload', issues: parsed.error.flatten() });
      return;
    }

    // Get tenant info for registration with IM
    const user = await prisma.user.findUnique({
      where: { id: sessionResult.sessionUser.id },
      include: { tenant: true },
    });

    if (!user) {
      response.status(404).json({ error: 'User not found' });
      return;
    }

    // Helper: perform local-link when IM validate endpoint is unavailable
    async function performLocalLink(targetUser: typeof user, email: string) {
      const localUserId = `im_${randomUUID()}`;
      const localWidgetKey = `pk_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
      const localUsername = email.split('@')[0].replace(/[^a-z0-9-]/gi, '-').toLowerCase();

      const updatedUser = await prisma.user.update({
        where: { id: targetUser!.id },
        data: {
          imLinked: true,
          imUserId: localUserId,
          imUsername: localUsername,
          imEmail: email,
          imWidgetKey: localWidgetKey,
          imAccessToken: null,
          imRefreshToken: null,
          imTokenExpiresAt: null,
          imLinkedAt: new Date(),
          imScopes: ['widget', 'meetings', 'live', 'analytics'],
        },
      });

      await prisma.integrationLog.create({
        data: {
          userId: targetUser!.id,
          platform: 'instant_meeting',
          action: 'link',
          details: {
            imUserId: localUserId,
            imUsername: localUsername,
            imEmail: email,
            mode: 'local_fallback',
          },
        },
      });

      return updatedUser;
    }

    // Try remote validation first, fall back to local link if IM service
    // doesn't have the integration endpoint yet (404) or is unreachable.
    try {
      let usedFallback = false;

      if (isImConfigured) {
        try {
          const imResponse = await fetch(`${IM_API_URL}/api/integrations/ih/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: parsed.data.email,
              password: parsed.data.password,
              ihTenantId: user.tenant?.id ?? user.tenantId,
              ihTenantSlug: user.tenant?.slug ?? sessionResult.sessionUser.tenantSlug,
              ihTenantName: user.tenant?.name,
            }),
          });

          if (imResponse.ok) {
            // Remote validation succeeded — use IM's response
            const imData = (await imResponse.json()) as {
              userId: string;
              widgetKey: string;
              username: string;
              email: string;
              accessToken?: string;
              refreshToken?: string;
            };

            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: {
                imLinked: true,
                imUserId: imData.userId,
                imUsername: imData.username,
                imEmail: imData.email,
                imWidgetKey: imData.widgetKey,
                imAccessToken: imData.accessToken ? encrypt(imData.accessToken) : null,
                imRefreshToken: imData.refreshToken ? encrypt(imData.refreshToken) : null,
                imTokenExpiresAt: null,
                imLinkedAt: new Date(),
                imScopes: ['widget', 'meetings', 'live', 'analytics'],
              },
            });

            await prisma.integrationLog.create({
              data: {
                userId: user.id,
                platform: 'instant_meeting',
                action: 'link',
                details: {
                  imUserId: imData.userId,
                  imUsername: imData.username,
                  imEmail: imData.email,
                  mode: 'remote',
                },
              },
            });

            response.json({
              linked: true,
              imUsername: updatedUser.imUsername,
              imEmail: updatedUser.imEmail,
              imUserId: updatedUser.imUserId,
              linkedAt: updatedUser.imLinkedAt?.toISOString(),
              features: {
                meetingEmbed: true,
                websiteWidget: true,
                liveBroadcast: true,
                visitorPresence: true,
              },
            });
            return;
          } else if (imResponse.status === 404) {
            // IM service doesn't have the validate endpoint yet — fall back to local link
            console.info('IM validate endpoint returned 404 — using local-link fallback');
            usedFallback = true;
          } else if (imResponse.status === 401 || imResponse.status === 403) {
            // Genuine credential rejection from IM — do NOT fall back
            const errorData = await imResponse.json().catch(() => ({}));
            response.status(imResponse.status).json({
              error: (errorData as { error?: string }).error ?? 'Invalid InstantMeeting credentials',
            });
            return;
          } else {
            // Other server errors (500, etc.) — fall back to local link
            console.warn(`IM validate endpoint returned ${imResponse.status} — using local-link fallback`);
            usedFallback = true;
          }
        } catch (fetchError) {
          // Network error / IM service unreachable — fall back to local link
          console.warn('IM service unreachable — using local-link fallback:', fetchError);
          usedFallback = true;
        }
      } else {
        // IM not configured at all — use local link
        usedFallback = true;
      }

      if (usedFallback) {
        const updatedUser = await performLocalLink(user, parsed.data.email);

        response.json({
          linked: true,
          imUsername: updatedUser.imUsername,
          imEmail: updatedUser.imEmail,
          imUserId: updatedUser.imUserId,
          linkedAt: updatedUser.imLinkedAt?.toISOString(),
          features: {
            meetingEmbed: true,
            websiteWidget: true,
            liveBroadcast: true,
            visitorPresence: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to link InstantMeeting account:', error);
      response.status(502).json({ error: 'Unable to connect to InstantMeeting service' });
    }
  });

  // POST /api/integrations/instant-meeting/disconnect — unlink accounts
  app.post('/api/integrations/instant-meeting/disconnect', requireAuthenticated, async (request, response) => {
    const sessionResult = await validateAuthenticatedSession(request, response);

    if (!sessionResult) {
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionResult.sessionUser.id },
    });

    if (!user || !user.imLinked) {
      response.status(400).json({ error: 'No InstantMeeting account is linked' });
      return;
    }

    // Notify IM to clean up their side
    if (isImConfigured) {
    try {
      await fetch(`${IM_API_URL}/api/integrations/ih/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imUserId: user.imUserId }),
      });
    } catch (error) {
      console.error('Failed to notify IM of disconnect:', error);
      // Continue with local cleanup even if IM notification fails
    }
    }

    // Clear IM fields on user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        imLinked: false,
        imUserId: null,
        imUsername: null,
        imEmail: null,
        imWidgetKey: null,
        imAccessToken: null,
        imRefreshToken: null,
        imTokenExpiresAt: null,
        imLinkedAt: null,
        imScopes: [],
      },
    });

    // Also clear widgetKey from all funnels belonging to this user's tenant
    if (user.tenantId) {
      const tenantFunnels = await prisma.funnel.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true },
      });

      for (const funnel of tenantFunnels) {
        await prisma.instantMeetingConfig.updateMany({
          where: { funnelId: funnel.id },
          data: { widgetKey: null, meetingUrl: null },
        });
      }
    }

    // Log the disconnect event
    await prisma.integrationLog.create({
      data: {
        userId: user.id,
        platform: 'instant_meeting',
        action: 'unlink',
        details: { imUserId: user.imUserId },
      },
    });

    response.json({ success: true });
  });

  // POST /api/integrations/instant-meeting/refresh — refresh connection
  app.post('/api/integrations/instant-meeting/refresh', requireAuthenticated, async (request, response) => {
    const sessionResult = await validateAuthenticatedSession(request, response);

    if (!sessionResult) {
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionResult.sessionUser.id },
      include: { tenant: true },
    });

    if (!user || !user.imLinked || !user.imUserId) {
      response.status(400).json({ error: 'No InstantMeeting account is linked' });
      return;
    }

    if (!isImConfigured) {
      response.json({
        linked: user.imLinked,
        imUsername: user.imUsername ?? undefined,
        imEmail: user.imEmail ?? undefined,
        imUserId: user.imUserId ?? undefined,
        linkedAt: user.imLinkedAt?.toISOString(),
        features: {
          meetingEmbed: user.imLinked,
          websiteWidget: user.imLinked,
          liveBroadcast: user.imLinked,
          visitorPresence: user.imLinked,
        },
      });
      return;
    }

    // Check status with IM — gracefully fall back to local data if IM status endpoint
    // doesn't exist yet (404) or is unreachable.
    try {
      const imResponse = await fetch(`${IM_API_URL}/api/integrations/ih/status?userId=${user.imUserId}`);

      if (imResponse.status === 404) {
        // IM status endpoint doesn't exist yet — return local data
        console.info('IM status endpoint returned 404 — using local data');
        response.json({
          linked: user.imLinked,
          imUsername: user.imUsername ?? undefined,
          imEmail: user.imEmail ?? undefined,
          imUserId: user.imUserId ?? undefined,
          linkedAt: user.imLinkedAt?.toISOString(),
          features: {
            meetingEmbed: user.imLinked,
            websiteWidget: user.imLinked,
            liveBroadcast: user.imLinked,
            visitorPresence: user.imLinked,
          },
        });
        return;
      }

      if (!imResponse.ok) {
        response.status(502).json({ error: 'Unable to verify InstantMeeting connection' });
        return;
      }

      const imData = (await imResponse.json()) as {
        connected: boolean;
        username?: string;
        email?: string;
        widgetKey?: string;
      };

      if (!imData.connected) {
        // IM says we're not connected, clean up locally
        await prisma.user.update({
          where: { id: user.id },
          data: {
            imLinked: false,
            imUserId: null,
            imUsername: null,
            imEmail: null,
            imWidgetKey: null,
            imAccessToken: null,
            imRefreshToken: null,
          },
        });

        response.json({
          linked: false,
          features: { meetingEmbed: false, websiteWidget: false, liveBroadcast: false, visitorPresence: false },
        });
        return;
      }

      // Sync latest data from IM
      await prisma.user.update({
        where: { id: user.id },
        data: {
          imUsername: imData.username ?? user.imUsername,
          imEmail: imData.email ?? user.imEmail,
          imWidgetKey: imData.widgetKey ?? user.imWidgetKey,
        },
      });

      response.json({
        linked: true,
        imUsername: imData.username ?? user.imUsername,
        imEmail: imData.email ?? user.imEmail,
        imUserId: user.imUserId,
        linkedAt: user.imLinkedAt?.toISOString(),
        features: {
          meetingEmbed: true,
          websiteWidget: true,
          liveBroadcast: true,
          visitorPresence: true,
        },
      });
    } catch (error) {
      // Network error — fall back to local data instead of erroring
      console.warn('IM service unreachable during refresh — using local data:', error);
      response.json({
        linked: user.imLinked,
        imUsername: user.imUsername ?? undefined,
        imEmail: user.imEmail ?? undefined,
        imUserId: user.imUserId ?? undefined,
        linkedAt: user.imLinkedAt?.toISOString(),
        features: {
          meetingEmbed: user.imLinked,
          websiteWidget: user.imLinked,
          liveBroadcast: user.imLinked,
          visitorPresence: user.imLinked,
        },
      });
    }
  });

  // POST /api/integrations/instant-meeting/webhook — receive events from IM
  app.post('/api/integrations/instant-meeting/webhook', async (request, response) => {
    // Verify HMAC signature
    const signature = request.headers['x-im-signature'] as string | undefined;
    const webhookSecret = process.env.WEBHOOK_SECRET ?? 'instanthomes-dev-webhook-secret';

    if (signature) {
      const { createHmac } = await import('node:crypto');
      const expectedSig = `sha256=${createHmac('sha256', webhookSecret).update(JSON.stringify(request.body)).digest('hex')}`;

      if (signature !== expectedSig) {
        response.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const body = request.body as { type: string; payload: Record<string, unknown>; imUserId?: string };

    if (!body.type) {
      response.status(400).json({ error: 'Missing event type' });
      return;
    }

    // Find the user associated with this IM account
    const targetUser = body.imUserId
      ? await prisma.user.findFirst({ where: { imUserId: body.imUserId as string } })
      : null;

    if (targetUser) {
      await prisma.integrationLog.create({
        data: {
          userId: targetUser.id,
          platform: 'instant_meeting',
          action: `webhook:${body.type}`,
          details: body.payload as object,
        },
      });
    }

    // Handle specific event types
    if (body.type === 'account.unlinked' && targetUser) {
      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          imLinked: false,
          imUserId: null,
          imUsername: null,
          imEmail: null,
          imWidgetKey: null,
          imAccessToken: null,
          imRefreshToken: null,
        },
      });
    }

    response.json({ received: true });
  });

  return app;
}
