import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X } from 'lucide-react';

interface ContentDisplayConfig {
  content: string;
  title?: string;
  showTitle: boolean;
  allowHtml: boolean;
}

interface ContentDisplayPortletProps {
  config: ContentDisplayConfig;
  isEditing?: boolean;
  onConfigChange?: (config: ContentDisplayConfig) => void;
}

export function ContentDisplayPortlet({ 
  config, 
  isEditing = false, 
  onConfigChange 
}: ContentDisplayPortletProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfig, setTempConfig] = useState<ContentDisplayConfig>(config);

  const handleSave = () => {
    onConfigChange?.(tempConfig);
    setIsConfiguring(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsConfiguring(false);
  };

  if (isConfiguring && isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure Content Display</CardTitle>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="showTitle"
              checked={tempConfig.showTitle}
              onCheckedChange={(checked) => 
                setTempConfig({ ...tempConfig, showTitle: checked })
              }
            />
            <Label htmlFor="showTitle">Show Title</Label>
          </div>
          
          {tempConfig.showTitle && (
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={tempConfig.title || ''}
                onChange={(e) => 
                  setTempConfig({ ...tempConfig, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allowHtml"
              checked={tempConfig.allowHtml}
              onCheckedChange={(checked) => 
                setTempConfig({ ...tempConfig, allowHtml: checked })
              }
            />
            <Label htmlFor="allowHtml">Allow HTML</Label>
          </div>
          
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={tempConfig.content}
              onChange={(e) => 
                setTempConfig({ ...tempConfig, content: e.target.value })
              }
              placeholder="Enter your content here..."
              rows={6}
            />
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
      
      {config.showTitle && config.title && (
        <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
      )}
      
      {config.content ? (
        config.allowHtml ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: config.content }}
          />
        ) : (
          <div className="whitespace-pre-wrap">{config.content}</div>
        )
      ) : isEditing ? (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <p>Click "Configure" to add content</p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          <p>No content configured</p>
        </div>
      )}
    </div>
  );
}