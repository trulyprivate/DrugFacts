# drugfacts.wiki - Drug Information Publishing Platform

## Overview

This is a full-stack web application called "drugfacts.wiki" for displaying comprehensive drug information from FDA labels. The platform is designed to provide healthcare professionals with detailed prescribing information, dosing guidelines, and clinical data in a user-friendly interface optimized for search engines and Core Web Vitals.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 21, 2025
- Implemented native browser functionality for drug page actions:
  - "Save to Favorites" button now uses browser bookmark APIs with fallbacks to manual bookmark instructions
  - "Share" button utilizes Web Share API for native sharing, with clipboard fallback for unsupported browsers
  - Added toast notifications for user feedback on bookmark and share actions
  - Enhanced mobile responsive design for action buttons with vertical stacking on small screens
- Fixed card spacing issues on home page with forced gap rules and inline styles
- Enhanced drug card clickability with improved hover effects, animations, and visual feedback
- Resolved mobile UI overflow issues across all components with comprehensive responsive design improvements
- Enhanced header search functionality:
  - Search bar expands when focused, hiding title and navigation for more space
  - Removed bookmark icon from header completely
  - Added smooth transitions for search expansion and element hiding
- Improved tab interface for drug pages:
  - Changed from vertical grid layout to horizontal flex layout
  - Added blue background and border highlighting for active tabs
  - Enhanced button-like appearance with proper hover states and transitions
  - Fixed CSS specificity issues to ensure styling only applies to tab buttons, not content areas
- Created therapeutic classes page (/therapeutic-classes):
  - Groups drugs by therapeutic classification pulled from drug data
  - Displays statistics on number of classes and drugs per class
  - Links directly to individual drug pages with hover effects
  - Shows drug details including generic name, manufacturer, and indication summaries

### January 20, 2025
- Fixed Next.js application startup by installing Next.js dependency
- Updated drug page to display all schema fields according to provided YAML specification
- Enhanced drug detail page with comprehensive sections including:
  - Highlights section with dosage administration
  - All schema-required fields: drugName, setId, slug, labeler, label properties
  - Full prescribing information sections: title, indicationsAndUsage, dosageAndAdministration, dosageFormsAndStrengths, warningsAndPrecautions, adverseReactions, clinicalPharmacology, clinicalStudies, howSupplied, useInSpecificPopulations, description, nonclinicalToxicology, instructionsForUse, mechanismOfAction, contraindications
  - Updated sidebar with complete drug information display including Set ID, labeler details, product type, and effective time
- Updated TypeScript interfaces to support both new schema structure and legacy field compatibility
- Fixed Dialog accessibility issues by adding DialogTitle and DialogDescription components
- Implemented comprehensive content generation system with:
  - SEO-optimized titles and meta descriptions with enhanced keywords and social media tags
  - Patient-friendly explanations that simplify medical terminology and provide clear usage information
  - Automated FAQ generation from drug label information with categorized sections
  - Related content suggestions including similar drugs, conditions, and alternative treatments
  - Enhanced search results with patient-friendly previews
- Created new tabbed interface for drug pages with Professional Info, Patient-Friendly, and FAQ & Related sections
- Enhanced home page to showcase new content generation features

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom medical-themed color palette and CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL (configured for Neon Database)
- **Session Management**: In-memory storage with planned PostgreSQL session store
- **API Design**: RESTful API structure with `/api` prefix

## Key Components

### Frontend Components
- **Layout Components**: Header with navigation and search, Footer with resource links
- **Drug Display**: DrugHeader for basic info, CollapsibleSection for organized content display
- **Search Functionality**: SearchBar component with real-time search capabilities
- **UI Components**: Complete shadcn/ui component library for consistent design

### Backend Components
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **Route Handler**: Express.js routes with error handling middleware
- **Database Schema**: Drizzle schema for users and drugs with proper typing

### Data Models
- **Drug Schema**: Comprehensive drug information including FDA label data
- **User Schema**: Basic user management structure
- **Type Safety**: Full TypeScript coverage with Zod validation schemas

## Data Flow

1. **Static Data**: Drug information stored as JSON with plans for database integration
2. **Search Flow**: Client-side search with future API endpoint integration
3. **SEO Optimization**: Structured data generation and meta tag management
4. **State Management**: React Query handles API calls and caching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Accessible UI primitive components

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific tooling

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with React Fast Refresh
- **TypeScript Compilation**: Real-time type checking during development
- **Database**: Configured for PostgreSQL with Drizzle migrations
- **Docker Development**: `docker-compose.dev.yml` for containerized development

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations with schema push capability
- **Environment**: Node.js production server serving static files and API routes

### Docker Deployment
- **Multi-stage Dockerfile**: Optimized production image with Node.js 20 Alpine
- **Docker Compose**: Full-stack deployment with PostgreSQL, Redis, and Nginx
- **Health Checks**: Built-in health monitoring for all services
- **Security**: Non-root user, security headers, rate limiting
- **SSL Ready**: Nginx configuration prepared for HTTPS with SSL certificates
- **Scaling**: Ready for horizontal scaling with load balancing

### Key Features
- **SEO Optimized**: Structured data, meta tags, and Core Web Vitals optimization
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Performance**: Static generation approach for drug information pages
- **Type Safety**: End-to-end TypeScript with shared types between client and server

The application is architected to handle drug information display with plans for database-driven content, search functionality, and user management while maintaining excellent performance and SEO characteristics.