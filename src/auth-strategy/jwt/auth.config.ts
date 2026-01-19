export interface AuthConfig {
  excludePaths: string[]
  cookieName: string
  jwt: {
    secretKey: string
    ignoreExpiration: boolean
  }
}
