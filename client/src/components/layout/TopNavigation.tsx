import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, ChevronDown, Box, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface TopNavigationProps {
  currentWorkspace?: { id: string; name: string };
  onWorkspaceChange?: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
}

export function TopNavigation({ 
  currentWorkspace, 
  onWorkspaceChange,
  onCreateWorkspace 
}: TopNavigationProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: workspaces } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: !!user,
  });

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="text-white" size={16} />
            </div>
            <span className="text-xl font-semibold text-gray-900">ModularDXP</span>
          </Link>
          
          {/* Workspace Selector */}
          {currentWorkspace && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {currentWorkspace.name}
                  </span>
                  <ChevronDown className="text-gray-500" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces?.map((workspace: any) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => onWorkspaceChange?.(workspace.id)}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {workspace.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {workspace.name}
                      </div>
                    </div>
                    {workspace.id === currentWorkspace.id && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCreateWorkspace}
                  className="flex items-center space-x-2"
                >
                  <Plus size={16} className="text-gray-400" />
                  <span>Create Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search projects, pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-gray-100 border-0 focus:bg-white"
            />
          </div>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} className="text-gray-500" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <div className="text-sm font-medium">Project updated</div>
                  <div className="text-xs text-gray-500">Corporate Website was updated by John Doe</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <div className="text-sm font-medium">New team member</div>
                  <div className="text-xs text-gray-500">Jane Smith joined your workspace</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <div className="text-sm font-medium">Page published</div>
                  <div className="text-xs text-gray-500">About Us page is now live</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="text-gray-400" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a href="/api/logout" className="w-full">
                  Logout
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
