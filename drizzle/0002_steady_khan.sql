CREATE TYPE "public"."locale" AS ENUM('en', 'pl');--> statement-breakpoint
CREATE TYPE "public"."page_block_type" AS ENUM('hero', 'project_showcase', 'blog_feed', 'cta', 'text');--> statement-breakpoint
CREATE TYPE "public"."post_category" AS ENUM('TECH', 'PERSONAL');--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"type" "page_block_type" NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"data_en" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"data_pl" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"en" text NOT NULL,
	"pl" text NOT NULL,
	CONSTRAINT "translations_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_slug_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_slug_unique";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "locale" "locale" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category" "post_category" DEFAULT 'TECH' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "locale" "locale" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_blocks_page_position_idx" ON "page_blocks" USING btree ("page_id","position");--> statement-breakpoint
CREATE INDEX "translations_key_idx" ON "translations" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_locale_slug_idx" ON "posts" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_locale_slug_idx" ON "projects" USING btree ("locale","slug");