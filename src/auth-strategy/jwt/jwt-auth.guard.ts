import { ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { AuthConfig } from './auth.config'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly authConfig: AuthConfig
  constructor(private readonly configService: ConfigService) {
    super()
    this.authConfig = this.configService.get<AuthConfig>('auth.excludePaths')
  }
  canActivate(context: ExecutionContext) {
    const requestUrl = context.switchToHttp().getRequest<Request>().url
    for (const excludePath of this.authConfig.excludePaths) {
      if (requestUrl.startsWith(excludePath)) {
        return true
      }
    }
    return super.canActivate(context)
  }
}
