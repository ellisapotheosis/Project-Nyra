// ===== QUOTE ENGINE SERVER =====
// Stateless mortgage pricing microservice
// Callable from OpenClaw via Nexus Router MCP

import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import {
  calculateMortgage,
  generate3OptionComparison,
  generateAmortizationSchedule,
  calculateAffordability,
  QuoteRequest,
} from './utils/mortgageMath';
import pino from 'pino';

// ===== SETUP =====
const app = express();
const logger = pino();

app.use(express.json());
app.use(cors());

// ===== ZOD SCHEMAS (Input Validation) =====
const QuoteSchema = z.object({
  propertyValue: z
    .number()
    .positive('Property value must be greater than 0'),
  downPayment: z
    .number()
    .min(0, 'Down payment cannot be negative'),
  baseInterestRate: z
    .number()
    .positive('Interest rate must be greater than 0')
    .max(20, 'Rate too high'),
  termYears: z
    .number()
    .int()
    .positive()
    .default(30),
  annualTaxes: z.number().min(0).default(0),
  annualInsurance: z.number().min(0).default(0),
  monthlyHoa: z.number().min(0).default(0),
  loanType: z
    .enum(['conventional', 'fha', 'va', 'usda'])
    .default('conventional'),
});

const AffordabilitySchema = z.object({
  monthlyIncome: z
    .number()
    .positive('Monthly income must be positive'),
  existingDebts: z
    .number()
    .min(0, 'Existing debts cannot be negative'),
  ...QuoteSchema.shape,
});

// ===== HEALTH CHECK =====
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'nyra-quote-engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ===== MAIN QUOTE GENERATION =====
app.post('/api/v1/quote', (req: Request, res: Response) => {
  try {
    logger.info({ body: req.body }, 'Quote request received');

    // 1. Validate payload
    const validatedData = QuoteSchema.parse(req.body);

    // 2. Prevent impossible scenarios
    if (validatedData.downPayment >= validatedData.propertyValue) {
      return res.status(400).json({
        success: false,
        error: 'Down payment cannot be >= property value',
        received: {
          propertyValue: validatedData.propertyValue,
          downPayment: validatedData.downPayment,
        },
      });
    }

    // 3. Generate 3-option comparison
    const options = generate3OptionComparison(validatedData);

    logger.info(
      { options },
      'Quote generated successfully'
    );

    res.status(200).json({
      success: true,
      data: {
        scenario: '3-Option Comparison',
        inputs: validatedData,
        options: {
          standard: {
            description: 'Par Rate (No Points)',
            ...options.standard,
          },
          buyDown: {
            description: '-0.5% Buy-Down (Borrower pays points)',
            ...options.buyDown,
          },
          lenderCredit: {
            description:
              '+0.5% Yield Spread (Lender pays closing costs)',
            ...options.lenderCredit,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.errors }, 'Validation error');
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    logger.error({ error }, 'Quote generation error');
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ===== AMORTIZATION SCHEDULE =====
app.post('/api/v1/amortization', (req: Request, res: Response) => {
  try {
    logger.info({ body: req.body }, 'Amortization request');

    const validatedData = QuoteSchema.parse(req.body);

    if (validatedData.downPayment >= validatedData.propertyValue) {
      return res.status(400).json({
        success: false,
        error: 'Invalid down payment',
      });
    }

    const schedule = generateAmortizationSchedule(validatedData);

    // Return summary + first/last 12 months (full schedule is large)
    res.status(200).json({
      success: true,
      data: {
        totalMonths: schedule.length,
        firstYear: schedule.slice(0, 12),
        lastYear: schedule.slice(-12),
        summary: {
          totalPrincipal: schedule[schedule.length - 1]
            ? validatedData.propertyValue - validatedData.downPayment
            : 0,
          totalInterest: schedule.reduce((sum, line) => sum + line.interestPayment, 0),
        },
        _links: {
          fullSchedule: '/api/v1/amortization/full',
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.errors,
      });
    }
    logger.error({ error }, 'Amortization error');
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===== AFFORDABILITY ANALYSIS =====
app.post('/api/v1/affordability', (req: Request, res: Response) => {
  try {
    logger.info({ body: req.body }, 'Affordability request');

    const validatedData = AffordabilitySchema.parse(req.body);

    if (validatedData.downPayment >= validatedData.propertyValue) {
      return res.status(400).json({
        success: false,
        error: 'Invalid down payment',
      });
    }

    const quote = calculateMortgage(validatedData);
    const affordability = calculateAffordability(
      validatedData.monthlyIncome,
      validatedData.existingDebts,
      quote
    );

    res.status(200).json({
      success: true,
      data: {
        borrower: {
          monthlyIncome: validatedData.monthlyIncome,
          existingDebts: validatedData.existingDebts,
        },
        property: {
          value: validatedData.propertyValue,
          downPayment: validatedData.downPayment,
          loanAmount: quote.principal,
          ltv: quote.ltv,
        },
        loan: {
          rate: quote.interestRate,
          term: validatedData.termYears,
          monthlyPayment: quote.totalMonthlyPayment,
        },
        analysis: affordability,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.errors,
      });
    }
    logger.error({ error }, 'Affordability error');
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===== ERROR HANDLER =====
app.use((err: any, req: Request, res: Response) => {
  logger.error({ err }, 'Uncaught error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  logger.info({ port: PORT }, '🚀 Nyra Quote Engine online');
});

export default app;
