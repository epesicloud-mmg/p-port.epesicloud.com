import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import SidebarNavigation from "@/components/layout/SidebarNavigation";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateWorkspaceModal } from "@/components/modals/CreateWorkspaceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Globe, Users, BarChart3, Calendar, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Projects() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'projects'],
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
          <p className="text-gray-600">Loading projects...</p>
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
              No Workspaces Found
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

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'website':
        return Globe;
      case 'portal':
      case 'intranet':
        return Users;
      case 'dashboard':
        return BarChart3;
      default:
        return Globe;
    }
  };

  const getProjectGradient = (type: string) => {
    switch (type) {
      case 'website':
        return 'from-primary to-accent';
      case 'portal':
      case 'intranet':
        return 'from-accent to-primary';
      case 'dashboard':
        return 'from-success to-accent';
      default:
        return 'from-primary to-accent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-white';
      case 'draft':
        return 'bg-warning text-white';
      case 'archived':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const filteredProjects = projects?.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">
                Manage your digital experience projects
              </p>
            </div>
            <Button
              onClick={() => setCreateProjectModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
                <SelectItem value="intranet">Intranet</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="app">Application</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {projects?.length === 0 ? 'No projects yet' : 'No projects found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {projects?.length === 0 
                  ? 'Create your first project to get started building digital experiences.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {projects?.length === 0 && (
                <Button onClick={() => setCreateProjectModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: any) => {
                const Icon = getProjectIcon(project.type);
                const gradient = getProjectGradient(project.type);
                const statusColor = getStatusColor(project.status);
                
                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {project.type}
                          </Badge>
                          <Badge className={`text-xs ${statusColor}`}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>Updated {formatDate(project.updatedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <span>Live</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
