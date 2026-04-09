# Subscription Sales Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add tenant subscription lifecycle controls, manual payment-proof intake, and a high-converting promo landing page with receipt instructions.

**Architecture:** Extend the Prisma data model with tenant lifecycle and payment submission entities, enforce tenant access rules in the Express API, and expose the new admin and public experiences through the React app. Keep payment handling manual: the app stores proof and shows instructions plus a clickable Facebook page link instead of attempting Messenger automation.

**Tech Stack:** Prisma, Express, React, React Router, Vite, Vitest, Testing Library

---

### Task 1: Extend tenant and payment data model

**Files:**
- Modify: `server/prisma/schema.prisma`
- Modify: `server/src/db.ts`
- Test: `server/src/test/app.test.ts`

**Step 1: Write the failing test**

Add server tests that expect:
- admin tenant list returns lifecycle fields
- admin can pause and delete tenants
- expired tenants are blocked from login
- public funnel requests for expired tenants return an expired payload instead of funnel content

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/app.test.ts`
Expected: FAIL because lifecycle fields and actions do not exist yet.

**Step 3: Write minimal implementation**

Add to Prisma:
- `TenantStatus`: `active`, `paused`, `expired`
- `subscriptionEndsAt`, `forcedLogoutAt`
- `PaymentSubmission` model with manual-review fields

Update seeding so existing demo tenants get sensible lifecycle defaults.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/app.test.ts`
Expected: PASS for the new lifecycle cases.

### Task 2: Add admin tenant lifecycle actions

**Files:**
- Modify: `server/src/app.ts`
- Modify: `app/src/lib/api.ts`
- Modify: `app/src/types/api.ts`
- Modify: `app/src/pages/admin/AdminTenantsPage.tsx`
- Test: `server/src/test/app.test.ts`
- Test: `app/src/App.test.tsx`

**Step 1: Write the failing test**

Add tests for:
- pause tenant
- resume tenant
- force logout tenant owner
- permanent delete tenant

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/app.test.ts`
Expected: FAIL because admin lifecycle endpoints do not exist.

**Step 3: Write minimal implementation**

Add admin routes:
- `PATCH /api/admin/tenants/:tenantId/status`
- `POST /api/admin/tenants/:tenantId/force-logout`
- `DELETE /api/admin/tenants/:tenantId`

Expose matching frontend API helpers and admin action buttons with refresh behavior.

**Step 4: Run tests to verify they pass**

Run:
- `npm test -- src/test/app.test.ts`
- `npm test -- src/App.test.tsx`

Expected: PASS.

### Task 3: Enforce login and public funnel gating

**Files:**
- Modify: `server/src/app.ts`
- Modify: `app/src/pages/public/FunnelPage.tsx`
- Modify: `app/src/pages/auth/LoginPage.tsx`
- Test: `server/src/test/app.test.ts`
- Test: `app/src/App.test.tsx`

**Step 1: Write the failing test**

Add tests for:
- paused tenant login rejected
- expired tenant login rejected
- paused tenant public funnel still works
- expired tenant public funnel shows support/expiry content

**Step 2: Run test to verify it fails**

Run server and app tests for those files.

**Step 3: Write minimal implementation**

During login, reject non-active tenant users with status-specific messaging. During public funnel fetch, return an `expired` page payload for expired tenants while allowing paused tenants to remain public.

**Step 4: Run tests to verify it passes**

Run:
- `npm test -- src/test/app.test.ts`
- `npm test -- src/App.test.tsx`

Expected: PASS.

### Task 4: Add manual proof submission flow

**Files:**
- Modify: `server/src/app.ts`
- Modify: `app/src/lib/api.ts`
- Modify: `app/src/types/api.ts`
- Modify: `app/src/pages/HomePage.tsx`
- Test: `server/src/test/app.test.ts`
- Test: `app/src/App.test.tsx`

**Step 1: Write the failing test**

Add tests for public receipt submission and success-state instructions.

**Step 2: Run test to verify it fails**

Run targeted tests and confirm the missing public payment submission behavior.

**Step 3: Write minimal implementation**

Add public endpoint for payment proof submission using multipart form data. Store buyer details and receipt path in `PaymentSubmission`. Return a manual-review success response with Messenger instructions.

**Step 4: Run tests to verify it passes**

Run targeted server and app tests.

### Task 5: Rebuild the landing page as a promo sales page

**Files:**
- Modify: `app/src/pages/HomePage.tsx`
- Modify: `app/src/pages/auth/LoginPage.tsx` if needed for consistent copy
- Add/Modify: `app/public/*` for QR asset if needed
- Test: `app/src/App.test.tsx`

**Step 1: Write the failing test**

Add app tests expecting:
- promo pricing `P699/month`
- struck-through `P3499/month`
- perks list
- per-user three-day countdown container
- slots-left copy
- Messenger link
- public payment proof flow

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the current homepage is not the sales page.

**Step 3: Write minimal implementation**

Replace the simple homepage with a polished promo page that includes:
- strong hero and pricing
- expanded package inclusions
- GCash QR section
- upload form
- post-submit instructions
- per-user countdown using persisted client state

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS.

### Task 6: Verify integrated behavior

**Files:**
- Verify: `server/src/test/app.test.ts`
- Verify: `app/src/App.test.tsx`

**Step 1: Run full targeted verification**

Run:
- `npm test -- src/test/app.test.ts`
- `npm test -- src/App.test.tsx`

Expected: all tests PASS.

**Step 2: Sync Prisma schema to dev DB**

Run: `npm run db:push`
Expected: database synced.

**Step 3: Relaunch local dev servers**

Run:
- `npm run dev` in `server`
- `npm run dev` in `app`

Expected: backend on `http://localhost:4000`, frontend on `http://localhost:5173`.
