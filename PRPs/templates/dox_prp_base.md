name: "DoX PRP Template - Context-Rich with Validation"
description: |

## Purpose
Template optimized for AI agents to implement DoX features with comprehensive context about the Big 12 policy management system, Supabase integration, and MCP server capabilities.

## Core Principles
1. **Context is King**: Include ALL necessary DoX documentation, patterns, and database schema
2. **Validation Loops**: Provide executable tests for Next.js and MCP server
3. **Information Dense**: Use DoX-specific patterns and conventions
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
[What needs to be built for DoX - be specific about policy management features]

## Why
- [Business value for Big 12 Conference]
- [Integration with existing policy system]
- [Problems this solves for conference administrators]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes for DoX]
- [ ] Works with existing 191 policies
- [ ] Integrates with MCP server if needed
- [ ] Maintains Big 12 branding

## All Needed Context

### DoX System Overview
```yaml
Database:
  - Supabase Project: vfzgnvcwakjxtdsaedfq
  - Schema: competition
  - Tables: policies, sports, policy_versions, manuals, manual_policies
  - 191 policies across 8 sports imported
  
MCP Server:
  - 18 tools (search, retrieve, list, generate, manage)
  - Resource URIs: policy://, manual://, sport://
  - 5 interactive prompts (/dox_search, etc.)
  
Frontend:
  - Next.js 14 with App Router
  - TypeScript strict mode
  - Tailwind CSS with Big 12 colors
  - React Query for data fetching
```

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: /Users/nickw/Documents/XII-Ops/Dox/CLAUDE.md
  why: Complete DoX architecture and conventions
  
- file: /Users/nickw/Documents/XII-Ops/Dox/src/lib/supabase/types.ts
  why: Database types and schema reference
  
- file: /Users/nickw/Documents/XII-Ops/Dox/mcp-server/src/tools/search.ts
  why: Pattern for implementing MCP tools with Zod validation
  
- url: https://nextjs.org/docs/app
  why: Next.js 14 App Router patterns
  
- url: https://supabase.com/docs/guides/auth/server-side/nextjs
  why: Supabase SSR authentication patterns

- file: /Users/nickw/Documents/XII-Ops/Dox/src/lib/supabase/client.ts
  why: Supabase client creation pattern
```

### Current Codebase Structure
```bash
Dox/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── globals.css   # Tailwind styles
│   ├── components/       # React components
│   ├── lib/             
│   │   └── supabase/    # Supabase utilities
│   │       ├── client.ts # Browser client
│   │       ├── server.ts # Server client
│   │       └── types.ts  # Generated types
│   └── types/           # TypeScript types
├── mcp-server/          # MCP server implementation
│   ├── src/
│   │   ├── tools/       # MCP tool implementations
│   │   ├── resources/   # Resource providers
│   │   ├── prompts/     # Interactive prompts
│   │   └── lib/         # Utilities
│   └── dist/            # Compiled output
└── supabase/
    └── migrations/      # Database migrations
```

### Known DoX Patterns & Gotchas
```typescript
// CRITICAL: Policy numbering format
// Format: {SPORT}-{CATEGORY}-{NUMBER}
// Example: "BSB-OFF-001" (Baseball Officiating #1)

// PATTERN: Multi-sport policies
// Use NULL sport_id and applies_to_sports array
const multiSportPolicy = {
  sport_id: null,
  applies_to_sports: ["Men's Basketball", "Women's Basketball"]
};

// GOTCHA: Supabase client differences
// Browser: createBrowserClient (src/lib/supabase/client.ts)
// Server: createServerClient (src/lib/supabase/server.ts)

// PATTERN: MCP tool structure
const tool: Tool = {
  name: 'tool_name',
  description: 'Clear description',
  inputSchema: z.object({...}), // Zod validation
  handler: async (args) => {...}
};

// CRITICAL: Policy categories enum
type PolicyCategory = 
  | 'scheduling_policies'
  | 'officiating'
  | 'playing_rules'
  // ... (see types.ts for full list)
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// Use existing types from src/lib/supabase/types.ts
import type { Database } from '@/lib/supabase/types';

type Policy = Database['competition']['Tables']['policies']['Row'];
type Sport = Database['competition']['Tables']['sports']['Row'];

// Component props pattern
interface PolicyCardProps {
  policy: Policy;
  sport?: Sport;
  onEdit?: (id: number) => void;
}

// API response pattern
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Task List
```yaml
Task 1: Create Supabase queries
  - File: src/lib/queries/policies.ts
  - Pattern: Follow src/lib/supabase/client.ts usage
  - Include: Error handling, type safety

Task 2: Build React components
  - Files: src/components/policies/PolicyList.tsx
  - Pattern: Server components by default
  - Props: Typed with TypeScript interfaces

Task 3: Add API routes (if needed)
  - File: src/app/api/policies/route.ts
  - Pattern: Next.js Route Handlers
  - Auth: Check Supabase session

Task 4: Integrate MCP tools (if applicable)
  - File: mcp-server/src/tools/new-tool.ts
  - Pattern: Follow existing tool structure
  - Validation: Use Zod schemas

Task 5: Update types and documentation
  - Update CLAUDE.md if new patterns
  - Add JSDoc comments
  - Update README.md
```

### Integration Points
```yaml
DATABASE:
  - Use existing schema in competition
  - Follow RLS policies
  - Use proper indexes for search
  
AUTHENTICATION:
  - Public read for policies
  - Admin check for mutations
  - Use Supabase Auth helpers
  
MCP SERVER:
  - Add tool to allTools in server.ts
  - Update README with examples
  - Test with Claude CLI
```

## Validation Loop

### Level 1: TypeScript & Linting
```bash
# Frontend checks
npm run typecheck      # No TypeScript errors
npm run lint          # ESLint passes
npm run format        # Prettier formatting

# MCP Server checks (if modified)
cd mcp-server
npm run build         # TypeScript compilation
```

### Level 2: Build Testing
```bash
# Next.js production build
npm run build
# Expected: Successful build with no errors

# MCP server build (if modified)
cd mcp-server && npm run build
```

### Level 3: Runtime Testing
```bash
# Start development server
npm run dev

# Test functionality:
# 1. Navigate to http://localhost:3000
# 2. Check feature works as expected
# 3. Verify Supabase queries execute
# 4. Check browser console for errors

# If MCP tools added:
cd mcp-server
npm run dev
# Test tools with example inputs
```

### Level 4: Integration Testing
```bash
# Test with real data
# 1. Verify works with existing 191 policies
# 2. Check pagination if applicable
# 3. Test search functionality
# 4. Verify PDF generation if applicable
```

## Final Validation Checklist
- [ ] All TypeScript checks pass: `npm run typecheck`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Manual test successful in browser
- [ ] Supabase queries work correctly
- [ ] MCP tools validated (if added)
- [ ] Error cases handled gracefully
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Big 12 branding maintained

---

## Anti-Patterns to Avoid
- ❌ Don't create new database tables (use existing schema)
- ❌ Don't hardcode Supabase URLs (use env vars)
- ❌ Don't skip TypeScript types
- ❌ Don't ignore existing patterns in codebase
- ❌ Don't create synchronous database calls
- ❌ Don't expose service keys in client code
- ❌ Don't break existing MCP tools