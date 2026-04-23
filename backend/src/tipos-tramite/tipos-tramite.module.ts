import { Module } from '@nestjs/common'
import { TiposTramiteService } from './tipos-tramite.service'
import { TiposTramiteController, TiposTramitePublicoController } from './tipos-tramite.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [TiposTramiteService],
  controllers: [TiposTramiteController, TiposTramitePublicoController],
  exports: [TiposTramiteService],
})
export class TiposTramiteModule {}
