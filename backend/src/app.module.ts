import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AdminModule } from './admin/admin.module';
import { DocumentosModule } from './documentos/documentos.module';
import { TiposTramiteModule } from './tipos-tramite/tipos-tramite.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    AdminModule,
    DocumentosModule,
    TiposTramiteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
