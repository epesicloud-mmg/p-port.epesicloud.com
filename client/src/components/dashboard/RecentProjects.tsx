import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";

interface Project {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  status: string;
}

interface RecentProjectsProps {
  projects: Project[];
  workspaceId: string;
}

export function RecentProjects({ projects, workspaceId }: RecentProjectsProps) {
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
        return 'bg-success';
      case 'draft':
        return 'bg-warning';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Live';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Projects
          </CardTitle>
          <Link href="/projects">
            <Button variant="ghost" className="text-sm text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No projects yet</div>
              <div className="text-gray-400 text-xs mt-1">Create your first project to get started</div>
            </div>
          ) : (
            projects.slice(0, 3).map((project) => {
              const Icon = getProjectIcon(project.type);
              const gradient = getProjectGradient(project.type);
              const statusColor = getStatusColor(project.status);
              const statusLabel = getStatusLabel(project.status);
              
              return (
                <div
                  key={project.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {project.type} • Updated {formatTime(project.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${statusColor} rounded-full`}></div>
                    <span className="text-sm text-gray-600">{statusLabel}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
