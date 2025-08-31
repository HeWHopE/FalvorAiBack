import { Module } from '@nestjs/common';
import { AuthModule } from './modules';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaService } from '../prisma/prisma.serice';
import { RecipeModule } from './modules/recipe/recipe.module';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    RecipeModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // project root /uploads
      serveRoot: '/uploads', // accessible at /uploads/filename.jpg
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}
