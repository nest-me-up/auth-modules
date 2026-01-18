import {
  AuthenticationResultType,
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { ConfigService } from '@nestjs/config'
import { CognitoAccessToken, CognitoIdToken, CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { UsernamePasswordDto } from '../admin-auth.controller'
import { AdminConfig, AdminIdentity, AdminIdentityExtended, IdentityProvider } from '../admin.interface'

export interface CognitoProviderConfig extends AdminConfig {
  cognito: {
    region: string
    clientId: string
    userPoolId: string
  }
}

export class CognitoProvider implements IdentityProvider {
  private readonly config: CognitoProviderConfig
  constructor(
    readonly configService: ConfigService,
    @InjectPinoLogger(CognitoProvider.name)
    private readonly logger: PinoLogger,
  ) {
    this.config = configService.get<CognitoProviderConfig>('admin')
  }

  async getIdentity(payload: Record<string, unknown>): Promise<AdminIdentity> {
    return {
      userId: payload.sub as string,
      email: payload.email as string,
    }
  }

  async authenticate(loginUserDto: UsernamePasswordDto): Promise<AdminIdentityExtended> {
    const { username, password } = loginUserDto
    const cognito = new CognitoIdentityProviderClient({ region: this.config.cognito.region })

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
        ClientId: this.config.cognito.clientId,
      })

      const result = await cognito.send(command)

      this.logger.info(result, 'authentication result')
      if (!result.AuthenticationResult) {
        if (!result.AuthenticationResult) {
          this.logger.error('Authenticate Admin - AuthenticationResult is unexpected null')
          throw new Error('Authenticate Admin - AuthenticationResult is null')
        }
      }

      return this.getCognitoUserDtoFromAuthenticationResult(result.AuthenticationResult)
    } catch (error) {
      this.logger.error(error, 'error while authenticating user')
      throw error
    }
  }

  private getCognitoUserDtoFromAuthenticationResult(
    authenticationResult: AuthenticationResultType,
  ): AdminIdentityExtended {
    const session = this.getSession(authenticationResult)

    return {
      userId: session.getIdToken().payload.sub,
      email: session.getIdToken().payload.email,
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      metadata: session.getIdToken().payload,
    }
  }

  private getSession(cognitoDto: AuthenticationResultType): CognitoUserSession {
    return new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: cognitoDto.IdToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: cognitoDto.AccessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: cognitoDto.RefreshToken }),
    })
  }
}
