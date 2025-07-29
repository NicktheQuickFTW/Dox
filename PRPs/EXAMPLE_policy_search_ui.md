name: "Policy Search UI Implementation"
description: |

## Purpose
Implement a comprehensive policy search interface for DoX that provides Big 12 Conference administrators with powerful search capabilities across all 191 policies.

## Core Principles
1. **Context is King**: All DoX patterns and Supabase integration details included
2. **Validation Loops**: Executable tests for UI and functionality
3. **Progressive Success**: Basic search → filters → pagination → polish
4. **Follow CLAUDE.md**: Adhere to all project guidelines

---

## Goal
Build a responsive policy search interface that allows users to find policies quickly using keywords, filters, and smart suggestions. Display results in an intuitive card layout with modal details view.

## Why
- Administrators need fast access to specific policies among 191 documents
- Current system requires knowing exact policy numbers
- Search will reduce policy lookup time from minutes to seconds
- Enables discovery of related policies across sports

## What
A React-based search interface with:
- Real-time search with debouncing
- Filter by sport, category, tags
- Paginated results (20 per page)
- Card layout with policy summaries
- Modal for full policy details
- Loading and error states

### Success Criteria
- [ ] Search returns results in <2 seconds
- [ ] All 191 policies are searchable
- [ ] Filters work correctly
- [ ] Pagination handles all results
- [ ] Mobile responsive design
- [ ] Matches MCP tool search capabilities

## All Needed Context

### DoX System Context
```yaml
Database:
  Project: vfzgnvcwakjxtdsaedfq
  Schema: competition
  Policies: 191 total across 8 sports
  
Key Tables:
  policies:
    - id, title, short_name, policy_number
    - category (enum), sport_id (nullable)
    - content_text (searchable), summary
    - tags[], keywords[], applies_to_sports[]
  
  sports:
    - id, name, abbreviation
    - 22 sports total, 8 with policies

Search Infrastructure:
  - PostgreSQL GIN indexes on content_text
  - Full-text search configured
  - Pattern: textSearch('content_text', query)
```

### Documentation & References
```yaml
- file: /Users/nickw/Documents/XII-Ops/Dox/src/lib/supabase/types.ts
  critical: Complete type definitions for policies and sports

- file: /Users/nickw/Documents/XII-Ops/Dox/mcp-server/src/tools/search.ts
  critical: Search implementation patterns, query building
  
- file: /Users/nickw/Documents/XII-Ops/Dox/src/lib/supabase/client.ts
  critical: Supabase client creation pattern

- url: https://supabase.com/docs/guides/database/full-text-search
  section: PostgreSQL full-text search
  
- url: https://tanstack.com/query/latest/docs/react/guides/paginated-queries
  section: Pagination with React Query

- url: https://ui.shadcn.com/docs/components/card
  why: Card component pattern for results
```

### Current Codebase Structure
```bash
Dox/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Providers setup
│   │   ├── page.tsx          # Home page (UPDATE)
│   │   └── policies/
│   │       └── page.tsx      # NEW - Search page
│   ├── components/
│   │   └── policies/         # NEW directory
│   │       ├── PolicySearch.tsx
│   │       ├── PolicyCard.tsx
│   │       ├── PolicyFilters.tsx
│   │       ├── PolicyModal.tsx
│   │       └── PolicyPagination.tsx
│   └── lib/
│       ├── supabase/         # Existing
│       └── queries/          # NEW
│           └── policies.ts   # Query functions
```

### Known Patterns & Gotchas
```typescript
// PATTERN: Supabase text search
const { data, count } = await supabase
  .from('policies')
  .select('*', { count: 'exact' })
  .textSearch('content_text', searchQuery, {
    type: 'websearch',
    config: 'english'
  })
  .eq('status', 'current')
  .range(offset, offset + limit - 1);

// GOTCHA: Multi-sport policies
// NULL sport_id means policy applies to multiple sports
// Check applies_to_sports array for specific sports

// PATTERN: React Query for search
const { data, isLoading } = useQuery({
  queryKey: ['policies', searchTerm, filters, page],
  queryFn: () => searchPolicies(searchTerm, filters, page),
  keepPreviousData: true, // For smooth pagination
});

// CRITICAL: Debounce search input
const debouncedSearch = useMemo(
  () => debounce((term: string) => setSearchTerm(term), 300),
  []
);
```

## Implementation Blueprint

