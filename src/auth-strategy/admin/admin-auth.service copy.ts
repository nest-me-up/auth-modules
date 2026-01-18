import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoginUserDto } from './dto/admin-login.dto'
import {
  AuthenticationResultType,
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { CognitoAccessToken, CognitoIdToken, CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { AdminLoginResultDto } from './dto/admin-login-result.dto'

@Injectable()
export class AdminAuthService {
  private readonly clientId: string
  private readonly userPoolId: string
  private readonly region: string

  constructor(
    @InjectPinoLogger(AdminAuthService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.clientId = configService.get('admin').cognito.client_id
    this.userPoolId = configService.get('admin').cognito.user_pool_id
    this.region = this.configService.get('cognito').region
  }

  async authenticate(loginUserDto: LoginUserDto): Promise<AdminLoginResultDto> {
    const { email, password } = loginUserDto

    this.logger.info('authentication admin user with cognito')

    const cognito = new CognitoIdentityProviderClient({ region: this.region })

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
        ClientId: this.clientId,
      })

      const result = await cognito.send(command)

      this.logger.info(result, 'authentication result')
      if (!result.AuthenticationResult) {
        if (!result.AuthenticationResult) {
          throw new Error('Authenticate Admin - AuthenticationResult is null')
        }
      }

      return AdminAuthService.getCognitoUserDtoFromAuthenticationResult(result.AuthenticationResult)
    } catch (error) {
      this.logger.error(error, 'error while authenticating user')
      throw error
    }
  }

  private static getCognitoUserDtoFromAuthenticationResult(
    authenticationResult: AuthenticationResultType,
  ): AdminLoginResultDto {
    const session = AdminAuthService.getSession({
      accessToken: authenticationResult.AccessToken,
      idToken: authenticationResult.IdToken,
      refreshToken: authenticationResult.RefreshToken,
    } as AdminLoginResultDto)

    return {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      payload: session.getIdToken().payload,
    } as AdminLoginResultDto
  }
  private static getSession(cognitoDto: AdminLoginResultDto): CognitoUserSession {
    return new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: cognitoDto.idToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: cognitoDto.accessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: cognitoDto.refreshToken }),
    })
  }
}
