import { IsJSON, IsString, IsOptional } from 'class-validator'

export class AdminLoginResultDto {
  @IsString()
  accessToken: string
  @IsString()
  refreshToken: string
  @IsJSON()
  payload: any
  @IsString()
  @IsOptional()
  idToken?: string
}
