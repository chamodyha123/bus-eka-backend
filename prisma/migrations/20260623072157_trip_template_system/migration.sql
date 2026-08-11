/*
  Warnings:

  - You are about to drop the column `status` on the `TripTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `templateCode` on the `TripTemplate` table. All the data in the column will be lost.
  - Made the column `routeId` on table `TripTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TripTemplate" DROP CONSTRAINT "TripTemplate_routeId_fkey";

-- DropIndex
DROP INDEX "TripTemplate_templateCode_key";

-- AlterTable
ALTER TABLE "TripTemplate" DROP COLUMN "status",
DROP COLUMN "templateCode",
ALTER COLUMN "routeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TripTemplate" ADD CONSTRAINT "TripTemplate_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
