-- CreateEnum
CREATE TYPE "TerritoryType" AS ENUM ('GLOBAL', 'COUNTRY', 'STATE', 'CITY');

-- CreateEnum
CREATE TYPE "TerritoryStatus" AS ENUM ('NONE', 'ACTIVE', 'COMPETITIVE', 'DOMINATED', 'WAR');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MERCADOPAGO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RankEventType" AS ENUM ('TERRITORY_TAKEN', 'USER_PASSED', 'TOP_10_ENTERED', 'PAYMENT_APPROVED', 'WAR_STARTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "publicName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "message" TEXT,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalPaidCents" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Territory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TerritoryType" NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "TerritoryStatus" NOT NULL DEFAULT 'NONE',
    "ownerId" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalAmountCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MERCADOPAGO',
    "providerPaymentId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixQrCode" TEXT,
    "pixQrCodeBase64" TEXT,
    "pixCopyPaste" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "territoryId" TEXT,
    "type" "RankEventType" NOT NULL,
    "text" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannedWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannedWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE INDEX "User_totalPoints_createdAt_idx" ON "User"("totalPoints", "createdAt");

-- CreateIndex
CREATE INDEX "User_country_state_city_idx" ON "User"("country", "state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_slug_key" ON "Territory"("slug");

-- CreateIndex
CREATE INDEX "Territory_type_country_state_city_idx" ON "Territory"("type", "country", "state", "city");

-- CreateIndex
CREATE INDEX "Territory_status_idx" ON "Territory"("status");

-- CreateIndex
CREATE INDEX "Territory_ownerId_idx" ON "Territory"("ownerId");

-- CreateIndex
CREATE INDEX "TerritoryScore_territoryId_points_createdAt_idx" ON "TerritoryScore"("territoryId", "points", "createdAt");

-- CreateIndex
CREATE INDEX "TerritoryScore_userId_idx" ON "TerritoryScore"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryScore_userId_territoryId_key" ON "TerritoryScore"("userId", "territoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_territoryId_idx" ON "Payment"("territoryId");

-- CreateIndex
CREATE INDEX "RankEvent_createdAt_idx" ON "RankEvent"("createdAt");

-- CreateIndex
CREATE INDEX "RankEvent_country_state_city_idx" ON "RankEvent"("country", "state", "city");

-- CreateIndex
CREATE INDEX "RankEvent_territoryId_idx" ON "RankEvent"("territoryId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "BannedWord_word_key" ON "BannedWord"("word");

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryScore" ADD CONSTRAINT "TerritoryScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryScore" ADD CONSTRAINT "TerritoryScore_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankEvent" ADD CONSTRAINT "RankEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankEvent" ADD CONSTRAINT "RankEvent_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
