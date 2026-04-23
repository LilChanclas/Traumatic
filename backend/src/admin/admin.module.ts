import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { UsuariosModule } from '../usuarios/usuarios.module'
import { AdministrativoModule } from '../administrativo/administrativo.module'

@Module({
  imports: [UsuariosModule, AdministrativoModule],
  controllers: [AdminController],
})
export class AdminModule {}
