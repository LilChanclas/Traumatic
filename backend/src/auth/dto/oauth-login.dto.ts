import { IsString } from 'class-validator'

export class OauthLoginDto {
  @IsString()
  idToken: string
}