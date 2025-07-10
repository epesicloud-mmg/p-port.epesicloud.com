import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Grid3X3, FileText, Navigation, Mail, Images, User, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PortletLibraryProps {
  onPortletSelect: (portletId: string) => void;
  selectedPortlet: string | null;
}

const getPortletIcon = (type: string) => {
  switch (type) {
    case 'content-display':
      return FileText;
    case 'navigation':
      return Navigation;
    case 'contact-form':
      return Mail;
    case 'media-gallery':
      return Images;
    case 'user-profile':
      return User;
    default:
      return Grid3X3;
  }
};

export function PortletLibrary({ onPortletSelect, selectedPortlet }: PortletLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: portlets, isLoading } = useQuery({
    queryKey: ['/api/portlets'],
  });

  const filteredPortlets = portlets?.filter((portlet: any) => {
    const matchesSearch = portlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portlet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || portlet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(portlets?.map((p: any) => p.category) || [])];

  const handlePortletClick = (portletId: string) => {
    onPortletSelect(portletId);
  };

  const handleDragStart = (e: React.DragEvent, portletId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ portletId }));
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portlet Library</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search portlets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Categories</div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Portlets */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Available Portlets</div>
        <div className="space-y-2">
          {filteredPortlets.map((portlet: any) => {
            const Icon = getPortletIcon(portlet.type);
            const isSelected = selectedPortlet === portlet.id;
            
            return (
              <Card
                key={portlet.id}
                className={`cursor-pointer transition-colors ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, portlet.id)}
                onClick={() => handlePortletClick(portlet.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {portlet.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {portlet.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {portlet.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Custom Portlet */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-primary cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-gray-500 hover:text-primary">
            <Plus size={20} />
            <span className="text-sm font-medium">Add Custom Portlet</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
