import { Prompt, PromptMessage } from '../types/index.js';
import { supabase } from '../lib/supabase.js';

const doxSearch: Prompt = {
  name: 'dox_search',
  description: 'Interactive policy search workflow',
  arguments: [
    {
      name: 'initial_query',
      description: 'Optional initial search query',
      required: false,
    },
  ],
  handler: async (args) => {
    const messages: PromptMessage[] = [];
    
    messages.push({
      role: 'assistant',
      content: {
        type: 'text',
        text: `Welcome to DoX Policy Search! I'll help you find Big 12 Conference policies.

${args.initial_query ? `Searching for: "${args.initial_query}"` : 'What would you like to search for?'}

You can search by:
- Keywords or phrases
- Policy numbers (e.g., BSB-OFF-001)
- Sports (e.g., "basketball", "soccer")
- Categories (e.g., "officiating", "scheduling")

Try combining terms for more specific results, like "basketball officiating" or "soccer venue requirements".`,
      },
    });

    if (args.initial_query) {
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Search for policies containing: ${args.initial_query}`,
        },
      });
    }

    return messages;
  },
};

const doxGenerateManual: Prompt = {
  name: 'dox_generate_manual',
  description: 'Step-by-step manual generation workflow',
  arguments: [
    {
      name: 'sport',
      description: 'Optional sport abbreviation to pre-filter',
      required: false,
    },
  ],
  handler: async (args) => {
    const messages: PromptMessage[] = [];
    
    // Get available sports
    const { data: sports } = await supabase
      .from('sports')
      .select('name, abbreviation')
      .eq('active', true)
      .order('name');

    const sportsList = sports?.map(s => `- ${s.name} (${s.abbreviation})`).join('\n') || '';

    messages.push({
      role: 'assistant',
      content: {
        type: 'text',
        text: `Let's create a custom manual! I'll guide you through the process.

**Step 1: Choose your manual type**

1. **Sport-specific manual** - All policies for a single sport
2. **Category-based manual** - Policies from specific categories across all sports
3. **Custom selection** - Hand-pick specific policies

${args.sport ? `\nPre-selected sport: ${args.sport}` : ''}

**Available Sports:**
${sportsList}

What type of manual would you like to create?`,
      },
    });

    return messages;
  },
};

const doxQuickFind: Prompt = {
  name: 'dox_quick_find',
  description: 'Quick policy lookup by number or title',
  arguments: [
    {
      name: 'query',
      description: 'Policy number or partial title',
      required: true,
    },
  ],
  handler: async (args) => {
    const messages: PromptMessage[] = [];
    
    messages.push({
      role: 'user',
      content: {
        type: 'text',
        text: `Find policy: ${args.query}`,
      },
    });

    messages.push({
      role: 'assistant',
      content: {
        type: 'text',
        text: `Searching for policy matching "${args.query}"...

I'll check:
1. Exact policy number matches
2. Partial policy number matches
3. Title matches
4. Content containing this term

Use the get_policy tool with the policy number for full details.`,
      },
    });

    return messages;
  },
};

const doxPolicySummary: Prompt = {
  name: 'dox_policy_summary',
  description: 'Generate a summary report of policies',
  arguments: [
    {
      name: 'sport',
      description: 'Sport abbreviation (optional)',
      required: false,
    },
    {
      name: 'category',
      description: 'Policy category (optional)',
      required: false,
    },
  ],
  handler: async (args) => {
    const messages: PromptMessage[] = [];
    
    let filters = [];
    if (args.sport) filters.push(`Sport: ${args.sport}`);
    if (args.category) filters.push(`Category: ${args.category}`);
    
    messages.push({
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll generate a comprehensive policy summary report.

${filters.length > 0 ? `**Filters:** ${filters.join(', ')}` : '**Scope:** All policies'}

The report will include:
- Total policy count
- Distribution by category
- Distribution by sport
- Recent updates
- Key policies by category
- Compliance status overview

Would you like me to:
1. Generate a detailed PDF report
2. Show a quick summary here
3. Export as a CSV for further analysis

Which format would you prefer?`,
      },
    });

    return messages;
  },
};

const doxComplianceCheck: Prompt = {
  name: 'dox_compliance_check',
  description: 'Check policy compliance and coverage',
  arguments: [
    {
      name: 'sport',
      description: 'Sport to check compliance for',
      required: true,
    },
  ],
  handler: async (args) => {
    const messages: PromptMessage[] = [];
    
    // Get sport details
    const { data: sport } = await supabase
      .from('sports')
      .select('name')
      .eq('abbreviation', args.sport)
      .single();

    const sportName = sport?.name || args.sport;

    messages.push({
      role: 'assistant',
      content: {
        type: 'text',
        text: `Running compliance check for ${sportName}...

I'll verify:
1. **Required Policies** - Checking all mandatory policy categories are covered
2. **Policy Status** - Ensuring all policies are current (not draft/archived)
3. **Expiration Dates** - Identifying policies nearing expiration
4. **Version Control** - Checking for outdated policy versions
5. **Coverage Gaps** - Identifying missing policy areas

Standard required categories for all sports:
- Scheduling Policies
- Officiating
- Playing Rules
- Equipment Specifications
- Venue Requirements
- Safety Protocols
- Championship Procedures

Would you like me to generate a detailed compliance report?`,
      },
    });

    return messages;
  },
};

export const prompts: Record<string, Prompt> = {
  dox_search: doxSearch,
  dox_generate_manual: doxGenerateManual,
  dox_quick_find: doxQuickFind,
  dox_policy_summary: doxPolicySummary,
  dox_compliance_check: doxComplianceCheck,
};