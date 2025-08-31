import { IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export interface RecipeDto {
  id: number;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;

  averageRating?: number;
  ratingsCount?: number;
}
