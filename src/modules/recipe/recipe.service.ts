import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreateNoteDto, RecipeDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

import { PrismaService } from 'prisma/prisma.serice';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RateRecipeDto } from './dto/rate.dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  // --------------------
  // Recipes
  // --------------------

  async searchRecipes(
    currentUserId: number,
    query: string,
  ): Promise<RecipeDto[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { instructions: { contains: query, mode: 'insensitive' } },
          {
            ingredients: {
              hasSome: [query], // checks if any ingredient matches exactly
            },
          },
        ],
      },
      include: {
        notes: true,
        user: true,
        ratings: true,
        _count: { select: { ratings: true } },
      },
    });

    const ratings = await this.prisma.recipeRating.groupBy({
      by: ['recipeId'],
      _avg: { rating: true },
    });

    return recipes.map((recipe) => {
      const ratingData = ratings.find((r) => r.recipeId === recipe.id);
      const userRating =
        recipe.ratings.find((r) => r.userId === currentUserId)?.rating ?? 0;

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description ?? undefined,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        imageUrl: recipe.imageUrl ?? undefined,
        userId: recipe.userId,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        notes: recipe.notes,
        user: recipe.user,
        avgRating: ratingData?._avg.rating ?? 0,
        userRating,
      };
    });
  }

  async getAllRecipes(currentUserId: number): Promise<RecipeDto[]> {
    // Fetch recipes including notes, user, and ratings
    const recipes = await this.prisma.recipe.findMany({
      include: {
        notes: true,
        user: true,
        ratings: true, // include ratings to get userRating
      },
    });

    // Compute avgRating per recipe
    const ratingsAvg = await this.prisma.recipeRating.groupBy({
      by: ['recipeId'],
      _avg: { rating: true },
    });

    return recipes.map((recipe) => {
      const ratingData = ratingsAvg.find((r) => r.recipeId === recipe.id);
      const userRating =
        recipe.ratings.find((r) => r.userId === currentUserId)?.rating ?? 0;

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description ?? undefined,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        imageUrl: recipe.imageUrl ?? undefined,
        userId: recipe.userId,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        notes: recipe.notes,
        user: recipe.user,
        avgRating: ratingData?._avg.rating ?? 0,
        userRating,
      };
    });
  }

  async createRecipe(userId: number, data: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async getRecipes(userId: number) {
    return this.prisma.recipe.findMany({
      where: { userId },
      include: { notes: true },
    });
  }

  async getRecipeById(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: { notes: true },
    });
  }

  async updateRecipe(id: number, data: UpdateRecipeDto) {
    return this.prisma.recipe.update({
      where: { id },
      data,
    });
  }

  async deleteRecipe(id: number) {
    return this.prisma.recipe.delete({ where: { id } });
  }

  // --------------------
  // Notes
  // --------------------
  async addNote(userId: number, recipeId: number, data: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        recipe: { connect: { id: recipeId } },
      },
    });
  }

  async getNotesForRecipe(userId: number, recipeId: number) {
    return this.prisma.note.findMany({
      where: { recipeId, userId }, // only notes of this user
    });
  }

  async updateNote(noteId: number, data: UpdateNoteDto) {
    return this.prisma.note.update({
      where: { id: noteId },
      data,
    });
  }

  async deleteNote(noteId: number) {
    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  async rateRecipe(userId: number, recipeId: number, dto: RateRecipeDto) {
    // Upsert the user's rating
    await this.prisma.recipeRating.upsert({
      where: {
        recipeId_userId: { recipeId, userId },
      },
      update: { rating: dto.rating },
      create: { recipeId, userId, rating: dto.rating },
    });

    // Calculate the updated average rating for the recipe
    const result = await this.prisma.recipeRating.aggregate({
      where: { recipeId },
      _avg: { rating: true },
    });

    return {
      avgRating: result._avg.rating ?? 0,
    };
  }

  // ⭐ Get average rating of a recipe
  async getAverageRating(recipeId: number) {
    const result = await this.prisma.recipeRating.aggregate({
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      rating: result._avg.rating || 0,
      count: result._count.rating,
    };
  }
}
