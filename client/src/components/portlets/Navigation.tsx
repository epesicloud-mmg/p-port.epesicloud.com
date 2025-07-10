import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Menu, Home, FileText, Mail, Info } from "lucide-react";

interface NavigationProps {
  config: {
    menuType: 'horizontal' | 'vertical';
    showIcons: boolean;
    maxDepth: number;
  };
  onConfigChange?: (config: any) => void;
  isEditing?: boolean;
}

export function Navigation({ 
  config, 
  onConfigChange, 
  isEditing = false 
}: NavigationProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [editMode, setEditMode] = useState(isEditing);

  const handleSave = () => {
    onConfigChange?.(localConfig);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setEditMode(false);
  };

  // Mock navigation items
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FileText, label: 'About', href: '/about' },
    { icon: Mail, label: 'Contact', href: '/contact' },
    { icon: Info, label: 'Services', href: '/services' },
  ];

  if (editMode) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Navigation Settings</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X size={16} />
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menuType">Menu Type</Label>
            <Select
              value={localConfig.menuType}
              onValueChange={(value: 'horizontal' | 'vertical') => 
                setLocalConfig({ ...localConfig, menuType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showIcons"
              checked={localConfig.showIcons}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showIcons: checked })}
            />
            <Label htmlFor="showIcons">Show Icons</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxDepth">Max Depth</Label>
            <Select
              value={localConfig.maxDepth.toString()}
              onValueChange={(value) => 
                setLocalConfig({ ...localConfig, maxDepth: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Level</SelectItem>
                <SelectItem value="2">2 Levels</SelectItem>
                <SelectItem value="3">3 Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Menu size={20} />
          <span>Navigation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav className={`flex ${config.menuType === 'vertical' ? 'flex-col' : 'flex-row'} space-${config.menuType === 'vertical' ? 'y' : 'x'}-2`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className="justify-start"
                asChild
              >
                <a href={item.href} className="flex items-center space-x-2">
                  {config.showIcons && <Icon size={16} />}
                  <span>{item.label}</span>
                </a>
              </Button>
            );
          })}
        </nav>
        {onConfigChange && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Navigation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
