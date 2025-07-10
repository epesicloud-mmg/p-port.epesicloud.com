import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Images, Play, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface MediaGalleryProps {
  config: {
    layout: 'grid' | 'carousel' | 'masonry';
    columns: number;
    showCaptions: boolean;
    items: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      caption?: string;
      thumbnail?: string;
    }>;
  };
  onConfigChange?: (config: any) => void;
  isEditing?: boolean;
}

export function MediaGallery({ 
  config, 
  onConfigChange, 
  isEditing = false 
}: MediaGalleryProps) {
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

  // Default media items for demonstration
  const defaultItems = [
    {
      id: '1',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      caption: 'Modern office space',
    },
    {
      id: '2',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      caption: 'Team collaboration',
    },
    {
      id: '3',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
      caption: 'Technology workspace',
    },
  ];

  const items = config.items?.length > 0 ? config.items : defaultItems;

  if (editMode) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Media Gallery Settings</CardTitle>
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
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={localConfig.layout}
              onValueChange={(value: 'grid' | 'carousel' | 'masonry') => 
                setLocalConfig({ ...localConfig, layout: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="columns">Columns</Label>
            <Select
              value={localConfig.columns.toString()}
              onValueChange={(value) => 
                setLocalConfig({ ...localConfig, columns: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Column</SelectItem>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showCaptions"
              checked={localConfig.showCaptions}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showCaptions: checked })}
            />
            <Label htmlFor="showCaptions">Show Captions</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Images size={20} />
          <span>Media Gallery</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[config.columns as keyof typeof gridCols]} gap-4`}>
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer overflow-hidden rounded-lg">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || 'Gallery image'}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Play size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.caption || 'Gallery image'}
                      className="w-full max-h-[80vh] object-contain"
                    />
                  ) : (
                    <video
                      controls
                      className="w-full max-h-[80vh]"
                      src={item.url}
                    />
                  )}
                  {config.showCaptions && item.caption && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {item.caption}
                    </p>
                  )}
                </DialogContent>
              </Dialog>
              
              {config.showCaptions && item.caption && (
                <p className="text-sm text-gray-600 mt-2">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
        
        {onConfigChange && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Gallery
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
