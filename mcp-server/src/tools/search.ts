import { z } from 'zod';
import { Tool } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { SearchQuerySchema, SportFilterSchema, CategoryFilterSchema } from '../lib/validation.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

const searchPolicies: Tool = {
  name: 'search_policies',
  description: 'Search policies using full-text search with optional filters',
  inputSchema: SearchQuerySchema,
  handler: async (args) => {
    const { query, filters, pagination } = args;
    const { page = 1, limit = 20 } = pagination || {};
    const offset = (page - 1) * limit;

    try {
      let queryBuilder = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .textSearch('content_text', query, {
          type: 'websearch',
          config: 'english'
        })
        .eq('status', 'current');

      // Apply filters
      if (filters) {
        if (filters.sport_ids?.length) {
          queryBuilder = queryBuilder.in('sport_id', filters.sport_ids);
        }
        if (filters.categories?.length) {
          queryBuilder = queryBuilder.in('category', filters.categories);
        }
        if (filters.status) {
          queryBuilder = queryBuilder.eq('status', filters.status);
        }
        if (filters.tags?.length) {
          queryBuilder = queryBuilder.overlaps('tags', filters.tags);
        }
      }

      // Apply pagination
      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('updated_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        policies: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const searchBySport: Tool = {
  name: 'search_by_sport',
  description: 'Search policies for a specific sport',
  inputSchema: SportFilterSchema,
  handler: async (args) => {
    const { sport_id, sport_abbreviation, include_multi_sport, pagination } = args;
    const { page = 1, limit = 20 } = pagination || {};
    const offset = (page - 1) * limit;

    try {
      // If abbreviation provided, look up sport_id
      let sportId = sport_id;
      if (sport_abbreviation && !sportId) {
        const { data: sport } = await supabase
          .from('sports')
          .select('id, name')
          .eq('abbreviation', sport_abbreviation)
          .single();
        
        if (!sport) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Sport with abbreviation "${sport_abbreviation}" not found`
          );
        }
        sportId = sport.id;
      }

      let queryBuilder = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .eq('status', 'current');

      if (sportId) {
        if (include_multi_sport) {
          // Include policies that apply to this sport OR have null sport_id
          queryBuilder = queryBuilder.or(`sport_id.eq.${sportId},sport_id.is.null`);
        } else {
          queryBuilder = queryBuilder.eq('sport_id', sportId);
        }
      }

      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('policy_number', { ascending: true });

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        policies: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const searchByCategory: Tool = {
  name: 'search_by_category',
  description: 'Search policies by category with optional sport filter',
  inputSchema: CategoryFilterSchema,
  handler: async (args) => {
    const { category, sport_id, pagination } = args;
    const { page = 1, limit = 20 } = pagination || {};
    const offset = (page - 1) * limit;

    try {
      let queryBuilder = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .eq('status', 'current')
        .eq('category', category);

      if (sport_id !== undefined) {
        queryBuilder = queryBuilder.eq('sport_id', sport_id);
      }

      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('policy_number', { ascending: true });

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        policies: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const searchByKeywords: Tool = {
  name: 'search_by_keywords',
  description: 'Search policies by keywords or tags',
  inputSchema: z.object({
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    match_all: z.boolean().default(false).describe('Whether to match all keywords or any'),
    pagination: z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }).optional(),
  }),
  handler: async (args) => {
    const { keywords, match_all, pagination } = args;
    const { page = 1, limit = 20 } = pagination || {};
    const offset = (page - 1) * limit;

    try {
      let queryBuilder = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .eq('status', 'current');

      if (match_all) {
        // Match all keywords - use contains for array overlap
        queryBuilder = queryBuilder.contains('keywords', keywords);
      } else {
        // Match any keyword - use overlaps
        queryBuilder = queryBuilder.overlaps('keywords', keywords);
      }

      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('updated_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return {
        policies: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export const searchTools: Record<string, Tool> = {
  search_policies: searchPolicies,
  search_by_sport: searchBySport,
  search_by_category: searchByCategory,
  search_by_keywords: searchByKeywords,
};