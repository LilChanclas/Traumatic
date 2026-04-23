import { Module } from '@nestjs/common'
import { TramitesService } from './tramites.service'
import { TramitesController } from './tramites.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [TramitesService],
  controllers: [TramitesController],
  exports: [TramitesService],
})
export class TramitesModule {}
