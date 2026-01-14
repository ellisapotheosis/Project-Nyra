const db = require('../config/database');

/**
 * Lender Model
 * Handles all database operations for mortgage lenders
 */
class Lender {
  /**
   * Create a new lender
   * @param {Object} lenderData - Lender information
   * @returns {Promise<Object>} Created lender
   */
  static async create(lenderData) {
    const {
      name,
      website_url,
      scraper_enabled = true,
      scraper_config = {},
      logo_url,
      rating
    } = lenderData;

    const query = `
      INSERT INTO lenders (name, website_url, scraper_enabled, scraper_config, logo_url, rating)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      name,
      website_url,
      scraper_enabled,
      JSON.stringify(scraper_config),
      logo_url,
      rating
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all lenders
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of lenders
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM lenders WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.scraperEnabled !== undefined) {
      query += ` AND scraper_enabled = $${paramCount}`;
      values.push(filters.scraperEnabled);
      paramCount++;
    }

    if (filters.minRating) {
      query += ` AND rating >= $${paramCount}`;
      values.push(filters.minRating);
      paramCount++;
    }

    query += ' ORDER BY rating DESC, name ASC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get lender by ID
   * @param {number} id - Lender ID
   * @returns {Promise<Object>} Lender object
   */
  static async findById(id) {
    const query = 'SELECT * FROM lenders WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get lender by name
   * @param {string} name - Lender name
   * @returns {Promise<Object>} Lender object
   */
  static async findByName(name) {
    const query = 'SELECT * FROM lenders WHERE name = $1';
    const result = await db.query(query, [name]);
    return result.rows[0];
  }

  /**
   * Update lender
   * @param {number} id - Lender ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated lender
   */
  static async update(id, updates) {
    const allowedFields = [
      'name', 'website_url', 'scraper_enabled',
      'scraper_config', 'logo_url', 'rating'
    ];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        const value = key === 'scraper_config' ? JSON.stringify(updates[key]) : updates[key];
        values.push(value);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE lenders
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete lender
   * @param {number} id - Lender ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const query = 'DELETE FROM lenders WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get lenders with current rates
   * @returns {Promise<Array>} Lenders with rate counts
   */
  static async findWithRates() {
    const query = `
      SELECT
        l.*,
        COUNT(r.id) as active_rates_count,
        MIN(r.interest_rate) as best_rate
      FROM lenders l
      LEFT JOIN mortgage_rates r ON l.id = r.lender_id
        AND r.effective_date <= CURRENT_DATE
      GROUP BY l.id
      ORDER BY l.rating DESC, l.name ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Enable/disable scraper for lender
   * @param {number} id - Lender ID
   * @param {boolean} enabled - Scraper status
   * @returns {Promise<Object>} Updated lender
   */
  static async toggleScraper(id, enabled) {
    const query = `
      UPDATE lenders
      SET scraper_enabled = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [enabled, id]);
    return result.rows[0];
  }

  /**
   * Get scraper-enabled lenders
   * @returns {Promise<Array>} Lenders with scraping enabled
   */
  static async getScraperEnabled() {
    const query = `
      SELECT * FROM lenders
      WHERE scraper_enabled = true
      ORDER BY name ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Lender;
