-- CreateTable
CREATE TABLE `SubscriptionReminderPreference` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `kind` ENUM('seven_days', 'one_day') NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubscriptionReminderPreference_subscriptionId_idx`(`subscriptionId`),
    UNIQUE INDEX `SubscriptionReminderPreference_subscriptionId_kind_key`(`subscriptionId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubscriptionReminderPreference`
ADD CONSTRAINT `SubscriptionReminderPreference_subscriptionId_fkey`
FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
