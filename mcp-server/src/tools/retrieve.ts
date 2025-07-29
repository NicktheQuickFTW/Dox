import { z } from 'zod';
import { Tool } from '../types/index.js';
import { supabase } from '../lib/supabase.js';
import { PolicyIdSchema, PolicyNumberSchema } from '../lib/validation.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

const getPolicy: Tool = {
  name: 'get_policy',
  description: 'Retrieve a single policy by ID or policy number',
  inputSchema: z.union([
    PolicyIdSchema,
    PolicyNumberSchema,
  ]),
  handler: async (args) => {
    try {
      let query;
      
      if ('id' in args) {
        query = supabase
          .from('policies')
          .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)')
          .eq('id', args.id)
          .single();
      } else {
        query = supabase
          .from('policies')
          .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)')
          .eq('policy_number', args.policy_number)
          .single();
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Policy not found'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${error.message}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to retrieve policy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const getPolicyHistory: Tool = {
  name: 'get_policy_history',
  description: 'Get version history for a policy',
  inputSchema: z.object({
    policy_id: z.union([z.number(), z.string()]),
    limit: z.number().int().positive().max(50).default(10),
  }),
  handler: async (args) => {
    const { policy_id, limit } = args;

    try {
      // First get the current policy
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('id, title, policy_number, version')
        .eq('id', policy_id)
        .single();

      if (policyError) {
        if (policyError.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Policy not found'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Database query failed: ${policyError.message}`
        );
      }

      // Get version history
      const { data: versions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policy_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (versionsError) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to retrieve versions: ${versionsError.message}`
        );
      }

      return {
        policy: {
          id: policy.id,
          title: policy.title,
          policy_number: policy.policy_number,
          current_version: policy.version,
        },
        versions: versions || [],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to retrieve policy history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const listPolicies: Tool = {
  name: 'list_policies',
  description: 'List policies with pagination and optional filters',
  inputSchema: z.object({
    filters: z.object({
      sport_id: z.number().optional(),
      category: z.string().optional(),
      status: z.string().optional(),
      effective_after: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      effective_before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).optional(),
    sort_by: z.enum(['policy_number', 'title', 'updated_at', 'effective_date']).default('policy_number'),
    sort_order: z.enum(['asc', 'desc']).default('asc'),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
  handler: async (args) => {
    const { filters, sort_by, sort_order, page, limit } = args;
    const offset = (page - 1) * limit;

    try {
      let queryBuilder = supabase
        .from('policies')
        .select('*, sports!policies_sport_id_fkey(id, name, abbreviation)', { count: 'exact' });

      // Apply filters
      if (filters) {
        if (filters.sport_id !== undefined) {
          queryBuilder = queryBuilder.eq('sport_id', filters.sport_id);
        }
        if (filters.category) {
          queryBuilder = queryBuilder.eq('category', filters.category);
        }
        if (filters.status) {
          queryBuilder = queryBuilder.eq('status', filters.status);
        } else {
          // Default to current policies if no status specified
          queryBuilder = queryBuilder.eq('status', 'current');
        }
        if (filters.effective_after) {
          queryBuilder = queryBuilder.gte('effective_date', filters.effective_after);
        }
        if (filters.effective_before) {
          queryBuilder = queryBuilder.lte('effective_date', filters.effective_before);
        }
      } else {
        // Default to current policies
        queryBuilder = queryBuilder.eq('status', 'current');
      }

      // Apply sorting and pagination
      queryBuilder = queryBuilder
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

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
        `Failed to list policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export const retrieveTools: Record<string, Tool> = {
  get_policy: getPolicy,
  get_policy_history: getPolicyHistory,
  list_policies: listPolicies,
};