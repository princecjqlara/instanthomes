-- =====================================================
-- InstantHomes: Prisma Migration SQL
-- Run this in Supabase SQL Editor for the IH database
-- (project: jmibkexcozkflrtctdid)
-- =====================================================

-- 1. Add IM integration fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imLinked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imUserId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imUsername" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imWidgetKey" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imLinkedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imScopes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Add new fields to InstantMeetingConfig table
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "meetingUrl" TEXT;
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "widgetKey" TEXT;
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "embedType" TEXT NOT NULL DEFAULT 'booking';
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "showWidget" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "autoBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "InstantMeetingConfig" ADD COLUMN IF NOT EXISTS "liveBroadcast" BOOLEAN NOT NULL DEFAULT false;

-- 3. Create IntegrationLog table
CREATE TABLE IF NOT EXISTS "IntegrationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- 4. Add index and foreign key
CREATE INDEX IF NOT EXISTS "IntegrationLog_userId_platform_createdAt_idx"
    ON "IntegrationLog"("userId", "platform", "createdAt");

ALTER TABLE "IntegrationLog"
    ADD CONSTRAINT "IntegrationLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

SELECT 'InstantHomes migration completed!' as message;
