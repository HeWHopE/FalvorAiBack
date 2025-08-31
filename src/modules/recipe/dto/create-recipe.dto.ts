import { IsString, IsOptional } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  ingredients: string[]; // JSON string of ingredients

  @IsString()
  instructions: string;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;
}
