import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshResponse {
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
