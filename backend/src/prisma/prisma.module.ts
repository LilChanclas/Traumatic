import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
//Cuando se quiera usar prisma en otro modulo, se importa el PrismaModule
// Por el momento mejor lo deje global
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}