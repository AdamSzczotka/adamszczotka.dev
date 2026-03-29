ALTER TYPE "public"."page_block_type" ADD VALUE 'rich_text';--> statement-breakpoint
ALTER TYPE "public"."page_block_type" ADD VALUE 'timeline';--> statement-breakpoint
ALTER TYPE "public"."page_block_type" ADD VALUE 'stats';--> statement-breakpoint
ALTER TYPE "public"."page_block_type" ADD VALUE 'page_header';--> statement-breakpoint
ALTER TYPE "public"."page_block_type" ADD VALUE 'faq';--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_pl" varchar(100) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "related_posts" (
	"post_id" integer NOT NULL,
	"related_post_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_pl" varchar(255) NOT NULL,
	"description_en" text,
	"description_pl" text,
	"cover_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "meta_description_en" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "meta_description_pl" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "series_id" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "series_order" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_blur_data_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "og_image" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "read_time_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "toc" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "preview_token" varchar(64);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "related_posts" ADD CONSTRAINT "related_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_posts" ADD CONSTRAINT "related_posts_related_post_id_posts_id_fk" FOREIGN KEY ("related_post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "related_posts_post_id_idx" ON "related_posts" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "related_posts_unique_idx" ON "related_posts" USING btree ("post_id","related_post_id");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "posts_category_id_idx" ON "posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "posts_series_id_idx" ON "posts" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "posts_preview_token_idx" ON "posts" USING btree ("preview_token");