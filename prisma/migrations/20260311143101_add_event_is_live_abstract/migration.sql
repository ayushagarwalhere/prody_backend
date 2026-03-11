-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "abstract" TEXT,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false;
