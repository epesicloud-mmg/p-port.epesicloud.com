import { storage } from "./storage";

const builtInPortlets = [
  {
    name: 'Content Display',
    type: 'content-display',
    category: 'Content',
    version: '1.0.0',
    description: 'Display rich text content and HTML',
    icon: 'fas fa-file-text',
    config: {
      allowHtml: true,
      showTitle: true,
      contentType: 'text',
    },
    isBuiltIn: true,
  },
  {
    name: 'Navigation Menu',
    type: 'navigation',
    category: 'Navigation',
    version: '1.0.0',
    description: 'Create navigation menus and links',
    icon: 'fas fa-bars',
    config: {
      orientation: 'horizontal',
      style: 'default',
      showIcons: true,
    },
    isBuiltIn: true,
  },
  {
    name: 'Contact Form',
    type: 'contact-form',
    category: 'Forms',
    version: '1.0.0',
    description: 'Contact form with validation',
    icon: 'fas fa-envelope',
    config: {
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message',
      showLabels: true,
    },
    isBuiltIn: true,
  },
  {
    name: 'Media Gallery',
    type: 'media-gallery',
    category: 'Media',
    version: '1.0.0',
    description: 'Display images and videos',
    icon: 'fas fa-images',
    config: {
      layout: 'grid',
      columns: 3,
      showCaptions: true,
    },
    isBuiltIn: true,
  },
  {
    name: 'User Profile',
    type: 'user-profile',
    category: 'User',
    version: '1.0.0',
    description: 'Display user profile information',
    icon: 'fas fa-user',
    config: {
      showAvatar: true,
      showEmail: false,
      showJoinDate: true,
    },
    isBuiltIn: true,
  },
];

export async function seedBuiltInPortlets() {
  try {
    // Check if built-in portlets already exist
    const existingPortlets = await storage.getAllPortlets();
    const existingBuiltInPortlets = existingPortlets.filter(p => p.isBuiltIn);
    
    if (existingBuiltInPortlets.length > 0) {
      console.log("Built-in portlets already exist, skipping seed");
      return;
    }
    
    console.log("Seeding built-in portlets...");
    const portlets = [];
    
    for (const portletData of builtInPortlets) {
      const portlet = await storage.createPortlet(portletData);
      portlets.push(portlet);
    }
    
    console.log(`Successfully seeded ${portlets.length} built-in portlets`);
    return portlets;
  } catch (error) {
    console.error("Error seeding built-in portlets:", error);
    throw error;
  }
}