# CLAUDE.md - drugfacts.wiki Codebase Documentation

## Project Overview

drugfacts.wiki is a comprehensive drug information platform designed to provide healthcare professionals with easy access to FDA drug labeling information. The platform presents detailed prescribing information, dosing guidelines, contraindications, and clinical data in a user-friendly, searchable interface.

## Technology Stack

### Frontend
- **React 18** with TypeScript for building interactive UI
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **shadcn/ui** component library (built on Radix UI)
- **Tailwind CSS** for styling with custom medical theme
- **TanStack Query** for server state management
- **React Hook Form** with Zod for form validation

### Backend
- **Node.js** with Express.js server
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL support
- **Express Session** for session management
- **Passport.js** for authentication (scaffolded)

### Infrastructure
- **Docker** and Docker Compose for containerization
- **Nginx** as reverse proxy with SSL support
- **PostgreSQL** database (schema defined)
- **Redis** for session storage (configured)
- **Neon Database** for serverless PostgreSQL

## Project Structure

```
/root/repo/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components (40+ components)
│   │   │   ├── DrugHeader.tsx
│   │   │   ├── CollapsibleSection.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/           # Route components
│   │   │   ├── Home.tsx
│   │   │   ├── DrugDetail.tsx
│   │   │   ├── Search.tsx
│   │   │   └── not-found.tsx
│   │   ├── data/            # Static drug data (temporary)
│   │   ├── lib/             # Utilities and helpers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── main.tsx         # Application entry point
├── server/                   # Backend Express server
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Storage abstraction layer
│   └── vite.ts              # Vite integration
├── shared/                   # Shared code between client/server
│   └── schema.ts            # Database schema definitions
├── scripts/                  # Deployment and development scripts
├── nginx/                    # Nginx configuration
└── Docker files             # Containerization setup
```

## Key Features

### Implemented
- Comprehensive drug information display with FDA label data
- Search functionality for medications
- Responsive, mobile-first design
- Collapsible sections for organized information
- Related drug suggestions
- SEO optimization with structured data
- Health check endpoints
- Docker deployment ready

### In Progress
- Database integration (schema defined, using static data)
- User authentication system
- Full-text search capabilities
- Therapeutic class browsing
- Manufacturer listings

## Data Model

### Drug Information Schema
```typescript
interface DrugLabel {
  drugName: string
  genericName?: string
  activeIngredient?: string
  boxedWarning?: string
  warnings?: string
  precautions?: string
  adverseReactions?: string
  drugInteractions?: string
  contraindications?: string
  indicationsAndUsage?: string
  dosageAndAdministration?: string
  overdosage?: string
  description?: string
  clinicalPharmacology?: string
  nonClinicalToxicology?: string
  clinicalStudies?: string
  howSupplied?: string
  patientCounseling?: string
  principalDisplayPanel?: string
  spl?: string
  setId: string
  therapeuticClass?: string
  dea?: string
  manufacturer?: string
  slug: string
}
```

### Database Schema (Drizzle ORM)
- **users** table: Authentication and user management
- **drugs** table: Drug information storage
- Configured for PostgreSQL with Neon Database

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:generate
npm run db:migrate
npm run db:push

# Docker development
./scripts/dev.sh

# Docker production deployment
./scripts/deploy.sh
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/drugs` - List all drugs (placeholder)
- `GET /api/drugs/:id` - Get specific drug information (placeholder)
- `GET /api/search` - Search drugs (placeholder)

## Environment Variables

```env
DATABASE_URL=          # PostgreSQL connection string
SESSION_SECRET=        # Express session secret
NODE_ENV=             # development | production
PORT=                 # Server port (default: 5005)
```

## Deployment

The project includes comprehensive Docker support:

1. **Development**: `docker-compose.dev.yml` for local development
2. **Production**: `docker-compose.yml` with full stack:
   - Application container (Node.js)
   - PostgreSQL database
   - Redis for sessions
   - Nginx reverse proxy

### Production Deployment Steps
1. Configure environment variables
2. Run `./scripts/deploy.sh`
3. Access application at configured domain

## Current Status

The application is in a functional MVP state with:
- Working drug detail pages (using Mounjaro as example data)
- Professional medical UI design
- Search and navigation functionality
- Docker deployment infrastructure
- Database schema defined but not yet connected
- Authentication system scaffolded

## Next Steps

1. Connect PostgreSQL database and migrate from static data
2. Implement full-text search functionality
3. Complete authentication system
4. Add more drug data and implement data import pipeline
5. Implement caching strategy with Redis
6. Add analytics and monitoring
7. Enhance SEO with server-side rendering

## Testing

Currently, no automated tests are implemented. Testing infrastructure needs to be added.

## Security Considerations

- Non-root Docker user for production
- Environment variable configuration
- HTTPS/SSL support through Nginx
- Rate limiting configured in Nginx
- Security headers in place
- Authentication system ready for implementation

## Performance Optimizations

- Vite for optimized builds
- Code splitting and lazy loading support
- Static asset optimization
- Nginx caching configuration
- Database query optimization (pending implementation)

## Contributing

When contributing to this codebase:
1. Follow the existing TypeScript and React patterns
2. Use the established component library (shadcn/ui)
3. Maintain the medical theme and professional design
4. Ensure mobile responsiveness
5. Add appropriate TypeScript types
6. Follow the established file structure