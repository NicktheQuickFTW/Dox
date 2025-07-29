import { z } from 'zod';
import { Tool } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { GenerateManualSchema } from '../lib/validation.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { generatePDF } from '../lib/pdf.js';

const generateManual: Tool = {
  name: 'generate_manual',
  description: 'Generate a PDF manual from selected policies',
  inputSchema: GenerateManualSchema,
  handler: async (args) => {
    const { 
      title, 
      sport_id, 
      policy_ids, 
      categories, 
      include_toc, 
      include_index,
      template,
      format 
    } = args;

    try {
      // Build query to get policies
      let queryBuilder = supabase
        .from('policies')
        .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)')
        .eq('status', 'current');

      // Apply filters
      if (policy_ids?.length) {
        queryBuilder = queryBuilder.in('id', policy_ids);
      } else {
        // If no specific IDs, use sport and category filters
        if (sport_id !== undefined) {
          queryBuilder = queryBuilder.or(`sport_id.eq.${sport_id},sport_id.is.null`);
        }
        if (categories?.length) {
          queryBuilder = queryBuilder.in('category', categories);
        }
      }

      // Order by policy number for consistent manual structure
      queryBuilder = queryBuilder.order('policy_number', { ascending: true });

      const { data: policies, error } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch policies: ${error.message}`
        );
      }

      if (!policies || policies.length === 0) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'No policies found matching the criteria'
        );
      }

      // Group policies by category for better organization
      const policiesByCategory = policies.reduce((acc, policy) => {
        const category = policy.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(policy);
        return acc;
      }, {} as Record<string, typeof policies>);

      // Generate manual metadata
      const metadata = {
        title,
        generated_at: new Date().toISOString(),
        total_policies: policies.length,
        categories: Object.keys(policiesByCategory),
        sport: sport_id ? policies.find(p => p.sport_id === sport_id)?.sports?.name : 'Multi-Sport',
      };

      if (format === 'preview') {
        // Return preview structure instead of generating PDF
        return {
          metadata,
          structure: Object.entries(policiesByCategory).map(([category, categoryPolicies]) => ({
            category,
            policy_count: categoryPolicies.length,
            policies: categoryPolicies.map(p => ({
              policy_number: p.policy_number,
              title: p.title,
              summary: p.summary,
            })),
          })),
        };
      }

      // Generate PDF
      const pdfBuffer = await generatePDF({
        title,
        policies,
        policiesByCategory,
        metadata,
        include_toc,
        include_index,
        template,
      });

      // Save manual record to database
      const { data: manual, error: manualError } = await supabase
        .from('manuals')
        .insert({
          title,
          description: `Generated manual containing ${policies.length} policies`,
          sport_id,
          template_config: {
            categories,
            policy_ids,
            include_toc,
            include_index,
            template,
          },
        })
        .select()
        .single();

      if (manualError) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to save manual record: ${manualError.message}`
        );
      }

      // Create manual_policies relationships
      if (manual) {
        const manualPolicies = policies.map((policy, index) => ({
          manual_id: manual.id,
          policy_id: policy.id,
          section_order: index + 1,
          section_title: policy.category,
        }));

        await supabase
          .from('manual_policies')
          .insert(manualPolicies);
      }

      return {
        manual_id: manual?.id,
        title,
        pdf_size: pdfBuffer.length,
        policy_count: policies.length,
        categories: Object.keys(policiesByCategory),
        message: 'Manual generated successfully',
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to generate manual: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const previewManual: Tool = {
  name: 'preview_manual',
  description: 'Preview manual structure without generating PDF',
  inputSchema: GenerateManualSchema.omit({ format: true }),
  handler: async (args) => {
    return generateManual.handler({ ...args, format: 'preview' });
  },
};

const getManualTemplates: Tool = {
  name: 'get_manual_templates',
  description: 'Get available manual templates with their configurations',
  inputSchema: z.object({}),
  handler: async () => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('id, title, description, template_config')
        .eq('is_template', true)
        .order('title', { ascending: true });

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch templates: ${error.message}`
        );
      }

      // Add default templates if none exist
      const defaultTemplates = [
        {
          id: 'default',
          title: 'Standard Manual',
          description: 'Standard Big 12 manual format with TOC and index',
          template_config: {
            include_toc: true,
            include_index: true,
            style: 'standard',
          },
        },
        {
          id: 'compact',
          title: 'Compact Manual',
          description: 'Condensed format without TOC or index',
          template_config: {
            include_toc: false,
            include_index: false,
            style: 'compact',
          },
        },
        {
          id: 'detailed',
          title: 'Detailed Manual',
          description: 'Comprehensive format with all sections and appendices',
          template_config: {
            include_toc: true,
            include_index: true,
            include_appendices: true,
            style: 'detailed',
          },
        },
      ];

      return {
        templates: [...defaultTemplates, ...(data || [])],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export const generateTools: Record<string, Tool> = {
  generate_manual: generateManual,
  preview_manual: previewManual,
  get_manual_templates: getManualTemplates,
};