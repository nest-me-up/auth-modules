import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { UsePermissions } from '../permissions.decorator'
import { PermissionsGuard } from '../permissions.guard'
@Controller('az')
@UseGuards(PermissionsGuard)
export class RolesTestController {
  @UsePermissions({
    permissions: ['one'],
  })
  @Get('test_one')
  async testOnePermissions(@Req() req: Request, @Res() res: Response<boolean>) {
    return res.send(true)
  }

  @UsePermissions({
    permissions: ['one', 'two'],
  })
  @Get('test_two')
  async testTwoPermissions(@Req() req: Request, @Res() res: Response<boolean>) {
    return res.send(true)
  }

  @UsePermissions({
    permissions: [],
  })
  @Get('test_none')
  async testNonePermissions(@Req() req: Request, @Res() res: Response<boolean>) {
    return res.send(true)
  }
}
