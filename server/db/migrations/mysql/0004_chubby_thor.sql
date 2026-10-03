CREATE TABLE `categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_categories_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `comment_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comment_id` int NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`reaction_type` varchar(32) NOT NULL DEFAULT 'heart',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_comment_reactions_unique` UNIQUE(`comment_id`,`user_id`,`reaction_type`)
);
--> statement-breakpoint
ALTER TABLE `post_comments` ADD `guest_name` varchar(128);--> statement-breakpoint
ALTER TABLE `post_comments` ADD `guest_email` varchar(255);--> statement-breakpoint
ALTER TABLE `posts` ADD `category_id` varchar(64);--> statement-breakpoint
ALTER TABLE `posts` ADD `featured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `allow_comments` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_comment_reactions_comment_id` ON `comment_reactions` (`comment_id`);--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_posts_category_id` ON `posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_featured` ON `posts` (`featured`);