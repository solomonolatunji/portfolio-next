CREATE TABLE `post_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`parent_id` int,
	`content` varchar(1000) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`reaction_type` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_post_reactions_unique` UNIQUE(`post_id`,`user_id`,`reaction_type`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`featured_image_url` varchar(2048),
	`published` boolean NOT NULL DEFAULT false,
	`read_time_minutes` int NOT NULL DEFAULT 3,
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_posts_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_post_comments_post_id` ON `post_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_post_comments_parent_id` ON `post_comments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_post_comments_created_at` ON `post_comments` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_post_reactions_post_id` ON `post_reactions` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_published` ON `posts` (`published`);--> statement-breakpoint
CREATE INDEX `idx_posts_created_at` ON `posts` (`created_at`);