CREATE TABLE "shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"delete_after_read" boolean DEFAULT false NOT NULL,
	"max_views" integer,
	"current_views" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "shares_slug_unique" UNIQUE("slug")
);
