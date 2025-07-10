import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";

interface ContentDisplayProps {
  config: {
    title?: string;
    content: string;
    showTitle: boolean;
    allowHtml: boolean;
  };
  onConfigChange?: (config: any) => void;
  isEditing?: boolean;
}

export function ContentDisplay({ 
  config, 
  onConfigChange, 
  isEditing = false 
}: ContentDisplayProps) {
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

  if (editMode) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Display Settings</CardTitle>
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={localConfig.title || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
              placeholder="Enter title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={localConfig.content}
              onChange={(e) => setLocalConfig({ ...localConfig, content: e.target.value })}
              placeholder="Enter content"
              rows={6}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showTitle"
              checked={localConfig.showTitle}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showTitle: checked })}
            />
            <Label htmlFor="showTitle">Show Title</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allowHtml"
              checked={localConfig.allowHtml}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, allowHtml: checked })}
            />
            <Label htmlFor="allowHtml">Allow HTML</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {config.showTitle && config.title && (
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {config.allowHtml ? (
          <div dangerouslySetInnerHTML={{ __html: config.content }} />
        ) : (
          <div className="whitespace-pre-wrap">{config.content}</div>
        )}
        {onConfigChange && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Content
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
