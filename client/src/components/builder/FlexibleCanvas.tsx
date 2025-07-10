import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Move, Settings, RotateCw, Copy, Layers } from "lucide-react";
import { PortletRenderer } from "../portlets/PortletRenderer";
import { useQuery } from "@tanstack/react-query";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface CanvasElement {
  id: string;
  type: 'section' | 'column' | 'portlet';
  portletId?: string;
  config?: any;
  position: Position;
  size: Size;
  zIndex: number;
  parentId?: string;
  children?: string[];
  style?: {
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    border?: string;
  };
  responsive?: {
    mobile?: { position: Position; size: Size; visible: boolean };
    tablet?: { position: Position; size: Size; visible: boolean };
    desktop?: { position: Position; size: Size; visible: boolean };
  };
}

interface FlexibleCanvasProps {
  elements: CanvasElement[];
  onElementAdd: (element: CanvasElement) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementRemove: (id: string) => void;
  onElementSelect: (id: string | null) => void;
  selectedElement: string | null;
  previewMode: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
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

export function FlexibleCanvas({
  elements,
  onElementAdd,
  onElementUpdate,
  onElementRemove,
  onElementSelect,
  selectedElement,
  previewMode,
  currentBreakpoint,
}: FlexibleCanvasProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const { data: availablePortlets } = useQuery({
    queryKey: ['/api/portlets'],
  });

  const gridSize = 20;

  const snapToGridPosition = useCallback((position: Position): Position => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }, [snapToGrid]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const rawPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      const position = snapToGridPosition(rawPosition);
      
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: 'portlet',
        portletId: data.portletId,
        config: defaultConfigs[data.type as keyof typeof defaultConfigs] || {},
        position,
        size: { width: 300, height: 200 },
        zIndex: Math.max(...elements.map(e => e.zIndex), 0) + 1,
        responsive: {
          mobile: { position, size: { width: 280, height: 200 }, visible: true },
          tablet: { position, size: { width: 300, height: 200 }, visible: true },
          desktop: { position, size: { width: 300, height: 200 }, visible: true },
        },
      };
      
