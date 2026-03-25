-- Discount enhancements (usage limit + product scoping)
ALTER TABLE "Discount" ADD COLUMN     "limitUsage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Discount" ADD COLUMN     "usageLimit" INTEGER;
ALTER TABLE "Discount" ADD COLUMN     "timesUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Discount" ADD COLUMN     "productId" INTEGER;

-- Index
CREATE INDEX "Discount_productId_idx" ON "Discount"("productId");

-- Foreign key
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Invoice enhancements (cancel/restore + payment persistence)
ALTER TYPE "InvoiceState" ADD VALUE IF NOT EXISTS 'CANCELLED';

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Invoice" ADD COLUMN     "paymentMethod" "PaymentMethod";
ALTER TABLE "Invoice" ADD COLUMN     "paymentDate" TIMESTAMP(3);
