import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthConfig } from './auth.config'

export interface JwtPayload {
  id: string
  tenantId: string
  payloadVersion: string //used to check if the payload is compatible with the current version of the strategy
}

@Injectable()
export class JwtStrategy<T extends JwtPayload> extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const authConfig = configService.get<AuthConfig>('auth')
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => JwtStrategy.cookieExtractor(req, authConfig),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: authConfig?.jwt?.ignoreExpiration || false,
      secretOrKey: authConfig?.jwt?.secretKey || process.env.JWT_SECRET_KEY,
    })
  }

  //payload is the decoded jwt claims.
  async validate(payload: T): Promise<T> {
    return {
      ...payload,
      payloadVersion: payload.payloadVersion || '1.0.0',
    }
  }

  //extracts the token from the cookies, if found sets it as authorization header
  static cookieExtractor(req: Request, config?: AuthConfig): string | null {
    let token = null
    if (req && req.cookies && config?.cookieName) {
      token = req.cookies[config.cookieName]
      if (token) {
        req.headers['authorization'] = `Bearer ${token}`
      }
    }
    return token
  }
}
