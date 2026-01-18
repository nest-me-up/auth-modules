import { UsePermissions } from '../permissions.decorator'
import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common'
import { PermissionsGuard } from '../permissions.guard'

@Controller('az')
@UseGuards(PermissionsGuard)
export class RolesController {
  @UsePermissions({
    permissions: ['one'],
  })
  @Get('test_one')
  async testOnePermissions(@Request() req, @Response() res) {
    return res.send(true)
  }

  @UsePermissions({
    permissions: ['one', 'two'],
  })
  @Get('test_two')
  async testTwoPermissions(@Request() req, @Response() res) {
    return res.send(true)
  }

  @UsePermissions({
    permissions: [],
  })
  @Get('test_none')
  async testNonePermissions(@Request() req, @Response() res) {
    return res.send(true)
  }

  @UsePermissions({
    permissions: ['three'],
    notProjectSpecific: true,
  })
  @Get('test_global')
  async testGlobalPermissions(@Request() req, @Response() res) {
    return res.send(true)
  }
}
