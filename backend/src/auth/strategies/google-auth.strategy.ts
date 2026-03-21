import { Injectable, UnauthorizedException } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleAuthStrategy {
  private client: OAuth2Client

  constructor(private config: ConfigService) {
    this.client = new OAuth2Client(
      this.config.getOrThrow('GOOGLE_CLIENT_ID'),
    )
  }

  async validate(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.config.getOrThrow('GOOGLE_CLIENT_ID'),
    })

    const payload = ticket.getPayload()

    if (!payload?.email) {
      throw new UnauthorizedException('Token inválido')
    }

    return {
      email: payload.email,
      nombre: payload.given_name || payload.name,
      apellidos: payload.family_name || '',
      providerId: payload.sub,
      fotoUrl: payload.picture,
      emailVerified: payload.email_verified,
    }
  }
}