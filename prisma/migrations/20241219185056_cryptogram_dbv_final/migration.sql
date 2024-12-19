-- CreateTable
CREATE TABLE "Users" (
    "UserId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "AvatarPath" TEXT NOT NULL DEFAULT '/static/defaults/userAvatars/defaultUserAvatar.jpg',
    "UserName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Language" TEXT NOT NULL DEFAULT 'ru',
    "Role" INTEGER NOT NULL DEFAULT 1,
    "PasswordHash" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Chats" (
    "ChatId" SERIAL NOT NULL,
    "ChatName" TEXT NOT NULL,
    "IsGroup" BOOLEAN NOT NULL,
    "KeyHash" TEXT NOT NULL,
    "AvatarPath" TEXT NOT NULL DEFAULT '/static/defaults/chatAvatars/defaultChatAvatar.png',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("ChatId")
);

-- CreateTable
CREATE TABLE "Messages" (
    "MessageId" SERIAL NOT NULL,
    "ChatId" INTEGER NOT NULL,
    "SenderId" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "MessageType" TEXT NOT NULL,
    "IsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("MessageId")
);

-- CreateTable
CREATE TABLE "ChatMembers" (
    "UserId" TEXT NOT NULL,
    "ChatMemberId" SERIAL NOT NULL,
    "Role" INTEGER NOT NULL,
    "ChatId" INTEGER NOT NULL,
    "IsFixed" BOOLEAN NOT NULL DEFAULT false,
    "JoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMembers_pkey" PRIMARY KEY ("ChatMemberId")
);

-- CreateTable
CREATE TABLE "StickerGroup" (
    "StickerGroupId" SERIAL NOT NULL,
    "GroupName" TEXT NOT NULL,

    CONSTRAINT "StickerGroup_pkey" PRIMARY KEY ("StickerGroupId")
);

-- CreateTable
CREATE TABLE "Stickers" (
    "StickerId" SERIAL NOT NULL,
    "StickerGroupId" INTEGER NOT NULL,

    CONSTRAINT "Stickers_pkey" PRIMARY KEY ("StickerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_UserName_key" ON "Users"("UserName");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_ChatId_fkey" FOREIGN KEY ("ChatId") REFERENCES "Chats"("ChatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_SenderId_fkey" FOREIGN KEY ("SenderId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_ChatId_fkey" FOREIGN KEY ("ChatId") REFERENCES "Chats"("ChatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stickers" ADD CONSTRAINT "Stickers_StickerGroupId_fkey" FOREIGN KEY ("StickerGroupId") REFERENCES "StickerGroup"("StickerGroupId") ON DELETE RESTRICT ON UPDATE CASCADE;
