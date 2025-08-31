import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'prisma/prisma.serice';
import { RecipeAiService } from './recipe-ai.service';

@Module({
  controllers: [RecipeController],
  providers: [RecipeService, PrismaService, RecipeAiService],
})
export class RecipeModule {}
