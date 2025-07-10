import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Save, X, Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactFormConfig {
  fields: string[];
  submitText: string;
  showLabels: boolean;
  successMessage: string;
  emailTo?: string;
}

interface ContactFormPortletProps {
  config: ContactFormConfig;
  isEditing?: boolean;
  onConfigChange?: (config: ContactFormConfig) => void;
}

const availableFields = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'company', label: 'Company', type: 'text' },
  { id: 'subject', label: 'Subject', type: 'text' },
  { id: 'message', label: 'Message', type: 'textarea' },
];

export function ContactFormPortlet({ 
  config, 
  isEditing = false, 
  onConfigChange 
}: ContactFormPortletProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfig, setTempConfig] = useState<ContactFormConfig>({
    fields: ['name', 'email', 'message'],
    submitText: 'Send Message',
    showLabels: true,
    successMessage: 'Thank you for your message! We\'ll get back to you soon.',
    ...config
  });
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onConfigChange?.(tempConfig);
    setIsConfiguring(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsConfiguring(false);
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      setTempConfig({
        ...tempConfig,
        fields: [...tempConfig.fields, fieldId]
      });
    } else {
      setTempConfig({
        ...tempConfig,
        fields: tempConfig.fields.filter(f => f !== fieldId)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({});
      toast({
        title: "Message Sent!",
        description: tempConfig.successMessage,
      });
    }, 1000);
  };

  if (isConfiguring && isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure Contact Form</CardTitle>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="showLabels"
              checked={tempConfig.showLabels}
              onCheckedChange={(checked) => 
                setTempConfig({ ...tempConfig, showLabels: checked })
              }
            />
            <Label htmlFor="showLabels">Show Field Labels</Label>
          </div>
          
          <div>
            <Label htmlFor="submitText">Submit Button Text</Label>
            <Input
              id="submitText"
              value={tempConfig.submitText}
              onChange={(e) => 
                setTempConfig({ ...tempConfig, submitText: e.target.value })
              }
              placeholder="Send Message"
            />
          </div>
          
          <div>
            <Label htmlFor="successMessage">Success Message</Label>
            <Textarea
              id="successMessage"
              value={tempConfig.successMessage}
              onChange={(e) => 
                setTempConfig({ ...tempConfig, successMessage: e.target.value })
              }
              placeholder="Thank you message..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="emailTo">Send Emails To (optional)</Label>
            <Input
              id="emailTo"
              value={tempConfig.emailTo || ''}
              onChange={(e) => 
                setTempConfig({ ...tempConfig, emailTo: e.target.value })
              }
              placeholder="admin@example.com"
              type="email"
            />
          </div>
          
          <div>
            <Label className="text-base font-medium">Form Fields</Label>
            <div className="space-y-2 mt-2">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={tempConfig.fields.includes(field.id)}
                    onCheckedChange={(checked) => 
                      handleFieldToggle(field.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={field.id}>{field.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tempConfig.fields.map((fieldId) => {
              const field = availableFields.find(f => f.id === fieldId);
              if (!field) return null;

              return (
                <div key={fieldId}>
                  {tempConfig.showLabels && (
                    <Label htmlFor={fieldId} className="block mb-1">
                      {field.label}
                      {['name', 'email', 'message'].includes(fieldId) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  )}
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={fieldId}
                      value={formData[fieldId] || ''}
                      onChange={(e) => setFormData({ ...formData, [fieldId]: e.target.value })}
                      placeholder={!tempConfig.showLabels ? field.label : ''}
                      required={['name', 'email', 'message'].includes(fieldId)}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={fieldId}
                      type={field.type}
                      value={formData[fieldId] || ''}
                      onChange={(e) => setFormData({ ...formData, [fieldId]: e.target.value })}
                      placeholder={!tempConfig.showLabels ? field.label : ''}
                      required={['name', 'email', 'message'].includes(fieldId)}
                    />
                  )}
                </div>
              );
            })}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || isEditing}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={14} className="mr-2" />
                  {tempConfig.submitText}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}