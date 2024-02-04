import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import fs from "fs/promises";
import type { InsertRecipeType } from '../api/recipes/recipes.models';
import type { InsertIngredientType } from '../api/ingredients/ingredients.models';
import { RecipesDao } from '../api/recipes/recipes.dao';
import { RecipeIngredientsDao } from '../api/recipeIngredients/recipeIngredients.dao';
import { IngredientsDao } from '../api/ingredients/ingredients.dao';

type MockDataType = {
  recipes: InsertRecipeType[],
  ingredients: InsertIngredientType[],
}

const main = (async () => {
  const pool = new Pool({
    connectionString: `${process.env.DATABASE_URL}`
  });

  try {
    const fileContent = await fs.readFile('src/db/mockData.json', 'utf-8');
    const data = await JSON.parse(fileContent) as MockDataType;
    const { ingredients: mockIngredients, recipes: mockRecipes } = data;

    const db = drizzle(pool, { schema });

    const seedIngredientsDao = new IngredientsDao(db);
    const seedRecipesDao = new RecipesDao(db);
    const seedRecipeIngredientsDao = new RecipeIngredientsDao(db);

    const existingIngredients = await seedIngredientsDao.getAllIngredients();

    for (const existingIngredient of existingIngredients) {
      await seedRecipeIngredientsDao.deleteRecipeIngredientByIngredientId(existingIngredient.id)
      await seedIngredientsDao.deleteIngredientById(existingIngredient.id);
    }

    let i = 0;
    let lowestIngredientId: number;

    for (const mockIngredient of mockIngredients) {
      const insertedIngredient = await seedIngredientsDao.createIngredient(mockIngredient);

      if (!insertedIngredient) throw new Error('Unable to insert mock ingredient')

      if (i === 0) lowestIngredientId = insertedIngredient.id;
      i++;
    }

    const existingRecipes = await seedRecipesDao.getAllRecipes();

    for (const existingRecipe of existingRecipes) {
      await seedRecipesDao.deleteRecipeById(existingRecipe.id);
    }

    for (const mockRecipe of mockRecipes) {
      const { ingredients, ...rest } = mockRecipe;

      const insertedRecipe = await seedRecipesDao.createRecipe({ ...rest });

      if (!insertedRecipe) throw new Error('Unable to insert recipe');

      const modifiedIngredients = ingredients.map(
        (ingredient) => (
          {
            ...ingredient,
            ingredientId: (ingredient.ingredientId + lowestIngredientId - 1),
            recipeId: insertedRecipe.id
          })
      );

      if (rest.name === "Mocha") console.log(insertedRecipe, modifiedIngredients)

      await seedRecipeIngredientsDao.createRecipeIngredients(modifiedIngredients)

    }
  } catch (e) {
    console.log(e)
  }

  await pool.end();
})();