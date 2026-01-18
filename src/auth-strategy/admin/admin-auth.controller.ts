import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { IsString } from 'class-validator'
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
  password: string
}