### Task List

```yaml
Task 1: Create policy query functions
File: src/lib/queries/policies.ts
```
```typescript
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Policy = Database['competition']['Tables']['policies']['Row'];

export async function searchPolicies(
  query: string,
  filters: {
    sport_id?: number;
    category?: string;
    tags?: string[];
  },
  page: number = 1,
  limit: number = 20
) {
  const supabase = createClient();
  const offset = (page - 1) * limit;
  
  let queryBuilder = supabase
    .from('policies')
    .select('*, sports!policies_sport_id_fkey(*)', { count: 'exact' })
    .eq('status', 'current');

  if (query) {
    queryBuilder = queryBuilder.textSearch('content_text', query, {
      type: 'websearch',
      config: 'english'
    });
  }

  // Apply filters...
  
  const { data, error, count } = await queryBuilder
    .range(offset, offset + limit - 1)
    .order('updated_at', { ascending: false });

  return { policies: data, total: count, error };
}
```

```yaml
Task 2: Create PolicySearch component
File: src/components/policies/PolicySearch.tsx
```
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { searchPolicies } from '@/lib/queries/policies';
import PolicyCard from './PolicyCard';
import PolicyFilters from './PolicyFilters';
import PolicyPagination from './PolicyPagination';
import { debounce } from '@/lib/utils';

export default function PolicySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['policies', searchTerm, filters, page],
    queryFn: () => searchPolicies(searchTerm, filters, page),
    keepPreviousData: true,
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setPage(1);
    }, 300),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search policies..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="flex-1"
        />
        <PolicyFilters onFilterChange={setFilters} />
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div>Error loading policies</div>}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.policies?.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>

      {data?.total > 0 && (
        <PolicyPagination
          currentPage={page}
          totalPages={Math.ceil(data.total / 20)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

```yaml
Task 3: Create PolicyCard component
File: src/components/policies/PolicyCard.tsx
```
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PolicyModal from './PolicyModal';

export default function PolicyCard({ policy }) {
  const categoryLabel = policy.category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{policy.title}</CardTitle>
          <Badge variant="outline">{policy.policy_number}</Badge>
        </div>
        <CardDescription>
          {policy.sports?.name || 'Multi-Sport'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {policy.summary || 'No summary available'}
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-big12-blue">{categoryLabel}</Badge>
          {policy.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <PolicyModal policy={policy} />
    </Card>
  );
}
```

```yaml
Task 4: Create search page
File: src/app/policies/page.tsx
```
```typescript
import PolicySearch from '@/components/policies/PolicySearch';

export default function PoliciesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 text-big12-red">
        Policy Search
      </h1>
      <p className="text-gray-600 mb-8">
        Search and browse Big 12 Conference administrative policies
      </p>
      <PolicySearch />
    </div>
  );
}
```

```yaml
Task 5: Add navigation and providers
Update: src/app/layout.tsx
- Add React Query provider
- Add navigation link to /policies
```

## Validation Loop

### Level 1: TypeScript & Build
```bash
npm run typecheck     # No errors
npm run lint          # Clean
npm run build         # Successful build
```

### Level 2: Component Testing
```bash
# Start dev server
npm run dev

# Manual tests:
1. Navigate to http://localhost:3000/policies
2. Search for "officiating" - should return relevant policies
3. Filter by sport "Baseball" - should show only baseball policies
4. Click a policy card - modal should open with full details
5. Test pagination - should load page 2 correctly
6. Test empty search - should show all policies
```

### Level 3: Performance Testing
```bash
# Check search performance
# Should return results in <2 seconds
# Debouncing should prevent excessive queries
# Pagination should maintain scroll position
```

## Final Validation Checklist
- [ ] TypeScript: `npm run typecheck` passes
- [ ] Linting: `npm run lint` passes  
- [ ] Build: `npm run build` succeeds
- [ ] Search returns correct results
- [ ] Filters work independently and together
- [ ] Pagination works smoothly
- [ ] Modal displays full policy details
- [ ] Responsive on mobile devices
- [ ] Loading states display correctly
- [ ] Error states handle gracefully
- [ ] Big 12 branding is consistent
- [ ] Search matches MCP tool capabilities

---

## Confidence Score: 9/10
High confidence due to:
- Clear patterns from existing MCP search implementation
- Well-defined database schema and types
- Standard Next.js + React Query patterns
- Comprehensive validation steps