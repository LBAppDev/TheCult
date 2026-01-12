# The Cult - Multiplayer Social Deduction Game

## Overview

A web-based multiplayer social deduction game inspired by The Resistance/The Cult. Players are secretly divided into Village and Cult teams, engaging in discussion, deception, and voting to complete or sabotage quests. The game supports 4-10 players with real-time state synchronization via polling.

**Core Gameplay:**
- Village team wins by completing 3 quests
- Cult team wins if 3 quests fail OR they correctly identify the Seer
- Roles: Villager, Seer (knows Cultists), Cultist (can sabotage)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack React Query for server state with polling (1-second intervals for game state updates)
- **Styling:** Tailwind CSS with shadcn/ui components, dark mode theme with mysterious/cult aesthetic
- **Animations:** Framer Motion for smooth transitions
- **Build Tool:** Vite with custom path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **API Pattern:** RESTful endpoints defined in shared/routes.ts with Zod validation
- **Storage:** In-memory storage (MemStorage class) with interface for future database integration
- **Real-time Updates:** HTTP polling (no WebSockets) - clients poll every 1 second

### Data Flow
- Shared schema definitions in `shared/schema.ts` using Zod for type safety
- API routes defined declaratively in `shared/routes.ts` with input/output validation
- Game state sanitization on server to hide secret information (roles visible based on viewer's role)

### Key Design Decisions

**Polling over WebSockets:**
- Simpler implementation for game state sync
- Server doesn't actively push updates; client requests drive state changes
- 1-second polling interval balances responsiveness with server load

**Role Visibility Logic:**
- Players see their own role
- Cultists see other Cultists
- Seer sees Cultists marked as such
- Villagers see no role information for others

**Shared Code Pattern:**
- `/shared/` directory contains schemas and route definitions used by both client and server
- Zod schemas provide runtime validation and TypeScript types

## External Dependencies

### Database
- **PostgreSQL** via Drizzle ORM (configured but using in-memory storage currently)
- Schema defined in `shared/schema.ts`
- Drizzle Kit for migrations (`db:push` command)

### UI Components
- **shadcn/ui:** Full component library with Radix UI primitives
- **Tailwind CSS:** Utility-first styling with custom theme variables
- **Lucide React:** Icon library

### Build & Development
- **Vite:** Frontend bundling with React plugin
- **esbuild:** Server bundling for production
- **tsx:** TypeScript execution for development

### Fonts
- Cinzel (display/headings)
- Inter/DM Sans (body text)
- Fira Code (monospace)