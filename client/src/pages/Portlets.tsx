import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Layout, FileText, Navigation, Image, Mail, User, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPortletSchema, type Portlet } from "@shared/schema";
import SidebarNavigation from "@/components/layout/SidebarNavigation";

const portletFormSchema = insertPortletSchema.extend({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
});

type PortletFormData = z.infer<typeof portletFormSchema>;

const portletIcons = {
  "content-display": FileText,
  "navigation": Navigation,
  "media-gallery": Image,
  "contact-form": Mail,
  "user-profile": User,
  "layout": Layout,
  "widget": Settings,
};

const portletCategories = [
  "Content",
  "Navigation", 
  "Media",
  "Forms",
  "User",
  "Layout",
  "Widget"
];

export default function Portlets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPortlet, setEditingPortlet] = useState<Portlet | null>(null);
  const { toast } = useToast();

  const { data: portlets, isLoading } = useQuery({
    queryKey: ["/api/portlets"],
  });

  const createPortletMutation = useMutation({
    mutationFn: async (data: PortletFormData) => {
      return await apiRequest("/api/portlets", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portlets"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Portlet created successfully",
      });
    },
    onError: (error) => {
      console.error("Create portlet error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePortletMutation = useMutation({
    mutationFn: async (data: PortletFormData & { id: string }) => {
      const { id, ...updateData } = data;
      return await apiRequest(`/api/portlets/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portlets"] });
      setEditingPortlet(null);
      form.reset();
      toast({
        title: "Success",
        description: "Portlet updated successfully",
      });
    },
    onError: (error) => {
      console.error("Update portlet error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePortletMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/portlets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portlets"] });
      toast({
        title: "Success",
        description: "Portlet deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<PortletFormData>({
    resolver: zodResolver(portletFormSchema),
    defaultValues: {
      name: "",
      type: "",
      category: "",
      description: "",
      version: "1.0.0",
      icon: "",
      config: {},
      isBuiltIn: false,
      isActive: true,
    },
  });

  const onSubmit = async (data: PortletFormData) => {
    console.log("Form data:", data);
    console.log("Form errors:", form.formState.errors);
    
    if (editingPortlet) {
      updatePortletMutation.mutate({ ...data, id: editingPortlet.id });
    } else {
      createPortletMutation.mutate(data);
    }
  };

  const handleEdit = (portlet: Portlet) => {
    setEditingPortlet(portlet);
    form.reset({
      name: portlet.name,
      type: portlet.type,
      category: portlet.category,
      description: portlet.description || "",
      version: portlet.version,
      icon: portlet.icon || "",
      config: portlet.config || {},
      isBuiltIn: portlet.isBuiltIn,
      isActive: portlet.isActive,
    });
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingPortlet(null);
    form.reset();
  };

  const filteredPortlets = portlets?.filter((portlet: Portlet) => {
    const matchesSearch = portlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portlet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || portlet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPortletIcon = (type: string) => {
    const IconComponent = portletIcons[type as keyof typeof portletIcons] || Settings;
    return IconComponent;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portlets</h1>
              <p className="text-gray-600">Manage your reusable portlet components</p>
            </div>
            <Dialog open={isCreateOpen || !!editingPortlet} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Portlet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPortlet ? "Edit Portlet" : "Create New Portlet"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter portlet name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="content-display">Content Display</SelectItem>
                                <SelectItem value="navigation">Navigation</SelectItem>
                                <SelectItem value="media-gallery">Media Gallery</SelectItem>
                                <SelectItem value="contact-form">Contact Form</SelectItem>
                                <SelectItem value="user-profile">User Profile</SelectItem>
                                <SelectItem value="layout">Layout</SelectItem>
                                <SelectItem value="widget">Widget</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {portletCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Version</FormLabel>
                            <FormControl>
                              <Input placeholder="1.0.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter portlet description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <Input placeholder="fas fa-widget" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPortletMutation.isPending || updatePortletMutation.isPending}>
                        {editingPortlet
                          ? updatePortletMutation.isPending ? "Updating..." : "Update Portlet"
                          : createPortletMutation.isPending ? "Creating..." : "Create Portlet"
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search portlets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {portletCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortlets?.map((portlet: Portlet) => {
                const IconComponent = getPortletIcon(portlet.type);
                return (
                  <Card key={portlet.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{portlet.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {portlet.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                v{portlet.version}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleEdit(portlet)}
                          >
                            <Edit size={14} />
                          </Button>
                          {!portlet.isBuiltIn && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => deletePortletMutation.mutate(portlet.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm mb-3">
                        {portlet.description}
                      </CardDescription>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Type: {portlet.type}</span>
                        <div className="flex items-center gap-2">
                          {portlet.isBuiltIn && (
                            <Badge variant="outline" className="text-xs">
                              Built-in
                            </Badge>
                          )}
                          <Badge 
                            variant={portlet.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {portlet.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredPortlets?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layout size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portlets found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first portlet"
                }
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  Create Your First Portlet
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}