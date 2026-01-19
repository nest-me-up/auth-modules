/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLoggerMock } from '@nest-me-up/common'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { PermissionsDecoratorOptions } from './permissions-decorator-options'
import { Config } from './permissions.config'
import { PermissionsGuard } from './permissions.guard'

const permissionsHeaderName = 'x-permissions'
describe('RoleGuard', () => {
  let guard: PermissionsGuard
  let configService: ConfigService
  const authConfig: Config = {
    excludePaths: [],
    cookieName: '',
    jwt: {
      secretKey: '',
      ignoreExpiration: false,
    },
    permissions: {
      header: permissionsHeaderName,
      adminPermissions: [],
    } as any,
  }

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue(authConfig),
    } as unknown as ConfigService
    guard = new PermissionsGuard(new Reflector(), getLoggerMock(), configService)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
  it('should return true without auth guard', async () => {
    const context = {
      getHandler: jest.fn().mockReturnValue(() => {}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          headers: {
            Accept: 'application/json',
            Authorization: 'Basic',
            'Content-Type': 'application/json',
            Cookie:
              'accessToken=eyJraWQiOiJoNnhCSzc5RXh4MUJiRWV2UVNVOF8xQ2c1bE1YS3VjWXZxXy1Zd29LNUxRIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkttY1VYS2tucHl0Q09FZm5vN2pQZzVZaW1QaUNqM2kyOHBqcV95bnc2RUEub2FyMmFicXJnVnRsSVZkVVU1ZDYiLCJpc3MiOiJodHRwczovL2Rldi01NTk5MzA1Ny5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE2MjM2NTY5MDYsImV4cCI6MTYyMzY2MDUwNiwiY2lkIjoiMG9hdTcwbGp0MmVZU05uQkU1ZDYiLCJ1aWQiOiIwMHV3Z3c1NmNiRVFTWlF2QzVkNiIsInNjcCI6WyJvZmZsaW5lX2FjY2VzcyIsInByb2ZpbGUiLCJvcGVuaWQiXSwibW9udGFyYVBlcm1pc3Npb25zIjoic2VsZi5tZXRyaWMudmlldyxzZWxmLnNwb3RsaWdodC52aWV3Iiwic3ViIjoic2FuamFoYXV6QGdtYWlsLmNvbSIsIm1vbnRhcmFQZXJtaXNzaW9uTGlzdCI6InNlbGYubWV0cmljLnZpZXcsc2VsZi5zcG90bGlnaHQudmlldyxlbXBsb3llZS1iYXNpYy52aWV3LHNlbGYuZm9jdXMuZWRpdCxzZWxmLnNwb3RsaWdodC5lZGl0LHNlbGYuZm9jdXMuZWRpdCxzZWxmLmhpZ2hsaWdodC52aWV3In0.UqOe03UIsg8YVT53q2yt4j2Hk4Yi8dYSwOqQb6FEM9eR5PDodU7Rs5mImFy5AK4oFcmAevXIDaGGQ2AzQ7-fgrA5flLHnG8EVRcdjx9WIVOS77EyTKc7bI-Sn-8avDLmBzSI30ghQOeOiNZYfB4mmFwVi3kA9tcTEjaXQnl_r29q73EF5rN44UWUSYyDjP6na-hLE71P2OyfZcl925llFyU3IgFYVo6dLyRGC0rFJm4BXeN04PJXUIKiFw9lbZvt-c-5RLf_bTJLwZQCnn2xb1BwySXKevhi0Mcckyj-0HCrnWY-UJ46oOJ21GIF88efTXSUzPHGEbm888iwqmTF1w',
          },
          body: JSON.stringify({
            ref_type: 'employee',
            ref_id: '43r3r3r3r3',
          }),
        }),
      }),
    }
    const httpArgsHost = {
      getRequest: () => context,
    }
    context.switchToHttp.mockImplementation(() => httpArgsHost)
    const result = await guard.canActivate(context as any as ExecutionContext)
    expect(result).toBeTruthy()
    expect(context.switchToHttp).toHaveBeenCalledTimes(1)
  })

  describe('permission header tests', () => {
    it('missing headers', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [permissionsHeaderName]: 'd,c',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsDecoratorOptions = {
        permissions: ['a', 'b'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })

    it('includes permission', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [permissionsHeaderName]: 'users.read, tenant-structure.read',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsDecoratorOptions = {
        permissions: ['users.read', 'accounting.read'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })

    it('does not include permission', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [permissionsHeaderName]: 'users.read, tenant-structure.read',
            },
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsDecoratorOptions = {
        permissions: ['self.read', 'accounting.read'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
  })
})
