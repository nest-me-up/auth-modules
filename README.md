# @nest-me-up/auth-modules

A library for NestJS authorization and authentication components, designed for both Web and Microservices. This repository provides modular strategies, guards, and decorators to handle common authentication and authorization patterns.

## Goal

The goal of this repository is to provide a set of reusable, plug-and-play NestJS modules that simplify the implementation of:

- **JWT Authentication**: Flexible JWT-based authentication supporting both cookie and header extraction.
- **Permission-based Authorization**: A robust way to control access to API endpoints based on user permissions passed through request headers.
- **Admin Authentication**: A specialized module for administrative user authentication, supporting external identity providers like AWS Cognito.

---

## Modules

### 1. JWT Module

The JWT module provides the foundation for standard user authentication.

- **`JwtStrategy`**: A Passport strategy that can extract JWT tokens from:
  - Cookies (using a configurable `cookieName`).
  - `Authorization: Bearer <token>` header.
- **`JwtAuthGuard`**: A guard that protects routes using the JWT strategy. It includes a built-in mechanism to exclude specific paths from authentication via `AuthConfig.excludePaths`.
- **Configuration (`AuthConfig`)**:
  - `excludePaths`: List of paths to skip authentication.
  - `cookieName`: Name of the cookie containing the JWT.
  - `jwt.secretKey`: Secret key for JWT verification (can also be set via `JWT_SECRET_KEY` system environment variable).
  - `jwt.ignoreExpiration`: Whether to ignore token expiration.

### 2. Permissions Module

The Permissions module enables fine-grained access control based on specific permission strings.

- **`PermissionsGuard`**: Checks if the incoming request contains the required permissions. It expects permissions to be provided in a specific request header (defaulting to `x-permissions`).
- **`UsePermissions` Decorator**: A custom decorator used on controllers or handlers to specify which permissions are required to access them.
- **`PermissionsUtil`**: Provides utility methods, such as `isProjectAdmin`, to check if a user has administrative permissions within the project.
- **Configuration (`PermissionsConfig`)**:
  - `header`: The name of the header containing the comma-separated permissions list.
  - `adminPermissions`: A list of permission strings that are considered "admin" level.

### 3. Admin Module

The Admin module is dedicated to managing administrative user authentication, often against an external identity provider.
Usually used to protect system admin APIs

- **`AdminAuthModule`**: A dynamic module that should be initialized using `forRoot()`. It requires an implementation of an `IdentityProvider`.
- **`AdminAuthService`**: Handles the logic for authenticating admin users by delegating to the provided `IdentityProvider`.
- **`AdminJwtStrategy`**: A specialized JWT strategy for admins that uses JWKS (JSON Web Key Sets) for token verification, typically used with OIDC providers.
- **`AdminJwtAuthGuard`**: The guard used to protect admin-only routes.
- **`AdminAuthController`**: Provides a standard `/admin/authenticate` endpoint for admin login.
  Providers:
- **`CognitoProvider`**: A built-in implementation of `IdentityProvider` that integrates with AWS Cognito for administrative user authentication.

---

## Configuration

The modules rely on NestJS `ConfigService`. Below is a comprehensive example of the expected configuration structure, typically defined in your configuration YAML files.

### Configuration Example

```yaml
auth:
  # JWT Module Settings
  excludePaths:
    - /system
    - /public
  cookieName: auth_token
  jwt:
    secretKey: <SECRET>
    ignoreExpiration: false
  # Permissions Module Settings
  permissions:
    header: x-permissions
    adminPermissions:
      - system_admin
      - super_user

admin:
  # Admin Module Settings (e.g., for AWS Cognito)
  clientId: ${ADMIN_CLIENT_ID}
  issuer: https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}
  jwksUri: https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json
  cognito:
    region: ${AWS_REGION}
    clientId: ${ADMIN_CLIENT_ID}
    userPoolId: ${COGNITO_USER_POOL_ID}
```

---

## Getting Started

1. Install the package:
   ```bash
   npm install @nest-me-up/auth-modules
   ```
2. Configure your NestJS application to use the desired strategies and guards.
3. For Admin authentication, ensure you provide the correct configuration for your identity provider (e.g., AWS Cognito).
