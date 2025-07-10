import React from 'react';
import { ContentDisplayPortlet } from './ContentDisplayPortlet';
import { NavigationPortlet } from './NavigationPortlet';
import { MediaGalleryPortlet } from './MediaGalleryPortlet';
import { ContactFormPortlet } from './ContactFormPortlet';
import { UserProfilePortlet } from './UserProfilePortlet';
import { type PagePortlet } from '@shared/schema';

interface PortletRendererProps {
  pagePortlet: PagePortlet;
  isEditing?: boolean;
  onConfigChange?: (config: any) => void;
}

export function PortletRenderer({ pagePortlet, isEditing = false, onConfigChange }: PortletRendererProps) {
  const { portlet, config, position } = pagePortlet;
  
  if (!portlet) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Portlet not found</p>
      </div>
    );
  }

  const renderPortlet = () => {
    switch (portlet.type) {
      case 'content-display':
        return (
          <ContentDisplayPortlet
            config={config}
            isEditing={isEditing}
            onConfigChange={onConfigChange}
          />
        );
      case 'navigation':
        return (
          <NavigationPortlet
            config={config}
            isEditing={isEditing}
            onConfigChange={onConfigChange}
          />
        );
      case 'media-gallery':
        return (
          <MediaGalleryPortlet
            config={config}
            isEditing={isEditing}
            onConfigChange={onConfigChange}
          />
        );
      case 'contact-form':
        return (
          <ContactFormPortlet
            config={config}
            isEditing={isEditing}
            onConfigChange={onConfigChange}
          />
        );
      case 'user-profile':
        return (
          <UserProfilePortlet
            config={config}
            isEditing={isEditing}
            onConfigChange={onConfigChange}
          />
        );
      default:
        return (
          <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Unknown portlet type: {portlet.type}</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`portlet-container ${isEditing ? 'editing' : ''}`}
      style={{
        gridColumn: position?.x ? `${position.x} / span ${position.width || 1}` : undefined,
        gridRow: position?.y ? `${position.y} / span ${position.height || 1}` : undefined,
      }}
    >
      {renderPortlet()}
    </div>
  );
}