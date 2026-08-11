/*
  Warnings:

  - Made the column `totalAmount` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentId" TEXT,
ALTER COLUMN "totalAmount" SET NOT NULL;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" INTEGER;
