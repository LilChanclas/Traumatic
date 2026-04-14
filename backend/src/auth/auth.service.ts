import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
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
  ) {}

  async login(dto: OauthLoginDto) {
    const googleUser = await this.googleStrategy.validate(dto.idToken)

    if (!googleUser.emailVerified) {
      throw new UnauthorizedException('Correo no verificado')
    }

    const user = await this.usuariosService.findByCorreo(googleUser.email)

    if (!user) {
      // Usuario nuevo — devolver pre-auth token para selección de rol
      const preAuthToken = await this.jwtService.signAsync(
        {
          type: 'pre-auth',
          nombre: googleUser.nombre,
          apellidos: googleUser.apellidos,
          correo: googleUser.email,
          provider: 'GOOGLE',
          providerId: googleUser.providerId,
          fotoUrl: googleUser.fotoUrl ?? null,
        },
        { expiresIn: '10m' },
      )

      return {
        needsRoleSelection: true,
        preAuthToken,
        tempUser: {
          nombre: googleUser.nombre,
          correo: googleUser.email,
          fotoUrl: googleUser.fotoUrl,
        },
      }
    }

    // Actualizar datos del proveedor
    await this.usuariosService.updateProviderData(
      user.id,
      googleUser.providerId,
      googleUser.fotoUrl,
    )

    return this.buildAuthResponse({ ...user, fotoUrl: googleUser.fotoUrl })
  }

  async loginWithMicrosoft(code: string, redirectUri: string) {
    const msUser = await this.microsoftStrategy.validate(code, redirectUri)

    const user = await this.usuariosService.findByCorreo(msUser.email)

    if (!user) {
      const preAuthToken = await this.jwtService.signAsync(
        {
          type: 'pre-auth',
          nombre: msUser.nombre,
          apellidos: msUser.apellidos,
          correo: msUser.email,
          provider: 'MICROSOFT',
          providerId: msUser.providerId,
          fotoUrl: msUser.fotoUrl ?? null,
        },
        { expiresIn: '10m' },
      )

      return {
        needsRoleSelection: true,
        preAuthToken,
        tempUser: {
          nombre: msUser.nombre,
          correo: msUser.email,
          fotoUrl: msUser.fotoUrl,
        },
      }
    }

    await this.usuariosService.updateProviderData(
      user.id,
      msUser.providerId,
      msUser.fotoUrl,
    )

    return this.buildAuthResponse({ ...user, fotoUrl: msUser.fotoUrl })
  }

  async completeRegistration(preAuthToken: string, rol: 'ALUMNO' | 'ADMINISTRATIVO') {
    // Validar pre-auth token
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(preAuthToken)
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }

    if (payload.type !== 'pre-auth') {
      throw new UnauthorizedException('Token inválido')
    }

    // Protección contra condición de carrera: si ya existe, simplemente loguear
    const existing = await this.usuariosService.findByCorreo(payload.correo)
    if (existing) {
      return this.buildAuthResponse(existing)
    }

    const esAdministrativo = rol === 'ADMINISTRATIVO'

    const newUser = await this.usuariosService.createWithRole({
      nombre: payload.nombre,
      apellidos: payload.apellidos,
      correo: payload.correo,
      provider: payload.provider,
      providerId: payload.providerId,
      fotoUrl: payload.fotoUrl,
      rol,
      activo: !esAdministrativo,
      pendienteAprobacion: esAdministrativo,
    })

    if (esAdministrativo) {
      return { status: 'pending_approval' }
    }

    return this.buildAuthResponse(newUser)
  }

  private async buildAuthResponse(user: any) {
    if (!user.activo) {
      if (user.pendienteAprobacion) {
        return { status: 'pending_approval' }
      }
      throw new ForbiddenException('Tu cuenta ha sido desactivada')
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
        fotoUrl: user.fotoUrl ?? null,
      },
    }
  }
}
