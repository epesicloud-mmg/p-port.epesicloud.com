import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWorkspaceSchema, 
  insertProjectSchema, 
  insertSiteSchema, 
  insertPageSchema, 
  insertPortletSchema, 
  insertPagePortletSchema, 
  insertThemeSchema, 
  insertAssetSchema, 
  insertAssetFolderSchema, 
  insertServiceSchemaSchema, 
  insertActivityLogSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaces = await storage.getWorkspacesByUserId(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceData = insertWorkspaceSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      const workspace = await storage.createWorkspace(workspaceData);
      
      // Log activity
      await storage.createActivityLog({
        userId,
        workspaceId: workspace.id,
        action: 'create',
        resource: 'workspace',
        resourceId: workspace.id,
        details: { name: workspace.name },
      });
      
      res.json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(400).json({ message: "Failed to create workspace" });
    }
  });

  app.get('/api/workspaces/:id', isAuthenticated, async (req: any, res) => {
    try {
      const workspace = await storage.getWorkspaceById(req.params.id);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.put('/api/workspaces/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertWorkspaceSchema.partial().parse(req.body);
      const workspace = await storage.updateWorkspace(req.params.id, updates);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.id,
        action: 'update',
        resource: 'workspace',
        resourceId: req.params.id,
        details: updates,
      });
      
      res.json(workspace);
    } catch (error) {
      console.error("Error updating workspace:", error);
      res.status(400).json({ message: "Failed to update workspace" });
    }
  });

  app.delete('/api/workspaces/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteWorkspace(req.params.id);
      
      await storage.createActivityLog({
        userId,
        action: 'delete',
        resource: 'workspace',
        resourceId: req.params.id,
      });
      
      res.json({ message: "Workspace deleted successfully" });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });

  // Project routes
  app.get('/api/workspaces/:workspaceId/projects', isAuthenticated, async (req: any, res) => {
    try {
      const projects = await storage.getProjectsByWorkspaceId(req.params.workspaceId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/workspaces/:workspaceId/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      const project = await storage.createProject(projectData);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.workspaceId,
        action: 'create',
        resource: 'project',
        resourceId: project.id,
        details: { name: project.name, type: project.type },
      });
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      
      await storage.createActivityLog({
        userId,
        workspaceId: project.workspaceId,
        action: 'update',
        resource: 'project',
        resourceId: req.params.id,
        details: updates,
      });
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.deleteProject(req.params.id);
      
      await storage.createActivityLog({
        userId,
        workspaceId: project.workspaceId,
        action: 'delete',
        resource: 'project',
        resourceId: req.params.id,
      });
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Site routes
  app.get('/api/projects/:projectId/sites', isAuthenticated, async (req: any, res) => {
    try {
      const sites = await storage.getSitesByProjectId(req.params.projectId);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.post('/api/projects/:projectId/sites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const siteData = insertSiteSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const site = await storage.createSite(siteData);
      
      const project = await storage.getProjectById(req.params.projectId);
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'create',
        resource: 'site',
        resourceId: site.id,
        details: { name: site.name },
      });
      
      res.json(site);
    } catch (error) {
      console.error("Error creating site:", error);
      res.status(400).json({ message: "Failed to create site" });
    }
  });

  // Page routes
  app.get('/api/sites/:siteId/pages', isAuthenticated, async (req: any, res) => {
    try {
      const pages = await storage.getPagesBySiteId(req.params.siteId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post('/api/sites/:siteId/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pageData = insertPageSchema.parse({
        ...req.body,
        siteId: req.params.siteId,
      });
      const page = await storage.createPage(pageData);
      
      const site = await storage.getSiteById(req.params.siteId);
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'create',
        resource: 'page',
        resourceId: page.id,
        details: { title: page.title },
      });
      
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(400).json({ message: "Failed to create page" });
    }
  });

  app.get('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const page = await storage.getPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.put('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertPageSchema.partial().parse(req.body);
      const page = await storage.updatePage(req.params.id, updates);
      
      const site = await storage.getSiteById(page.siteId);
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'update',
        resource: 'page',
        resourceId: req.params.id,
        details: updates,
      });
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(400).json({ message: "Failed to update page" });
    }
  });

  app.delete('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = await storage.getPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      const site = await storage.getSiteById(page.siteId);
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.deletePage(req.params.id);
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'delete',
        resource: 'page',
        resourceId: req.params.id,
      });
      
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Portlet routes
  app.get('/api/portlets', isAuthenticated, async (req: any, res) => {
    try {
      const portlets = await storage.getAllPortlets();
      res.json(portlets);
    } catch (error) {
      console.error("Error fetching portlets:", error);
      res.status(500).json({ message: "Failed to fetch portlets" });
    }
  });

  app.post('/api/portlets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portletData = insertPortletSchema.parse(req.body);
      const portlet = await storage.createPortlet(portletData);
      
      // Activity log creation is optional for portlets since they're not workspace-specific
      try {
        await storage.createActivityLog({
          userId,
          action: 'create',
          resource: 'portlet',
          resourceId: portlet.id,
          details: { name: portlet.name, type: portlet.type },
        });
      } catch (logError) {
        console.warn("Failed to create activity log for portlet:", logError);
      }
      
      res.json(portlet);
    } catch (error) {
      console.error("Error creating portlet:", error);
      res.status(400).json({ message: "Failed to create portlet", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/portlets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const portlet = await storage.getPortletById(req.params.id);
      if (!portlet) {
        return res.status(404).json({ message: "Portlet not found" });
      }
      res.json(portlet);
    } catch (error) {
      console.error("Error fetching portlet:", error);
      res.status(500).json({ message: "Failed to fetch portlet" });
    }
  });

  app.put('/api/portlets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertPortletSchema.partial().parse(req.body);
      const portlet = await storage.updatePortlet(req.params.id, updates);
      
      // Activity log creation is optional for portlets since they're not workspace-specific
      try {
        await storage.createActivityLog({
          userId,
          action: 'update',
          resource: 'portlet',
          resourceId: req.params.id,
          details: updates,
        });
      } catch (logError) {
        console.warn("Failed to create activity log for portlet:", logError);
      }
      
      res.json(portlet);
    } catch (error) {
      console.error("Error updating portlet:", error);
      res.status(400).json({ message: "Failed to update portlet", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/portlets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portlet = await storage.getPortletById(req.params.id);
      if (!portlet) {
        return res.status(404).json({ message: "Portlet not found" });
      }
      
      if (portlet.isBuiltIn) {
        return res.status(400).json({ message: "Cannot delete built-in portlets" });
      }
      
      await storage.deletePortlet(req.params.id);
      
      // Activity log creation is optional for portlets since they're not workspace-specific
      try {
        await storage.createActivityLog({
          userId,
          action: 'delete',
          resource: 'portlet',
          resourceId: req.params.id,
        });
      } catch (logError) {
        console.warn("Failed to create activity log for portlet:", logError);
      }
      
      res.json({ message: "Portlet deleted successfully" });
    } catch (error) {
      console.error("Error deleting portlet:", error);
      res.status(500).json({ message: "Failed to delete portlet" });
    }
  });

  // Page portlet routes
  app.get('/api/pages/:pageId/portlets', isAuthenticated, async (req: any, res) => {
    try {
      const pagePortlets = await storage.getPagePortletsByPageId(req.params.pageId);
      res.json(pagePortlets);
    } catch (error) {
      console.error("Error fetching page portlets:", error);
      res.status(500).json({ message: "Failed to fetch page portlets" });
    }
  });

  app.post('/api/pages/:pageId/portlets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pagePortletData = insertPagePortletSchema.parse({
        ...req.body,
        pageId: req.params.pageId,
      });
      const pagePortlet = await storage.createPagePortlet(pagePortletData);
      
      const page = await storage.getPageById(req.params.pageId);
      const site = page ? await storage.getSiteById(page.siteId) : null;
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'add',
        resource: 'page-portlet',
        resourceId: pagePortlet.id,
        details: { pageId: req.params.pageId, portletId: pagePortlet.portletId },
      });
      
      res.json(pagePortlet);
    } catch (error) {
      console.error("Error adding portlet to page:", error);
      res.status(400).json({ message: "Failed to add portlet to page" });
    }
  });

  app.put('/api/page-portlets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertPagePortletSchema.partial().parse(req.body);
      const pagePortlet = await storage.updatePagePortlet(req.params.id, updates);
      
      const page = await storage.getPageById(pagePortlet.pageId);
      const site = page ? await storage.getSiteById(page.siteId) : null;
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'update',
        resource: 'page-portlet',
        resourceId: req.params.id,
        details: updates,
      });
      
      res.json(pagePortlet);
    } catch (error) {
      console.error("Error updating page portlet:", error);
      res.status(400).json({ message: "Failed to update page portlet" });
    }
  });

  app.delete('/api/page-portlets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pagePortlet = await storage.getPagePortletById(req.params.id);
      if (!pagePortlet) {
        return res.status(404).json({ message: "Page portlet not found" });
      }
      
      const page = await storage.getPageById(pagePortlet.pageId);
      const site = page ? await storage.getSiteById(page.siteId) : null;
      const project = site ? await storage.getProjectById(site.projectId) : null;
      
      await storage.deletePagePortlet(req.params.id);
      
      await storage.createActivityLog({
        userId,
        workspaceId: project?.workspaceId,
        action: 'remove',
        resource: 'page-portlet',
        resourceId: req.params.id,
      });
      
      res.json({ message: "Page portlet removed successfully" });
    } catch (error) {
      console.error("Error removing page portlet:", error);
      res.status(500).json({ message: "Failed to remove page portlet" });
    }
  });

  // Theme routes
  app.get('/api/workspaces/:workspaceId/themes', isAuthenticated, async (req: any, res) => {
    try {
      const themes = await storage.getThemesByWorkspaceId(req.params.workspaceId);
      res.json(themes);
    } catch (error) {
      console.error("Error fetching themes:", error);
      res.status(500).json({ message: "Failed to fetch themes" });
    }
  });

  app.post('/api/workspaces/:workspaceId/themes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const themeData = insertThemeSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      const theme = await storage.createTheme(themeData);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.workspaceId,
        action: 'create',
        resource: 'theme',
        resourceId: theme.id,
        details: { name: theme.name },
      });
      
      res.json(theme);
    } catch (error) {
      console.error("Error creating theme:", error);
      res.status(400).json({ message: "Failed to create theme" });
    }
  });

  // Asset routes
  app.get('/api/workspaces/:workspaceId/assets', isAuthenticated, async (req: any, res) => {
    try {
      const assets = await storage.getAssetsByWorkspaceId(req.params.workspaceId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post('/api/workspaces/:workspaceId/assets', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const assetData = insertAssetSchema.parse({
        name: req.body.name || file.originalname,
        originalName: file.originalname,
        type: file.mimetype.split('/')[0],
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        workspaceId: req.params.workspaceId,
        uploadedById: userId,
      });
      
      const asset = await storage.createAsset(assetData);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.workspaceId,
        action: 'upload',
        resource: 'asset',
        resourceId: asset.id,
        details: { name: asset.name, size: asset.size },
      });
      
      res.json(asset);
    } catch (error) {
      console.error("Error uploading asset:", error);
      res.status(400).json({ message: "Failed to upload asset" });
    }
  });

  // Asset folder routes
  app.get('/api/workspaces/:workspaceId/asset-folders', isAuthenticated, async (req: any, res) => {
    try {
      const folders = await storage.getAssetFoldersByWorkspaceId(req.params.workspaceId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching asset folders:", error);
      res.status(500).json({ message: "Failed to fetch asset folders" });
    }
  });

  app.post('/api/workspaces/:workspaceId/asset-folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderData = insertAssetFolderSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      const folder = await storage.createAssetFolder(folderData);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.workspaceId,
        action: 'create',
        resource: 'asset-folder',
        resourceId: folder.id,
        details: { name: folder.name },
      });
      
      res.json(folder);
    } catch (error) {
      console.error("Error creating asset folder:", error);
      res.status(400).json({ message: "Failed to create asset folder" });
    }
  });

  // Service Builder routes
  app.get('/api/workspaces/:workspaceId/service-schemas', isAuthenticated, async (req: any, res) => {
    try {
      const schemas = await storage.getServiceSchemasByWorkspaceId(req.params.workspaceId);
      res.json(schemas);
    } catch (error) {
      console.error("Error fetching service schemas:", error);
      res.status(500).json({ message: "Failed to fetch service schemas" });
    }
  });

  app.post('/api/workspaces/:workspaceId/service-schemas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schemaData = insertServiceSchemaSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      const schema = await storage.createServiceSchema(schemaData);
      
      await storage.createActivityLog({
        userId,
        workspaceId: req.params.workspaceId,
        action: 'create',
        resource: 'service-schema',
        resourceId: schema.id,
        details: { name: schema.name, tableName: schema.tableName },
      });
      
      res.json(schema);
    } catch (error) {
      console.error("Error creating service schema:", error);
      res.status(400).json({ message: "Failed to create service schema" });
    }
  });

  // Dashboard stats route
  app.get('/api/workspaces/:workspaceId/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.workspaceId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Activity logs route
  app.get('/api/workspaces/:workspaceId/activity-logs', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getActivityLogsByWorkspaceId(req.params.workspaceId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
