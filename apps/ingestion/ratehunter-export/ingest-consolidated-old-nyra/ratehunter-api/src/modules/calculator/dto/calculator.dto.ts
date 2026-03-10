import { IsNumber, Min } from 'class-validator';

export class CalculatePaymentDto {
  @IsNumber()
  @Min(1)
  homePrice: number;

  @IsNumber()
  @Min(0)
  downPayment: number;

  @IsNumber()
  @Min(0)
  interestRate: number;

  @IsNumber()
  @Min(1)
  loanTerm: number;
}

export class CalculateAffordabilityDto {
  @IsNumber()
  @Min(1)
  annualIncome: number;

  @IsNumber()
  @Min(0)
  monthlyDebts: number;

  @IsNumber()
  @Min(0)
  downPayment: number;

  @IsNumber()
  @Min(0)
  interestRate: number;
}
