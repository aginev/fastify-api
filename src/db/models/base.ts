import { serial, timestamp, boolean, bigint } from 'drizzle-orm/mysql-core';

export const withPrimary = { id: serial('id').primaryKey() };
export const withTimestamps = {
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
};
export const withSoftDelete = { deleted_at: timestamp('deleted_at') };
export const withActiveStatus = { is_active: boolean('is_active').default(true) };

// Helper function for foreign keys
export const withForeignKey = (fieldName: string, referenceTable: () => any) => ({
    [fieldName]: bigint(fieldName, { mode: 'number' }).notNull().references(referenceTable),
});
