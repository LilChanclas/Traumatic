import { Module } from '@nestjs/common'
import { TramitesService } from './tramites.service'
import { TramitesController } from './tramites.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [TramitesService],
  controllers: [TramitesController],
  exports: [TramitesService],
})
export class TramitesModule {}
