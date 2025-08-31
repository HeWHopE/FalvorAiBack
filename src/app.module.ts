import { Module } from '@nestjs/common';
import { AuthModule } from './modules';

import { PrismaService } from '../prisma/prisma.serice';
import { TrainModule } from './modules/trains/train.module';

@Module({
  imports: [AuthModule, TrainModule],
  exports: [],
  providers: [PrismaService],
})
export class AppModule {}
