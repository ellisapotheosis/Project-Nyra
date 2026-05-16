const { query } = require('../config/database');
const logger = require('../config/logger');

class ScoringService {
  constructor() {
    this.rules = [];
    this.rulesLoaded = false;
  }

  async loadRules() {
    try {
      const sql = 'SELECT * FROM scoring_rules WHERE active = true ORDER BY priority DESC';
      const result = await query(sql);
      this.rules = result.rows;
      this.rulesLoaded = true;
      logger.info(`Loaded ${this.rules.length} scoring rules`);
    } catch (error) {
      logger.error('Failed to load scoring rules', { error: error.message });
      throw error;
    }
  }

  async calculateScore(lead) {
    if (!this.rulesLoaded) {
      await this.loadRules();
    }

    let totalScore = 0;
    const appliedRules = [];

    for (const rule of this.rules) {
      try {
        if (this.evaluateRule(rule, lead)) {
          totalScore += rule.score_impact;
          appliedRules.push({
            rule_id: rule.id,
            rule_name: rule.name,
            score_impact: rule.score_impact,
          });
        }
      } catch (error) {
        logger.error('Error evaluating scoring rule', {
          rule_id: rule.id,
          error: error.message,
        });
      }
    }

    const minScore = parseInt(process.env.SCORING_MIN_SCORE || '0');
    const maxScore = parseInt(process.env.SCORING_MAX_SCORE || '100');
    totalScore = Math.max(minScore, Math.min(maxScore, totalScore));

    logger.info('Calculated lead score', {
      lead_id: lead.id,
      score: totalScore,
      applied_rules: appliedRules.length,
    });

    return {
      score: totalScore,
      applied_rules: appliedRules,
    };
  }

  evaluateRule(rule, lead) {
    const { rule_type, condition } = rule;

    switch (rule_type) {
      case 'email_domain':
        return this.evaluateEmailDomain(lead, condition);

      case 'job_title':
        return this.evaluateJobTitle(lead, condition);

      case 'company_size':
        return this.evaluateCompanySize(lead, condition);

      case 'annual_revenue':
        return this.evaluateAnnualRevenue(lead, condition);

      case 'source':
        return this.evaluateSource(lead, condition);

      case 'industry':
        return this.evaluateIndustry(lead, condition);

      case 'custom_field':
        return this.evaluateCustomField(lead, condition);

      default:
        logger.warn('Unknown rule type', { rule_type });
        return false;
    }
  }

  evaluateEmailDomain(lead, condition) {
    if (!lead.email) return false;

    const domain = lead.email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    if (condition.exclude_domains) {
      return !condition.exclude_domains.map(d => d.toLowerCase()).includes(domain);
    }

    if (condition.include_domains) {
      return condition.include_domains.map(d => d.toLowerCase()).includes(domain);
    }

    return false;
  }

  evaluateJobTitle(lead, condition) {
    if (!lead.job_title) return false;

    const jobTitle = lead.job_title.toLowerCase();

    if (condition.keywords) {
      return condition.keywords.some(keyword =>
        jobTitle.includes(keyword.toLowerCase())
      );
    }

    return false;
  }

  evaluateCompanySize(lead, condition) {
    if (!lead.company_size) return false;

    if (condition.values) {
      return condition.values.includes(lead.company_size);
    }

    return false;
  }

  evaluateAnnualRevenue(lead, condition) {
    if (!lead.annual_revenue) return false;

    const revenue = parseFloat(lead.annual_revenue);

    if (condition.min && revenue < condition.min) {
      return false;
    }

    if (condition.max && revenue > condition.max) {
      return false;
    }

    return true;
  }

  evaluateSource(lead, condition) {
    if (!lead.source) return false;

    if (condition.values) {
      return condition.values.includes(lead.source);
    }

    return false;
  }

  evaluateIndustry(lead, condition) {
    if (!lead.industry) return false;

    if (condition.values) {
      return condition.values.includes(lead.industry);
    }

    return false;
  }

  evaluateCustomField(lead, condition) {
    if (!lead.custom_fields) return false;

    const customFields = typeof lead.custom_fields === 'string'
      ? JSON.parse(lead.custom_fields)
      : lead.custom_fields;

    const fieldName = condition.field_name;
    const fieldValue = customFields[fieldName];

    if (fieldValue === undefined) return false;

    if (condition.equals !== undefined) {
      return fieldValue === condition.equals;
    }

    if (condition.contains !== undefined) {
      return String(fieldValue).toLowerCase().includes(String(condition.contains).toLowerCase());
    }

    return false;
  }

  async createRule(ruleData) {
    const sql = `
      INSERT INTO scoring_rules (name, description, rule_type, condition, score_impact, priority, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      ruleData.name,
      ruleData.description,
      ruleData.rule_type,
      JSON.stringify(ruleData.condition),
      ruleData.score_impact,
      ruleData.priority || 0,
      ruleData.active !== false,
    ];

    const result = await query(sql, values);
    await this.loadRules(); // Reload rules
    return result.rows[0];
  }

  async updateRule(ruleId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'rule_type', 'condition', 'score_impact', 'priority', 'active'];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'condition' ? JSON.stringify(updates[key]) : updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(ruleId);
    const sql = `
      UPDATE scoring_rules
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    await this.loadRules(); // Reload rules
    return result.rows[0];
  }

  async getRules() {
    const sql = 'SELECT * FROM scoring_rules ORDER BY priority DESC, created_at DESC';
    const result = await query(sql);
    return result.rows;
  }
}

module.exports = new ScoringService();
