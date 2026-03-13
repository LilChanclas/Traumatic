import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
//Cuando se quiera usar prisma en otro modulo, se importa el PrismaModule
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}