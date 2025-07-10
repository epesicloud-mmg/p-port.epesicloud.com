import {
  users,
  workspaces,
  workspaceMembers,
  projects,
  sites,
  pages,
  portlets,
  pagePortlets,
  themes,
  assets,
  assetFolders,
  serviceSchemas,
  activityLogs,
  type User,
  type UpsertUser,
  type Workspace,
  type InsertWorkspace,
  type Project,
  type InsertProject,
  type Site,
  type InsertSite,
  type Page,
  type InsertPage,
  type Portlet,
  type InsertPortlet,
  type PagePortlet,
  type InsertPagePortlet,
  type Theme,
  type InsertTheme,
  type Asset,
  type InsertAsset,
  type AssetFolder,
  type InsertAssetFolder,
  type ServiceSchema,
  type InsertServiceSchema,
  type ActivityLog,
  type InsertActivityLog,
  type WorkspaceMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Workspace operations
  getWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  getWorkspaceById(id: string): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: string, updates: Partial<InsertWorkspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
  
  // Workspace member operations
  getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  addWorkspaceMember(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember>;
  removeWorkspaceMember(workspaceId: string, userId: string): Promise<void>;
  
  // Project operations
  getProjectsByWorkspaceId(workspaceId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Site operations
  getSitesByProjectId(projectId: string): Promise<Site[]>;
  getSiteById(id: string): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, updates: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: string): Promise<void>;
  
  // Page operations
  getPagesBySiteId(siteId: string): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, updates: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<void>;
  
  // Portlet operations
  getAllPortlets(): Promise<Portlet[]>;
  getPortletById(id: string): Promise<Portlet | undefined>;
  createPortlet(portlet: InsertPortlet): Promise<Portlet>;
  updatePortlet(id: string, updates: Partial<InsertPortlet>): Promise<Portlet>;
  deletePortlet(id: string): Promise<void>;
  
  // Page portlet operations
  getPagePortletsByPageId(pageId: string): Promise<PagePortlet[]>;
  getPagePortletById(id: string): Promise<PagePortlet | undefined>;
  createPagePortlet(pagePortlet: InsertPagePortlet): Promise<PagePortlet>;
  updatePagePortlet(id: string, updates: Partial<InsertPagePortlet>): Promise<PagePortlet>;
  deletePagePortlet(id: string): Promise<void>;
  
  // Theme operations
  getThemesByWorkspaceId(workspaceId: string): Promise<Theme[]>;
  getThemeById(id: string): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme>;
  deleteTheme(id: string): Promise<void>;
  
  // Asset operations
  getAssetsByWorkspaceId(workspaceId: string): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  
  // Asset folder operations
  getAssetFoldersByWorkspaceId(workspaceId: string): Promise<AssetFolder[]>;
  getAssetFolderById(id: string): Promise<AssetFolder | undefined>;
  createAssetFolder(folder: InsertAssetFolder): Promise<AssetFolder>;
  updateAssetFolder(id: string, updates: Partial<InsertAssetFolder>): Promise<AssetFolder>;
  deleteAssetFolder(id: string): Promise<void>;
  
  // Service schema operations
  getServiceSchemasByWorkspaceId(workspaceId: string): Promise<ServiceSchema[]>;
  getServiceSchemaById(id: string): Promise<ServiceSchema | undefined>;
  createServiceSchema(schema: InsertServiceSchema): Promise<ServiceSchema>;
  updateServiceSchema(id: string, updates: Partial<InsertServiceSchema>): Promise<ServiceSchema>;
  deleteServiceSchema(id: string): Promise<void>;
  
  // Activity log operations
  getActivityLogsByWorkspaceId(workspaceId: string): Promise<ActivityLog[]>;
  getActivityLogsByUserId(userId: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Dashboard stats
  getDashboardStats(workspaceId: string): Promise<{
    activeProjects: number;
    totalPages: number;
    activePortlets: number;
    teamMembers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Workspace operations
  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    const result = await db
      .select()
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(asc(workspaces.name));
    
    return result.map(r => r.workspaces);
  }

  async getWorkspaceById(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db.insert(workspaces).values(workspace).returning();
    
    // Add owner as admin member
    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userId: workspace.ownerId,
      role: 'owner',
      joinedAt: new Date(),
    });
    
    return newWorkspace;
  }

  async updateWorkspace(id: string, updates: Partial<InsertWorkspace>): Promise<Workspace> {
    const [workspace] = await db
      .update(workspaces)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return workspace;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  // Workspace member operations
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .orderBy(asc(workspaceMembers.role));
  }

  async addWorkspaceMember(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId,
        role,
        joinedAt: new Date(),
      })
      .returning();
    return member;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    await db
      .delete(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ));
  }

  // Project operations
  async getProjectsByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    
    // Create default site
    await db.insert(sites).values({
      name: 'Main Site',
      projectId: newProject.id,
      isDefault: true,
    });
    
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Site operations
  async getSitesByProjectId(projectId: string): Promise<Site[]> {
    return await db
      .select()
      .from(sites)
      .where(eq(sites.projectId, projectId))
      .orderBy(desc(sites.isDefault), asc(sites.name));
  }

  async getSiteById(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db.insert(sites).values(site).returning();
    return newSite;
  }

  async updateSite(id: string, updates: Partial<InsertSite>): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async deleteSite(id: string): Promise<void> {
    await db.delete(sites).where(eq(sites.id, id));
  }

  // Page operations
  async getPagesBySiteId(siteId: string): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(eq(pages.siteId, siteId))
      .orderBy(asc(pages.sortOrder), asc(pages.title));
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [newPage] = await db.insert(pages).values(page).returning();
    return newPage;
  }

  async updatePage(id: string, updates: Partial<InsertPage>): Promise<Page> {
    const [page] = await db
      .update(pages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  // Portlet operations
  async getAllPortlets(): Promise<Portlet[]> {
    return await db
      .select()
      .from(portlets)
      .where(eq(portlets.isActive, true))
      .orderBy(asc(portlets.category), asc(portlets.name));
  }

  async getPortletById(id: string): Promise<Portlet | undefined> {
    const [portlet] = await db.select().from(portlets).where(eq(portlets.id, id));
    return portlet;
  }

  async createPortlet(portlet: InsertPortlet): Promise<Portlet> {
    const [newPortlet] = await db.insert(portlets).values(portlet).returning();
    return newPortlet;
  }

  async updatePortlet(id: string, updates: Partial<InsertPortlet>): Promise<Portlet> {
    const [portlet] = await db
      .update(portlets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portlets.id, id))
      .returning();
    return portlet;
  }

  async deletePortlet(id: string): Promise<void> {
    await db.delete(portlets).where(eq(portlets.id, id));
  }

  // Page portlet operations
  async getPagePortletsByPageId(pageId: string): Promise<PagePortlet[]> {
    return await db
      .select()
      .from(pagePortlets)
      .where(eq(pagePortlets.pageId, pageId))
      .orderBy(asc(pagePortlets.sortOrder));
  }

  async getPagePortletById(id: string): Promise<PagePortlet | undefined> {
    const [pagePortlet] = await db.select().from(pagePortlets).where(eq(pagePortlets.id, id));
    return pagePortlet;
  }

  async createPagePortlet(pagePortlet: InsertPagePortlet): Promise<PagePortlet> {
    const [newPagePortlet] = await db.insert(pagePortlets).values(pagePortlet).returning();
    return newPagePortlet;
  }

  async updatePagePortlet(id: string, updates: Partial<InsertPagePortlet>): Promise<PagePortlet> {
    const [pagePortlet] = await db
      .update(pagePortlets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pagePortlets.id, id))
      .returning();
    return pagePortlet;
  }

  async deletePagePortlet(id: string): Promise<void> {
    await db.delete(pagePortlets).where(eq(pagePortlets.id, id));
  }

  // Theme operations
  async getThemesByWorkspaceId(workspaceId: string): Promise<Theme[]> {
    return await db
      .select()
      .from(themes)
      .where(eq(themes.workspaceId, workspaceId))
      .orderBy(desc(themes.isDefault), asc(themes.name));
  }

  async getThemeById(id: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme;
  }

  async createTheme(theme: InsertTheme): Promise<Theme> {
    const [newTheme] = await db.insert(themes).values(theme).returning();
    return newTheme;
  }

  async updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme> {
    const [theme] = await db
      .update(themes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themes.id, id))
      .returning();
    return theme;
  }

  async deleteTheme(id: string): Promise<void> {
    await db.delete(themes).where(eq(themes.id, id));
  }

  // Asset operations
  async getAssetsByWorkspaceId(workspaceId: string): Promise<Asset[]> {
    return await db
      .select()
      .from(assets)
      .where(eq(assets.workspaceId, workspaceId))
      .orderBy(desc(assets.createdAt));
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset> {
    const [asset] = await db
      .update(assets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Asset folder operations
  async getAssetFoldersByWorkspaceId(workspaceId: string): Promise<AssetFolder[]> {
    return await db
      .select()
      .from(assetFolders)
      .where(eq(assetFolders.workspaceId, workspaceId))
      .orderBy(asc(assetFolders.name));
  }

  async getAssetFolderById(id: string): Promise<AssetFolder | undefined> {
    const [folder] = await db.select().from(assetFolders).where(eq(assetFolders.id, id));
    return folder;
  }

  async createAssetFolder(folder: InsertAssetFolder): Promise<AssetFolder> {
    const [newFolder] = await db.insert(assetFolders).values(folder).returning();
    return newFolder;
  }

  async updateAssetFolder(id: string, updates: Partial<InsertAssetFolder>): Promise<AssetFolder> {
    const [folder] = await db
      .update(assetFolders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assetFolders.id, id))
      .returning();
    return folder;
  }

  async deleteAssetFolder(id: string): Promise<void> {
    await db.delete(assetFolders).where(eq(assetFolders.id, id));
  }

  // Service schema operations
  async getServiceSchemasByWorkspaceId(workspaceId: string): Promise<ServiceSchema[]> {
    return await db
      .select()
      .from(serviceSchemas)
      .where(eq(serviceSchemas.workspaceId, workspaceId))
      .orderBy(asc(serviceSchemas.name));
  }

  async getServiceSchemaById(id: string): Promise<ServiceSchema | undefined> {
    const [schema] = await db.select().from(serviceSchemas).where(eq(serviceSchemas.id, id));
    return schema;
  }

  async createServiceSchema(schema: InsertServiceSchema): Promise<ServiceSchema> {
    const [newSchema] = await db.insert(serviceSchemas).values(schema).returning();
    return newSchema;
  }

  async updateServiceSchema(id: string, updates: Partial<InsertServiceSchema>): Promise<ServiceSchema> {
    const [schema] = await db
      .update(serviceSchemas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceSchemas.id, id))
      .returning();
    return schema;
  }

  async deleteServiceSchema(id: string): Promise<void> {
    await db.delete(serviceSchemas).where(eq(serviceSchemas.id, id));
  }

  // Activity log operations
  async getActivityLogsByWorkspaceId(workspaceId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.workspaceId, workspaceId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);
  }

  async getActivityLogsByUserId(userId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Dashboard stats
  async getDashboardStats(workspaceId: string): Promise<{
    activeProjects: number;
    totalPages: number;
    activePortlets: number;
    teamMembers: number;
  }> {
    const projectsList = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    const pagesList = await db
      .select()
      .from(pages)
      .innerJoin(sites, eq(pages.siteId, sites.id))
      .innerJoin(projects, eq(sites.projectId, projects.id))
      .where(eq(projects.workspaceId, workspaceId));

    const portletsList = await db
      .select()
      .from(pagePortlets)
      .innerJoin(pages, eq(pagePortlets.pageId, pages.id))
      .innerJoin(sites, eq(pages.siteId, sites.id))
      .innerJoin(projects, eq(sites.projectId, projects.id))
      .where(eq(projects.workspaceId, workspaceId));

    const membersList = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return {
      activeProjects: projectsList.length,
      totalPages: pagesList.length,
      activePortlets: portletsList.length,
      teamMembers: membersList.length,
    };
  }
}

export const storage = new DatabaseStorage();
