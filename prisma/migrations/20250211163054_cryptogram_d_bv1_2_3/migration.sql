/*
  Warnings:

  - Added the required column `StickerPath` to the `Stickers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stickers" ADD COLUMN     "StickerPath" TEXT NOT NULL;
