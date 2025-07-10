# ModularDXP - Digital Experience Platform

## Overview

ModularDXP is a multi-tenant SaaS digital experience platform built with React and Node.js that enables organizations to create websites, portals, intranets, and dashboards through a modular portlet-based system. The platform provides drag-and-drop functionality, workspace management, and developer extensibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state, local state with React hooks
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Key Architecture Decisions
- **Monorepo Structure**: Single repository with client/, server/, and shared/ directories
- **Shared Schema**: Common TypeScript types and database schema between client and server
- **Multi-tenant**: Workspace-based organization with user access controls
- **Modular Design**: Portlet system for reusable UI components

## Key Components

### Database Schema
- **Users**: Authentication and profile management
- **Workspaces**: Multi-tenant organization with ownership
- **Projects**: Container for digital experiences (websites, portals, etc.)
- **Sites**: Individual site instances within projects
- **Pages**: Individual page content within sites
- **Portlets**: Reusable UI components/widgets
- **Themes**: Visual styling and layout templates
- **Assets**: File and media management
- **Service Schemas**: Custom data models for dynamic content

### Portlet System
- **Content Display**: Rich text and HTML content
- **Navigation**: Menu and navigation components
- **Contact Form**: Form building and submission
- **Media Gallery**: Image and video galleries
- **User Profile**: User information display
- **Configuration**: Each portlet has editable configuration options

### Page Builder
- **Drag-and-Drop**: Visual page construction interface
- **Preview Mode**: Real-time preview of pages being built
- **Portlet Library**: Browsable collection of available portlets
- **Save/Load**: Persistent page configurations

## Data Flow

1. **Authentication**: Users authenticate via Replit Auth (OpenID Connect)
2. **Workspace Selection**: Users select or create workspaces for organization
3. **Project Management**: Users create projects within workspaces
4. **Page Building**: Users drag portlets onto pages and configure them
5. **Content Management**: Assets and content are managed per workspace
6. **Data Persistence**: All configurations saved to PostgreSQL via Drizzle ORM

## External Dependencies

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express
- **Session Management**: PostgreSQL-backed session store

### Database
- **Neon**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Neon's built-in connection pooling

### UI/UX
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast bundling for production

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth for development environment

### Production
- **Build Process**: 
  - Frontend: Vite build to dist/public
  - Backend: ESBuild bundle to dist/index.js
- **Server**: Node.js Express server serving static files and API
- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Key Deployment Considerations
- **Static Assets**: Frontend built to static files served by Express
- **API Routes**: RESTful API with proper error handling
- **Database Migrations**: Drizzle Kit for schema migrations
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS required
- **Multi-tenancy**: Workspace-based data isolation
- **File Uploads**: Multer for handling asset uploads (10MB limit)

The architecture supports horizontal scaling through stateless server design and PostgreSQL session storage, enabling multiple server instances to share session data.