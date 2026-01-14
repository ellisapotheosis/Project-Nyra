const { query } = require('../config/database');
const fuzz = require('fuzzball');
const logger = require('../config/logger');

class DuplicateDetectionService {
  constructor() {
    this.emailThreshold = 100; // Exact match required
    this.phoneThreshold = 90; // High similarity
    this.nameCompanyThreshold = 85; // High similarity for combined check
  }

  async detectDuplicates(lead) {
    const duplicates = [];

    try {
      // 1. Check for exact email match
      if (lead.email) {
        const emailDuplicates = await this.findByEmail(lead.email, lead.id);
        emailDuplicates.forEach(dup => {
          duplicates.push({
            lead: dup,
            match_type: 'email_exact',
            confidence_score: 100,
            match_details: { field: 'email', value: lead.email },
          });
        });
      }

      // 2. Check for exact or similar phone
      if (lead.phone) {
        const phoneDuplicates = await this.findByPhone(lead.phone, lead.id);
        phoneDuplicates.forEach(dup => {
          const phoneScore = this.comparePhones(lead.phone, dup.phone);
          if (phoneScore >= this.phoneThreshold) {
            duplicates.push({
              lead: dup,
              match_type: phoneScore === 100 ? 'phone_exact' : 'phone_fuzzy',
              confidence_score: phoneScore,
              match_details: { field: 'phone', value: lead.phone, matched: dup.phone },
            });
          }
        });
      }

      // 3. Check for name + company combination
      if (lead.full_name && lead.company) {
        const nameCompanyDuplicates = await this.findByNameAndCompany(
          lead.full_name,
          lead.company,
          lead.id
        );

        nameCompanyDuplicates.forEach(dup => {
          const nameScore = fuzz.token_set_ratio(
            this.normalize(lead.full_name),
            this.normalize(dup.full_name || '')
          );
          const companyScore = fuzz.token_set_ratio(
            this.normalize(lead.company),
            this.normalize(dup.company || '')
          );

          const avgScore = (nameScore + companyScore) / 2;

          if (avgScore >= this.nameCompanyThreshold) {
            duplicates.push({
              lead: dup,
              match_type: 'name_company_fuzzy',
              confidence_score: Math.round(avgScore),
              match_details: {
                name_score: nameScore,
                company_score: companyScore,
              },
            });
          }
        });
      }

      // 4. Remove duplicate matches (same lead matched multiple ways)
      const uniqueDuplicates = this.deduplicateMatches(duplicates);

      // 5. Store duplicate records in database
      if (uniqueDuplicates.length > 0) {
        await this.storeDuplicates(lead.id, uniqueDuplicates);
      }

      logger.info('Duplicate detection completed', {
        lead_id: lead.id,
        duplicates_found: uniqueDuplicates.length,
      });

      return uniqueDuplicates;
    } catch (error) {
      logger.error('Duplicate detection failed', {
        lead_id: lead.id,
        error: error.message,
      });
      throw error;
    }
  }

  async findByEmail(email, excludeId) {
    const sql = `
      SELECT * FROM leads
      WHERE LOWER(email) = LOWER($1)
      AND id != $2
    `;
    const result = await query(sql, [email, excludeId || '00000000-0000-0000-0000-000000000000']);
    return result.rows;
  }

  async findByPhone(phone, excludeId) {
    const normalizedPhone = this.normalizePhone(phone);
    const sql = `
      SELECT * FROM leads
      WHERE phone IS NOT NULL
      AND id != $1
    `;
    const result = await query(sql, [excludeId || '00000000-0000-0000-0000-000000000000']);

    // Filter by phone similarity
    return result.rows.filter(lead => {
      const leadPhone = this.normalizePhone(lead.phone);
      return this.comparePhones(normalizedPhone, leadPhone) >= this.phoneThreshold;
    });
  }

