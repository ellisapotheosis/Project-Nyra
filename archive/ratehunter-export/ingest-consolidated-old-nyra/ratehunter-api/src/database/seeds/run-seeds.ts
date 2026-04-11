import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Rate } from '../entities/rate.entity';

async function runSeeds() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USER', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', 'postgres'),
    database: configService.get('DATABASE_NAME', 'ratehunter_dev'),
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  });

  await dataSource.initialize();

  console.log('Seeding database...');

  // Seed rates
  const rateRepository = dataSource.getRepository(Rate);

  const rates = [
    {
      loanType: '30-Year Fixed',
      term: '360 months',
      rate: 6.25,
      apr: 6.35,
      points: 0.5,
      lenderName: 'First National Bank',
      requirements: {
        minCreditScore: 620,
        maxLTV: 80,
        minDownPayment: 20,
      },
    },
    {
      loanType: '15-Year Fixed',
      term: '180 months',
      rate: 5.75,
      apr: 5.85,
      points: 0.0,
      lenderName: 'Citizens Bank',
      requirements: {
        minCreditScore: 640,
        maxLTV: 75,
        minDownPayment: 25,
      },
    },
    {
      loanType: '5/1 ARM',
      term: '360 months',
      rate: 5.99,
      apr: 6.45,
      points: 1.0,
      lenderName: 'Union Mortgage',
      requirements: {
        minCreditScore: 700,
        maxLTV: 70,
        minDownPayment: 30,
      },
    },
  ];

  for (const rate of rates) {
    const existing = await rateRepository.findOne({
      where: { loanType: rate.loanType, lenderName: rate.lenderName },
    });

    if (!existing) {
      await rateRepository.save(rate);
      console.log(`✓ Created rate: ${rate.loanType} - ${rate.lenderName}`);
    }
  }

  console.log('Seeding complete!');

  await dataSource.destroy();
}

runSeeds().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
