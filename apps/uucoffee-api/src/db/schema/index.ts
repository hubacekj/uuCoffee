import {
  boolean,
  integer,
  serial,
  text,
  pgTable,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  favorite: boolean('favorite').default(false).notNull(),
  portionAmount: integer('portionAmount').notNull(),
  preparationTime: integer('preparationTime').notNull(),
});

export const unitEnum = pgEnum('unit', ['grams', 'mililiters']);

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  unit: unitEnum('unit').notNull(),
});

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    recipeId: integer('recipeId').notNull().references(() => recipes.id),
    ingredientId: integer('ingredientId').notNull().references(() => ingredients.id),
    amount: integer('amount').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.recipeId, t.ingredientId] }),
  }),
);

export const recipeRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const ingredientRelations = relations(ingredients, ({ many }) => ({
  recipes: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));
