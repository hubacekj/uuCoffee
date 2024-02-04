import { createSelectSchema } from 'drizzle-zod';
import { recipeIngredients } from '../../db/schema';
import { z } from 'zod';

export const RecipeIngredientRelationSchema = createSelectSchema(recipeIngredients);
export const RecipeIngredientSchema = RecipeIngredientRelationSchema
  .omit({ recipeId: true })
  .extend({
    amount: z.number({ 'required_error': 'Ingredient amount is required.' }),
    ingredientId: z
      .number({ 'required_error': 'Ingredient id is required.' })
      .positive('Ingredient id must be a positive integer.')
      .int('Ingredient id must be an integer.')
  });
export type RecipeIngredientRelation = z.infer<typeof RecipeIngredientRelationSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;