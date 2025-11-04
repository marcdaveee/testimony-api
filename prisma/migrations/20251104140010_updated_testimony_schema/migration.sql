/*
  Warnings:

  - You are about to drop the `Testimony` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Testimony" DROP CONSTRAINT "Testimony_userId_fkey";

-- DropTable
DROP TABLE "public"."Testimony";

-- CreateTable
CREATE TABLE "testimonies" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createDate" TIMESTAMP(3) NOT NULL,
    "updateDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "testimonies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
