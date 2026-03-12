import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rate } from '../../database/entities/rate.entity';

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>
  ) {}

  async findAll(): Promise<any[]> {
    const rates = await this.rateRepository.find({
      where: { active: true },
      order: { rate: 'ASC' },
      take: 10,
    });

    // Mock data if no rates in database
    if (rates.length === 0) {
      return this.getMockRates();
    }

    return rates.map((rate) => ({
      id: rate.id,
      loanType: rate.loanType,
      term: rate.term,
      rate: Number(rate.rate),
      apr: Number(rate.apr),
      points: Number(rate.points),
      monthlyPayment: this.calculateMonthlyPayment(500000, Number(rate.rate), 30),
      updatedAt: this.formatDate(rate.updatedAt),
    }));
  }

  async findOne(id: string): Promise<Rate> {
    const rate = await this.rateRepository.findOne({ where: { id } });

    if (!rate) {
      throw new NotFoundException(`Rate with ID ${id} not found`);
    }

    return rate;
  }

  private getMockRates() {
    return [
      {
        id: '1',
        loanType: '30-Year Fixed',
        term: '360 months',
        rate: 6.25,
        apr: 6.35,
        points: 0.5,
        monthlyPayment: '3,078',
        updatedAt: 'today',
      },
      {
        id: '2',
        loanType: '15-Year Fixed',
        term: '180 months',
        rate: 5.75,
        apr: 5.85,
        points: 0.0,
        monthlyPayment: '4,106',
        updatedAt: 'today',
      },
      {
        id: '3',
        loanType: '5/1 ARM',
        term: '360 months',
        rate: 5.99,
        apr: 6.45,
        points: 1.0,
        monthlyPayment: '2,996',
        updatedAt: 'today',
      },
    ];
  }

  private calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    years: number
  ): string {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return (principal / numberOfPayments).toLocaleString();
    }

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return Math.round(payment).toLocaleString();
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }
}
