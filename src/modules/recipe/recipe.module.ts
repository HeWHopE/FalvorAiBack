import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'prisma/prisma.serice';

@Module({
  controllers: [RecipeController],
  providers: [RecipeService, PrismaService],
})
export class RecipeModule {}