  async findByNameAndCompany(fullName, company, excludeId) {
    const sql = `
      SELECT * FROM leads
      WHERE full_name IS NOT NULL
      AND company IS NOT NULL
      AND id != $1
      AND (
        similarity(full_name, $2) > 0.5
        OR similarity(company, $3) > 0.5
      )
    `;
    const result = await query(sql, [
      excludeId || '00000000-0000-0000-0000-000000000000',
      fullName,
      company,
    ]);
    return result.rows;
  }

  comparePhones(phone1, phone2) {
    const normalized1 = this.normalizePhone(phone1);
    const normalized2 = this.normalizePhone(phone2);

    if (normalized1 === normalized2) return 100;

    return fuzz.ratio(normalized1, normalized2);
  }

  normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  normalize(text) {
    if (!text) return '';
    return text.toLowerCase().trim();
  }

  deduplicateMatches(duplicates) {
    const seen = new Set();
    const unique = [];

    duplicates.forEach(dup => {
      const key = dup.lead.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(dup);
      }
    });

    return unique;
  }

  async storeDuplicates(leadId, duplicates) {
    try {
      for (const dup of duplicates) {
        const sql = `
          INSERT INTO lead_duplicates (
            lead_id, duplicate_lead_id, match_type, confidence_score, match_details
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (lead_id, duplicate_lead_id) DO NOTHING
        `;

        await query(sql, [
          leadId,
          dup.lead.id,
          dup.match_type,
          dup.confidence_score,
          JSON.stringify(dup.match_details),
        ]);
      }
    } catch (error) {
      logger.error('Failed to store duplicates', { error: error.message });
    }
  }

  async getDuplicates(leadId) {
    const sql = `
      SELECT
        ld.*,
        l.email, l.phone, l.full_name, l.company, l.status, l.score, l.created_at
      FROM lead_duplicates ld
      JOIN leads l ON l.id = ld.duplicate_lead_id
      WHERE ld.lead_id = $1 AND ld.resolved = false
      ORDER BY ld.confidence_score DESC
    `;
    const result = await query(sql, [leadId]);
    return result.rows;
  }

  async resolveDuplicate(duplicateId, action, resolvedBy) {
    const sql = `
      UPDATE lead_duplicates
      SET resolved = true, resolved_action = $1, resolved_at = CURRENT_TIMESTAMP, resolved_by = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [action, resolvedBy, duplicateId]);
    return result.rows[0];
  }

  async mergLeads(primaryLeadId, duplicateLeadId, mergedBy) {
    const { transaction } = require('../config/database');

    return await transaction(async (client) => {
      // Get both leads
      const primaryLead = await client.query('SELECT * FROM leads WHERE id = $1', [primaryLeadId]);
      const duplicateLead = await client.query('SELECT * FROM leads WHERE id = $1', [duplicateLeadId]);

      if (!primaryLead.rows[0] || !duplicateLead.rows[0]) {
        throw new Error('One or both leads not found');
      }

      // Merge data (prefer primary, fill gaps with duplicate)
      const merged = { ...duplicateLead.rows[0], ...primaryLead.rows[0] };

      // Update primary lead
      await client.query(
        'UPDATE leads SET phone = $1, company = $2, job_title = $3 WHERE id = $4',
        [
          merged.phone || primaryLead.rows[0].phone,
          merged.company || primaryLead.rows[0].company,
          merged.job_title || primaryLead.rows[0].job_title,
          primaryLeadId,
        ]
      );

      // Transfer activities
      await client.query(
        'UPDATE lead_activities SET lead_id = $1 WHERE lead_id = $2',
        [primaryLeadId, duplicateLeadId]
      );

      // Mark duplicate as resolved
      await client.query(
        `UPDATE lead_duplicates
         SET resolved = true, resolved_action = 'merged', resolved_at = CURRENT_TIMESTAMP, resolved_by = $1
         WHERE (lead_id = $2 AND duplicate_lead_id = $3) OR (lead_id = $3 AND duplicate_lead_id = $2)`,
        [mergedBy, primaryLeadId, duplicateLeadId]
      );

      // Delete duplicate lead
      await client.query('DELETE FROM leads WHERE id = $1', [duplicateLeadId]);

      return merged;
    });
  }
}

module.exports = new DuplicateDetectionService();
