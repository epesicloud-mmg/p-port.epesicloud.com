import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Move, Settings } from "lucide-react";
import { PortletRenderer } from "../portlets/PortletRenderer";
import { useQuery } from "@tanstack/react-query";

interface DragDropCanvasProps {
  pagePortlets: any[];
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
    items: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' },
    ],
  },
  'contact-form': {
    fields: ['name', 'email', 'message'],
    submitText: 'Send Message',
    showLabels: true,
    successMessage: 'Thank you for your message! We\'ll get back to you soon.',
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
    showRole: true,
    showBio: false,
  },
};

export function DragDropCanvas({
  pagePortlets,
  onPortletDrop,
  onPortletUpdate,
  onPortletRemove,
  previewMode,
}: DragDropCanvasProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const { data: availablePortlets } = useQuery({
    queryKey: ['/api/portlets'],
  });

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
    const portlet = availablePortlets?.find((p: any) => p.id === portletInstance.portletId);
    if (!portlet) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-600">Portlet not found</p>
        </div>
      );
    }

    const pagePortlet = {
      ...portletInstance,
      portlet,
      config: portletInstance.config || defaultConfigs[portlet.type as keyof typeof defaultConfigs] || {},
    };

    return (
      <PortletRenderer
        pagePortlet={pagePortlet}
        isEditing={!previewMode}
        onConfigChange={(newConfig) => onPortletUpdate(portletInstance.id, { config: newConfig })}
      />
    );
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
        {pagePortlets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Move size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop portlets here
              </h3>
              <p className="text-gray-600">
                Drag portlets from the library to start building your page
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagePortlets.map((portletInstance) => (
              <PortletWrapper key={portletInstance.id} portletInstance={portletInstance}>
                {renderPortlet(portletInstance)}
              </PortletWrapper>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}