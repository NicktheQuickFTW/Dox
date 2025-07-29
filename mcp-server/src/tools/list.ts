import { z } from 'zod';
import { Tool } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

const listSports: Tool = {
  name: 'list_sports',
  description: 'Get all available sports in the system',
  inputSchema: z.object({
    active_only: z.boolean().default(true).describe('Only return active sports'),
  }),
  handler: async (args) => {
    const { active_only } = args;

    try {
      let queryBuilder = supabase
        .from('sports')
        .select('*')
        .order('name', { ascending: true });

      if (active_only) {
        queryBuilder = queryBuilder.eq('active', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        sports: data || [],
        total: data?.length || 0,
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list sports: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const listCategories: Tool = {
  name: 'list_categories',
  description: 'Get all policy categories with optional counts',
  inputSchema: z.object({
    include_counts: z.boolean().default(false).describe('Include policy counts per category'),
    sport_id: z.number().optional().describe('Filter counts by sport'),
  }),
  handler: async (args) => {
    const { include_counts, sport_id } = args;

    try {
      // Fixed list of categories from the enum
      const categories = [
        'scheduling_policies',
        'officiating',
        'playing_rules',
        'equipment_specifications',
        'facility_standards',
        'travel_procedures',
        'media_relations',
        'safety_protocols',
        'awards_recognition',
        'championship_procedures',
        'venue_requirements',
        'broadcasting_standards',
        'governance',
        'game_management',
        'crowd_control',
        'eligibility',
        'administrative',
      ];

      if (!include_counts) {
        return {
          categories: categories.map(cat => ({
            value: cat,
            label: cat.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
          })),
        };
      }

      // Get counts for each category
      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        let queryBuilder = supabase
          .from('policies')
          .select('id', { count: 'exact', head: true })
          .eq('category', category)
          .eq('status', 'current');

        if (sport_id !== undefined) {
          queryBuilder = queryBuilder.eq('sport_id', sport_id);
        }

        const { count } = await queryBuilder;
        counts[category] = count || 0;
      }

      return {
        categories: categories.map(cat => ({
          value: cat,
          label: cat.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          count: counts[cat],
        })),
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list categories: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const listTags: Tool = {
  name: 'list_tags',
  description: 'Get all unique tags used in policies',
  inputSchema: z.object({
    sport_id: z.number().optional().describe('Filter tags by sport'),
    limit: z.number().int().positive().max(100).default(50),
  }),
  handler: async (args) => {
    const { sport_id, limit } = args;

    try {
      // Get all tags from policies
      let queryBuilder = supabase
        .from('policies')
        .select('tags')
        .eq('status', 'current')
        .not('tags', 'is', null);

      if (sport_id !== undefined) {
        queryBuilder = queryBuilder.eq('sport_id', sport_id);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      // Extract and count unique tags
      const tagCounts: Record<string, number> = {};
      
      data?.forEach(row => {
        row.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // Sort by count and limit
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));

      return {
        tags: sortedTags,
        total: Object.keys(tagCounts).length,
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list tags: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const listManualTemplates: Tool = {
  name: 'list_manual_templates',
  description: 'Get available manual templates',
  inputSchema: z.object({}),
  handler: async () => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .eq('is_template', true)
        .order('title', { ascending: true });

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        templates: data || [],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export const listTools: Record<string, Tool> = {
  list_sports: listSports,
  list_categories: listCategories,
  list_tags: listTags,
  list_manual_templates: listManualTemplates,
};