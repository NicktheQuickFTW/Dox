import { z } from 'zod';
import { Tool } from '../types/index.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { CreatePolicySchema, UpdatePolicySchema } from '../lib/validation.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

// Helper to check if admin client is available
const requireAdmin = () => {
  if (!supabaseAdmin) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Admin operations require SUPABASE_SERVICE_KEY environment variable'
    );
  }
  return supabaseAdmin;
};

const createPolicy: Tool = {
  name: 'create_policy',
  description: 'Create a new policy (requires admin access)',
  inputSchema: CreatePolicySchema,
  handler: async (args) => {
    const client = requireAdmin();

    try {
      // Check if policy number already exists
      const { data: existing } = await client
        .from('policies')
        .select('id')
        .eq('policy_number', args.policy_number)
        .single();

      if (existing) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Policy with number ${args.policy_number} already exists`
        );
      }

      // Create the policy
      const { data, error } = await client
        .from('policies')
        .insert({
          ...args,
          status: 'draft',
          version: '1.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create policy: ${error.message}`
        );
      }

      return {
        policy: data,
        message: 'Policy created successfully',
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create policy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const updatePolicy: Tool = {
  name: 'update_policy',
  description: 'Update an existing policy (requires admin access)',
  inputSchema: UpdatePolicySchema,
  handler: async (args) => {
    const client = requireAdmin();
    const { id, updates, change_summary } = args;

    try {
      // Get current policy
      const { data: currentPolicy, error: fetchError } = await client
        .from('policies')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Policy not found'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch policy: ${fetchError.message}`
        );
      }

      // Create version record before updating
      if (change_summary || Object.keys(updates).length > 0) {
        await client
          .from('policy_versions')
          .insert({
            policy_id: currentPolicy.id,
            version: currentPolicy.version,
            title: currentPolicy.title,
            content_text: currentPolicy.content_text,
            content_html: currentPolicy.content_html,
            summary: currentPolicy.summary,
            change_summary: change_summary || 'Policy updated',
            created_at: new Date().toISOString(),
          });
      }

      // Increment version if content changed
      let newVersion = currentPolicy.version;
      if (updates.content_text || updates.content_html) {
        const [major, minor] = newVersion.split('.').map(Number);
        newVersion = `${major}.${minor + 1}`;
      }

      // Update the policy
      const { data, error } = await client
        .from('policies')
        .update({
          ...updates,
          version: newVersion,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update policy: ${error.message}`
        );
      }

      return {
        policy: data,
        previous_version: currentPolicy.version,
        new_version: newVersion,
        message: 'Policy updated successfully',
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update policy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const archivePolicy: Tool = {
  name: 'archive_policy',
  description: 'Archive a policy (requires admin access)',
  inputSchema: z.object({
    id: z.union([z.number(), z.string()]),
    reason: z.string().optional(),
  }),
  handler: async (args) => {
    const client = requireAdmin();
    const { id, reason } = args;

    try {
      // Update status to archived
      const { data, error } = await client
        .from('policies')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
          metadata: {
            archived_at: new Date().toISOString(),
            archive_reason: reason,
          },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Policy not found'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to archive policy: ${error.message}`
        );
      }

      return {
        policy: data,
        message: 'Policy archived successfully',
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to archive policy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

const approvePolicy: Tool = {
  name: 'approve_policy',
  description: 'Approve a pending policy (requires admin access)',
  inputSchema: z.object({
    id: z.union([z.number(), z.string()]),
    approver_notes: z.string().optional(),
  }),
  handler: async (args) => {
    const client = requireAdmin();
    const { id, approver_notes } = args;

    try {
      // Check current status
      const { data: currentPolicy, error: fetchError } = await client
        .from('policies')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Policy not found'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch policy: ${fetchError.message}`
        );
      }

      if (currentPolicy.status !== 'pending_approval' && currentPolicy.status !== 'draft') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Cannot approve policy with status: ${currentPolicy.status}`
        );
      }

      // Update to current status
      const { data, error } = await client
        .from('policies')
        .update({
          status: 'current',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            approval_notes: approver_notes,
          },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to approve policy: ${error.message}`
        );
      }

      return {
        policy: data,
        message: 'Policy approved and set to current',
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to approve policy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export const manageTools: Record<string, Tool> = {
  create_policy: createPolicy,
  update_policy: updatePolicy,
  archive_policy: archivePolicy,
  approve_policy: approvePolicy,
};