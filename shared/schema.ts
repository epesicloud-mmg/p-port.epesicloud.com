import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workspaces table
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workspace members table
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"), // owner, admin, member
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // website, portal, intranet, dashboard, app
  slug: varchar("slug", { length: 255 }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  themeId: uuid("theme_id").references(() => themes.id),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, published, archived
  customDomain: varchar("custom_domain"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sites table
export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  isDefault: boolean("is_default").default(false),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pages table
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  siteId: uuid("site_id").references(() => sites.id).notNull(),
  parentId: uuid("parent_id"),
  layout: jsonb("layout"), // Grid layout configuration
  settings: jsonb("settings"),
  isPublished: boolean("is_published").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portlets table
export const portlets = pgTable("portlets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // content-display, navigation, form, media-gallery, user-profile
  category: varchar("category", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  config: jsonb("config"), // Default configuration
  isBuiltIn: boolean("is_built_in").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Page portlets table (portlets placed on pages)
export const pagePortlets = pgTable("page_portlets", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").references(() => pages.id).notNull(),
  portletId: uuid("portlet_id").references(() => portlets.id).notNull(),
  position: jsonb("position"), // { x, y, width, height }
  config: jsonb("config"), // Instance-specific configuration
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Themes table
export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  workspaceId: uuid("workspace_id").references(() => workspaces.id),
  config: jsonb("config"), // CSS variables, fonts, colors
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assets table
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // image, video, document, audio
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  folderId: uuid("folder_id"),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset folders table
export const assetFolders = pgTable("asset_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service builder schemas table
export const serviceSchemas = pgTable("service_schemas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  tableName: varchar("table_name", { length: 255 }).notNull(),
  schema: jsonb("schema").notNull(), // JSON schema definition
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  uploadedAssets: many(assets),
  activityLogs: many(activityLogs),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  projects: many(projects),
  themes: many(themes),
  assets: many(assets),
  assetFolders: many(assetFolders),
  serviceSchemas: many(serviceSchemas),
  activityLogs: many(activityLogs),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  theme: one(themes, { fields: [projects.themeId], references: [themes.id] }),
  sites: many(sites),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  project: one(projects, { fields: [sites.projectId], references: [projects.id] }),
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
  parent: one(pages, { fields: [pages.parentId], references: [pages.id] }),
  children: many(pages),
  portlets: many(pagePortlets),
}));

export const portletsRelations = relations(portlets, ({ many }) => ({
  pagePortlets: many(pagePortlets),
}));

export const pagePortletsRelations = relations(pagePortlets, ({ one }) => ({
  page: one(pages, { fields: [pagePortlets.pageId], references: [pages.id] }),
  portlet: one(portlets, { fields: [pagePortlets.portletId], references: [portlets.id] }),
}));

export const themesRelations = relations(themes, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [themes.workspaceId], references: [workspaces.id] }),
  projects: many(projects),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  workspace: one(workspaces, { fields: [assets.workspaceId], references: [workspaces.id] }),
  folder: one(assetFolders, { fields: [assets.folderId], references: [assetFolders.id] }),
  uploadedBy: one(users, { fields: [assets.uploadedById], references: [users.id] }),
}));

export const assetFoldersRelations = relations(assetFolders, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [assetFolders.workspaceId], references: [workspaces.id] }),
  parent: one(assetFolders, { fields: [assetFolders.parentId], references: [assetFolders.id] }),
  children: many(assetFolders),
  assets: many(assets),
}));

export const serviceSchemasRelations = relations(serviceSchemas, ({ one }) => ({
  workspace: one(workspaces, { fields: [serviceSchemas.workspaceId], references: [workspaces.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  workspace: one(workspaces, { fields: [activityLogs.workspaceId], references: [workspaces.id] }),
}));

// Insert schemas
export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortletSchema = createInsertSchema(portlets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPagePortletSchema = createInsertSchema(pagePortlets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetFolderSchema = createInsertSchema(assetFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchemaSchema = createInsertSchema(serviceSchemas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

export type InsertPortlet = z.infer<typeof insertPortletSchema>;
export type Portlet = typeof portlets.$inferSelect;

export type InsertPagePortlet = z.infer<typeof insertPagePortletSchema>;
export type PagePortlet = typeof pagePortlets.$inferSelect;

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertAssetFolder = z.infer<typeof insertAssetFolderSchema>;
export type AssetFolder = typeof assetFolders.$inferSelect;

export type InsertServiceSchema = z.infer<typeof insertServiceSchemaSchema>;
export type ServiceSchema = typeof serviceSchemas.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
