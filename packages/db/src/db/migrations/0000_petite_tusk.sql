CREATE TABLE `shares` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expires_at` text,
	`read_at` text,
	`delete_after_read` integer DEFAULT false NOT NULL,
	`max_views` integer,
	`current_views` integer DEFAULT 0 NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shares_slug_unique` ON `shares` (`slug`);