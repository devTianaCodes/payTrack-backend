-- AlterTable
ALTER TABLE `Subscription` MODIFY `status` ENUM('active', 'cancelled', 'archived') NOT NULL DEFAULT 'active';
