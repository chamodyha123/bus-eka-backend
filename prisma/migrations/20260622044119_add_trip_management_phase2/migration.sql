/*
  Warnings:

  - You are about to drop the column `travelDate` on the `Trip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tripCode]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `arrivalCity` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalTime` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureCity` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTime` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripCode` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripDate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_routeId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "travelDate",
ADD COLUMN     "arrivalCity" TEXT NOT NULL,
ADD COLUMN     "arrivalTime" TEXT NOT NULL,
ADD COLUMN     "departureCity" TEXT NOT NULL,
ADD COLUMN     "departureTime" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tripCode" TEXT NOT NULL,
ADD COLUMN     "tripDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "routeId" DROP NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Trip_tripCode_key" ON "Trip"("tripCode");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
