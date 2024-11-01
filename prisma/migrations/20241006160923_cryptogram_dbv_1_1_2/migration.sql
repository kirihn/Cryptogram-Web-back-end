/*
  Warnings:

  - You are about to drop the column `Login` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[UserName]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Name` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Users_Login_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "Login",
ADD COLUMN     "Name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Users_UserName_key" ON "Users"("UserName");
