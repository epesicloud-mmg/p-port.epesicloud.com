import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import SidebarNavigation from "@/components/layout/SidebarNavigation";
import { CreateWorkspaceModal } from "@/components/modals/CreateWorkspaceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Code,
  Table,
  Settings,
  Play,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Download
} from "lucide-react";

const createSchemaFormSchema = z.object({
  name: z.string().min(1, "Schema name is required"),
  tableName: z.string().min(1, "Table name is required"),
  description: z.string().optional(),
  schema: z.string().min(1, "Schema definition is required"),
});

type CreateSchemaFormData = z.infer<typeof createSchemaFormSchema>;

const fieldTypeOptions = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "DateTime" },
  { value: "text", label: "Text" },
  { value: "decimal", label: "Decimal" },
  { value: "json", label: "JSON" },
];

export default function ServiceBuilder() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [createSchemaModalOpen, setCreateSchemaModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [schemaFields, setSchemaFields] = useState<any[]>([
    { name: "id", type: "integer", required: true, primary: true, autoIncrement: true }
  ]);

  const form = useForm<CreateSchemaFormData>({
    resolver: zodResolver(createSchemaFormSchema),
    defaultValues: {
      name: "",
      tableName: "",
      description: "",
      schema: "",
    },
  });

  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: isAuthenticated,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: schemas, isLoading: schemasLoading } = useQuery({
    queryKey: ['/api/workspaces', currentWorkspace?.id, 'service-schemas'],
    enabled: !!currentWorkspace?.id,
  });

  const createSchemaMutation = useMutation({
    mutationFn: async (data: CreateSchemaFormData) => {
      const response = await apiRequest('POST', `/api/workspaces/${currentWorkspace.id}/service-schemas`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service schema created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces', currentWorkspace.id, 'service-schemas'] });
      setCreateSchemaModalOpen(false);
      form.reset();
      setSchemaFields([
        { name: "id", type: "integer", required: true, primary: true, autoIncrement: true }
      ]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service schema",
        variant: "destructive",
      });
    },
  });

  // Set the first workspace as current if none selected
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Auto-generate table name from schema name
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.name && !form.getValues('tableName')) {
        const tableName = values.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        form.setValue('tableName', tableName);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update schema JSON when fields change
  useEffect(() => {
    const schemaJson = {
      fields: schemaFields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required || false,
        unique: field.unique || false,
        defaultValue: field.defaultValue || null,
        validation: field.validation || null,
      })),
      relations: [],
      indexes: schemaFields
        .filter(field => field.indexed)
        .map(field => ({ fields: [field.name] })),
    };
    
    form.setValue('schema', JSON.stringify(schemaJson, null, 2));
  }, [schemaFields, form]);

  if (isLoading || workspacesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading Service Builder...</p>
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation
          onCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
        />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary" size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Workspaces Found
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first workspace to start using Service Builder.
            </p>
            <Button onClick={() => setCreateWorkspaceModalOpen(true)}>
              Create Workspace
            </Button>
          </div>
        </div>
        <CreateWorkspaceModal
          open={createWorkspaceModalOpen}
          onOpenChange={setCreateWorkspaceModalOpen}
          onWorkspaceCreated={(workspace) => {
            setCurrentWorkspace(workspace);
            setCreateWorkspaceModalOpen(false);
          }}
        />
      </div>
    );
  }

  const addField = () => {
    setSchemaFields([
      ...schemaFields,
      {
        name: "",
        type: "string",
        required: false,
        unique: false,
        indexed: false,
        defaultValue: "",
        validation: "",
      }
    ]);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...schemaFields];
    newFields[index] = { ...newFields[index], ...updates };
    setSchemaFields(newFields);
  };

  const removeField = (index: number) => {
    if (index === 0) return; // Don't allow removing the ID field
    setSchemaFields(schemaFields.filter((_, i) => i !== index));
  };

  const generateTableName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const onSubmit = async (data: CreateSchemaFormData) => {
    try {
      await createSchemaMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const filteredSchemas = schemas?.filter((schema: any) => {
    return schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           schema.tableName.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const SchemaCard = ({ schema }: { schema: any }) => {
    const parsedSchema = JSON.parse(schema.schema);
    const fieldCount = parsedSchema.fields?.length || 0;
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-database/10 rounded-lg flex items-center justify-center">
                <Database className="text-database" size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">{schema.name}</CardTitle>
                <p className="text-sm text-gray-600">Table: {schema.tableName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {fieldCount} fields
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSchema(schema)}
              >
                <Edit size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="text-success" size={14} />
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span>{new Date(schema.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">Generated Components:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-success" size={12} />
                  <span>REST API</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-success" size={12} />
                  <span>Admin UI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-success" size={12} />
                  <span>Validation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-success" size={12} />
                  <span>Relations</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Code size={14} className="mr-1" />
                View API
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Table size={14} className="mr-1" />
                Open Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={(workspaceId) => {
          const workspace = workspaces.find((w: any) => w.id === workspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
          }
        }}
        onCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
      />
      
      <div className="flex pt-16">
        <SidebarNavigation
          projectCount={0}
          currentWorkspaceId={currentWorkspace?.id}
        />
        
        <main className="flex-1 ml-64 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Service Builder</h1>
              <p className="text-gray-600 mt-1">
                Auto-generate CRUD APIs and admin interfaces from data schemas
              </p>
            </div>
            <Dialog open={createSchemaModalOpen} onOpenChange={setCreateSchemaModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus size={16} className="mr-2" />
                  Create Schema
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Schemas</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{schemas?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active APIs</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{schemas?.length * 5 || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Code className="text-accent" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admin UIs</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{schemas?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Table className="text-success" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Relations</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Settings className="text-warning" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search schemas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                Documentation
              </Button>
            </div>
          </div>

          {/* Schemas Grid */}
          {schemasLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {schemas?.length === 0 ? 'No schemas yet' : 'No schemas found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {schemas?.length === 0 
                  ? 'Create your first data schema to auto-generate APIs and admin interfaces.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {schemas?.length === 0 && (
                <Button onClick={() => setCreateSchemaModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Schema
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemas.map((schema: any) => (
                <SchemaCard key={schema.id} schema={schema} />
              ))}
            </div>
          )}

          {/* Create Schema Modal */}
          <Dialog open={createSchemaModalOpen} onOpenChange={setCreateSchemaModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Service Schema</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="fields">Fields</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schema Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Job Board, Product Catalog"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tableName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-generated from schema name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this schema is used for..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="fields" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Schema Fields</h3>
                        <Button type="button" onClick={addField} size="sm">
                          <Plus size={16} className="mr-2" />
                          Add Field
                        </Button>
                      </div>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {schemaFields.map((field, index) => (
                          <Card key={index} className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                                <Input
                                  id={`field-name-${index}`}
                                  value={field.name}
                                  onChange={(e) => updateField(index, { name: e.target.value })}
                                  placeholder="field_name"
                                  disabled={index === 0}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`field-type-${index}`}>Type</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value) => updateField(index, { type: value })}
                                  disabled={index === 0}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fieldTypeOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2 flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`field-required-${index}`}
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField(index, { required: checked })}
                                    disabled={index === 0}
                                  />
                                  <Label htmlFor={`field-required-${index}`} className="text-sm">Required</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`field-unique-${index}`}
                                    checked={field.unique}
                                    onCheckedChange={(checked) => updateField(index, { unique: checked })}
                                    disabled={index === 0}
                                  />
                                  <Label htmlFor={`field-unique-${index}`} className="text-sm">Unique</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`field-indexed-${index}`}
                                    checked={field.indexed}
                                    onCheckedChange={(checked) => updateField(index, { indexed: checked })}
                                  />
                                  <Label htmlFor={`field-indexed-${index}`} className="text-sm">Indexed</Label>
                                </div>
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="space-y-4">
                      <div>
                        <Label htmlFor="schema-json">Generated Schema JSON</Label>
                        <FormField
                          control={form.control}
                          name="schema"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  id="schema-json"
                                  rows={12}
                                  className="font-mono text-sm"
                                  {...field}
                                  readOnly
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">What will be generated:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• REST API endpoints (GET, POST, PUT, DELETE)</li>
                          <li>• Admin table interface with CRUD operations</li>
                          <li>• Form validation and error handling</li>
                          <li>• Search and filtering capabilities</li>
                          <li>• Pagination and sorting</li>
                          <li>• API documentation</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateSchemaModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSchemaMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createSchemaMutation.isPending ? "Creating..." : "Create Schema"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
      
      <CreateWorkspaceModal
        open={createWorkspaceModalOpen}
        onOpenChange={setCreateWorkspaceModalOpen}
        onWorkspaceCreated={(workspace) => {
          setCurrentWorkspace(workspace);
          setCreateWorkspaceModalOpen(false);
        }}
      />
    </div>
  );
}
