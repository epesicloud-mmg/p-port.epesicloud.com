import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { PageBuilder as PageBuilderComponent } from "@/components/builder/PageBuilder";
import { CreateWorkspaceModal } from "@/components/modals/CreateWorkspaceModal";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageBuilder() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
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

  const handleSave = (pageData: any) => {
    // TODO: Implement page save functionality
    toast({
      title: "Page Saved",
      description: "Your page has been saved successfully.",
    });
  };

  if (isLoading || workspacesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading page builder...</p>
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
              Create your first workspace to start building pages.
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
      
      <div className="pt-16 h-screen">
        <PageBuilderComponent
          onSave={handleSave}
        />
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
