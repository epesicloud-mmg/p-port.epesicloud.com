import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Save, X, Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  config: {
    fields: string[];
    submitText: string;
    showLabels: boolean;
    title?: string;
  };
  onConfigChange?: (config: any) => void;
  isEditing?: boolean;
}

export function ContactForm({ 
  config, 
  onConfigChange, 
  isEditing = false 
}: ContactFormProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [editMode, setEditMode] = useState(isEditing);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleSave = () => {
    onConfigChange?.(localConfig);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setEditMode(false);
  };

  const onSubmit = (data: any) => {
    // Simulate form submission
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We'll get back to you soon!",
    });
    reset();
  };

  const availableFields = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel' },
    { id: 'subject', label: 'Subject', type: 'text' },
    { id: 'message', label: 'Message', type: 'textarea' },
  ];

  if (editMode) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contact Form Settings</CardTitle>
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
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={localConfig.title || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
              placeholder="Contact Us"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="submitText">Submit Button Text</Label>
            <Input
              id="submitText"
              value={localConfig.submitText}
              onChange={(e) => setLocalConfig({ ...localConfig, submitText: e.target.value })}
              placeholder="Send Message"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Form Fields</Label>
            <div className="space-y-2">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Switch
                    id={field.id}
                    checked={localConfig.fields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setLocalConfig({
                          ...localConfig,
                          fields: [...localConfig.fields, field.id]
                        });
                      } else {
                        setLocalConfig({
                          ...localConfig,
                          fields: localConfig.fields.filter(f => f !== field.id)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={field.id}>{field.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showLabels"
              checked={localConfig.showLabels}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showLabels: checked })}
            />
            <Label htmlFor="showLabels">Show Field Labels</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail size={20} />
          <span>{config.title || 'Contact Form'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {config.fields.map((fieldId) => {
            const field = availableFields.find(f => f.id === fieldId);
            if (!field) return null;

            return (
              <div key={fieldId} className="space-y-2">
                {config.showLabels && (
                  <Label htmlFor={fieldId}>{field.label}</Label>
                )}
                {field.type === 'textarea' ? (
                  <Textarea
                    id={fieldId}
                    placeholder={!config.showLabels ? field.label : ''}
                    {...register(fieldId, { required: true })}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={fieldId}
                    type={field.type}
                    placeholder={!config.showLabels ? field.label : ''}
                    {...register(fieldId, { required: true })}
                  />
                )}
                {errors[fieldId] && (
                  <p className="text-sm text-red-500">{field.label} is required</p>
                )}
              </div>
            );
          })}
          
          <Button type="submit" className="w-full">
            <Send size={16} className="mr-2" />
            {config.submitText}
          </Button>
        </form>
        
        {onConfigChange && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Form
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
