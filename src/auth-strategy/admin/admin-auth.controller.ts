import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { IsString, Matches } from 'class-validator'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { AdminAuthService } from './admin-auth.service'
import { AdminIdentity } from './admin.interface'

@Controller('admin')
export class AdminAuthController {
  constructor(
    @InjectPinoLogger(AdminAuthController.name)
    private readonly logger: PinoLogger,
    private readonly adminService: AdminAuthService,
  ) {}

  @Post('/authenticate')
  @UsePipes(ValidationPipe)
  async authenticate(@Body() usernamePasswordDto: UsernamePasswordDto): Promise<AdminIdentity> {
    return await this.adminService.authenticate(usernamePasswordDto)
  }
}

export class UsernamePasswordDto {
  @IsString()
  username: string

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/, {
    message:
      'password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string
}
