import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface NavigationItem {
  label: string;
  url: string;
  icon?: string;
}

interface NavigationConfig {
  menuType: 'horizontal' | 'vertical';
  showIcons: boolean;
  maxDepth: number;
  items: NavigationItem[];
}

interface NavigationPortletProps {
  config: NavigationConfig;
  isEditing?: boolean;
  onConfigChange?: (config: NavigationConfig) => void;
}

export function NavigationPortlet({ 
  config, 
  isEditing = false, 
  onConfigChange 
}: NavigationPortletProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfig, setTempConfig] = useState<NavigationConfig>({
    menuType: 'horizontal',
    showIcons: false,
    maxDepth: 2,
    items: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' },
    ],
    ...config
  });

  const handleSave = () => {
    onConfigChange?.(tempConfig);
    setIsConfiguring(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsConfiguring(false);
  };

  const addMenuItem = () => {
    setTempConfig({
      ...tempConfig,
      items: [...tempConfig.items, { label: 'New Item', url: '#' }]
    });
  };

  const removeMenuItem = (index: number) => {
    setTempConfig({
      ...tempConfig,
      items: tempConfig.items.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index: number, field: keyof NavigationItem, value: string) => {
    const updatedItems = [...tempConfig.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setTempConfig({ ...tempConfig, items: updatedItems });
  };

  if (isConfiguring && isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure Navigation</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save size={14} className="mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="menuType">Menu Type</Label>
            <Select 
              value={tempConfig.menuType} 
              onValueChange={(value: 'horizontal' | 'vertical') => 
                setTempConfig({ ...tempConfig, menuType: value })
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
              checked={tempConfig.showIcons}
              onCheckedChange={(checked) => 
                setTempConfig({ ...tempConfig, showIcons: checked })
              }
            />
            <Label htmlFor="showIcons">Show Icons</Label>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Menu Items</Label>
              <Button size="sm" onClick={addMenuItem}>
                <Plus size={14} className="mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-2">
              {tempConfig.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={item.url}
                    onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                  />
                  {tempConfig.showIcons && (
                    <Input
                      placeholder="Icon"
                      value={item.icon || ''}
                      onChange={(e) => updateMenuItem(index, 'icon', e.target.value)}
                    />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeMenuItem(index)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {isEditing && (
        <div className="flex justify-end mb-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsConfiguring(true)}
          >
            <Edit size={14} className="mr-1" />
            Configure
          </Button>
        </div>
      )}
      
      <nav className={`navigation-menu ${tempConfig.menuType}`}>
        <ul className={`flex ${tempConfig.menuType === 'vertical' ? 'flex-col space-y-2' : 'space-x-6'}`}>
          {tempConfig.items.map((item, index) => (
            <li key={index}>
              <a
                href={item.url}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={(e) => isEditing && e.preventDefault()}
              >
                {tempConfig.showIcons && item.icon && (
                  <span className="text-sm">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}