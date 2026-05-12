import { Module } from '@nestjs/common'
import { AlertasService } from './alertas.service'
import { AlertasController } from './alertas.controller'
import { AlertasAdminController } from './alertas-admin.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [AlertasService],
  controllers: [AlertasController, AlertasAdminController],
})
export class AlertasModule {}
