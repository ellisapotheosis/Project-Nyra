import { Campaign, CampaignStep } from '../../src/models/campaign.model.js';

describe('Campaign Model', () => {
  describe('Campaign', () => {
    it('should create campaign with valid data', () => {
      const data = {
        id: 'test_campaign',
        name: 'Test Campaign',
        steps: [
          {
            day: 1,
            channel: 'sms',
            offset_minutes: 0,
            body: 'Test message'
          }
        ]
      };

      const campaign = new Campaign(data);

      expect(campaign.id).toBe('test_campaign');
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.steps).toHaveLength(1);
      expect(campaign.status).toBe('draft');
    });

    it('should validate campaign structure', () => {
      const validCampaign = new Campaign({
        id: 'test',
        name: 'Test',
        steps: [{ day: 1, channel: 'sms', offset_minutes: 0, body: 'Test' }]
      });

      const validation = validCampaign.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidCampaign = new Campaign({
        id: '',
        name: '',
        steps: []
      });

      const validation = invalidCampaign.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid steps', () => {
      const campaign = new Campaign({
        id: 'test',
        name: 'Test',
        steps: [
          { day: 0, channel: 'invalid', offset_minutes: null }
        ]
      });

      const validation = campaign.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('day'))).toBe(true);
      expect(validation.errors.some(e => e.includes('channel'))).toBe(true);
    });

    it('should convert to JSON', () => {
      const campaign = new Campaign({
        id: 'test',
        name: 'Test',
        steps: []
      });

      const json = campaign.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('steps');
      expect(json).toHaveProperty('status');
    });

    it('should create from JSON', () => {
      const json = {
        id: 'test',
        name: 'Test',
        steps: []
      };

      const campaign = Campaign.fromJSON(json);
      expect(campaign).toBeInstanceOf(Campaign);
      expect(campaign.id).toBe('test');
    });
  });

  describe('CampaignStep', () => {
    it('should create step with valid data', () => {
      const step = new CampaignStep({
        day: 1,
        channel: 'sms',
        label: 'sms1',
        offset_minutes: 30,
        body: 'Test message'
      });

      expect(step.day).toBe(1);
      expect(step.channel).toBe('sms');
      expect(step.offset_minutes).toBe(30);
    });

    it('should calculate absolute minutes correctly', () => {
      const step1 = new CampaignStep({
        day: 1,
        channel: 'sms',
        offset_minutes: 30,
        body: ''
      });

      expect(step1.getAbsoluteMinutes()).toBe(30);

      const step2 = new CampaignStep({
        day: 2,
        channel: 'email',
        offset_minutes: 60,
        body: ''
      });

      expect(step2.getAbsoluteMinutes()).toBe(1440 + 60); // 24 hours + 1 hour
    });

    it('should handle zero offset', () => {
      const step = new CampaignStep({
        day: 1,
        channel: 'sms',
        offset_minutes: 0,
        body: ''
      });

      expect(step.getAbsoluteMinutes()).toBe(0);
    });

    it('should convert to JSON', () => {
      const step = new CampaignStep({
        day: 1,
        channel: 'sms',
        offset_minutes: 30,
        body: 'Test'
      });

      const json = step.toJSON();
      expect(json).toHaveProperty('day');
      expect(json).toHaveProperty('channel');
      expect(json).toHaveProperty('offset_minutes');
      expect(json).toHaveProperty('body');
    });
  });
});
