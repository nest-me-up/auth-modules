import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  permissionsHeaderName,
  projectIdHeaderName,
  projectIdsHeaderName,
  tenantIdHeaderName,
  userIdHeaderName,
} from '../../http-client'
import { getLoggerMock } from '../../logger'
import { PermissionsConfig } from './permissions-decorator-options'
import { PermissionsGuard } from './permissions.guard'

describe('RoleGuard', () => {
  let guard: PermissionsGuard

  beforeEach(() => {
    guard = new PermissionsGuard(new Reflector(), getLoggerMock())
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
  it.skip('should return false without auth', async () => {
    const context = {
      getHandler: jest.fn().mockReturnValue(null),
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

  describe('new permission header tests', () => {
    it('requires projectID but missing', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["d","c"]},{"projectId": "1", "permissions":["a","c"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsConfig = {
        permissions: ['a', 'b'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
    it('missing headers', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["d","c"]},{"projectId": "1", "permissions":["a","c"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsConfig = {
        permissions: ['a', 'b'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })

    it('project1 includes permission', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '3a2c9f35-5993-4ccb-ac02-a74cedba26e2',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId":"GLOBAL","permissions":["self.read","tenant-structure.read"]},{"projectId":"3a2c9f35-5993-4ccb-ac02-a74cedba26e2","permissions":["report.read","report.write","report.execute","dbt.read","dbt.write","dbt.execute","users.read","self.read","tenant-structure.read","version.read","version.write","pipeline.read","pipeline.write","pipeline.execute","project_accounting.read","audit.read","project_accounting.write"]},{"projectId":"75e3fb37-0eaa-46a7-9065-005eeb4561b3","permissions":[]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsConfig = {
        permissions: ['users.read', 'accounting.read'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })

    it('project includes permission - with projectId', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '1',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["d","c"]},{"projectId": "1", "permissions":["a","c"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      const perms: PermissionsConfig = {
        permissions: ['a', 'b'],
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([perms])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })
    it('project includes permission - with projectId and global permissions', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '1',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["a","b"]},{"projectId": "1", "permissions":["d","c"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['d', 'c'] }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })
    it('project includes permission - with projectId and global permissions - self', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId":"GLOBAL","permissions":["report.read","report.write","report.execute","dbt.read","dbt.write","dbt.execute","users.read","self.read","tenant-structure.read","version.read","version.write","pipeline.read","pipeline.write","pipeline.execute","project_accounting.read"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest
        .spyOn(guard, 'getPermissionsDecorator')
        .mockReturnValue([{ permissions: ['project_accounting.read'], notProjectSpecific: true }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })
    it('project includes permission - without projectId', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["a","b"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest
        .spyOn(guard, 'getPermissionsDecorator')
        .mockReturnValue([{ permissions: ['a', 'b'], notProjectSpecific: true }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })
    it('project doesnt include permission - without projectId', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["c","d"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a', 'b'] }])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
    it('project doesnt include permission - with projectId using global', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '1',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["c","d"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a', 'b'] }])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
    it('project doesnt include permission - with projectId using project', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '1',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]: '[{"projectId": "1", "permissions":["c","d"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a', 'b'] }])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
    it('project doesnt include permission - with projectId with project and global', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdHeaderName]: '1',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["a","b"]},{"projectId": "1", "permissions":["d","c"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['e', 'f'] }])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('projectIds array tests', () => {
    it('should pass when all projectIds have required permissions', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdsHeaderName]: '1,2,3',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "1", "permissions":["a","b"]}, {"projectId": "2", "permissions":["a","b"]}, {"projectId": "3", "permissions":["a","b"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'] }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })

    it('should fail if any projectId is missing required permissions', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdsHeaderName]: '1,2,3',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "1", "permissions":["a","b"]}, {"projectId": "2", "permissions":["c","d"]}, {"projectId": "3", "permissions":["a","b"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'] }])
      await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
    })

    it('should pass when global permissions cover all projectIds', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdsHeaderName]: '1,2,3',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["a","b"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'] }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })

    it('should pass with mix of global and project-specific permissions', async () => {
      const httpContext = {
        getRequest: () => {
          return {
            headers: {
              [tenantIdHeaderName]: 'tenant',
              [projectIdsHeaderName]: '1,2,3',
              [userIdHeaderName]: 'user',
              [permissionsHeaderName]:
                '[{"projectId": "GLOBAL", "permissions":["a","b"]}, {"projectId": "2", "permissions":["c","d"]}]',
            },
            body: {},
          }
        },
      }
      const context = {
        switchToHttp: () => httpContext,
      }
      jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'] }])
      const result = await guard.canActivate(context as unknown as ExecutionContext)
      expect(result).toBeTruthy()
    })
  })

  it('should fail when both projectIds and projectId are undefined', async () => {
    const httpContext = {
      getRequest: () => {
        return {
          headers: {
            [tenantIdHeaderName]: 'tenant',
            [userIdHeaderName]: 'user',
            [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["a","b"]}]',
          },
          body: {},
        }
      },
    }
    const context = {
      switchToHttp: () => httpContext,
    }
    jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'], notProjectSpecific: false }])
    await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
  })

  it('should fail when projectIds is an empty array', async () => {
    const httpContext = {
      getRequest: () => {
        return {
          headers: {
            [tenantIdHeaderName]: 'tenant',
            [userIdHeaderName]: 'user',
            [projectIdsHeaderName]: '',
            [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["a","b"]}]',
          },
          body: {},
        }
      },
    }
    const context = {
      switchToHttp: () => httpContext,
    }
    jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'], notProjectSpecific: false }])
    await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
  })

  it('should fail when projectId is empty string', async () => {
    const httpContext = {
      getRequest: () => {
        return {
          headers: {
            [tenantIdHeaderName]: 'tenant',
            [userIdHeaderName]: 'user',
            [projectIdHeaderName]: '',
            [permissionsHeaderName]: '[{"projectId": "GLOBAL", "permissions":["a","b"]}]',
          },
          body: {},
        }
      },
    }
    const context = {
      switchToHttp: () => httpContext,
    }
    jest.spyOn(guard, 'getPermissionsDecorator').mockReturnValue([{ permissions: ['a'], notProjectSpecific: false }])
    await expect(guard.canActivate(context as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
  })
})
