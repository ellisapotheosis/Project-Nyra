import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create leads table
    await queryRunner.query(`
      CREATE TABLE leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        phone VARCHAR NOT NULL,
        loan_type VARCHAR NOT NULL CHECK (loan_type IN ('purchase', 'refinance')),
        property_value DECIMAL(12,2) NOT NULL,
        credit_score VARCHAR NOT NULL CHECK (credit_score IN ('excellent', 'good', 'fair', 'poor')),
        status VARCHAR NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
        assigned_to VARCHAR,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create rates table
    await queryRunner.query(`
      CREATE TABLE rates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        loan_type VARCHAR NOT NULL,
        term VARCHAR NOT NULL,
        rate DECIMAL(5,3) NOT NULL,
        apr DECIMAL(5,3) NOT NULL,
        points DECIMAL(5,2) NOT NULL,
        lender_name VARCHAR NOT NULL,
        requirements JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contacts table
    await queryRunner.query(`
      CREATE TABLE contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_leads_email ON leads(email)`);
    await queryRunner.query(`CREATE INDEX idx_leads_status ON leads(status)`);
    await queryRunner.query(`CREATE INDEX idx_leads_created_at ON leads(created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_rates_active ON rates(active)`);
    await queryRunner.query(`CREATE INDEX idx_rates_loan_type ON rates(loan_type)`);
    await queryRunner.query(`CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contacts`);
    await queryRunner.query(`DROP TABLE IF EXISTS rates`);
    await queryRunner.query(`DROP TABLE IF EXISTS leads`);
  }
}
