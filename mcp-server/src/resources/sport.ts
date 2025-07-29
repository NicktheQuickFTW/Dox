import { ResourceProvider, Resource, ResourceContent } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export class SportResourceProvider implements ResourceProvider {
  async listResources(): Promise<Resource[]> {
    try {
      // Get all active sports
      const { data, error } = await supabase
        .from('sports')
        .select('id, name, abbreviation')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list sports: ${error.message}`
        );
      }

      return (data || []).map(sport => ({
        uri: `sport://${sport.abbreviation}`,
        name: `${sport.name} Policies`,
        description: `All policies for ${sport.name}`,
        mimeType: 'text/plain',
      }));
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list sport resources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async readResource(uri: string): Promise<ResourceContent[]> {
    try {
      // Parse URI
      const match = uri.match(/^sport:\/\/(.+)$/);
      if (!match) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid sport URI format: ${uri}`
        );
      }

      const sportAbbreviation = match[1];
      
      // Get sport details
      const { data: sport, error: sportError } = await supabase
        .from('sports')
        .select('*')
        .eq('abbreviation', sportAbbreviation)
        .single();

      if (sportError) {
        if (sportError.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Sport not found: ${sportAbbreviation}`
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Database error: ${sportError.message}`
        );
      }

      // Get policies for this sport
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('*')
        .eq('status', 'current')
        .or(`sport_id.eq.${sport.id},and(sport_id.is.null,applies_to_sports.cs.{"${sport.name}"})`)
        .order('category', { ascending: true })
        .order('policy_number', { ascending: true });

      if (policiesError) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch policies: ${policiesError.message}`
        );
      }

      // Get policy counts by category
      const categoryCounts: Record<string, number> = {};
      policies?.forEach(policy => {
        categoryCounts[policy.category] = (categoryCounts[policy.category] || 0) + 1;
      });

      const content = this.formatSportOverview(sport, policies || [], categoryCounts);

      return [{
        uri: `sport://${sportAbbreviation}`,
        mimeType: 'text/plain',
        text: content,
      }];
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read sport resource: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private formatSportOverview(sport: any, policies: any[], categoryCounts: Record<string, number>): string {
    // Group policies by category
    const policiesByCategory: Record<string, any[]> = {};
    policies.forEach(policy => {
      if (!policiesByCategory[policy.category]) {
        policiesByCategory[policy.category] = [];
      }
      policiesByCategory[policy.category].push(policy);
    });

    let content = `# ${sport.name} Administrative Policies

**Abbreviation:** ${sport.abbreviation}  
**Status:** ${sport.active ? 'Active' : 'Inactive'}  
**Total Policies:** ${policies.length}

## Policy Distribution by Category
`;

    // Add category summary
    Object.entries(categoryCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, count]) => {
        const categoryName = category.split('_').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        content += `- **${categoryName}:** ${count} ${count === 1 ? 'policy' : 'policies'}\n`;
      });

    content += '\n---\n\n';

    // Add policies by category
    Object.entries(policiesByCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, categoryPolicies]) => {
        const categoryName = category.split('_').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        
        content += `## ${categoryName}\n\n`;
        
        categoryPolicies.forEach(policy => {
          content += `### ${policy.title}\n`;
          content += `**Policy Number:** ${policy.policy_number}  \n`;
          content += `**Effective Date:** ${policy.effective_date}  \n`;
          content += `**Summary:** ${policy.summary || 'No summary available'}\n\n`;
          
          if (policy.tags?.length > 0) {
            content += `**Tags:** ${policy.tags.join(', ')}\n\n`;
          }
          
          content += '---\n\n';
        });
      });

    return content;
  }
}