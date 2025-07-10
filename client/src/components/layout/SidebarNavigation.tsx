import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Folder,
  Grid3X3,
  Palette,
  Images,
  Edit,
  Database,
  BarChart,
  Users,
  Settings,
} from "lucide-react";

interface SidebarNavigationProps {
  projectCount?: number;
  currentWorkspaceId?: string;
}

export default function SidebarNavigation({ 
  projectCount = 0, 
  currentWorkspaceId 
}: SidebarNavigationProps) {
  const [location] = useLocation();

  const mainNavItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/projects", icon: Folder, label: "Projects", badge: projectCount },
    { href: "/portlets", icon: Grid3X3, label: "Portlets" },
    { href: "/themes", icon: Palette, label: "Themes" },
    { href: "/assets", icon: Images, label: "Assets" },
  ];

  const toolsNavItems = [
    { href: "/page-builder", icon: Edit, label: "Page Builder" },
    { href: "/service-builder", icon: Database, label: "Service Builder" },
    { href: "/analytics", icon: BarChart, label: "Analytics" },
  ];

  const settingsNavItems = [
    { href: "/team", icon: Users, label: "Team" },
    { href: "/settings", icon: Settings, label: "Workspace Settings" },
  ];

  const NavItem = ({ 
    href, 
    icon: Icon, 
    label, 
    badge 
  }: { 
    href: string; 
    icon: any; 
    label: string; 
    badge?: number; 
  }) => {
    const isActive = location === href;
    
    return (
      <Link href={href}>
        <div
          className={cn(
            "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "text-primary bg-primary/10"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-gray-400")} />
          <span>{label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="ml-auto bg-gray-200 text-gray-600 text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
            />
          ))}
        </div>
        
        <div className="mt-8">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
            Tools
          </div>
          <div className="space-y-1">
            {toolsNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
            Settings
          </div>
          <div className="space-y-1">
            {settingsNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
