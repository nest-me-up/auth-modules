import { SetMetadata } from '@nestjs/common'
import { PermissionsDecoratorOptions } from './permissions-decorator-options'

export const PERMISSIONS_OPTIONS_KEY = 'permissionOptions'
export const UsePermissions = (...permissionOptions: PermissionsDecoratorOptions[]) =>
  SetMetadata(PERMISSIONS_OPTIONS_KEY, permissionOptions)
