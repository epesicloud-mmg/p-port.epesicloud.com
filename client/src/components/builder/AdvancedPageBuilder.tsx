import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Undo, 
  Redo, 
  Save, 
  Eye, 
  Settings, 
  Smartphone, 
  Tablet, 
  Monitor,
  Layers,
  Plus,
  Grid,
  Palette,
  Code
} from "lucide-react";
import { FlexibleCanvas } from "./FlexibleCanvas";
import { PortletLibrary } from "./PortletLibrary";

interface CanvasElement {
  id: string;
  type: 'section' | 'column' | 'portlet';
  portletId?: string;
  config?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  parentId?: string;
  children?: string[];
  style?: any;
  responsive?: {
    mobile?: { position: { x: number; y: number }; size: { width: number; height: number }; visible: boolean };
    tablet?: { position: { x: number; y: number }; size: { width: number; height: number }; visible: boolean };
    desktop?: { position: { x: number; y: number }; size: { width: number; height: number }; visible: boolean };
  };
}

interface AdvancedPageBuilderProps {
  pageId?: string;
  initialElements?: CanvasElement[];
  onSave?: (pageData: any) => void;
}

export function AdvancedPageBuilder({ 
  pageId = 'new-page',
  initialElements = [],
  onSave 
}: AdvancedPageBuilderProps) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [selectedPortlet, setSelectedPortlet] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  const handleElementAdd = useCallback((element: CanvasElement) => {
    setElements(prev => [...prev, element]);
    setSelectedElement(element.id);
  }, []);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => 
      prev.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    );
  }, []);

  const handleElementRemove = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  }, []);

  const handleElementSelect = useCallback((id: string | null) => {
    setSelectedElement(id);
    setSelectedPortlet(null);
  }, []);

  const handlePortletSelect = useCallback((portletId: string) => {
    setSelectedPortlet(portletId);
    setSelectedElement(null);
  }, []);

  const handleSave = useCallback(() => {
    const pageData = {
      id: pageId,
      elements,
      responsive: {
        mobile: { width: 375, height: 667 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1920, height: 1080 },
      },
      lastModified: new Date().toISOString(),
    };
    onSave?.(pageData);
  }, [pageId, elements, onSave]);

  const addSection = useCallback(() => {
    const newSection: CanvasElement = {
      id: `section-${Date.now()}`,
      type: 'section',
      position: { x: 100, y: 100 },
      size: { width: 600, height: 400 },
      zIndex: Math.max(...elements.map(e => e.zIndex), 0) + 1,
      style: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 20,
      },
      responsive: {
        mobile: { position: { x: 20, y: 100 }, size: { width: 335, height: 300 }, visible: true },
        tablet: { position: { x: 50, y: 100 }, size: { width: 500, height: 350 }, visible: true },
        desktop: { position: { x: 100, y: 100 }, size: { width: 600, height: 400 }, visible: true },
      },
    };
    handleElementAdd(newSection);
  }, [elements, handleElementAdd]);

  const selectedElementData = elements.find(el => el.id === selectedElement);

  const getBreakpointIcon = (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile': return <Smartphone size={16} />;
      case 'tablet': return <Tablet size={16} />;
      case 'desktop': return <Monitor size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Top Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" disabled>
                <Undo size={16} className="mr-1" />
                Undo
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Redo size={16} className="mr-1" />
                Redo
              </Button>
            </div>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus size={16} className="mr-1" />
                Section
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayers(!showLayers)}
              >
                <Layers size={16} className="mr-1" />
                Layers
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Responsive Breakpoint Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              {(['mobile', 'tablet', 'desktop'] as const).map((breakpoint) => (
                <Button
                  key={breakpoint}
                  variant={currentBreakpoint === breakpoint ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentBreakpoint(breakpoint)}
                >
                  {getBreakpointIcon(breakpoint)}
                </Button>
              ))}
            </div>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye size={16} className="mr-1" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save size={16} className="mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Tools & Portlets */}
        {!previewMode && (
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <Tabs defaultValue="elements" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="layers">Layers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="elements" className="flex-1 overflow-y-auto">
                <PortletLibrary
                  onPortletSelect={handlePortletSelect}
                  selectedPortlet={selectedPortlet}
                />
              </TabsContent>
              
              <TabsContent value="design" className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Page Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Palette size={16} />
                      <span className="text-sm">Theme</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Code size={16} />
                      <span className="text-sm">Custom CSS</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="layers" className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Elements</span>
                    <Badge variant="secondary">{elements.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`p-2 rounded border cursor-pointer hover:bg-gray-50 ${
                          selectedElement === element.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded bg-blue-500" />
                          <span className="text-sm capitalize">{element.type}</span>
                          {element.portletId && (
                            <Badge variant="outline" className="text-xs">
                              {element.portletId.slice(0, 8)}...
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Canvas Area */}
        <div 
          className="flex-1 relative"
          style={{
            width: currentBreakpoint === 'mobile' ? '375px' : 
                   currentBreakpoint === 'tablet' ? '768px' : '100%',
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          <FlexibleCanvas
            elements={elements}
            onElementAdd={handleElementAdd}
            onElementUpdate={handleElementUpdate}
            onElementRemove={handleElementRemove}
            onElementSelect={handleElementSelect}
            selectedElement={selectedElement}
            previewMode={previewMode}
            currentBreakpoint={currentBreakpoint}
          />
        </div>

        {/* Right Sidebar - Properties Panel */}
        {!previewMode && selectedElementData && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Element Properties</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedElementData.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">X Position</label>
                    <input
                      type="number"
                      value={selectedElementData.position.x}
                      onChange={(e) => 
                        handleElementUpdate(selectedElementData.id, {
                          position: { ...selectedElementData.position, x: parseInt(e.target.value) || 0 }
                        })
                      }
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y Position</label>
                    <input
                      type="number"
                      value={selectedElementData.position.y}
                      onChange={(e) => 
                        handleElementUpdate(selectedElementData.id, {
                          position: { ...selectedElementData.position, y: parseInt(e.target.value) || 0 }
                        })
                      }
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={selectedElementData.size.width}
                      onChange={(e) => 
                        handleElementUpdate(selectedElementData.id, {
                          size: { ...selectedElementData.size, width: parseInt(e.target.value) || 100 }
                        })
                      }
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={selectedElementData.size.height}
                      onChange={(e) => 
                        handleElementUpdate(selectedElementData.id, {
                          size: { ...selectedElementData.size, height: parseInt(e.target.value) || 100 }
                        })
                      }
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Z-Index</label>
                  <input
                    type="number"
                    value={selectedElementData.zIndex}
                    onChange={(e) => 
                      handleElementUpdate(selectedElementData.id, {
                        zIndex: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full p-1 border rounded text-sm"
                  />
                </div>

                {selectedElementData.type === 'section' && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Background Color</label>
                    <input
                      type="color"
                      value={selectedElementData.style?.backgroundColor || '#f9fafb'}
                      onChange={(e) => 
                        handleElementUpdate(selectedElementData.id, {
                          style: { ...selectedElementData.style, backgroundColor: e.target.value }
                        })
                      }
                      className="w-full p-1 border rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}