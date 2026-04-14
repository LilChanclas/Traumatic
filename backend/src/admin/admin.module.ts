import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { UsuariosModule } from '../usuarios/usuarios.module'

@Module({
  imports: [UsuariosModule],
  controllers: [AdminController],
})
export class AdminModule {}
