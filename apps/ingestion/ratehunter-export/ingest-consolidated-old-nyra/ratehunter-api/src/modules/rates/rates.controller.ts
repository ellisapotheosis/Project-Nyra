import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RatesService } from './rates.service';

@Controller('rates')
@UseGuards(ThrottlerGuard)
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  async findAll() {
    return this.ratesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ratesService.findOne(id);
  }
}
