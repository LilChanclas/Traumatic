import { ForbiddenException, Injectable, UnauthorizedException,} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsuariosService } from '../usuarios/usuarios.service'
import { GoogleAuthStrategy } from './strategies/google-auth.strategy'
import { OauthLoginDto } from './dto/oauth-login.dto'
import { MicrosoftAuthStrategy } from './strategies/microsoft-auth.strategy'

@Injectable()
export class AuthService {
  constructor(
    private googleStrategy: GoogleAuthStrategy,
    private microsoftStrategy: MicrosoftAuthStrategy,
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: OauthLoginDto) {
    const googleUser = await this.googleStrategy.validate(dto.idToken)

    if (!googleUser.emailVerified) {
      throw new UnauthorizedException('Correo no verificado')
    }

    // Esto lo podemos agregar para solo dejar entrar cuentas UAS
    // const domain = googleUser.email.split('@')[1]

    // if (domain !== this.config.get('ALLOWED_EMAIL_DOMAIN')) {
    //   throw new ForbiddenException('Dominio no permitido')
    // }

    let user = await this.usuariosService.findByCorreo(googleUser.email)

    if (!user) {
      user = await this.usuariosService.create({
        nombre: googleUser.nombre,
        apellidos: googleUser.apellidos,
        correo: googleUser.email,
        provider: 'GOOGLE',
        providerId: googleUser.providerId,
        fotoUrl: googleUser.fotoUrl,
      })
    } else {
      user = await this.usuariosService.updateProviderData(
        user.id,
        googleUser.providerId,
        googleUser.fotoUrl,
      )
    }

    const token = await this.jwtService.signAsync({
      sub: user.id.toString(),
      correo: user.correo,
      rol: user.rol,
    })

    return {
      accessToken: token,
      usuario: {
        id: user.id.toString(),   // BigInt → string
        nombre: user.nombre,
        apellidos: user.apellidos,
        correo: user.correo,
        rol: user.rol,
        fotoUrl: user.fotoUrl,
      }
    }
  }

  async loginWithMicrosoft(code: string, redirectUri: string) {
    const msUser = await this.microsoftStrategy.validate(code, redirectUri)

    let user = await this.usuariosService.findByCorreo(msUser.email)

    if (!user) {
      user = await this.usuariosService.create({
        nombre: msUser.nombre,
        apellidos: msUser.apellidos,
        correo: msUser.email,
        provider: 'MICROSOFT',
        providerId: msUser.providerId,
        fotoUrl: msUser.fotoUrl,
      })
    } else {
      user = await this.usuariosService.updateProviderData(
        user.id,
        msUser.providerId,
        msUser.fotoUrl,
      )
    }

    const token = await this.jwtService.signAsync({
      sub: user.id.toString(),
      correo: user.correo,
      rol: user.rol,
    })

    return {
      accessToken: token,
      usuario: {
        id: user.id.toString(),
        nombre: user.nombre,
        apellidos: user.apellidos,
        correo: user.correo,
        rol: user.rol,
        fotoUrl: user.fotoUrl,
      },
  }
}
}