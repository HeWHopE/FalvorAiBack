import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/common';
import { UserInfo } from 'src/common/decorators/userInfo';
import { UserPayload } from 'src/common/utils/user-payload';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dtos';
import { JwtGuard } from './guards';

@UseGuards(JwtGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data);
  }

  @Public()
  @Post('/signin')
  async signIn(@Body() data: SignInDto) {
    return await this.authService.signIn(data);
  }

  @Public()
  @Post('/refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Get('/currentUser')
  async getCurrentUser(@UserInfo() user: UserPayload) {
    return await this.authService.getById(user.id);
  }
}
