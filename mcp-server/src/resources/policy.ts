import { ResourceProvider, Resource, ResourceContent } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export class PolicyResourceProvider implements ResourceProvider {
  async listResources(): Promise<Resource[]> {
    try {
      // Get all current policies
      const { data, error } = await supabase
        .from('policies')
        .select('id, title, policy_number, category, sport_id')
        .eq('status', 'current')
        .order('policy_number', { ascending: true })
        .limit(100);

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list policies: ${error.message}`
        );
      }

      return (data || []).map(policy => ({
        uri: `policy://${policy.policy_number}`,
        name: policy.title,
        description: `Policy ${policy.policy_number} - Category: ${policy.category}`,
        mimeType: 'text/plain',
      }));
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list policy resources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async readResource(uri: string): Promise<ResourceContent[]> {
    try {
      // Parse URI
      const match = uri.match(/^policy:\/\/(.+)$/);
      if (!match) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid policy URI format: ${uri}`
        );
      }

      const identifier = match[1];
      
      // Handle different URI patterns
      if (identifier.startsWith('sport/')) {
        // policy://sport/{abbreviation}
        return await this.readSportPolicies(identifier.substring(6));
      } else if (identifier.startsWith('category/')) {
        // policy://category/{category}
        return await this.readCategoryPolicies(identifier.substring(9));
      } else {
        // policy://{policy_number}
        return await this.readSinglePolicy(identifier);
      }
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read policy resource: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async readSinglePolicy(policyNumber: string): Promise<ResourceContent[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)')
      .eq('policy_number', policyNumber)
      .eq('status', 'current')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Policy not found: ${policyNumber}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Database error: ${error.message}`
      );
    }

    const content = this.formatPolicy(data);

    return [{
      uri: `policy://${policyNumber}`,
      mimeType: 'text/plain',
      text: content,
    }];
  }

  private async readSportPolicies(sportAbbreviation: string): Promise<ResourceContent[]> {
    // Get sport ID
    const { data: sport } = await supabase
      .from('sports')
      .select('id, name')
      .eq('abbreviation', sportAbbreviation)
      .single();

    if (!sport) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Sport not found: ${sportAbbreviation}`
      );
    }

    // Get policies for sport
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
      .eq('status', 'current')
      .or(`sport_id.eq.${sport.id},sport_id.is.null`)
      .order('policy_number', { ascending: true });

    if (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Database error: ${error.message}`
      );
    }

    const content = `# ${sport.name} Policies\n\n` +
      `Total Policies: ${policies?.length || 0}\n\n` +
      (policies || []).map(p => this.formatPolicySummary(p)).join('\n---\n\n');

    return [{
      uri: `policy://sport/${sportAbbreviation}`,
      mimeType: 'text/plain',
      text: content,
    }];
  }

  private async readCategoryPolicies(category: string): Promise<ResourceContent[]> {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)')
      .eq('status', 'current')
      .eq('category', category)
      .order('policy_number', { ascending: true });

    if (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Database error: ${error.message}`
      );
    }

    const categoryTitle = category.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');

    const content = `# ${categoryTitle} Policies\n\n` +
      `Total Policies: ${policies?.length || 0}\n\n` +
      (policies || []).map(p => this.formatPolicySummary(p)).join('\n---\n\n');

    return [{
      uri: `policy://category/${category}`,
      mimeType: 'text/plain',
      text: content,
    }];
  }

  private formatPolicy(policy: any): string {
    return `# ${policy.title}

**Policy Number:** ${policy.policy_number}  
**Category:** ${policy.category}  
**Sport:** ${policy.sports?.name || 'Multi-Sport'}  
**Version:** ${policy.version}  
**Effective Date:** ${policy.effective_date}  
**Status:** ${policy.status}

## Summary
${policy.summary || 'No summary available'}

## Content
${policy.content_text}

## Tags
${policy.tags?.join(', ') || 'None'}

## Keywords
${policy.keywords?.join(', ') || 'None'}

## Applies to Sports
${policy.applies_to_sports?.join(', ') || 'All Sports'}

---
*Last Updated: ${new Date(policy.updated_at).toLocaleDateString()}*`;
  }

  private formatPolicySummary(policy: any): string {
    return `## ${policy.title}
**Policy Number:** ${policy.policy_number}  
**Summary:** ${policy.summary || 'No summary available'}`;
  }
}