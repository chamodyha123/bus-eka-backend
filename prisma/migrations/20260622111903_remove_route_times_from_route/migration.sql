/*
  Warnings:

  - You are about to drop the column `arrivalTime` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `Route` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[routePermitNumber]` on the table `Route` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `routePermitNumber` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime",
ADD COLUMN     "routePermitNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Route_routePermitNumber_key" ON "Route"("routePermitNumber");
