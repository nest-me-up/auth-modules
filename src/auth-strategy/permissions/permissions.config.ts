import { AuthConfig } from '../jwt/auth.config'

export interface PermissionsConfig extends AuthConfig {
  adminPermissions: string[]
  header: string
}

export interface Config extends AuthConfig {
  permissions: PermissionsConfig
}