      onElementAdd(newElement);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  }, [elements, onElementAdd, snapToGridPosition]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    if (previewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setIsDragging(true);
    onElementSelect(elementId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [elements, onElementSelect, previewMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const rawPosition = {
      x: e.clientX - canvasRect.left - dragOffset.x,
      y: e.clientY - canvasRect.top - dragOffset.y,
    };
    
    const position = snapToGridPosition(rawPosition);
    
    onElementUpdate(selectedElement, {
      position,
      [`responsive.${currentBreakpoint}.position`]: position,
    });
  }, [isDragging, selectedElement, dragOffset, onElementUpdate, snapToGridPosition, currentBreakpoint]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners
  useMemo(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    onElementSelect(elementId);
  }, [onElementSelect]);

  const renderElement = useCallback((element: CanvasElement) => {
    const responsiveData = element.responsive?.[currentBreakpoint];
    const position = responsiveData?.position || element.position;
    const size = responsiveData?.size || element.size;
    const isVisible = responsiveData?.visible !== false;

    if (!isVisible && !previewMode) {
      // Show ghost element in edit mode
      return (
        <div
          key={element.id}
          className="absolute border-2 border-dashed border-gray-300 bg-gray-100 opacity-50 flex items-center justify-center"
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: element.zIndex,
          }}
        >
          <span className="text-gray-500 text-sm">Hidden on {currentBreakpoint}</span>
        </div>
      );
    }

    if (!isVisible) return null;

    const isSelected = selectedElement === element.id;
    
    if (element.type === 'section') {
      return (
        <div
          key={element.id}
          className={`absolute border-2 ${
            isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
          } ${!previewMode ? 'cursor-move' : ''}`}
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: element.zIndex,
            backgroundColor: element.style?.backgroundColor || '#f9fafb',
            borderRadius: element.style?.borderRadius || 8,
            padding: element.style?.padding || 20,
            ...element.style,
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        >
          <div className="w-full h-full bg-white bg-opacity-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Section Container</span>
          </div>
          {!previewMode && isSelected && (
            <ElementControls
              element={element}
              onRemove={() => onElementRemove(element.id)}
              onDuplicate={() => {
                const duplicate = {
                  ...element,
                  id: `element-${Date.now()}`,
                  position: { x: element.position.x + 20, y: element.position.y + 20 },
                };
                onElementAdd(duplicate);
              }}
              onResizeStart={(e) => handleResizeStart(e, element.id)}
            />
          )}
        </div>
      );
    }

    if (element.type === 'portlet' && element.portletId) {
      const portlet = availablePortlets?.find((p: any) => p.id === element.portletId);
      if (!portlet) {
        return (
          <div
            key={element.id}
            className="absolute p-4 border border-red-200 bg-red-50 rounded-lg"
            style={{
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
              zIndex: element.zIndex,
            }}
          >
            <p className="text-red-600">Portlet not found</p>
          </div>
        );
      }

      const pagePortlet = {
        ...element,
        portlet,
        config: element.config || defaultConfigs[portlet.type as keyof typeof defaultConfigs] || {},
      };

      return (
        <div
          key={element.id}
          className={`absolute ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          } ${!previewMode ? 'cursor-move' : ''}`}
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: element.zIndex,
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        >
          <div className="w-full h-full overflow-hidden">
            <PortletRenderer
              pagePortlet={pagePortlet}
              isEditing={!previewMode}
              onConfigChange={(newConfig) => onElementUpdate(element.id, { config: newConfig })}
            />
          </div>
          {!previewMode && isSelected && (
            <ElementControls
              element={element}
              onRemove={() => onElementRemove(element.id)}
              onDuplicate={() => {
                const duplicate = {
                  ...element,
                  id: `element-${Date.now()}`,
                  position: { x: element.position.x + 20, y: element.position.y + 20 },
                };
                onElementAdd(duplicate);
              }}
              onResizeStart={(e) => handleResizeStart(e, element.id)}
            />
          )}
        </div>
      );
    }

    return null;
  }, [
    currentBreakpoint,
    previewMode,
    selectedElement,
    availablePortlets,
    handleElementMouseDown,
    handleResizeStart,
    onElementRemove,
    onElementAdd,
    onElementUpdate,
  ]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Canvas Controls */}
      {!previewMode && (
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-2">
          <Button
            size="sm"
            variant={showGrid ? "default" : "outline"}
            onClick={() => setShowGrid(!showGrid)}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={snapToGrid ? "default" : "outline"}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            Snap
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onElementSelect(null)}
          >
            <Layers size={16} />
          </Button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full relative ${
          draggedOver ? 'bg-blue-50' : 'bg-white'
        } ${showGrid && !previewMode ? 'canvas-grid' : ''}`}
        style={{
          backgroundImage: showGrid && !previewMode 
            ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
            : 'none',
          backgroundSize: showGrid && !previewMode ? `${gridSize}px ${gridSize}px` : 'auto',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDraggedOver('canvas');
        }}
        onDragLeave={() => setDraggedOver(null)}
        onDrop={handleCanvasDrop}
        onClick={() => !previewMode && onElementSelect(null)}
      >
        {elements.length === 0 && !previewMode ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Move size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drag elements here
              </h3>
              <p className="text-gray-600">
                Create flexible layouts with precise positioning
              </p>
            </div>
          </div>
        ) : (
          elements.map(renderElement)
        )}
      </div>
    </div>
  );
}

interface ElementControlsProps {
  element: CanvasElement;
  onRemove: () => void;
  onDuplicate: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

function ElementControls({ element, onRemove, onDuplicate, onResizeStart }: ElementControlsProps) {
  return (
    <>
      {/* Control Panel */}
      <div className="absolute -top-10 left-0 flex items-center space-x-1 bg-white rounded-md shadow-lg border p-1">
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <Settings size={12} />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onDuplicate}>
          <Copy size={12} />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <RotateCw size={12} />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Resize Handles */}
      <div 
        className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize"
        onMouseDown={onResizeStart}
      />
      <div 
        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize"
        onMouseDown={onResizeStart}
      />
      <div 
        className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize"
        onMouseDown={onResizeStart}
      />
      <div 
        className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize"
        onMouseDown={onResizeStart}
      />
    </>
  );
}