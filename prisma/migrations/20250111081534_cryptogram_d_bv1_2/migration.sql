-- CreateEnum
CREATE TYPE "ContactRequestsStatus" AS ENUM ('pending', 'accepted', 'blocked');

-- CreateTable
CREATE TABLE "ContactRequests" (
    "ContactRequestId" SERIAL NOT NULL,
    "UserSenderId" TEXT NOT NULL,
    "UserRecipientId" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" "ContactRequestsStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "ContactRequests_pkey" PRIMARY KEY ("ContactRequestId")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "ContactId" SERIAL NOT NULL,
    "UserId1" TEXT NOT NULL,
    "UserId2" TEXT NOT NULL,
    "ChatId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("ContactId")
);

-- AddForeignKey
ALTER TABLE "ContactRequests" ADD CONSTRAINT "ContactRequests_UserSenderId_fkey" FOREIGN KEY ("UserSenderId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRequests" ADD CONSTRAINT "ContactRequests_UserRecipientId_fkey" FOREIGN KEY ("UserRecipientId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_UserId1_fkey" FOREIGN KEY ("UserId1") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_UserId2_fkey" FOREIGN KEY ("UserId2") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;
