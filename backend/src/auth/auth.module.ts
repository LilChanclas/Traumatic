import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleAuthStrategy } from './strategies/google-auth.strategy'
import { UsuariosModule } from '../usuarios/usuarios.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { MicrosoftAuthStrategy } from './strategies/microsoft-auth.strategy'

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsuariosModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthStrategy, MicrosoftAuthStrategy, JwtStrategy],
})
export class AuthModule {}