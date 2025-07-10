import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Move, Settings } from "lucide-react";
import { ContentDisplay } from "../portlets/ContentDisplay";
import { Navigation } from "../portlets/Navigation";
import { ContactForm } from "../portlets/ContactForm";
import { MediaGallery } from "../portlets/MediaGallery";
import { UserProfile } from "../portlets/UserProfile";

interface DragDropCanvasProps {
  portlets: any[];
  onPortletDrop: (portletId: string, position: any) => void;
  onPortletUpdate: (portletInstanceId: string, updates: any) => void;
  onPortletRemove: (portletInstanceId: string) => void;
  previewMode: boolean;
}

const defaultConfigs = {
  'content-display': {
    content: 'Click to edit content...',
    showTitle: true,
    allowHtml: false,
    title: 'Content Display',
  },
  'navigation': {
    menuType: 'horizontal',
    showIcons: false,
    maxDepth: 2,
  },
  'contact-form': {
    fields: ['name', 'email', 'message'],
    submitText: 'Send Message',
    showLabels: true,
    title: 'Contact Us',
  },
  'media-gallery': {
    layout: 'grid',
    columns: 3,
    showCaptions: true,
    items: [],
  },
  'user-profile': {
    showAvatar: true,
    showEmail: false,
    showJoinDate: true,
    showLocation: false,
    showBio: false,
  },
};

export function DragDropCanvas({
  portlets,
  onPortletDrop,
  onPortletUpdate,
  onPortletRemove,
  previewMode,
}: DragDropCanvasProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver('canvas');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      onPortletDrop(data.portletId, { x, y });
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  }, [onPortletDrop]);

  const renderPortlet = (portletInstance: any) => {
    const config = portletInstance.config || defaultConfigs[portletInstance.type as keyof typeof defaultConfigs];
    
    switch (portletInstance.type) {
      case 'content-display':
        return (
          <ContentDisplay
            config={config}
            onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
            isEditing={false}
          />
        );
      case 'navigation':
        return (
          <Navigation
            config={config}
            onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
            isEditing={false}
          />
        );
      case 'contact-form':
        return (
          <ContactForm
            config={config}
            onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
            isEditing={false}
          />
        );
      case 'media-gallery':
        return (
          <MediaGallery
            config={config}
            onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
            isEditing={false}
          />
        );
      case 'user-profile':
        return (
          <UserProfile
            config={config}
            onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
            isEditing={false}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-gray-500">
                Unknown portlet type: {portletInstance.type}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const PortletWrapper = ({ portletInstance, children }: { portletInstance: any; children: React.ReactNode }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (previewMode) {
      return <div className="relative">{children}</div>;
    }

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white rounded-md shadow-lg border p-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                // TODO: Open portlet settings
              }}
            >
              <Settings size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                // TODO: Enable drag mode
              }}
            >
              <Move size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => onPortletRemove(portletInstance.id)}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div
        className={`min-h-full p-6 transition-colors ${
          draggedOver === 'canvas' 
            ? 'bg-blue-50 border-2 border-dashed border-blue-300' 
            : 'bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {portlets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Move size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {previewMode ? 'Preview Mode' : 'Start Building'}
              </h3>
              <p className="text-gray-600">
                {previewMode 
                  ? 'This is how your page will look to visitors'
                  : 'Drag portlets from the library to start building your page'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {portlets.map((portletInstance) => (
              <PortletWrapper
                key={portletInstance.id}
                portletInstance={portletInstance}
              >
                {renderPortlet(portletInstance)}
              </PortletWrapper>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
