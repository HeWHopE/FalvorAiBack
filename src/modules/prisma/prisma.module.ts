import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.serice';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
