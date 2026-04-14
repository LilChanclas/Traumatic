import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { OauthLoginDto } from './dto/oauth-login.dto'
import { CompleteRegistrationDto } from './dto/complete-registration.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('oauth')
  login(@Body() dto: OauthLoginDto) {
    return this.authService.login(dto)
  }

  @Post('microsoft')
  microsoftLogin(@Body() body: { code: string; redirectUri: string }) {
    return this.authService.loginWithMicrosoft(body.code, body.redirectUri)
  }

  @Post('complete-registration')
  completeRegistration(@Body() dto: CompleteRegistrationDto) {
    return this.authService.completeRegistration(dto.preAuthToken, dto.rol)
  }
}
