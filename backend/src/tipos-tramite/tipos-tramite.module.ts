import { Module } from '@nestjs/common'
import { TiposTramiteService } from './tipos-tramite.service'
import { TiposTramiteController } from './tipos-tramite.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [TiposTramiteService],
  controllers: [TiposTramiteController],
  exports: [TiposTramiteService],
})
export class TiposTramiteModule {}
