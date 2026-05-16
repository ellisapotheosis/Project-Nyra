const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Lead {
  static async create(leadData) {
    const id = uuidv4();
    const {
      email,
      phone,
      firstName,
      lastName,
      company,
      jobTitle,
      industry,
      companySize,
      annualRevenue,
      source,
      campaign,
      medium,
      referringUrl,
      landingPage,
      territory,
      customFields,
      tags,
      notes,
      ipAddress,
      userAgent,
    } = leadData;

    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const sql = `
      INSERT INTO leads (
        id, email, phone, first_name, last_name, full_name,
        company, job_title, industry, company_size, annual_revenue,
        source, campaign, medium, referring_url, landing_page,
        territory, custom_fields, tags, notes, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const values = [
      id, email, phone, firstName, lastName, fullName,
      company, jobTitle, industry, companySize, annualRevenue,
      source, campaign, medium, referringUrl, landingPage,
      territory, JSON.stringify(customFields || {}), tags, notes, ipAddress, userAgent,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = 'SELECT * FROM leads WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM leads WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const allowedFields = [
      'phone', 'first_name', 'last_name', 'company', 'job_title',
      'industry', 'company_size', 'annual_revenue', 'source', 'campaign',
      'medium', 'status', 'stage', 'temperature', 'score', 'assigned_to',
      'territory', 'custom_fields', 'tags', 'notes', 'enriched',
      'enrichment_data', 'twenty_crm_id',
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE leads
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async updateScore(id, score) {
    const sql = 'UPDATE leads SET score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await query(sql, [score, id]);
    return result.rows[0];
  }

  static async assign(id, userId) {
    const sql = `
      UPDATE leads
      SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [userId, id]);
    return result.rows[0];
  }

  static async list(filters = {}, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM leads WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.assignedTo) {
      sql += ` AND assigned_to = $${paramCount}`;
      values.push(filters.assignedTo);
      paramCount++;
    }

    if (filters.source) {
      sql += ` AND source = $${paramCount}`;
      values.push(filters.source);
      paramCount++;
    }

    if (filters.minScore) {
      sql += ` AND score >= $${paramCount}`;
      values.push(filters.minScore);
      paramCount++;
    }

    if (filters.territory) {
      sql += ` AND territory = $${paramCount}`;
      values.push(filters.territory);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        full_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount} OR
        company ILIKE $${paramCount}
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);

    const countSql = 'SELECT COUNT(*) FROM leads WHERE 1=1';
    const countResult = await query(countSql);

    return {
      leads: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    };
  }

  static async delete(id) {
    const sql = 'DELETE FROM leads WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async findDuplicates(email, phone, company) {
    const sql = `
      SELECT * FROM leads
      WHERE (email = $1 OR phone = $2)
      OR (company = $3 AND company IS NOT NULL)
      ORDER BY created_at DESC
    `;
    const result = await query(sql, [email, phone, company]);
    return result.rows;
  }

  static async bulkCreate(leads) {
    return await transaction(async (client) => {
      const createdLeads = [];
      for (const leadData of leads) {
        const lead = await this.create(leadData);
        createdLeads.push(lead);
      }
      return createdLeads;
    });
  }

  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
        AVG(score) as average_score,
        COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_leads
      FROM leads
    `;
    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = Lead;
