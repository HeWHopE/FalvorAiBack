import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { userInfo } from 'os';
import { UserInfo } from 'src/common/decorators/userInfo';
import { UserPayload } from 'src/common/utils/user-payload';
import { JwtGuard } from 'src/modules';
import { RateRecipeDto } from './dto/rate.dto';

@UseGuards(JwtGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  getAllRecipes(@UserInfo() user: UserPayload) {
    return this.recipeService.getAllRecipes(user.id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'), // project root /uploads
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  createRecipe(
    @UserInfo() user: UserPayload,
    @Body() data: CreateRecipeDto, // receive everything else
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Remove userId if accidentally included in data
    let ingredientsArray: string[] = [];

    if (typeof data.ingredients === 'string') {
      try {
        ingredientsArray = JSON.parse(data.ingredients); // now it's string[]
      } catch (e) {
        console.error('Failed to parse ingredients:', data.ingredients);
        ingredientsArray = []; // fallback
      }
    } else if (Array.isArray(data.ingredients)) {
      ingredientsArray = data.ingredients; // already array
    }

    const imageUrl = file ? `/uploads/${file.filename}` : null;

    return this.recipeService.createRecipe(user.id, {
      ...data,
      ingredients: ingredientsArray,
      imageUrl,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRecipeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Parse ingredients if string
    let ingredientsArray: string[] | undefined = undefined;
    if (data.ingredients) {
      if (typeof data.ingredients === 'string') {
        try {
          ingredientsArray = JSON.parse(data.ingredients);
        } catch {
          ingredientsArray = [];
        }
      } else if (Array.isArray(data.ingredients)) {
        ingredientsArray = data.ingredients;
      }
    }

    // Prepare imageUrl if new image uploaded
    const imageUrl = image ? `/uploads/${image.filename}` : undefined;

    return this.recipeService.updateRecipe(id, {
      ...data,
      ingredients: ingredientsArray,
      ...(imageUrl && { imageUrl }), // only set if new image uploaded
    });
  }

  @Post(':recipeId/notes')
  addNote(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body('userId') userId: number,
    @Body() data: CreateNoteDto,
  ) {
    return this.recipeService.addNote(userId, recipeId, data);
  }

  @Patch('notes/:id')
  updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateNoteDto,
  ) {
    return this.recipeService.updateNote(id, data);
  }

  @Get('user/:userId')
  getRecipesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.recipeService.getRecipes(userId);
  }

  @Delete(':id')
  deleteRecipe(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.deleteRecipe(id);
  }

  @Post(':recipeId/rate')
  rateRecipe(
    @UserInfo() user: UserPayload,
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() dto: RateRecipeDto,
  ) {
    return this.recipeService.rateRecipe(user.id, recipeId, dto);
  }

  // ⭐ Get average rating for a recipe
  @Get(':recipeId/rating/average')
  getAverageRating(@Param('recipeId', ParseIntPipe) recipeId: number) {
    return this.recipeService.getAverageRating(recipeId);
  }
}
