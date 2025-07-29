# DoX - Big 12 Conference Policy Management System

A comprehensive policy management and manual generation system for the Big 12 Conference, powered by AI integration and modern web technologies.

## Overview

DoX is a modern web application designed to manage, search, and generate administrative manuals for Big 12 Conference sports policies. Built with HELiiX AI Solutions' design system, the platform provides:

- **Policy Database**: Centralized storage of 191+ conference policies across 8 sports
- **Search & Filter**: Advanced full-text search with PostgreSQL GIN indexes
- **Manual Generation**: Dynamic PDF generation with React PDF and Big 12 branding
- **Version Control**: Complete policy version history and change tracking
- **AI Integration**: MCP server with 18 tools for Claude-powered policy management
- **Legal Review**: AI-powered policy analysis for loopholes and enforceability

## Features

- 📚 **Policy Management**: Create, read, update, and delete policies
- 🔍 **Advanced Search**: Full-text search with filtering by sport, category, and tags
- 📄 **Manual Generation**: Generate PDF manuals on-demand with custom selections
- 📊 **Analytics Dashboard**: Track policy usage and changes
- 🔐 **Secure Access**: Role-based permissions for administrators and viewers
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- **Backend**: Supabase (PostgreSQL) - Project ID: vfzgnvcwakjxtdsaedfq
- **AI Integration**: Model Context Protocol (MCP) Server
- **Authentication**: Supabase Auth with RLS policies
- **PDF Generation**: React PDF with custom Big 12 templates
- **Design System**: HELiiX minimalist black/white aesthetic
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel / Docker

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/NicktheQuickFTW/DoX.git
cd DoX

# Install dependencies
npm install

# Install MCP server dependencies
cd mcp-server && npm install && cd ..

# Set up environment variables
cp .env.example .env.local

# Build MCP server
npm run build:mcp

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local` for the main app:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `mcp-server/.env` for the MCP server:
```env
SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # For admin operations
MCP_SERVER_NAME="DoX Policy Management"
MCP_SERVER_VERSION=1.0.0
```

## Project Structure

```
DoX/
├── src/
│   ├── app/              # Next.js app directory (App Router)
│   ├── components/       # React components with HELiiX design
│   ├── lib/             # Utilities (Supabase client, helpers)
│   └── types/           # TypeScript types
├── mcp-server/          # Model Context Protocol server
│   ├── src/
│   │   ├── tools/       # 18 MCP tools (search, retrieve, etc.)
│   │   ├── resources/   # Resource providers
│   │   └── prompts/     # Interactive prompts
│   └── dist/            # Compiled MCP server
├── .claude/             # Claude Code configuration
│   ├── agents/          # Specialized AI agents
│   ├── commands/        # Custom slash commands
│   └── hooks/           # Pre/post tool hooks
├── PRPs/                # Product Requirement Prompts
│   └── templates/       # PRP templates
├── public/              # Static assets
└── supabase/           # Database migrations
```

## Database Schema

The system uses Supabase PostgreSQL with the `competition` schema:

### Core Tables
- **policies**: Main policy storage with full-text search
  - Multi-sport support via `applies_to_sports[]` array
  - Policy numbers: `{SPORT}-{CATEGORY}-{NUMBER}`
  - GIN indexes for fast search
- **sports**: 22 Big 12 sports with abbreviations
- **policy_versions**: Complete version history tracking
- **manuals**: Generated manual configurations
- **manual_policies**: Junction table for manual composition

### Key Features
- Row-level security (RLS) for access control
- Full-text search with PostgreSQL ts_vector
- JSONB fields for flexible metadata
- Automatic timestamps and audit trails

## MCP Server

DoX includes a Model Context Protocol (MCP) server that provides programmatic access to the policy management system. This allows deep integration with AI assistants like Claude.

### MCP Features
- **18 Tools** across 5 categories:
  - Search Tools: Full-text, sport, category, keyword searches
  - Retrieval Tools: Get policies, history, listings
  - List Tools: Sports, categories, tags, templates
  - Generation Tools: PDF manuals with React PDF
  - Management Tools: CRUD operations (with auth)
- **Resource URIs** for direct access:
  - `policy://{policy_number}` - Individual policies
  - `policy://sport/{abbreviation}` - Sport policies
  - `manual://{uuid}` - Generated manuals
- **Interactive Prompts**:
  - `/dox_search` - Interactive policy search
  - `/dox_generate_manual` - Manual creation wizard
  - `/dox_compliance_check` - Policy compliance verification

### Claude Integration
```bash
claude mcp add dox-server \
  -e SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co \
  -e SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_KEY=your_service_key \
  -- node /path/to/DoX/mcp-server/dist/index.js
```

See the [MCP Server README](./mcp-server/README.md) for detailed setup and usage instructions.

## Claude Code Integration

DoX includes advanced Claude Code features for enhanced development:

### Sub-Agents
- **Policy Management**: policy-analyzer, manual-generator, policy-counsel
- **UI/UX Development**: ux-engineer, ui-implementation, mobile-ux-engineer, ui-converter, ui-testing

### Custom Commands
- `/init` - Initialize DoX in a new Claude session
- `/generate-prp` - Create Product Requirement Prompts
- `/init-foundation` - Set up standardized project foundation
- `/dox_search` - Interactive policy search

### Development Hooks
- Pre-tool validation for dangerous operations
- Policy format verification
- Audit trail maintenance

## Development Commands

```bash
# Main application
npm run dev                 # Start development server
npm run build              # Build for production
npm run lint               # Run ESLint
npm run typecheck          # TypeScript checking
npm run format             # Format with Prettier

# MCP Server
npm run build:mcp          # Build MCP server
npm run dev:mcp            # MCP development mode

# Database
npm run db:push            # Push to Supabase
npm run db:generate        # Generate types
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

© 2025 Big 12 Conference. All rights reserved.