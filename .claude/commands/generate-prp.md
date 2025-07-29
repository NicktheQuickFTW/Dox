# Create PRP for DoX

## Feature file: $ARGUMENTS

Generate a complete PRP for DoX feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement. Read the feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assume the AI agent has access to the codebase and the same knowledge cutoff as you, so its important that your research findings are included or referenced in the PRP. The Agent has Websearch capabilities, so pass urls to documentation and examples.

## Research Process

1. **Codebase Analysis**
   - Search for similar features/patterns in the DoX codebase
   - Check existing components in src/app, src/components, src/lib
   - Review MCP server tools and resources in mcp-server/src
   - Identify files to reference in PRP
   - Note Supabase patterns and policy database structure
   - Check test patterns for validation approach

2. **External Research**
   - Next.js 14 App Router patterns
   - Supabase client/server patterns with SSR
   - React Query for data fetching
   - React PDF for manual generation
   - MCP protocol implementation examples
   - Library documentation (include specific URLs)
   - Best practices and common pitfalls

3. **DoX-Specific Context**
   - Policy categories enum values
   - Policy numbering format ({SPORT}-{CATEGORY}-{NUMBER})
   - Multi-sport policy handling (NULL sport_id pattern)
   - Existing 191 policies across 8 sports
   - MCP tools structure and validation

## PRP Generation

Using PRPs/templates/dox_prp_base.md as template:

### Critical Context to Include
- **Database Schema**: competition.policies, sports tables
- **Environment**: HELiiX Supabase instance (vfzgnvcwakjxtdsaedfq)
- **MCP Server**: 18 tools, resource URIs, prompts
- **Documentation**: URLs with specific sections
- **Code Examples**: Real snippets from codebase
- **Gotchas**: Supabase RLS, PDF memory limits
- **Patterns**: Existing MCP tools, React components

### Implementation Blueprint
- Start with pseudocode showing approach
- Reference real files for patterns
- Include error handling strategy
- List tasks to be completed in order

### Validation Gates (Must be Executable)
```bash
# Frontend (Next.js)
npm run lint
npm run typecheck
npm run build

# MCP Server
cd mcp-server && npm run build
cd mcp-server && npm test

# Integration Test
npm run dev # Then test UI manually
```

*** CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP ***

*** ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP ***

## Output
Save as: `PRPs/{feature-name}.md`

## Quality Checklist
- [ ] All necessary DoX context included
- [ ] Supabase patterns documented
- [ ] MCP integration clear
- [ ] Validation gates are executable
- [ ] References existing patterns
- [ ] Clear implementation path
- [ ] Error handling documented

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation)

Remember: The goal is one-pass implementation success through comprehensive context.