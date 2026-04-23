import { Module } from '@nestjs/common'
import { AdministrativoService } from './administrativo.service'
import { AdministrativoController } from './administrativo.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [AdministrativoService],
  controllers: [AdministrativoController],
  exports: [AdministrativoService],
})
export class AdministrativoModule {}
