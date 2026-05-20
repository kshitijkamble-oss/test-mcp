import { Module } from '@nestjs/common';
import { ApsController } from './aps.controller';
import { ApsService } from './aps.service';

@Module({
  controllers: [ApsController],
  providers: [ApsService],
})
export class ApsModule {}
