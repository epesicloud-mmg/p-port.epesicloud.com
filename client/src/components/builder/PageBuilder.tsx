import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortletLibrary } from "./PortletLibrary";
import { DragDropCanvas } from "./DragDropCanvas";
import { Save, Eye, Undo, Redo, Settings } from "lucide-react";

interface PageBuilderProps {
  pageId?: string;
  onSave?: (pageData: any) => void;
}

export function PageBuilder({ pageId, onSave }: PageBuilderProps) {
  const [selectedPortlet, setSelectedPortlet] = useState<string | null>(null);
  const [pagePortlets, setPagePortlets] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const handlePortletSelect = (portletId: string) => {
    setSelectedPortlet(portletId);
  };

  const handlePortletDrop = (portletId: string, position: any) => {
    const newPortlet = {
      id: `portlet-${Date.now()}`,
      portletId,
      position,
      config: {},
    };
    setPagePortlets([...pagePortlets, newPortlet]);
  };

  const handlePortletUpdate = (portletInstanceId: string, updates: any) => {
    setPagePortlets(portlets =>
      portlets.map(p => 
        p.id === portletInstanceId 
          ? { ...p, ...updates }
          : p
      )
    );
  };

  const handlePortletRemove = (portletInstanceId: string) => {
    setPagePortlets(portlets =>
      portlets.filter(p => p.id !== portletInstanceId)
    );
  };

  const handleSave = () => {
    const pageData = {
      id: pageId,
      portlets: pagePortlets,
      layout: {
        columns: 12,
        rows: 'auto',
      },
    };
    onSave?.(pageData);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Undo size={16} className="mr-2" />
              Undo
            </Button>
            <Button variant="outline" size="sm">
              <Redo size={16} className="mr-2" />
              Redo
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={16} className="mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="outline" size="sm">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Portlet Library */}
        {!previewMode && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <PortletLibrary
              onPortletSelect={handlePortletSelect}
              selectedPortlet={selectedPortlet}
            />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50 overflow-auto">
          <DragDropCanvas
            portlets={pagePortlets}
            onPortletDrop={handlePortletDrop}
            onPortletUpdate={handlePortletUpdate}
            onPortletRemove={handlePortletRemove}
            previewMode={previewMode}
          />
        </div>

        {/* Right Sidebar - Properties Panel */}
        {!previewMode && selectedPortlet && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Portlet Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Configure the selected portlet properties here.
                  </div>
                  {/* Portlet-specific configuration would go here */}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
