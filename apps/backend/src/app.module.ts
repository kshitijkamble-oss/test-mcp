import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ApsModule } from './aps/aps.module';

@Module({
  imports: [AuthModule, ApsModule],
})
export class AppModule {}
