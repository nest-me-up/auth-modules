import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { AdminConfig, IdentityProvider } from './admin.interface'
import { IDENTITY_PROVIDER } from './admin.interface'

export const ADMIN_JWT_STRATEGY = 'admin-jwt'

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, ADMIN_JWT_STRATEGY) {
  constructor(
    configService: ConfigService,
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {
    const adminConfig = configService.get<AdminConfig>('admin')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      _audience: adminConfig.clientId,
      issuer: adminConfig.issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: adminConfig.jwksUri,
      }),
    })
  }

  async validate(payload: unknown) {
    return this.identityProvider.getIdentity(payload)
  }
}
