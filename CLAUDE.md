# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server on localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm ci` - Run migrations and build (used in CI/CD)

### Payload CMS Commands
- `pnpm payload` - Access Payload CLI
- `pnpm payload migrate:create` - Create new database migration
- `pnpm payload migrate` - Run pending migrations
- `pnpm generate:types` - Generate TypeScript types from Payload config
- `pnpm generate:importmap` - Generate import map for admin panel

### Development Tips
- Use `pnpm devsafe` if you encounter Next.js cache issues (removes .next folder)
- Admin panel is accessible at `/admin` when running
- Database migrations are required when making schema changes in production

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS 3.33.0 with PostgreSQL (Vercel Postgres)
- **Database**: PostgreSQL with Vercel Postgres adapter
- **Storage**: Vercel Blob Storage for media files
- **Styling**: Tailwind CSS 4.1.6
- **UI Components**: Radix UI primitives with custom components
- **Rich Text**: Lexical editor from Payload

### Directory Structure

#### `/src/app` - Next.js App Router
- `(frontend)` - Public-facing site routes
  - `(site)` - Main website pages with dynamic routing
  - `digital-menu` - Interactive digital menu interface
  - `print-menu` - Print-optimized menu interface
- `(payload)` - Payload CMS admin and API routes
  - `admin` - Admin panel interface
  - `api` - Payload API endpoints
- `api` - Custom API routes (revalidation, webhooks)

#### `/src/collections` - Payload CMS Collections
- `Pages.ts` - Dynamic pages with block-based content
- `MenuItems.ts` - Restaurant menu items with categories and pricing
- `Categories.ts` - Menu categories organization
- `Events.ts` - Event management
- `Media.ts` - File uploads and media management
- `Users.ts` - Admin user authentication

#### `/src/globals` - Payload Global Settings
- `ContactInfo.ts` - Business contact information
- `Hours.ts` - Business hours configuration
- `SocialMedia.ts` - Social media links
- `Status.ts` - Site-wide status (e.g., sold out notifications)

#### `/src/blocks` - Reusable Content Blocks
- `HeroBlock.tsx` - Hero sections with CTAs
- `ContentBlock.tsx` - Rich text content with background images
- `ContactBlock.tsx` - Contact information display
- `EventsBlock.tsx` - Event listings
- `ImageBlock.tsx` - Single image display
- `ImageSliderBlock.tsx` - Image carousels
- `HeaderBlock.tsx` - Page headers

#### `/src/components` - React Components
- `BlockRenderer.tsx` - Renders page blocks dynamically
- `layout/` - Layout components (headers, navigation)
- `ui/` - Reusable UI components (buttons, sheets, sliders)

### Key Concepts

#### Content Management
- **Pages**: Use block-based layouts defined in `Pages.ts`
- **Menu Items**: Support sub-items for variations (sizes, etc.)
- **Categories**: Organize menu items hierarchically
- **Media**: Handled by Vercel Blob Storage with automatic resizing
- **Cache Invalidation**: Automatic revalidation via webhooks on content changes

#### Data Flow
1. Content managed in Payload admin at `/admin`
2. Data stored in PostgreSQL via Vercel Postgres
3. Frontend fetches data using Payload's `getPayload()` function
4. Static pages regenerated via ISR when content changes
5. Cache invalidated automatically through `afterChange` hooks

#### Authentication & Access
- Admin users managed through Payload's built-in auth
- Public read access for most content
- Private admin routes protected by Payload

### Environment Variables
- `PAYLOAD_SECRET` - Used for JWT signing
- `POSTGRES_URL` - Database connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token
- `NEXT_PUBLIC_SERVER_URL` - Public server URL for revalidation
- `REVALIDATE_TOKEN` - Token for cache revalidation endpoints

### Database Migrations
- Required for schema changes in production
- Located in `/src/migrations/`
- Must be run before deploying: `pnpm payload migrate`
- Development uses `push: false` to prevent accidental data loss

### Special Features
- **Digital Menu**: Interactive menu with drag-and-drop positioning
- **Print Menu**: Optimized layout for printing
- **Sold Out Status**: Global status management with visual indicators
- **Multi-language Support**: Arabic character support in slugs
- **Real-time Revalidation**: Automatic cache updates on content changes