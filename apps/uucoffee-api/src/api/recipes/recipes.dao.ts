import { eq } from 'drizzle-orm';
import { recipes } from '../../db/schema';
import { db } from '../../db';
import * as schema from '../../db/schema';
import type {
  Recipe,
  InsertRecipeType,
  UpdateRecipeType,
} from './recipes.models';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class RecipesDao {
  private dbClient: NodePgDatabase<typeof schema>;

  constructor(dbClientInstance: NodePgDatabase<typeof schema>) {
    this.dbClient = dbClientInstance;
  }

  public async getAllRecipes() {
    return await this.dbClient.query.recipes.findMany({
      with: {
        ingredients: {
          columns: {
            ingredientId: true,
            amount: true,
          },
        },
      },
    })
  }

  public async getRecipeById(id: Recipe["id"]) {
    return (await this.dbClient
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
    )[0]
  }

  public async getRecipeByName(name: Recipe["name"]) {
    return (await this.dbClient
      .select()
      .from(recipes)
      .where(eq(recipes.name, name))
    )[0]
  }

  public async getRecipeWithIngredientsById(id: Recipe["id"]) {
    return (await this.dbClient.query.recipes
      .findMany({
        where: eq(recipes.id, id),
        with: {
          ingredients: {
            columns: {
              ingredientId: true,
              amount: true,
            },
          },
        },
      })
    )[0]
  }

  public async createRecipe(recipeToInsert: Omit<InsertRecipeType, 'ingredients'>) {
    return (await this.dbClient
      .insert(recipes)
      .values({ ...recipeToInsert })
      .returning()
    )[0]
  }

  public async updateRecipeById(recipeToUpdate: UpdateRecipeType & { ingredients?: never }, id: Recipe["id"]) {
    await this.dbClient
      .update(recipes)
      .set({ ...recipeToUpdate })
      .where(eq(recipes.id, id))
  }

  public async deleteRecipeById(id: Recipe["id"]) {
    await this.dbClient
      .delete(recipes)
      .where(eq(recipes.id, id));
  }
}

export const recipesDao = new RecipesDao(db);