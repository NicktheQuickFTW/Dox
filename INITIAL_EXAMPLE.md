## FEATURE:
Build a comprehensive policy search interface for DoX that allows users to search the Big 12 Conference policies by keyword, sport, category, and tags. The interface should display results in a card layout with the ability to view full policy details in a modal. Include pagination for results and real-time search suggestions.

## EXAMPLES:
- src/lib/supabase/client.ts - Use this pattern for creating Supabase client
- src/lib/supabase/server.ts - Reference for server-side Supabase queries
- mcp-server/src/tools/search.ts - Follow the search logic and query patterns
- src/app/layout.tsx - Use this for understanding the app structure
- src/app/globals.css - Reference for Tailwind classes and Big 12 colors

## DOCUMENTATION:
- https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating - Next.js data fetching in App Router
- https://supabase.com/docs/guides/database/full-text-search - Supabase full-text search
- https://tanstack.com/query/latest/docs/react/overview - React Query for data fetching
- https://ui.shadcn.com/docs/components/dialog - For modal implementation pattern
- https://tailwindcss.com/docs/responsive-design - Responsive design utilities

## OTHER CONSIDERATIONS:
- Must handle the existing 191 policies efficiently with pagination (20 per page default)
- Search should use PostgreSQL full-text search (already configured with GIN indexes)
- Follow the policy numbering format: {SPORT}-{CATEGORY}-{NUMBER}
- Handle multi-sport policies (those with NULL sport_id)
- Use React Query for caching search results
- Include loading states and error handling
- Maintain Big 12 branding colors (red: #C8102E, blue: #003DA5, gray: #53565A)
- Consider debouncing search input to avoid excessive queries
- The search should work similar to the MCP tool 'search_policies' but with a UI