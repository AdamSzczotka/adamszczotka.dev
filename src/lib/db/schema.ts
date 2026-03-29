import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  pgEnum,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Better Auth tables ──────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ── Enums ───────────────────────────────────────────────────────────

export const commentStatusEnum = pgEnum("comment_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const postCategoryEnum = pgEnum("post_category", [
  "TECH",
  "PERSONAL",
]);

export const localeEnum = pgEnum("locale", ["en", "pl"]);

export const pageBlockTypeEnum = pgEnum("page_block_type", [
  "hero",
  "project_showcase",
  "blog_feed",
  "cta",
  "text",
  "rich_text",
  "timeline",
  "stats",
  "page_header",
  "faq",
]);

// ── Categories ─────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  namePl: varchar("name_pl", { length: 100 }).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Series ─────────────────────────────────────────────────────────

export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  namePl: varchar("name_pl", { length: 255 }).notNull(),
  descriptionEn: text("description_en"),
  descriptionPl: text("description_pl"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Projects ────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    locale: localeEnum("locale").default("en").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    content: text("content"),
    coverImage: text("cover_image"),
    imageUrl: text("image_url"),
    liveUrl: text("live_url"),
    githubUrl: text("github_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("projects_locale_slug_idx").on(table.locale, table.slug)],
);

// ── Posts ────────────────────────────────────────────────────────────

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    locale: localeEnum("locale").default("en").notNull(),
    category: postCategoryEnum("category").default("TECH").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    coverImage: text("cover_image"),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // New columns for CMS expansion
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    seriesId: integer("series_id").references(() => series.id, {
      onDelete: "set null",
    }),
    seriesOrder: integer("series_order"),
    coverBlurDataUrl: text("cover_blur_data_url"),
    metaDescription: text("meta_description"),
    ogImage: text("og_image"),
    readTimeMinutes: integer("read_time_minutes").default(0).notNull(),
    toc: jsonb("toc").default([]).notNull(),
    previewToken: varchar("preview_token", { length: 64 }),
    publishedAt: timestamp("published_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("posts_locale_slug_idx").on(table.locale, table.slug),
    index("posts_category_idx").on(table.category),
    index("posts_category_id_idx").on(table.categoryId),
    index("posts_series_id_idx").on(table.seriesId),
    index("posts_published_at_idx").on(table.publishedAt),
    index("posts_preview_token_idx").on(table.previewToken),
  ],
);

// ── Tags ────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const projectTags = pgTable("project_tags", {
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
});

export const postTags = pgTable("post_tags", {
  postId: integer("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
});

// ── Related Posts (junction) ────────────────────────────────────────

export const relatedPosts = pgTable(
  "related_posts",
  {
    postId: integer("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    relatedPostId: integer("related_post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    index("related_posts_post_id_idx").on(table.postId),
    uniqueIndex("related_posts_unique_idx").on(
      table.postId,
      table.relatedPostId,
    ),
  ],
);

// ── Comments ────────────────────────────────────────────────────────

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  content: text("content").notNull(),
  status: commentStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Translations (static UI strings) ────────────────────────────────

export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    en: text("en").notNull(),
    pl: text("pl").notNull(),
  },
  (table) => [index("translations_key_idx").on(table.key)],
);

// ── Pages & Page Blocks (page builder) ──────────────────────────────

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metaDescriptionEn: text("meta_description_en"),
  metaDescriptionPl: text("meta_description_pl"),
  isPublished: boolean("is_published").default(true).notNull(),
});

export const pageBlocks = pgTable(
  "page_blocks",
  {
    id: serial("id").primaryKey(),
    pageId: integer("page_id")
      .references(() => pages.id, { onDelete: "cascade" })
      .notNull(),
    type: pageBlockTypeEnum("type").notNull(),
    position: integer("position").default(0).notNull(),
    dataEn: jsonb("data_en").default({}).notNull(),
    dataPl: jsonb("data_pl").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("page_blocks_page_position_idx").on(table.pageId, table.position)],
);

// ── Relations ───────────────────────────────────────────────────────

export const pagesRelations = relations(pages, ({ many }) => ({
  blocks: many(pageBlocks),
}));

export const pageBlocksRelations = relations(pageBlocks, ({ one }) => ({
  page: one(pages, {
    fields: [pageBlocks.pageId],
    references: [pages.id],
  }),
}));

// ── Category & Series Relations ────────────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  categoryRef: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  seriesRef: one(series, {
    fields: [posts.seriesId],
    references: [series.id],
  }),
  relatedPosts: many(relatedPosts),
}));

export const relatedPostsRelations = relations(relatedPosts, ({ one }) => ({
  post: one(posts, {
    fields: [relatedPosts.postId],
    references: [posts.id],
  }),
  relatedPost: one(posts, {
    fields: [relatedPosts.relatedPostId],
    references: [posts.id],
  }),
}));
