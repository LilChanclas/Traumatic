import { Module } from '@nestjs/common'
import { AdministrativoService } from './administrativo.service'
import { AdministrativoController } from './administrativo.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [AdministrativoService],
  controllers: [AdministrativoController],
  exports: [AdministrativoService],
})
export class AdministrativoModule {}
