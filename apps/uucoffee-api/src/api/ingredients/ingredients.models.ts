import {
  createInsertSchema, createSelectSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { ingredients } from '../../db/schema';

export const IngredientSchema = createSelectSchema(ingredients);
export const InsertIngredientWithIdSchema = createInsertSchema(ingredients);
export const InsertIngredientSchema = InsertIngredientWithIdSchema
  .omit({ id: true })
  .extend({
    name: z
      .string({ 'required_error': 'Name is required.' })
      .min(1, 'Name must be at least 1 char long.'),
    unit: z.enum(
      ['grams', 'mililiters'],
      {
        'required_error': 'Unit is required.',
        'invalid_type_error': 'Unit must be either "mililiters" or "grams".',
      },
    )
  });
export const UpdateIngredientSchema = InsertIngredientSchema.partial();
export type Ingredient = z.infer<typeof IngredientSchema>;
export type InsertIngredientType = z.infer<typeof InsertIngredientSchema>;
export type UpdateIngredientType = z.infer<typeof UpdateIngredientSchema>;
