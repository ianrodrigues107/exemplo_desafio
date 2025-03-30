/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `participantCount` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleDate` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `scheduledDate` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "deletedAt",
DROP COLUMN "participantCount",
DROP COLUMN "scheduleDate",
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL;
