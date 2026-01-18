import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { RolesController } from './roles.controller'

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [RolesController],
  providers: [],
  exports: [],
})
export class RolesModule {}
