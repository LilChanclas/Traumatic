import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lee el header Authorization
      secretOrKey: config.get<string>('JWT_SECRET')!,
    })
  }

  async validate(payload: { sub: string; correo: string; rol: string }) {
    return {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    }
  }
}