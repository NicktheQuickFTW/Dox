import { z } from 'zod';
import { PolicyCategoryEnum, PolicyStatusEnum } from '../types/index.js';

// Common schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    sport_ids: z.array(z.number()).optional(),
    categories: z.array(PolicyCategoryEnum).optional(),
    status: PolicyStatusEnum.optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  pagination: PaginationSchema.optional(),
});

export const PolicyIdSchema = z.object({
  id: z.union([z.number(), z.string()]),
});

export const PolicyNumberSchema = z.object({
  policy_number: z.string().regex(/^[A-Z]+-[A-Z]+-\d{3}$/, 'Invalid policy number format'),
});

export const SportFilterSchema = z.object({
  sport_id: z.number().optional(),
  sport_abbreviation: z.string().optional(),
  include_multi_sport: z.boolean().default(true),
  pagination: PaginationSchema.optional(),
});

export const CategoryFilterSchema = z.object({
  category: PolicyCategoryEnum,
  sport_id: z.number().optional(),
  pagination: PaginationSchema.optional(),
});

export const CreatePolicySchema = z.object({
  title: z.string().min(1).max(255),
  short_name: z.string().min(1).max(100),
  category: PolicyCategoryEnum,
  sport_id: z.number().nullable().optional(),
  policy_number: z.string().regex(/^[A-Z]+-[A-Z]+-\d{3}$/),
  content_text: z.string().min(1),
  content_html: z.string().optional(),
  summary: z.string().optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  applies_to_sports: z.array(z.string()).default([]),
});

export const UpdatePolicySchema = z.object({
  id: z.union([z.number(), z.string()]),
  updates: z.object({
    title: z.string().min(1).max(255).optional(),
    short_name: z.string().min(1).max(100).optional(),
    category: PolicyCategoryEnum.optional(),
    sport_id: z.number().nullable().optional(),
    content_text: z.string().min(1).optional(),
    content_html: z.string().optional(),
    summary: z.string().optional(),
    effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    tags: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    applies_to_sports: z.array(z.string()).optional(),
    status: PolicyStatusEnum.optional(),
  }),
  change_summary: z.string().optional(),
});

export const GenerateManualSchema = z.object({
  title: z.string().min(1),
  sport_id: z.number().optional(),
  policy_ids: z.array(z.string()).optional(),
  categories: z.array(PolicyCategoryEnum).optional(),
  include_toc: z.boolean().default(true),
  include_index: z.boolean().default(true),
  template: z.string().optional(),
  format: z.enum(['pdf', 'preview']).default('pdf'),
});