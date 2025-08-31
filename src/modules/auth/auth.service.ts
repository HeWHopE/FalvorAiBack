import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { getConfig } from 'src/config';

import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.serice';
import { AuthResponse, RefreshResponse, SignInDto, SignUpDto } from './dtos';

interface JwtPayload {
  id: number;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens(payload: JwtPayload): AuthResponse {
    const access_token = this.generateToken(
      payload,
      getConfig().jwt_access_secret,
      getConfig().jwt_access_expires,
    );
    const refresh_token = this.generateToken(
      payload,
      getConfig().jwt_refresh_secret,
      getConfig().jwt_refresh_expires,
    );
    return { access_token, refresh_token };
  }

  private generateToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: string,
  ) {
    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  async signUp(data: SignUpDto): Promise<AuthResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user) {
        throw new BadRequestException(
          `User with this email: ${data.email} already registered`,
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });

      const payload: JwtPayload = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };

      this.logger.log(`New user registered: ${newUser.email}`);
      return this.generateTokens(payload);
    } catch (error) {
      this.logger.error('Error during sign-up', error.stack);
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  async signIn(data: SignInDto): Promise<AuthResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new NotFoundException(
          `User with this email: ${data.email} not found`,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Password incorrect');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      this.logger.log(`User signed in: ${user.email}`);
      return this.generateTokens(payload);
    } catch (error) {
      this.logger.error('Error during sign-in', error.stack);
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  async refreshToken(refresh_token: string): Promise<RefreshResponse> {
    try {
      let decoded;
      try {
        decoded = this.jwtService.verify(refresh_token, {
          secret: getConfig().jwt_refresh_secret,
        });
      } catch (e) {
        this.logger.warn('Invalid or expired refresh token');
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const access_token = this.generateToken(
        payload,
        getConfig().jwt_access_secret,
        getConfig().jwt_access_expires,
      );

      this.logger.log(`Access token refreshed for user: ${user.email}`);
      return { access_token };
    } catch (error) {
      this.logger.error('Error during token refresh', error.stack);
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`Fetched user by ID: ${id}`);
      return user;
    } catch (error) {
      this.logger.error('Error fetching user by ID', error.stack);
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }
}
