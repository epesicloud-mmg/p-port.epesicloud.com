import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, User, Mail, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserProfileProps {
  config: {
    showAvatar: boolean;
    showEmail: boolean;
    showJoinDate: boolean;
    showLocation: boolean;
    showBio: boolean;
  };
  onConfigChange?: (config: any) => void;
  isEditing?: boolean;
}

export function UserProfile({ 
  config, 
  onConfigChange, 
  isEditing = false 
}: UserProfileProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [editMode, setEditMode] = useState(isEditing);
  const { user } = useAuth();

  const handleSave = () => {
    onConfigChange?.(localConfig);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setEditMode(false);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'Anonymous User';
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString();
    }
    return 'N/A';
  };

  if (editMode) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Profile Settings</CardTitle>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="showAvatar"
              checked={localConfig.showAvatar}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showAvatar: checked })}
            />
            <Label htmlFor="showAvatar">Show Avatar</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showEmail"
              checked={localConfig.showEmail}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showEmail: checked })}
            />
            <Label htmlFor="showEmail">Show Email</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showJoinDate"
              checked={localConfig.showJoinDate}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showJoinDate: checked })}
            />
            <Label htmlFor="showJoinDate">Show Join Date</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showLocation"
              checked={localConfig.showLocation}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showLocation: checked })}
            />
            <Label htmlFor="showLocation">Show Location</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showBio"
              checked={localConfig.showBio}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showBio: checked })}
            />
            <Label htmlFor="showBio">Show Bio</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User size={20} />
          <span>User Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {config.showAvatar && (
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {getFullName()}
            </h3>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Member</Badge>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
          
          <div className="w-full space-y-3">
            {config.showEmail && user?.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            )}
            
            {config.showJoinDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Joined {getJoinDate()}</span>
              </div>
            )}
            
            {config.showLocation && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>Location not set</span>
              </div>
            )}
            
            {config.showBio && (
              <div className="text-sm text-gray-600">
                <p>Digital experience enthusiast passionate about creating modern web applications.</p>
              </div>
            )}
          </div>
        </div>
        
        {onConfigChange && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
