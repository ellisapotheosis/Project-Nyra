import { Injectable } from '@nestjs/common';
import {
  CalculatePaymentDto,
  CalculateAffordabilityDto,
} from './dto/calculator.dto';

@Injectable()
export class CalculatorService {
  calculatePayment(dto: CalculatePaymentDto) {
    const { homePrice, downPayment, interestRate, loanTerm } = dto;
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfPayments;
    } else {
      monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal),
    };
  }

  calculateAffordability(dto: CalculateAffordabilityDto) {
    const { annualIncome, monthlyDebts, downPayment, interestRate } = dto;
    const monthlyIncome = annualIncome / 12;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = 30 * 12; // Assume 30-year term

    // Front-end ratio: 28% of monthly income for housing
    const maxHousingPayment = monthlyIncome * 0.28;

    // Back-end ratio: 36% of monthly income for all debts
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxMortgagePayment = maxTotalDebt - monthlyDebts;

    // Use the lower of the two
    const maxPayment = Math.min(maxHousingPayment, maxMortgagePayment);

    // Calculate maximum loan amount
    let maxLoanAmount: number;
    if (monthlyRate === 0) {
      maxLoanAmount = maxPayment * numberOfPayments;
    } else {
      maxLoanAmount =
        (maxPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    }

    const maxHomePrice = maxLoanAmount + downPayment;

    return {
      maxHomePrice: Math.round(maxHomePrice),
      maxLoanAmount: Math.round(maxLoanAmount),
      maxMonthlyPayment: Math.round(maxPayment),
      downPayment,
    };
  }
}
