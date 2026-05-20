import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApsService } from './aps.service';

@Controller('aps')
export class ApsController {
  constructor(private readonly apsService: ApsService) {}

  @Get('token')
  async getToken() {
    try {
      return await this.apsService.getToken();
    } catch (err) {
      throw new HttpException('Failed to fetch APS token', HttpStatus.BAD_GATEWAY);
    }
  }
}
