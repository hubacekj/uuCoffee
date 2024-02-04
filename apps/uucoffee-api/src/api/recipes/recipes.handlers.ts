import type {
  Response,
  Request,
  NextFunction,
} from 'express';
import type {
  ParamWithId,
  EmptyObject,
} from '../../types';
import { filterAsync } from '../../utilities/asyncFilter';

import type {
  InsertRecipeType, Recipe, UpdateRecipeType,
} from './recipes.models';
import { recipesDao } from './recipes.dao';
import { ingredientsDao } from '../ingredients/ingredients.dao';
import { recipeIngredientsDao } from '../recipeIngredients/recipeIngredients.dao';

export async function findAll(_: Request, res: Response<Recipe[]>, next: NextFunction) {
  try {
    const allRecipes = await recipesDao.getAllRecipes();

    res.json(allRecipes);
  } catch (error) {
    next(error);
  }
}

export async function createOne(
  req: Request<EmptyObject, Recipe, InsertRecipeType>,
  res: Response<Recipe>,
  next: NextFunction,
) {
  try {
    const {
      ingredients: recipeIngredientList,
      ...rest
    } = req.body;

    const recipesWithName = await recipesDao.getRecipeByName(rest.name);

    if (recipesWithName) {
      res.status(409);
      throw new Error(`Recipe with name "${rest.name}" already exists.`);
    }

    const recipeIngredientsThatDontExist = await filterAsync(recipeIngredientList, async (recipeIngredient) => {
      const ingredientRecord = await ingredientsDao.getIngredientById(recipeIngredient.ingredientId);

      return ingredientRecord === undefined;
    });

    if (recipeIngredientsThatDontExist.length > 0) {
      const idsString = recipeIngredientsThatDontExist
        .map((recipeIngredient) => recipeIngredient.ingredientId).join(', ');

      res.status(404);
      throw new Error(
        `Ingredients with ids ${idsString} not found.`,
      );
    }

    const insertedRecipe = await recipesDao.createRecipe(rest);

    if (!insertedRecipe) {
      res.status(500);
      throw new Error('Unable to create recipe. Try again later.');
    }

    const recipeIngredientsToInsert = recipeIngredientList.map((recipeIngredient) => ({
      ...recipeIngredient,
      recipeId: insertedRecipe.id,
    }));

    await recipeIngredientsDao.createRecipeIngredients(recipeIngredientsToInsert);

    const insertedRecipeWithIngredients = await recipesDao.getRecipeWithIngredientsById(insertedRecipe.id);

    res.json(insertedRecipeWithIngredients);
  } catch (error) {
    next(error);
  }
}

export async function findOne(
  req: Request<ParamWithId, Recipe, EmptyObject>,
  res: Response<Recipe>,
  next: NextFunction,
) {
  try {
    const paramId = Number(req.params.id);

    const recipe = await recipesDao.getRecipeWithIngredientsById(paramId);

    if (!recipe) {
      res.status(404);
      throw new Error(`Recipe with id "${paramId}" not found.`);
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

export async function updateOne(
  req: Request<ParamWithId, Recipe, UpdateRecipeType>,
  res: Response<Recipe>,
  next: NextFunction,
) {
  try {
    const paramId = Number(req.params.id);

    const {
      ingredients: recipeIngredientList,
      ...rest
    } = req.body;

    const recipeToBeUpdated = await recipesDao.getRecipeById(paramId);

    if (!recipeToBeUpdated) {
      res.status(404);
      throw new Error(`Recipe with id ${paramId} not found.`);
    }

    if (rest.name) {
      const recipeWithName = await recipesDao.getRecipeByName(rest.name);

      if (recipeWithName && recipeWithName.id !== paramId) {
        res.status(409);
        throw new Error(`Unable to update recipe with name "${rest.name}" that already exists.`);
      }
    }

    if (recipeIngredientList) {
      const recipeIngredientsThatDontExist = await filterAsync(recipeIngredientList, async (recipeIngredient) => {
        const ingredientRecord = await ingredientsDao.getIngredientById(recipeIngredient.ingredientId);

        return ingredientRecord === undefined;
      });

      if (recipeIngredientsThatDontExist.length > 0) {
        const idsString = recipeIngredientsThatDontExist
          .map((recipeIngredient) => recipeIngredient.ingredientId).join(', ');

        res.status(404);
        throw new Error(
          `Ingredients with ids ${idsString} not found.`,
        );
      } else {
        const recipeIngredientsToInsert = recipeIngredientList.map((recipeIngredient) => ({
          ...recipeIngredient,
          recipeId: paramId,
        }));

        await recipeIngredientsDao.deleteRecipeIngredientByRecipeId(paramId);
        await recipeIngredientsDao.createRecipeIngredients(recipeIngredientsToInsert);
      }
    }

    await recipesDao.updateRecipeById(rest, paramId);

    const updatedRecipeWithIngredients = await recipesDao.getRecipeWithIngredientsById(paramId);

    res.json(updatedRecipeWithIngredients);
  } catch (error) {
    next(error);
  }
}

export async function deleteOne(
  req: Request<ParamWithId, EmptyObject, EmptyObject>,
  res: Response<EmptyObject>,
  next: NextFunction,
) {
  try {
    const paramId = Number(req.params.id);

    const recipeToBeDeleted = await recipesDao.getRecipeById(paramId);

    if (!recipeToBeDeleted) {
      res.status(404);
      throw new Error(`Recipe with id ${paramId} not found.`);
    }

    await recipeIngredientsDao.deleteRecipeIngredientByRecipeId(paramId);
    await recipesDao.deleteRecipeById(paramId);

    res.status(204).json();
  } catch (error) {
    next(error);
  }
}
