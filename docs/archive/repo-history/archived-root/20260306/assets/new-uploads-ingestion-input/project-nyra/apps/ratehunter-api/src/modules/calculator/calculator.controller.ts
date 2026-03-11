import { Controller, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CalculatorService } from './calculator.service';
import {
  CalculatePaymentDto,
  CalculateAffordabilityDto,
} from './dto/calculator.dto';

@Controller('calculator')
@UseGuards(ThrottlerGuard)
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('payment')
  calculatePayment(@Body(ValidationPipe) dto: CalculatePaymentDto) {
    return this.calculatorService.calculatePayment(dto);
  }

  @Post('affordability')
  calculateAffordability(@Body(ValidationPipe) dto: CalculateAffordabilityDto) {
    return this.calculatorService.calculateAffordability(dto);
  }
}
