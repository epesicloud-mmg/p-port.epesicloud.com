import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid3X3, Palette, Users } from "lucide-react";

interface QuickActionsProps {
  onCreateProject: () => void;
  onCreateWorkspace: () => void;
}

export function QuickActions({ onCreateProject, onCreateWorkspace }: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      title: "New Project",
      description: "Create a new digital experience",
      color: "primary",
      onClick: onCreateProject,
    },
    {
      icon: Grid3X3,
      title: "Add Portlet",
      description: "Install new functionality",
      color: "accent",
      onClick: () => {
        // TODO: Implement portlet installation
      },
    },
    {
      icon: Palette,
      title: "Create Theme",
      description: "Design custom styles",
      color: "success",
      onClick: () => {
        // TODO: Implement theme creation
      },
    },
    {
      icon: Users,
      title: "Invite Team",
      description: "Add collaborators",
      color: "warning",
      onClick: () => {
        // TODO: Implement team invitation
      },
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10 group-hover:bg-primary/20',
          text: 'text-primary',
          border: 'border-primary hover:bg-primary/5',
        };
      case 'accent':
        return {
          bg: 'bg-accent/10 group-hover:bg-accent/20',
          text: 'text-accent',
          border: 'border-accent hover:bg-accent/5',
        };
      case 'success':
        return {
          bg: 'bg-success/10 group-hover:bg-success/20',
          text: 'text-success',
          border: 'border-success hover:bg-success/5',
        };
      case 'warning':
        return {
          bg: 'bg-warning/10 group-hover:bg-warning/20',
          text: 'text-warning',
          border: 'border-warning hover:bg-warning/5',
        };
      default:
        return {
          bg: 'bg-gray-100 group-hover:bg-gray-200',
          text: 'text-gray-600',
          border: 'border-gray-300 hover:bg-gray-50',
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);
            
            return (
              <Button
                key={action.title}
                variant="outline"
                className={`p-4 h-auto border-2 border-dashed ${colors.border} transition-colors group`}
                onClick={action.onClick}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
