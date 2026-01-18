import { Config } from './permissions.config'

export class PermissionsUtil {
  static isProjectAdmin({ userPermissions, config }: { userPermissions: string[]; config: Config }) {
    return userPermissions.some((permission) => config.permissions?.adminPermissions?.includes(permission))
  }
}
