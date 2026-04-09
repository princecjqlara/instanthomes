# Property Funnel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the existing product landing page into a single-property real estate sales funnel while keeping the current palette and layout style.

**Architecture:** Reuse the existing section structure and interaction patterns, but replace supplement content with one listing, one agent, and showing-focused lead capture. Keep the page as a single React entry point so the change stays content-driven instead of introducing new routing.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, lucide-react

---

### Task 1: Add a failing render test for the new property funnel

**Files:**
- Modify: `app/package.json`
- Create: `app/src/App.test.tsx`
- Create: `app/src/test/setup.ts`

**Step 1:** Add a test script and the minimal test dependencies needed to render `App` in jsdom.

**Step 2:** Write a failing test that expects property-funnel content like the address, price, and `Book a Showing` CTA.

**Step 3:** Run the test command and confirm it fails because the current page still renders supplement content.

### Task 2: Convert the global shell to real estate branding

**Files:**
- Modify: `app/src/sections/AnnouncementBar.tsx`
- Modify: `app/src/sections/Navigation.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/index.html`

**Step 1:** Replace the announcement copy with listing urgency.

**Step 2:** Replace nav links, mobile menu links, and centered branding with property-funnel anchors and agent branding.

**Step 3:** Update the document title to match the listing funnel.

### Task 3: Convert the hero/order section into the property conversion block

**Files:**
- Modify: `app/src/sections/ProductOrder.tsx`

**Step 1:** Replace product imagery and selectors with a listing gallery and showing preferences.

**Step 2:** Replace product details with address, price, home stats, value pitch, and showing CTA.

**Step 3:** Preserve the same two-column layout, rounded image cards, and stacked conversion panel feel.

### Task 4: Convert the mid-page proof sections

**Files:**
- Modify: `app/src/sections/WhyGruns.tsx`
- Modify: `app/src/sections/IngredientsScience.tsx`
- Modify: `app/src/sections/CustomerReviews.tsx`
- Modify: `app/src/sections/UsVsThem.tsx`
- Modify: `app/src/sections/PromoBanner.tsx`

**Step 1:** Turn feature tiles into standout home highlights.

**Step 2:** Turn accordions and chips into property details, upgrades, and neighborhood tags.

**Step 3:** Turn review tabs into buyer and seller proof.

**Step 4:** Turn the comparison table into a local listing comparison.

**Step 5:** Turn the promo banner into an urgency block for open house scheduling.

### Task 5: Convert the lower-funnel trust and close sections

**Files:**
- Modify: `app/src/sections/ShaunWhite.tsx`
- Modify: `app/src/sections/CTASection.tsx`
- Modify: `app/src/sections/FAQSection.tsx`
- Modify: `app/src/sections/Footer.tsx`

**Step 1:** Replace the spokesperson block with the listing agent spotlight.

**Step 2:** Replace the closing CTA with a showing-focused close.

**Step 3:** Replace the FAQ content with showing, disclosures, HOA, and offer timing answers.

**Step 4:** Replace footer sign-up, links, and legal copy with brokerage-style contact content.

### Task 6: Verify the finished funnel

**Files:**
- Modify: `app/src/index.css`

**Step 1:** Fix any pre-existing CSS ordering issues that block clean verification.

**Step 2:** Run the new test command and confirm the funnel test passes.

**Step 3:** Run the production build and confirm the site compiles successfully.
