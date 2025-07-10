import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface MediaItem {
  url: string;
  caption?: string;
  alt?: string;
  type: 'image' | 'video';
}

interface MediaGalleryConfig {
  layout: 'grid' | 'carousel' | 'masonry';
  columns: number;
  showCaptions: boolean;
  items: MediaItem[];
}

interface MediaGalleryPortletProps {
  config: MediaGalleryConfig;
  isEditing?: boolean;
  onConfigChange?: (config: MediaGalleryConfig) => void;
}

export function MediaGalleryPortlet({ 
  config, 
  isEditing = false, 
  onConfigChange 
}: MediaGalleryPortletProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfig, setTempConfig] = useState<MediaGalleryConfig>({
    layout: 'grid',
    columns: 3,
    showCaptions: true,
    items: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        caption: 'Beautiful Mountain Landscape',
        alt: 'Mountain landscape with clear sky',
        type: 'image'
      },
      {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        caption: 'Forest Path',
        alt: 'Winding path through forest',
        type: 'image'
      },
      {
        url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
        caption: 'Ocean Waves',
        alt: 'Ocean waves hitting the shore',
        type: 'image'
      }
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

  const addMediaItem = () => {
    setTempConfig({
      ...tempConfig,
      items: [...tempConfig.items, { url: '', caption: '', alt: '', type: 'image' }]
    });
  };

  const removeMediaItem = (index: number) => {
    setTempConfig({
      ...tempConfig,
      items: tempConfig.items.filter((_, i) => i !== index)
    });
  };

  const updateMediaItem = (index: number, field: keyof MediaItem, value: string) => {
    const updatedItems = [...tempConfig.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setTempConfig({ ...tempConfig, items: updatedItems });
  };

  if (isConfiguring && isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure Media Gallery</CardTitle>
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
            <Label htmlFor="layout">Layout</Label>
            <Select 
              value={tempConfig.layout} 
              onValueChange={(value: 'grid' | 'carousel' | 'masonry') => 
                setTempConfig({ ...tempConfig, layout: value })
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
          
          <div>
            <Label htmlFor="columns">Columns</Label>
            <Select 
              value={tempConfig.columns.toString()} 
              onValueChange={(value) => 
                setTempConfig({ ...tempConfig, columns: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="6">6</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showCaptions"
              checked={tempConfig.showCaptions}
              onCheckedChange={(checked) => 
                setTempConfig({ ...tempConfig, showCaptions: checked })
              }
            />
            <Label htmlFor="showCaptions">Show Captions</Label>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Media Items</Label>
              <Button size="sm" onClick={addMediaItem}>
                <Plus size={14} className="mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {tempConfig.items.map((item, index) => (
                <div key={index} className="border p-3 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image/Video URL"
                      value={item.url}
                      onChange={(e) => updateMediaItem(index, 'url', e.target.value)}
                    />
                    <Select 
                      value={item.type} 
                      onValueChange={(value: 'image' | 'video') => 
                        updateMediaItem(index, 'type', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMediaItem(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <Input
                    placeholder="Caption"
                    value={item.caption || ''}
                    onChange={(e) => updateMediaItem(index, 'caption', e.target.value)}
                  />
                  <Input
                    placeholder="Alt text"
                    value={item.alt || ''}
                    onChange={(e) => updateMediaItem(index, 'alt', e.target.value)}
                  />
                </div>
              ))}
            </div>
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
    6: 'grid-cols-6'
  };

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
      
      {tempConfig.items.length > 0 ? (
        <div className={`grid gap-4 ${gridCols[tempConfig.columns as keyof typeof gridCols] || 'grid-cols-3'}`}>
          {tempConfig.items.map((item, index) => (
            <div key={index} className="group relative">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.alt || item.caption || `Gallery image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
                  }}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              )}
              {tempConfig.showCaptions && item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                  <p className="text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isEditing ? (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <p>Click "Configure" to add media items</p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          <p>No media items configured</p>
        </div>
      )}
    </div>
  );
}