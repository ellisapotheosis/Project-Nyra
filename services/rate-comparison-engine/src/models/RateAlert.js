const db = require('../config/database');

/**
 * Rate Alert Model
 * Handles all database operations for rate alerts
 */
class RateAlert {
  /**
   * Create a new rate alert
   * @param {Object} alertData - Alert information
   * @returns {Promise<Object>} Created alert
   */
  static async create(alertData) {
    const {
      user_id,
      email,
      rate_type,
      target_rate,
      comparison_operator = 'less_than_equal',
      loan_amount,
      credit_score,
      down_payment
    } = alertData;

    const query = `
      INSERT INTO rate_alerts (
        user_id, email, rate_type, target_rate, comparison_operator,
        loan_amount, credit_score, down_payment, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;

    const values = [
      user_id, email, rate_type, target_rate, comparison_operator,
      loan_amount, credit_score, down_payment
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all alerts for a user
   * @param {string} userId - User ID
   * @param {boolean} activeOnly - Get only active alerts
   * @returns {Promise<Array>} Array of alerts
   */
  static async findByUser(userId, activeOnly = false) {
    let query = 'SELECT * FROM rate_alerts WHERE user_id = $1';
    const values = [userId];

    if (activeOnly) {
      query += ' AND is_active = true';
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get alert by ID
   * @param {number} id - Alert ID
   * @returns {Promise<Object>} Alert object
   */
  static async findById(id) {
    const query = 'SELECT * FROM rate_alerts WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all active alerts
   * @returns {Promise<Array>} Array of active alerts
   */
  static async findActive() {
    const query = `
      SELECT * FROM rate_alerts
      WHERE is_active = true
      ORDER BY rate_type, target_rate ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get alerts by rate type
   * @param {string} rateType - Rate type
   * @returns {Promise<Array>} Array of alerts
   */
  static async findByRateType(rateType) {
    const query = `
      SELECT * FROM rate_alerts
      WHERE rate_type = $1 AND is_active = true
      ORDER BY target_rate ASC
    `;

    const result = await db.query(query, [rateType]);
    return result.rows;
  }

  /**
   * Update alert
   * @param {number} id - Alert ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated alert
   */
  static async update(id, updates) {
    const allowedFields = [
      'target_rate', 'comparison_operator', 'loan_amount',
      'credit_score', 'down_payment', 'is_active'
    ];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE rate_alerts
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Activate/deactivate alert
   * @param {number} id - Alert ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated alert
   */
  static async setActive(id, isActive) {
    const query = `
      UPDATE rate_alerts
      SET is_active = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [isActive, id]);
    return result.rows[0];
  }

  /**
   * Mark alert as triggered
   * @param {number} id - Alert ID
   * @returns {Promise<Object>} Updated alert
   */
  static async markTriggered(id) {
    const query = `
      UPDATE rate_alerts
      SET last_triggered_at = CURRENT_TIMESTAMP,
          notification_count = notification_count + 1
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Delete alert
   * @param {number} id - Alert ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const query = 'DELETE FROM rate_alerts WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Delete all alerts for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of deleted alerts
   */
  static async deleteByUser(userId) {
    const query = 'DELETE FROM rate_alerts WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rowCount;
  }

  /**
   * Check if rate matches alert criteria
   * @param {Object} alert - Alert object
   * @param {number} currentRate - Current rate to check
   * @returns {boolean} Whether rate matches criteria
   */
  static matchesCriteria(alert, currentRate) {
    switch (alert.comparison_operator) {
      case 'less_than':
        return currentRate < alert.target_rate;
      case 'less_than_equal':
        return currentRate <= alert.target_rate;
      case 'equal':
        return currentRate === alert.target_rate;
      default:
        return false;
    }
  }

  /**
   * Get alerts that should be triggered by given rate
   * @param {string} rateType - Rate type
   * @param {number} currentRate - Current rate
   * @returns {Promise<Array>} Matching alerts
   */
  static async findTriggerable(rateType, currentRate) {
    const query = `
      SELECT * FROM rate_alerts
      WHERE rate_type = $1
        AND is_active = true
        AND (
          (comparison_operator = 'less_than' AND $2 < target_rate)
          OR (comparison_operator = 'less_than_equal' AND $2 <= target_rate)
          OR (comparison_operator = 'equal' AND $2 = target_rate)
        )
        AND (last_triggered_at IS NULL OR last_triggered_at < CURRENT_TIMESTAMP - INTERVAL '24 hours')
      ORDER BY created_at ASC
    `;

    const result = await db.query(query, [rateType, currentRate]);
    return result.rows;
  }
}

module.exports = RateAlert;
