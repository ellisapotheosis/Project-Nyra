const db = require('../config/database');

/**
 * Rate Model
 * Handles all database operations for mortgage rates
 */
class Rate {
  /**
   * Create a new mortgage rate
   * @param {Object} rateData - Rate information
   * @returns {Promise<Object>} Created rate
   */
  static async create(rateData) {
    const {
      lender_id,
      rate_type,
      interest_rate,
      apr,
      points = 0,
      loan_amount_min,
      loan_amount_max,
      credit_score_min,
      down_payment_min,
      fees = {},
      effective_date
    } = rateData;

    const query = `
      INSERT INTO mortgage_rates (
        lender_id, rate_type, interest_rate, apr, points,
        loan_amount_min, loan_amount_max, credit_score_min,
        down_payment_min, fees, effective_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      lender_id, rate_type, interest_rate, apr, points,
      loan_amount_min, loan_amount_max, credit_score_min,
      down_payment_min, JSON.stringify(fees), effective_date
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get current rates by rate type
   * @param {string} rateType - Type of mortgage rate
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of rates
   */
  static async getCurrentRates(rateType, filters = {}) {
    let query = `
      SELECT r.*, l.name as lender_name, l.rating, l.logo_url
      FROM mortgage_rates r
      JOIN lenders l ON r.lender_id = l.id
      WHERE r.effective_date <= CURRENT_DATE
    `;
    const values = [];
    let paramCount = 1;

    if (rateType) {
      query += ` AND r.rate_type = $${paramCount}`;
      values.push(rateType);
      paramCount++;
    }

    if (filters.loanAmount) {
      query += ` AND (r.loan_amount_min IS NULL OR r.loan_amount_min <= $${paramCount})`;
      values.push(filters.loanAmount);
      paramCount++;
      query += ` AND (r.loan_amount_max IS NULL OR r.loan_amount_max >= $${paramCount})`;
      values.push(filters.loanAmount);
      paramCount++;
    }

    if (filters.creditScore) {
      query += ` AND (r.credit_score_min IS NULL OR r.credit_score_min <= $${paramCount})`;
      values.push(filters.creditScore);
      paramCount++;
    }

    if (filters.downPayment) {
      query += ` AND (r.down_payment_min IS NULL OR r.down_payment_min <= $${paramCount})`;
      values.push(filters.downPayment);
      paramCount++;
    }

    query += ` ORDER BY r.interest_rate ASC, r.apr ASC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get best rates across all lenders
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Best rates
   */
  static async getBestRates(criteria = {}) {
    const query = `
      WITH ranked_rates AS (
        SELECT
          r.*,
          l.name as lender_name,
          l.rating,
          l.logo_url,
          ROW_NUMBER() OVER (PARTITION BY r.rate_type ORDER BY r.apr ASC) as rank
        FROM mortgage_rates r
        JOIN lenders l ON r.lender_id = l.id
        WHERE r.effective_date <= CURRENT_DATE
          AND (r.loan_amount_min IS NULL OR r.loan_amount_min <= $1)
          AND (r.loan_amount_max IS NULL OR r.loan_amount_max >= $1)
          AND (r.credit_score_min IS NULL OR r.credit_score_min <= $2)
      )
      SELECT * FROM ranked_rates
      WHERE rank <= 3
      ORDER BY rate_type, apr ASC
    `;

    const values = [
      criteria.loanAmount || 300000,
      criteria.creditScore || 700
    ];

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get rate by ID
   * @param {number} id - Rate ID
   * @returns {Promise<Object>} Rate object
   */
  static async findById(id) {
    const query = `
      SELECT r.*, l.name as lender_name, l.rating, l.logo_url
      FROM mortgage_rates r
      JOIN lenders l ON r.lender_id = l.id
      WHERE r.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Update rate
   * @param {number} id - Rate ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated rate
   */
  static async update(id, updates) {
    const allowedFields = ['interest_rate', 'apr', 'points', 'fees', 'effective_date'];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(key === 'fees' ? JSON.stringify(updates[key]) : updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE mortgage_rates
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete rate
   * @param {number} id - Rate ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const query = 'DELETE FROM mortgage_rates WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get rate comparison statistics
   * @param {string} rateType - Rate type
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics(rateType, days = 30) {
    const query = `
      SELECT
        AVG(interest_rate) as avg_rate,
        MIN(interest_rate) as min_rate,
        MAX(interest_rate) as max_rate,
        AVG(apr) as avg_apr,
        COUNT(*) as total_rates,
        COUNT(DISTINCT lender_id) as total_lenders
      FROM mortgage_rates
      WHERE rate_type = $1
        AND effective_date >= CURRENT_DATE - $2::integer
    `;

    const result = await db.query(query, [rateType, days]);
    return result.rows[0];
  }

  /**
   * Bulk insert rates
   * @param {Array} rates - Array of rate objects
   * @returns {Promise<number>} Number of inserted rates
   */
  static async bulkCreate(rates) {
    if (!rates || rates.length === 0) {
      return 0;
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO mortgage_rates (
          lender_id, rate_type, interest_rate, apr, points,
          loan_amount_min, loan_amount_max, credit_score_min,
          down_payment_min, fees, effective_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      let insertedCount = 0;
      for (const rate of rates) {
        const values = [
          rate.lender_id, rate.rate_type, rate.interest_rate, rate.apr,
          rate.points || 0, rate.loan_amount_min, rate.loan_amount_max,
          rate.credit_score_min, rate.down_payment_min,
          JSON.stringify(rate.fees || {}), rate.effective_date
        ];

        await client.query(query, values);
        insertedCount++;
      }

      await client.query('COMMIT');
      return insertedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Rate;
