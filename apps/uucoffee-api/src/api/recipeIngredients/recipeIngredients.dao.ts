import { eq } from 'drizzle-orm';
import { recipeIngredients } from '../../db/schema';
import { db } from '../../db';
import * as schema from '../../db/schema';
import type { Ingredient } from '../ingredients/ingredients.models';
import { RecipeIngredientRelation } from './recipeIngredients.models';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class RecipeIngredientsDao {
  private dbClient: NodePgDatabase<typeof schema>;

  constructor(dbClientInstance: NodePgDatabase<typeof schema>) {
    this.dbClient = dbClientInstance;
  }

  public async createRecipeIngredients(recipeIngredientsToInsert: RecipeIngredientRelation[]) {
    await this.dbClient
      .insert(recipeIngredients)
      .values(recipeIngredientsToInsert)
  }

  public async deleteRecipeIngredientByIngredientId(id: Ingredient["id"]) {
    await db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.ingredientId, id));
  }

  public async deleteRecipeIngredientByRecipeId(id: Ingredient["id"]) {
    await db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id));
  }
}

export const recipeIngredientsDao = new RecipeIngredientsDao(db);