import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ADMIN_JWT_STRATEGY } from './admin-jwt.strategy'

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard(ADMIN_JWT_STRATEGY) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
