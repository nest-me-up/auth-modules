import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { PermissionsDecoratorOptions } from './permissions-decorator-options'
import { Config, PermissionsConfig } from './permissions.config'
import { PERMISSIONS_OPTIONS_KEY } from './permissions.decorator'

// export const NO_PERMISSION_FOUND = 'No permission found'
// const MISSING_HEADERS_HEADER = 'Missing mandatory headers in request, failing the request'

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly permissionsConfig: PermissionsConfig
  constructor(
    readonly reflector: Reflector,
    @InjectPinoLogger(PermissionsGuard.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<Config>('permissions.decoratorOptions')
    this.permissionsConfig = config.permissions
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest()
  }

  getPermissionsDecorator(context: ExecutionContext): PermissionsDecoratorOptions[] {
    return this.reflector.get<PermissionsDecoratorOptions[]>(PERMISSIONS_OPTIONS_KEY, context.getHandler())
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context)

    const permissionsDecorators = this.getPermissionsDecorator(context)
    if (!permissionsDecorators?.length) {
      return true
    }

    const apiPermissions: string[] = permissionsDecorators.flatMap((option) => option.permissions)

    // get all headers and validate
    const headerPermissions = req.headers[this.permissionsConfig.header]

    if (!headerPermissions) {
      this.logger.error(
        'Permissions Guard - missing permissions header - %s, url: %s',
        this.permissionsConfig.header,
        req?.url,
      )
      throw new ForbiddenException('missing permissions header')
    }

    const userPermissions: string[] = this.parsePermissionsHeader(headerPermissions)

    const hasPermission = userPermissions.some((userPermission) => apiPermissions.includes(userPermission))

    if (!hasPermission) {
      this.logger.warn(
        'user permission: [%s] does not include any of the api permissions: [%s]. url: %s',
        userPermissions,
        apiPermissions,
        req?.url,
      )
      throw new ForbiddenException('user does not have the required permissions')
    }

    return true
  }

  private parsePermissionsHeader(headerPermissions: string): string[] {
    return headerPermissions.split(',').map((permission) => permission.trim())
  }
}
