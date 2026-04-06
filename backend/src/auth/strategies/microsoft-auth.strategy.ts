import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfidentialClientApplication } from '@azure/msal-node'

@Injectable()
export class MicrosoftAuthStrategy {
  private msalClient: ConfidentialClientApplication

  constructor(private config: ConfigService) {
    const clientId = config.get<string>('MICROSOFT_CLIENT_ID')
    const clientSecret = config.get<string>('MICROSOFT_CLIENT_SECRET')
    
    console.log('CLIENT_ID:', clientId)      
    console.log('SECRET existe:', !!clientSecret)

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: clientId!,
        clientSecret: clientSecret!,
        authority: `https://login.microsoftonline.com/common`,
      },
    })
  }

  async validate(code: string, redirectUri: string) {
    const result = await this.msalClient.acquireTokenByCode({
      code,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    })

    const claims = result.idTokenClaims as any

    return {
      email: claims.email ?? claims.preferred_username,
      nombre: claims.name?.split(' ')[0] ?? '',
      apellidos: claims.name?.split(' ').slice(1).join(' ') ?? '',
      providerId: claims.sub ?? claims.oid,
      fotoUrl: undefined,
      emailVerified: true,
    }
  }
}