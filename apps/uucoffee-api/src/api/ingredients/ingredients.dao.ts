import { eq } from 'drizzle-orm';
import { ingredients } from '../../db/schema';
import { db } from '../../db';
import * as schema from '../../db/schema';
import type { Ingredient, InsertIngredientType, UpdateIngredientType } from './ingredients.models';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class IngredientsDao {
  private dbClient: NodePgDatabase<typeof schema>;

  constructor(dbClientInstance: NodePgDatabase<typeof schema>) {
    this.dbClient = dbClientInstance;
  }

  public async getAllIngredients() {
    return await this.dbClient.query.ingredients.findMany({
      with: {
        recipes: {
          columns: {
            recipeId: true,
          },
        },
      },
    })
  }

  public async getIngredientById(id: Ingredient["id"]) {
    return (await this.dbClient
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, id))
    )[0]
  }

  public async getIngredientByName(name: Ingredient["name"]) {
    return (await this.dbClient
      .select()
      .from(ingredients)
      .where(eq(ingredients.name, name))
    )[0]
  }

  public async createIngredient(ingredientToInsert: InsertIngredientType) {
    return (await this.dbClient
      .insert(ingredients)
      .values({ ...ingredientToInsert })
      .returning()
    )[0]
  }

  public async updateIngredientById(ingredientToUpdate: UpdateIngredientType, id: Ingredient["id"]) {
    return (await this.dbClient
      .update(ingredients)
      .set({ ...ingredientToUpdate })
      .where(eq(ingredients.id, id))
      .returning()
    )[0]
  }

  public async deleteIngredientById(id: Ingredient["id"]) {
    await this.dbClient
      .delete(ingredients)
      .where(eq(ingredients.id, id));
  }
}

export const ingredientsDao = new IngredientsDao(db);