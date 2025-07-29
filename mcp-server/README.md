# DoX MCP Server

A Model Context Protocol (MCP) server for the Big 12 Conference DoX policy management system. This server provides programmatic access to policy search, retrieval, and manual generation capabilities.

## Features

### Tools
- **Search Tools**
  - `search_policies` - Full-text search with filters
  - `search_by_sport` - Search policies for specific sport
  - `search_by_category` - Search by policy category  
  - `search_by_keywords` - Search by tags/keywords

- **Retrieval Tools**
  - `get_policy` - Get single policy by ID or number
  - `get_policy_history` - Get version history
  - `list_policies` - List with pagination/filters
  - `list_sports` - Get all sports
  - `list_categories` - Get all categories
  - `list_tags` - Get unique tags
  - `list_manual_templates` - Get available templates

- **Generation Tools**
  - `generate_manual` - Create PDF manual
  - `preview_manual` - Preview manual structure
  - `get_manual_templates` - List templates with configs

- **Management Tools** (Requires Auth)
  - `create_policy` - Create new policy
  - `update_policy` - Update existing policy
  - `archive_policy` - Archive a policy
  - `approve_policy` - Approve pending policy

### Resources
- `policy://{policy_number}` - Individual policies
- `policy://sport/{abbreviation}` - Sport-specific policies
- `policy://category/{category}` - Category policies
- `manual://{manual_id}` - Generated manuals
- `manual://template/{template_id}` - Manual templates
- `sport://{abbreviation}` - Sport overview

### Prompts
- `/dox_search` - Interactive policy search
- `/dox_quick_find` - Quick policy lookup
- `/dox_generate_manual` - Manual generation wizard
- `/dox_policy_summary` - Generate policy summaries
- `/dox_compliance_check` - Check policy compliance

## Installation

```bash
# Clone the repository
cd /path/to/Dox/mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration
SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key  # For admin operations

# Server Configuration
MCP_SERVER_NAME="DoX Policy Management"
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info

# PDF Generation
PDF_TEMPLATE_PATH=./templates
PDF_OUTPUT_PATH=./generated
```

## Usage with Claude

### Add the MCP Server

```bash
# Add DoX MCP server to Claude
claude mcp add dox-server \
  -e SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co \
  -e SUPABASE_ANON_KEY=your_key \
  -- node /path/to/Dox/mcp-server/dist/index.js

# Or with admin capabilities
claude mcp add dox-server \
  -e SUPABASE_URL=https://vfzgnvcwakjxtdsaedfq.supabase.co \
  -e SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_KEY=your_service_key \
  -- node /path/to/Dox/mcp-server/dist/index.js
```

### Example Usage

#### Search for Policies
```
Use the search_policies tool to find all policies about "officiating" in Basketball

Use search_by_sport with sport_abbreviation "BSB" to get all Baseball policies

Use search_by_category with category "venue_requirements" to find venue policies
```

#### Retrieve Specific Policies
```
Use get_policy with policy_number "BSB-OFF-001" to see the baseball officiating policy

Use @dox:policy://BSB-OFF-001 to reference the policy directly

Use list_policies with filters for sport_id 1 to see all Baseball policies
```

#### Generate Manuals
```
Use generate_manual to create a PDF for all Soccer administrative policies

Use preview_manual with categories ["officiating", "scheduling_policies"] to preview structure

Use /dox_generate_manual to start the interactive manual creation workflow
```

#### Resource Examples
```
Reference @dox:policy://BSB-OFF-001 for the baseball officiating coordinator policy

Reference @dox:sport://MBB for all Men's Basketball policies

Reference @dox:policy://category/officiating for all officiating policies
```

#### Interactive Prompts
```
/dox_search basketball officiating

/dox_quick_find BSB-OFF

/dox_policy_summary sport=BSB

/dox_compliance_check Wrestling
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # MCP server setup
│   ├── tools/            # Tool implementations
│   ├── resources/        # Resource providers
│   ├── prompts/          # Interactive prompts
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

1. Create a new tool in `src/tools/`
2. Define the tool interface with Zod schema
3. Implement the handler function
4. Export in the tools index
5. The server will automatically register it

Example:
```typescript
const myNewTool: Tool = {
  name: 'my_new_tool',
  description: 'Description of what this tool does',
  inputSchema: z.object({
    param1: z.string(),
    param2: z.number().optional(),
  }),
  handler: async (args) => {
    // Implementation
    return { result: 'data' };
  },
};
```

## API Reference

### Tool Input/Output Formats

All tools accept JSON input and return JSON output. Errors follow MCP error format.

#### Search Tools
Input:
```json
{
  "query": "search terms",
  "filters": {
    "sport_ids": [1, 2],
    "categories": ["officiating"],
    "status": "current"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

Output:
```json
{
  "policies": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Resource URI Formats

- Single policy: `policy://{policy_number}`
- Sport policies: `policy://sport/{sport_abbreviation}`
- Category policies: `policy://category/{category_name}`
- Manual: `manual://{manual_uuid}`
- Template: `manual://template/{template_uuid}`
- Sport overview: `sport://{sport_abbreviation}`

## Security

- Read operations are available to all authenticated users
- Write operations require `SUPABASE_SERVICE_KEY`
- All inputs are validated using Zod schemas
- Database operations use Supabase RLS policies

## Troubleshooting

### Common Issues

1. **"Admin operations require SUPABASE_SERVICE_KEY"**
   - Add the service key to your environment variables
   - Only needed for create/update/delete operations

2. **"Policy not found"**
   - Check the policy number format (e.g., BSB-OFF-001)
   - Ensure the policy status is "current"

3. **PDF generation errors**
   - Ensure React PDF dependencies are installed
   - Check memory limits for large manuals

### Debug Mode

Set `LOG_LEVEL=debug` in your environment for detailed logging.

## License

© 2025 Big 12 Conference. All rights reserved.