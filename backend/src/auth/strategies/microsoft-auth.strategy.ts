import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfidentialClientApplication } from '@azure/msal-node'

@Injectable()
export class MicrosoftAuthStrategy {

  constructor(private config: ConfigService) {}

  async validate(code: string, redirectUri: string) {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID')
    const clientSecret = this.config.get<string>('MICROSOFT_CLIENT_SECRET')

    //Intercambiar code por tokens
    const tokenRes = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'openid profile email',
        }),
      },
    )

    const tokens = await tokenRes.json()

    if (tokens.error) {
      throw new UnauthorizedException(tokens.error_description)
    }

    //Decodificar el id_token (es un JWT, no necesita verificación extra aquí)
    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString(),
    )

    return {
      email: payload.email ?? payload.preferred_username,
      nombre: payload.name?.split(' ')[0] ?? '',
      apellidos: payload.name?.split(' ').slice(1).join(' ') ?? '',
      providerId: payload.sub ?? payload.oid,
      fotoUrl: undefined as string | undefined,
      emailVerified: true,
    }
  }

}