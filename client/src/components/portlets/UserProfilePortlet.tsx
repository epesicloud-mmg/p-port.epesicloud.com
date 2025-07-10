import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileConfig {
  showAvatar: boolean;
  showEmail: boolean;
  showJoinDate: boolean;
  showRole?: boolean;
  showBio?: boolean;
}

interface UserProfilePortletProps {
  config: UserProfileConfig;
  isEditing?: boolean;
  onConfigChange?: (config: UserProfileConfig) => void;
}

export function UserProfilePortlet({ 
  config, 
  isEditing = false, 
  onConfigChange 
}: UserProfilePortletProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfig, setTempConfig] = useState<UserProfileConfig>({
    showAvatar: true,
    showEmail: false,
    showJoinDate: true,
    showRole: true,
    showBio: false,
    ...config
  });
  const { user } = useAuth();

  const handleSave = () => {
    onConfigChange?.(tempConfig);
    setIsConfiguring(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsConfiguring(false);
  };

  // Mock user data for display when no user is logged in
  const displayUser = user || {
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john.doe@example.com',
    profileImageUrl: null,
    role: 'Member',
    bio: 'Digital experience enthusiast and web developer passionate about creating amazing user experiences.',
    joinDate: '2024-01-15'
  };

  const userInitials = `${displayUser.firstName?.[0] || 'J'}${displayUser.lastName?.[0] || 'D'}`;
  const fullName = `${displayUser.firstName || 'John'} ${displayUser.lastName || 'Doe'}`;

  if (isConfiguring && isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure User Profile</CardTitle>
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="showAvatar"
                checked={tempConfig.showAvatar}
                onCheckedChange={(checked) => 
                  setTempConfig({ ...tempConfig, showAvatar: checked })
                }
              />
              <Label htmlFor="showAvatar">Show Profile Picture</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showEmail"
                checked={tempConfig.showEmail}
                onCheckedChange={(checked) => 
                  setTempConfig({ ...tempConfig, showEmail: checked })
                }
              />
              <Label htmlFor="showEmail">Show Email Address</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showJoinDate"
                checked={tempConfig.showJoinDate}
                onCheckedChange={(checked) => 
                  setTempConfig({ ...tempConfig, showJoinDate: checked })
                }
              />
              <Label htmlFor="showJoinDate">Show Join Date</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showRole"
                checked={tempConfig.showRole}
                onCheckedChange={(checked) => 
                  setTempConfig({ ...tempConfig, showRole: checked })
                }
              />
              <Label htmlFor="showRole">Show User Role</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showBio"
                checked={tempConfig.showBio}
                onCheckedChange={(checked) => 
                  setTempConfig({ ...tempConfig, showBio: checked })
                }
              />
              <Label htmlFor="showBio">Show Biography</Label>
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
      
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {tempConfig.showAvatar && (
              <Avatar className="w-20 h-20">
                <AvatarImage src={displayUser.profileImageUrl || undefined} alt={fullName} />
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
            )}
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">{fullName}</h3>
              
              {tempConfig.showRole && (
                <Badge variant="secondary" className="mb-2">
                  {displayUser.role || 'Member'}
                </Badge>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                {tempConfig.showEmail && (
                  <div className="flex items-center justify-center space-x-2">
                    <Mail size={14} />
                    <span>{displayUser.email}</span>
                  </div>
                )}
                
                {tempConfig.showJoinDate && (
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar size={14} />
                    <span>
                      Joined {new Date(displayUser.joinDate || '2024-01-15').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                )}
              </div>
              
              {tempConfig.showBio && displayUser.bio && (
                <p className="text-sm text-gray-700 mt-3 px-2">
                  {displayUser.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}