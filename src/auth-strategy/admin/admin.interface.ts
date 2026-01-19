export const IDENTITY_PROVIDER = 'IDENTITY_PROVIDER'

export interface AdminConfig {
  clientId: string
  issuer: string
  jwksUri: string
}

export interface AdminIdentity {
  userId: string
  email: string
}

export interface AdminIdentityExtended extends AdminIdentity {
  accessToken: string
  refreshToken: string
  metadata: Record<string, unknown>
}

export interface UsernamePassword {
  username: string
  password: string
}

export interface IdentityProvider {
  authenticate(loginUserDto: UsernamePassword): Promise<AdminIdentity>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIdentity(payload: Record<string, any>): Promise<AdminIdentity>
}
