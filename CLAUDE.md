# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context Engineering & Advanced Features

### Product Requirement Prompts (PRPs)
DoX uses PRPs for comprehensive feature implementation. PRPs = PRD + curated codebase intelligence + agent/runbook.

**Commands:**
- `/generate-prp` - Create detailed implementation plans
- `/execute-prp` - Execute PRPs with validation loops
- `/init-foundation` - Initialize complete foundation in new projects
- `/copy-foundation` - Copy DoX foundation to new project directory
- `/foundation-status` - Check foundation health and completeness

**PRP Templates:** Located in `PRPs/templates/dox_prp_base_v2.md`

### Claude Hooks (Safety & Automation)
DoX implements hooks for safe policy operations:

**Active Hooks:**
1. **PreToolUse** - Blocks dangerous database operations and validates policy formats
2. **PostToolUse** - Validates results and maintains audit trail
3. **UserPromptSubmit** - Adds DoX context and suggests PRPs for complex features

**Hook Logs:** `.claude/hooks/logs/` for audit trail

### DoX Sub-Agents
Specialized agents for policy management:

1. **policy-analyzer** - Compliance checks and cross-sport analysis
2. **manual-generator** - PDF manual creation with Big 12 branding
3. **policy-counsel** - Legal review for loopholes, enforceability, and liability

**Usage:** Claude will automatically delegate to these agents based on task type.

## Project Overview

DoX is a comprehensive policy management system for the Big 12 Conference that consists of two main components:
1. **Web Application**: Next.js-based frontend for policy management and manual generation
2. **MCP Server**: Model Context Protocol server providing AI integration capabilities

The system manages 191 policies across 8 sports with full-text search, version control, and PDF generation capabilities.

## Development Commands

### Main Application
```bash
# Development
npm run dev                 # Start Next.js dev server (http://localhost:3000)
npm run build              # Build production bundle
npm run start              # Start production server
npm run lint               # Run ESLint
npm run typecheck          # TypeScript type checking
npm run format             # Format code with Prettier

# Database Operations
npm run db:push            # Push migrations to Supabase
npm run db:generate        # Generate TypeScript types from database schema

# MCP Server Development
npm run build:mcp          # Build MCP server
npm run dev:mcp            # Run MCP server in watch mode
```

### MCP Server Commands
```bash
cd mcp-server
npm install                # Install MCP dependencies
npm run build              # Compile TypeScript
npm run dev                # Development with hot reload
npm run test               # Run Jest tests
```

## Architecture Overview

### Database Schema (Supabase/PostgreSQL)
The system uses the `competition` schema with these core tables:
- **policies**: Main policy storage with full-text search, version tracking, and multi-sport support
- **sports**: 22 Big 12 sports with abbreviations
- **policy_versions**: Complete version history
- **manuals**: Generated manual configurations
- **manual_policies**: Junction table for manual composition

Key patterns:
- Multi-sport policies use `NULL` sport_id and `applies_to_sports[]` array
- Policy numbers follow format: `{SPORT}-{CATEGORY}-{NUMBER}` (e.g., BSB-OFF-001)
- Full-text search uses PostgreSQL GIN indexes with English configuration
- Row-level security enforces access control

### MCP Server Architecture
The MCP server (`/mcp-server`) provides 18 tools across 5 categories:
1. **Search Tools**: Full-text, sport-specific, category, keyword searches
2. **Retrieval Tools**: Get policies, history, listings
3. **List Tools**: Sports, categories, tags, templates
4. **Generation Tools**: PDF manuals with React PDF
5. **Management Tools**: CRUD operations (requires service key)

Resource URIs follow these patterns:
- `policy://{policy_number}` - Individual policy
- `policy://sport/{abbreviation}` - Sport policies
- `policy://category/{category}` - Category policies
- `manual://{uuid}` - Generated manual
- `sport://{abbreviation}` - Sport overview

### Key Technical Decisions
1. **Supabase Instance**: Uses existing HELiiX Supabase project (vfzgnvcwakjxtdsaedfq)
2. **Type Safety**: Zod schemas validate all MCP tool inputs
3. **PDF Generation**: React PDF for manual generation with Big 12 branding
4. **Authentication**: Public read via anon key, admin ops via service key
5. **Multi-Sport Handling**: Policies can apply to multiple sports via arrays

## Environment Configuration

### Required Environment Variables
```env
# .env.local (Main App)
NEXT_PUBLIC_SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# mcp-server/.env (MCP Server)
SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # Required for admin operations
```

## MCP Integration with Claude

To use the MCP server with Claude:
```bash
claude mcp add dox-server \
  -e SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co \
  -e SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_KEY=your_service_key \
  -- node /Users/nickw/Documents/XII-Ops/Dox/mcp-server/dist/index.js
```

Available prompts:
- `/dox_search` - Interactive policy search
- `/dox_generate_manual` - Manual creation wizard
- `/dox_quick_find` - Quick policy lookup
- `/dox_policy_summary` - Generate summaries
- `/dox_compliance_check` - Verify policy compliance

## Policy Categories
The system uses these enum values for policy categories:
- `scheduling_policies`
- `officiating`
- `playing_rules`
- `equipment_specifications`
- `facility_standards`
- `travel_procedures`
- `media_relations`
- `safety_protocols`
- `awards_recognition`
- `championship_procedures`
- `venue_requirements`
- `broadcasting_standards`
- `governance`
- `game_management`
- `crowd_control`
- `eligibility`
- `administrative`

## Current Data Status
- 191 total policies imported from 8 sports
- Sports covered: Baseball, Men's/Women's Basketball, Soccer, Volleyball, Gymnastics, Tennis, Wrestling
- All policies have been imported with proper categorization and search indexing