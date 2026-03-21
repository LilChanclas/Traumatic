import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosRepository } from './usuarios.repository';
import { UsuariosController } from './usuarios.controller';

@Module({
    providers: [UsuariosService, UsuariosRepository],
    controllers: [UsuariosController],
    exports: [UsuariosService],
})
export class UsuariosModule {}
