import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateWorkspaceModal } from "@/components/modals/CreateWorkspaceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Folder, FileText, Grid3X3, Users, Edit, Database } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);

  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: isAuthenticated,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'projects'],
    enabled: !!currentWorkspace?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'stats'],
    enabled: !!currentWorkspace?.id,
  });

  // Set the first workspace as current if none selected
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || workspacesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation
          onCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
        />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary" size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to ModularDXP
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first workspace to get started building digital experiences.
            </p>
            <Button onClick={() => setCreateWorkspaceModalOpen(true)}>
              Create Workspace
            </Button>
          </div>
        </div>
        <CreateWorkspaceModal
          open={createWorkspaceModalOpen}
          onOpenChange={setCreateWorkspaceModalOpen}
          onWorkspaceCreated={(workspace) => {
            setCurrentWorkspace(workspace);
            setCreateWorkspaceModalOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={(workspaceId) => {
          const workspace = workspaces.find((w: any) => w.id === workspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
          }
        }}
        onCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
      />
      
      <div className="flex pt-16">
        <SidebarNavigation
          projectCount={projects?.length || 0}
          currentWorkspaceId={currentWorkspace?.id}
        />
        
        <main className="flex-1 ml-64 p-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your projects.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                Export Data
              </Button>
              <Button
                onClick={() => setCreateProjectModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                New Project
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Projects"
              value={stats?.activeProjects || 0}
              icon={Folder}
              color="primary"
              trend={{ value: 2, label: "this month", isPositive: true }}
            />
            <StatsCard
              title="Total Pages"
              value={stats?.totalPages || 0}
              icon={FileText}
              color="accent"
              trend={{ value: 8, label: "this week", isPositive: true }}
            />
            <StatsCard
              title="Active Portlets"
              value={stats?.activePortlets || 0}
              icon={Grid3X3}
              color="success"
              trend={{ value: 12, label: "this month", isPositive: true }}
            />
            <StatsCard
              title="Team Members"
              value={stats?.teamMembers || 0}
              icon={Users}
              color="warning"
              trend={{ value: 3, label: "this month", isPositive: true }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentProjects
              projects={projects || []}
              workspaceId={currentWorkspace?.id}
            />
            <QuickActions
              onCreateProject={() => setCreateProjectModalOpen(true)}
              onCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
            />
          </div>
          
          {/* Page Builder Preview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Page Builder Preview
                </CardTitle>
                <Button className="bg-primary hover:bg-primary/90">
                  <Edit size={16} className="mr-2" />
                  Open Builder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Edit className="text-primary" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Visual Page Builder
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop portlets to build your pages visually
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="text-gray-400" size={16} />
                      <span className="font-medium text-gray-900">Content Display</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Rich text and HTML content portlet
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Grid3X3 className="text-gray-400" size={16} />
                      <span className="font-medium text-gray-900">Media Gallery</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Image and video display portlet
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="text-gray-400" size={16} />
                      <span className="font-medium text-gray-900">Contact Form</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Custom form builder portlet
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Builder Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Service Builder
                </CardTitle>
                <div className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded">
                  Advanced Feature
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Auto-Generated CRUD</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Database className="text-primary" size={16} />
                      <div>
                        <div className="font-medium text-gray-900">JobBoard Schema</div>
                        <div className="text-sm text-gray-600">Auto-generated APIs + Admin UI</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Database className="text-accent" size={16} />
                      <div>
                        <div className="font-medium text-gray-900">Product Catalog</div>
                        <div className="text-sm text-gray-600">E-commerce data management</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Database className="text-success" size={16} />
                      <div>
                        <div className="font-medium text-gray-900">Event Manager</div>
                        <div className="text-sm text-gray-600">Event scheduling system</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Generated Components</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>REST API Endpoints</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Admin Table Interface</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Form Validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Search & Filtering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Relationship Management</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Try Service Builder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      <CreateProjectModal
        open={createProjectModalOpen}
        onOpenChange={setCreateProjectModalOpen}
        workspaceId={currentWorkspace?.id}
      />
      
      <CreateWorkspaceModal
        open={createWorkspaceModalOpen}
        onOpenChange={setCreateWorkspaceModalOpen}
        onWorkspaceCreated={(workspace) => {
          setCurrentWorkspace(workspace);
          setCreateWorkspaceModalOpen(false);
        }}
      />
    </div>
  );
}
