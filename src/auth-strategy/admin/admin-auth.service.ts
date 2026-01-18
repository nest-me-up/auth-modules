import { Inject, Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { UsernamePasswordDto } from './admin-auth.controller'
import type { AdminIdentity, IdentityProvider } from './admin.interface'
import { IDENTITY_PROVIDER } from './admin.interface'

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectPinoLogger(AdminAuthService.name)
    private readonly logger: PinoLogger,
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async authenticate(loginUserDto: UsernamePasswordDto): Promise<AdminIdentity> {
    const { username, password } = loginUserDto

    this.logger.info('authentication admin user with username and password')
    return this.identityProvider.authenticate({ username, password })
  }
}
