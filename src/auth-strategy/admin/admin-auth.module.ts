import { DynamicModule, Module, Provider } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AdminAuthController } from './admin-auth.controller'
import { AdminAuthService } from './admin-auth.service'
import { ADMIN_JWT_STRATEGY, AdminJwtStrategy } from './admin-jwt.strategy'
import { IDENTITY_PROVIDER } from './admin.interface'

/**
 * AdminAuthModule handles authentication for admin users.
 *
 * To initialize the module, use the `forRoot` static method and provide an implementation of `IdentityProvider`.
 *
 * @example
 * ```typescript
 * // 1. Provide a class implementation
 * AdminAuthModule.forRoot(MyCustomIdentityProvider)
 *
 * // 2. Provide a full provider object
 * AdminAuthModule.forRoot({
 *   useClass: MyCustomIdentityProvider
 * })
 *
 * // 3. Provide a value or factory
 * AdminAuthModule.forRoot({
 *   provide: IDENTITY_PROVIDER,
 *   useValue: new MyCustomIdentityProvider()
 * })
 * ```
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: ADMIN_JWT_STRATEGY })],
  controllers: [AdminAuthController],
  providers: [AdminJwtStrategy, AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {
  static forRoot(identityProvider: Provider): DynamicModule {
    const isFullProvider =
      typeof identityProvider === 'object' &&
      ('useClass' in identityProvider || 'useValue' in identityProvider || 'useFactory' in identityProvider)

    return {
      module: AdminAuthModule,
      providers: [
        isFullProvider
          ? {
              provide: IDENTITY_PROVIDER,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(identityProvider as any),
            }
          : {
              provide: IDENTITY_PROVIDER,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              useClass: identityProvider as any,
            },
      ],
      exports: [IDENTITY_PROVIDER, AdminAuthService],
    }
  }
}
