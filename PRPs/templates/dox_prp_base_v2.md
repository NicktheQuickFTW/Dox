name: "DoX PRP Template v2 - Big 12 Policy Management"
description: |

## Purpose
Template optimized for DoX feature development with comprehensive context for Big 12 Conference policy management system. Ensures production-ready implementation with validation loops.

## Core Principles
1. **Context is King**: Include all DoX patterns, Supabase details, and MCP integration
2. **Validation Loops**: TypeScript checks, tests, and MCP tool verification
3. **Information Dense**: Use existing DoX patterns and Big 12 requirements
4. **Progressive Success**: Basic functionality → polish → performance

---

## Goal
[What DoX feature needs to be built - be specific about functionality and Big 12 requirements]

## Why
- [How this helps Big 12 Conference administrators]
- [Integration with existing 191 policies across 8 sports]
- [Problems this solves for policy management]

## What
[User-visible behavior in DoX interface and MCP tools]

### Success Criteria
- [ ] [Specific functionality working in Next.js app]
- [ ] [MCP tools updated if needed]
- [ ] [TypeScript strict mode compliance]
- [ ] [Follows Big 12 branding (red: #C8102E, blue: #003DA5)]

## All Needed Context

### DoX System Architecture
```yaml
Database:
  Project: vfzgnvcwakjxtdsaedfq (HELiiX Supabase)
  Schema: competition
  Total Policies: 191 across 8 sports
  
Key Tables:
  policies:
    - id, policy_number, title, sport_id, category
    - content_text (full-text searchable)
    - tags[], keywords[], applies_to_sports[]
    - version, status, created_by
  
  sports:
    - 22 total sports, 8 with policies
    - Baseball, Basketball (M/W), Soccer, Volleyball, 
    - Gymnastics, Tennis, Wrestling
  
  policy_versions: Complete history tracking
  manuals: Generated PDF configurations
  manual_policies: Junction for manual composition
```

### Documentation & References
```yaml
# MUST READ - DoX specific context
- file: /Users/nickw/Documents/XII-Ops/Dox/CLAUDE.md
  critical: Project guidelines and development commands

- file: /Users/nickw/Documents/XII-Ops/Dox/src/lib/supabase/types.ts
  why: Complete TypeScript types for all database tables

- file: /Users/nickw/Documents/XII-Ops/Dox/mcp-server/src/tools/
  why: MCP tool patterns for policy operations

- url: https://nextjs.org/docs/app
  section: App Router patterns
  
- url: https://supabase.com/docs/guides/database
  section: RLS policies and full-text search

- url: https://ui.shadcn.com/docs/components
  why: UI component patterns used in DoX
```

### Current Codebase Structure
```bash
Dox/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   └── api/               # API routes if needed
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/          # Supabase client and types
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks
├── mcp-server/                # MCP server (separate package)
│   ├── src/
│   │   ├── index.ts          # MCP server entry
│   │   ├── tools/            # 18 MCP tools
│   │   └── resources/        # Resource providers
│   └── package.json
├── public/                    # Static assets
├── .claude/                   # Claude configuration
│   ├── commands/             # Custom commands
│   ├── hooks/                # Pre/post hooks
│   └── agents/               # Sub-agents
└── PRPs/                     # Product Requirement Prompts
```

### Known DoX Patterns & Gotchas
```typescript
// CRITICAL: Multi-sport policies use NULL sport_id
// Check applies_to_sports array for specific sports
if (!policy.sport_id && policy.applies_to_sports?.length > 0) {
  // Handle multi-sport policy
}

// PATTERN: Supabase client creation
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// PATTERN: Full-text search with PostgreSQL
.textSearch('content_text', query, {
  type: 'websearch',
  config: 'english'
})

// GOTCHA: Policy numbers must follow format
// {SPORT}-{CATEGORY}-{NUMBER} e.g., BSB-OFF-001
const POLICY_NUMBER_REGEX = /^[A-Z]{2,4}-[A-Z]{3}-\d{3}$/

// CRITICAL: Always use React Query for data fetching
// Never fetch directly in components
```

## Implementation Blueprint

### Task List
```yaml
Task 1: [First implementation step]
File: src/[path]
Action: CREATE/MODIFY
Details: [Specific implementation details]

Task 2: [Second step]
File: src/[path]
Action: MODIFY
Pattern: [Code to find/replace]

Task 3: Update MCP tools if needed
File: mcp-server/src/tools/[toolname].ts
Action: MODIFY
Details: [Tool updates needed]
```

### Core Implementation Pattern
```typescript
// Example component structure for DoX
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function PolicyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['policies', filters],
    queryFn: async () => {
      const supabase = createClient();
      // Implementation
    }
  });
  
  // Component logic
}
```

## Validation Loop

### Level 1: TypeScript & Linting
```bash
# Must pass without errors
npm run typecheck
npm run lint
```

### Level 2: Build Verification
```bash
# Next.js build must succeed
npm run build

# MCP server build if modified
cd mcp-server && npm run build
```

### Level 3: Functionality Testing
```bash
# Start dev server
npm run dev

# Manual testing checklist:
1. [Specific user flow to test]
2. [Edge case to verify]
3. [Integration with existing features]
```

### Level 4: MCP Tool Verification
```bash
# If MCP tools were modified
cd mcp-server
npm run dev

# Test specific tool
# Use Claude to test: "Test the updated [tool_name] tool"
```

## Final Validation Checklist
- [ ] TypeScript strict mode compliance
- [ ] No ESLint errors or warnings
- [ ] Build succeeds without errors
- [ ] Feature works as specified
- [ ] Follows existing DoX patterns
- [ ] Big 12 branding applied correctly
- [ ] Database queries optimized
- [ ] React Query properly implemented
- [ ] MCP tools updated if needed
- [ ] Security: No service key exposure
- [ ] Accessibility: ARIA labels present

---

## Confidence Score: [X/10]
Explanation of confidence level and any concerns