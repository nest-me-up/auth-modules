import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { RolesTestController } from './roles-test.controller'

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [RolesTestController],
  providers: [],
  exports: [],
})
export class RolesTestModule {}
