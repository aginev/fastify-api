import { z } from 'zod';
import {
    withId,
    withTimestamps,
    withActiveStatus
} from './base.model.js';

// Category-specific field schemas
const categoryFields = {
    name: z
        .string()
        .min(1, 'Category name is required')
        .max(100, 'Category name must be less than 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be less than 100 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
};

// Category schemas using spread syntax - much cleaner!
// Categories need: id, timestamps, active status, but NO soft delete
export const CategorySchema = z.object({
    ...withId,
    ...categoryFields,
    ...withActiveStatus,
    ...withTimestamps,
});

// For creation and updates: only business fields (no id, timestamps, or soft delete)
export const CategoryDataSchema = z.object({
    ...categoryFields,
});

// Params schema for route parameters
export const CategoryParamsSchema = z.object({
    id: z.coerce.number().int().positive('Category ID must be a positive integer'),
});

// Response schemas
export const CategoryResponseSchema = z.object({
    category: CategorySchema,
});

export const CategoriesResponseSchema = z.object({
    categories: z.array(CategorySchema),
});

// Type exports
export type Category = z.infer<typeof CategorySchema>;
export type CategoryData = z.infer<typeof CategoryDataSchema>;
export type CategoryParams = z.infer<typeof CategoryParamsSchema>;
