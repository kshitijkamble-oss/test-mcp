import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ApsModule } from './aps/aps.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, ApsModule],
  controllers: [HealthController],
})
export class AppModule {}
