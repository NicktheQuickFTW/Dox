import { ResourceProvider, Resource, ResourceContent } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export class ManualResourceProvider implements ResourceProvider {
  async listResources(): Promise<Resource[]> {
    try {
      // Get all manuals
      const { data, error } = await supabase
        .from('manuals')
        .select('id, title, description, sport_id, created_at')
        .eq('is_template', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list manuals: ${error.message}`
        );
      }

      const resources: Resource[] = (data || []).map(manual => ({
        uri: `manual://${manual.id}`,
        name: manual.title,
        description: manual.description || `Manual created on ${new Date(manual.created_at).toLocaleDateString()}`,
        mimeType: 'text/plain',
      }));

      // Add template resources
      const { data: templates } = await supabase
        .from('manuals')
        .select('id, title, description')
        .eq('is_template', true)
        .order('title', { ascending: true });

      if (templates) {
        templates.forEach(template => {
          resources.push({
            uri: `manual://template/${template.id}`,
            name: `Template: ${template.title}`,
            description: template.description || 'Manual template',
            mimeType: 'text/plain',
          });
        });
      }

      return resources;
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list manual resources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async readResource(uri: string): Promise<ResourceContent[]> {
    try {
      // Parse URI
      const match = uri.match(/^manual:\/\/(.+)$/);
      if (!match) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid manual URI format: ${uri}`
        );
      }

      const identifier = match[1];
      
      if (identifier.startsWith('template/')) {
        // manual://template/{id}
        return await this.readTemplate(identifier.substring(9));
      } else {
        // manual://{id}
        return await this.readManual(identifier);
      }
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read manual resource: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async readManual(manualId: string): Promise<ResourceContent[]> {
    // Get manual details
    const { data: manual, error: manualError } = await supabase
      .from('manuals')
      .select('*, sports!manuals_sport_id_fkey(id, name, abbreviation)')
      .eq('id', manualId)
      .single();

    if (manualError) {
      if (manualError.code === 'PGRST116') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Manual not found: ${manualId}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Database error: ${manualError.message}`
      );
    }

    // Get policies in this manual
    const { data: manualPolicies, error: policiesError } = await supabase
      .from('manual_policies')
      .select(`
        section_order,
        section_title,
        policies!manual_policies_policy_id_fkey(
          id,
          title,
          short_name,
          category,
          policy_number,
          summary,
          content_text
        )
      `)
      .eq('manual_id', manualId)
      .order('section_order', { ascending: true });

    if (policiesError) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch manual policies: ${policiesError.message}`
      );
    }

    const content = this.formatManual(manual, manualPolicies || []);

    return [{
      uri: `manual://${manualId}`,
      mimeType: 'text/plain',
      text: content,
    }];
  }

  private async readTemplate(templateId: string): Promise<ResourceContent[]> {
    const { data: template, error } = await supabase
      .from('manuals')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Template not found: ${templateId}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Database error: ${error.message}`
      );
    }

    const content = this.formatTemplate(template);

    return [{
      uri: `manual://template/${templateId}`,
      mimeType: 'text/plain',
      text: content,
    }];
  }

  private formatManual(manual: any, policies: any[]): string {
    // Group policies by section
    const sections: Record<string, any[]> = {};
    policies.forEach(mp => {
      const section = mp.section_title || mp.policies.category;
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(mp.policies);
    });

    let content = `# ${manual.title}

**Sport:** ${manual.sports?.name || 'Multi-Sport'}  
**Created:** ${new Date(manual.created_at).toLocaleDateString()}  
**Total Policies:** ${policies.length}

## Description
${manual.description || 'No description available'}

## Table of Contents
`;

    Object.keys(sections).forEach((section, index) => {
      content += `${index + 1}. ${section} (${sections[section].length} policies)\n`;
    });

    content += '\n---\n\n';

    // Add sections
    Object.entries(sections).forEach(([section, sectionPolicies]) => {
      content += `## ${section}\n\n`;
      
      sectionPolicies.forEach((policy: any) => {
        content += `### ${policy.title}\n`;
        content += `**Policy Number:** ${policy.policy_number}\n\n`;
        content += `${policy.summary || 'No summary available'}\n\n`;
        content += `#### Content\n${policy.content_text}\n\n`;
        content += '---\n\n';
      });
    });

    return content;
  }

  private formatTemplate(template: any): string {
    return `# Manual Template: ${template.title}

## Description
${template.description || 'No description available'}

## Template Configuration
\`\`\`json
${JSON.stringify(template.template_config, null, 2)}
\`\`\`

## Usage
This template can be used when generating manuals to apply consistent formatting and structure.

### Configuration Options:
${this.formatTemplateOptions(template.template_config)}

---
*Template ID: ${template.id}*`;
  }

  private formatTemplateOptions(config: any): string {
    if (!config) return 'No configuration options available';

    let options = '';
    
    if (config.include_toc !== undefined) {
      options += `- **Include Table of Contents:** ${config.include_toc ? 'Yes' : 'No'}\n`;
    }
    if (config.include_index !== undefined) {
      options += `- **Include Index:** ${config.include_index ? 'Yes' : 'No'}\n`;
    }
    if (config.style) {
      options += `- **Style:** ${config.style}\n`;
    }
    if (config.categories) {
      options += `- **Default Categories:** ${config.categories.join(', ')}\n`;
    }

    return options || 'Standard configuration';
  }
}