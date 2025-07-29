import { z } from 'zod';

// Re-export database types
export type { Database } from '../../../src/lib/supabase/types.js';

// Tool handler type
export type ToolHandler<T = any> = (args: T) => Promise<any>;

// Tool definition
export interface Tool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: ToolHandler;
}

// Resource provider interface
export interface ResourceProvider {
  listResources(): Promise<Resource[]>;
  readResource(uri: string): Promise<ResourceContent[]>;
}

// Resource types
export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: string;
}

// Prompt types
export interface Prompt {
  name: string;
  description: string;
  arguments?: PromptArgument[];
  handler: (args: Record<string, any>) => Promise<PromptMessage[]>;
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: {
    type: 'text';
    text: string;
  };
}

// Policy types
export const PolicyCategoryEnum = z.enum([
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
  'administrative'
]);

export const PolicyStatusEnum = z.enum([
  'draft',
  'current',
  'archived',
  'pending_approval'
]);

export type PolicyCategory = z.infer<typeof PolicyCategoryEnum>;
export type PolicyStatus = z.infer<typeof PolicyStatusEnum>;

// Manual generation types
export interface ManualConfig {
  title: string;
  sport_id?: number;
  policy_ids?: string[];
  categories?: PolicyCategory[];
  include_toc?: boolean;
  include_index?: boolean;
  template?: string;
}