import {
  createInsertSchema,
  createSelectSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { recipes } from '../../db/schema';
import { RecipeIngredientSchema } from '../recipeIngredients/recipeIngredients.models';

export const RecipeSchema = createSelectSchema(recipes);
export const InsertRecipeWithIdSchema = createInsertSchema(recipes);
export const InsertRecipeSchema = InsertRecipeWithIdSchema
  .omit({ id: true })
  .extend({
    name: z
      .string({ 'required_error': 'Name is required.' })
      .min(1, 'Recipe name must be at least 1 char long.'),
    description: z.string({ 'required_error': 'Description is required.' }),
    portionAmount: z
      .number({ 'required_error': 'Portion amount is required.' })
      .min(1, 'Portion amount must be at least 1.'),
    preparationTime: z
      .number({ 'required_error': 'Preparation time is required.' })
      .min(1, 'Preparation time must be at least 1.'),
  })
  .merge(
    z.object({
      ingredients: z
        .array(RecipeIngredientSchema, { 'required_error': 'Recipe must have an array of ingredients.' })
        .nonempty({ message: 'Recipe must have at least 1 ingredient' })
    }),
  );
export const UpdateRecipeSchema = InsertRecipeSchema.partial();
export type Recipe = z.infer<typeof RecipeSchema>;
export type InsertRecipeType = z.infer<typeof InsertRecipeSchema>;
export type UpdateRecipeType = z.infer<typeof UpdateRecipeSchema>;
