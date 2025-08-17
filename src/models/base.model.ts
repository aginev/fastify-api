import { z } from 'zod';

// Shared property objects - use with spread syntax (...)
export const withId = {
    id: z.bigint().positive(),
};

export const withTimestamps = {
    created_at: z.date(),
    updated_at: z.date(),
};

export const withSoftDelete = {
    deleted_at: z.date().nullable().default(null),
};

export const withActiveStatus = {
    is_active: z.boolean().default(true),
};

// Generic foreign key property - reusable for any FK relationship
export const withForeignKey = (fieldName: string, label: string = 'ID') => ({
    [fieldName]: z.number().int().positive(`${label} must be a positive integer`),
});

// Base schema with all common properties
export const BaseSchema = z.object({
    ...withId,
    ...withTimestamps,
    ...withSoftDelete,
    ...withActiveStatus,
});

// Type exports for common base types
export type BaseModel = z.infer<typeof BaseSchema>;
export type BaseModelWithoutSoftDelete = z.infer<z.ZodObject<typeof withId & typeof withTimestamps & typeof withActiveStatus>>;
export type BaseModelWithoutTimestamps = z.infer<z.ZodObject<typeof withId & typeof withSoftDelete & typeof withActiveStatus>>;
export type BaseModelIdOnly = z.infer<z.ZodObject<typeof withId>>;
export type BaseModelTimestampsOnly = z.infer<z.ZodObject<typeof withTimestamps>>;
export type BaseModelSoftDeleteOnly = z.infer<z.ZodObject<typeof withSoftDelete>>;
export type BaseModelActiveStatusOnly = z.infer<z.ZodObject<typeof withActiveStatus>>;
