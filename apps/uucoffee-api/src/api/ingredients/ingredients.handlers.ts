import type {
  Response, Request, NextFunction,
} from 'express';
import type {
  ParamWithId,
  EmptyObject,
} from '../../types';
import type {
  InsertIngredientType,
  UpdateIngredientType,
  Ingredient,
} from './ingredients.models';
import { ingredientsDao } from './ingredients.dao';
import { recipeIngredientsDao } from '../recipeIngredients/recipeIngredients.dao';

export async function findAll(
  _: Request,
  res: Response<Ingredient[]>,
  next: NextFunction,
) {
  try {
    const allIngredients = await ingredientsDao.getAllIngredients();

    res.json(allIngredients);
  } catch (error) {
    next(error);
  }
}

export async function createOne(
  req: Request<EmptyObject, Ingredient, InsertIngredientType>,
  res: Response<Ingredient>,
  next: NextFunction,
) {
  try {
    const { name } = req.body;

    const ingredientWithName = await ingredientsDao.getIngredientByName(name);

    if (ingredientWithName) {
      res.status(409);
      throw new Error(`Ingredient with name "${name}" already exists.`);
    }

    const insertedIngredient = await ingredientsDao.createIngredient(req.body)

    if (!insertedIngredient) {
      res.status(500);
      throw new Error('Unable to create ingredient. Try again later.');
    }

    res.json(insertedIngredient);
  } catch (error) {
    next(error);
  }
}

export async function findOne(
  req: Request<ParamWithId, Ingredient, EmptyObject>,
  res: Response<Ingredient>,
  next: NextFunction,
) {
  try {
    const paramId = Number(req.params.id);

    const ingredient = await ingredientsDao.getIngredientById(paramId);

    if (!ingredient) {
      res.status(404);
      throw new Error(`Ingredient with id "${paramId}" not found.`);
    }

    res.json(ingredient);
  } catch (error) {
    next(error);
  }
}

export async function updateOne(
  req: Request<ParamWithId, Ingredient, UpdateIngredientType>,
  res: Response<Ingredient>,
  next: NextFunction,
) {
  try {
    const paramId = Number(req.params.id);
    const { name, unit } = req.body;

    if (!name && !unit) {
      res.status(400)
      throw new Error(`No values to update.`)
    }

    const ingredientToBeUpdated = await ingredientsDao.getIngredientById(paramId);

    if (!ingredientToBeUpdated) {
      res.status(404);
      throw new Error(`Ingredient with id "${paramId}" not found.`);
    }

    if (name) {
      const ingredientWithName = await ingredientsDao.getIngredientByName(name);

      if (ingredientWithName && ingredientWithName.id !== paramId) {
        res.status(409)
        throw new Error(`Unable to update ingredient with name "${name}" that already exists.`);
      }
    }

    const updatedIngredient = await ingredientsDao.updateIngredientById(req.body, paramId);

    if (!updatedIngredient) {
      res.status(500);
      throw new Error(`Unable to update ingredient with id ${paramId}. Try again later.`)
    }

    res.json(updatedIngredient);
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

    const toBeDeletedIngredient = await ingredientsDao.getIngredientById(paramId);

    if (!toBeDeletedIngredient) {
      res.status(404);
      throw new Error(`Ingredient with id "${paramId}" not found.`);
    }

    await recipeIngredientsDao.deleteRecipeIngredientByIngredientId(paramId);

    await ingredientsDao.deleteIngredientById(paramId);

    res.status(204).json();
  } catch (error) {
    next(error);
  }
}
