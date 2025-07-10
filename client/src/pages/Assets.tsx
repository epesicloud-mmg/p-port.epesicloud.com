import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import SidebarNavigation from "@/components/layout/SidebarNavigation";
import { CreateWorkspaceModal } from "@/components/modals/CreateWorkspaceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  FolderPlus, 
  Image, 
  FileText, 
  Video,
  Users,
  Download,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Assets() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

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

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'assets'],
    enabled: !!currentWorkspace?.id,
  });

  const { data: folders } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'asset-folders'],
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
          <p className="text-gray-600">Loading assets...</p>
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
              Create your first workspace to start managing assets.
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

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAssets = assets?.filter((asset: any) => {
    return asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           asset.originalName.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // TODO: Implement file upload functionality
      toast({
        title: "Upload Started",
        description: `Uploading ${files.length} file(s)...`,
      });
    }
  };

  const AssetCard = ({ asset }: { asset: any }) => {
    const Icon = getAssetIcon(asset.type);
    
    return (
      <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {asset.type === 'image' && asset.url ? (
                <img 
                  src={asset.url} 
                  alt={asset.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <Icon className="text-gray-500" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate">
                {asset.name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(asset.size)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download size={16} className="mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs capitalize">
              {asset.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatDate(asset.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AssetRow = ({ asset }: { asset: any }) => {
    const Icon = getAssetIcon(asset.type);
    
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg group">
        <input
          type="checkbox"
          className="rounded border-gray-300"
          checked={selectedAssets.includes(asset.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedAssets([...selectedAssets, asset.id]);
            } else {
              setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
            }
          }}
        />
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {asset.type === 'image' && asset.url ? (
            <img 
              src={asset.url} 
              alt={asset.name}
              className="w-10 h-10 object-cover rounded-lg"
            />
          ) : (
            <Icon className="text-gray-500" size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 truncate">
            {asset.name}
          </h3>
          <p className="text-xs text-gray-500">
            {asset.originalName}
          </p>
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {asset.type}
        </Badge>
        <div className="text-xs text-gray-500 w-20">
          {formatFileSize(asset.size)}
        </div>
        <div className="text-xs text-gray-500 w-24">
          {formatDate(asset.createdAt)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download size={16} className="mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
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
          projectCount={0}
          currentWorkspaceId={currentWorkspace?.id}
        />
        
        <main className="flex-1 ml-64 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
              <p className="text-gray-600 mt-1">
                Manage your media files and documents
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <FolderPlus size={16} className="mr-2" />
                New Folder
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Upload size={16} className="mr-2" />
                Upload Files
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Assets Content */}
          {assetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-32">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {assets?.length === 0 ? 'No assets yet' : 'No assets found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {assets?.length === 0 
                  ? 'Upload your first files to get started with asset management.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {assets?.length === 0 && (
                <Button className="bg-primary hover:bg-primary/90">
                  <Upload size={16} className="mr-2" />
                  Upload Files
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset: any) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {filteredAssets.length} assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {filteredAssets.map((asset: any) => (
                    <AssetRow key={asset.id} asset={asset} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
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
