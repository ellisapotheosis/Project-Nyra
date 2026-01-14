import { DocxCampaignParser } from '../../src/parsers/docx-parser.js';

describe('DocxCampaignParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DocxCampaignParser();
  });

  describe('parseText', () => {
    it('should parse simple campaign text', () => {
      const text = `
        Campaign Day 1-5

        Day 1

        SMS Time: instant
        Hello there!

        Email Time: 30 mins
        Subject: Welcome
        This is the email body
      `;

      const campaign = parser.parseText(text, 'test.docx');

      expect(campaign.name).toContain('Campaign Day 1-5');
      expect(campaign.steps).toHaveLength(2);
      expect(campaign.steps[0].channel).toBe('sms');
      expect(campaign.steps[0].day).toBe(1);
      expect(campaign.steps[0].offset_minutes).toBe(0);
      expect(campaign.steps[1].channel).toBe('email');
      expect(campaign.steps[1].offset_minutes).toBe(30);
    });

    it('should parse time offsets correctly', () => {
      expect(parser.parseTimeOffset('instant')).toBe(0);
      expect(parser.parseTimeOffset('30 mins')).toBe(30);
      expect(parser.parseTimeOffset('2 hours')).toBe(120);
      expect(parser.parseTimeOffset('2 hours 30 mins')).toBe(150);
    });

    it('should skip metadata lines', () => {
      const text = `
        Day 1
        SMS Time: instant
        ***Insert your link here
        Actual message content
      `;

      const campaign = parser.parseText(text);
      expect(campaign.steps[0].body).not.toContain('***');
      expect(campaign.steps[0].body).toContain('Actual message content');
    });

    it('should handle multiple days', () => {
      const text = `
        Campaign

        Day 1
        SMS Time: instant
        Day 1 message

        Day 2
        Email Time: 1 hour
        Day 2 message

        Day 3
        SMS Time: instant
        Day 3 message
      `;

      const campaign = parser.parseText(text);
      expect(campaign.steps).toHaveLength(3);
      expect(campaign.steps[0].day).toBe(1);
      expect(campaign.steps[1].day).toBe(2);
      expect(campaign.steps[2].day).toBe(3);
    });

    it('should handle voicemail channel', () => {
      const text = `
        Day 1
        Vmail Time: 10 mins
        Voicemail content
      `;

      const campaign = parser.parseText(text);
      expect(campaign.steps[0].channel).toBe('voicemail');
    });
  });

  describe('generateCampaignId', () => {
    it('should generate valid IDs', () => {
      expect(parser.generateCampaignId('Campaign Day 1-5')).toBe('campaign_day_1_5');
      expect(parser.generateCampaignId('Special Characters!@#')).toBe('special_characters');
      expect(parser.generateCampaignId('  Leading Trailing  ')).toBe('leading_trailing');
    });
  });

  describe('extractCampaignName', () => {
    it('should extract campaign names', () => {
      const lines = ['Campaign Day 1-5', 'Content'];
      expect(parser.extractCampaignName(lines)).toBe('Campaign Day 1 5');

      const lines2 = ['Day 1-5', 'Content'];
      expect(parser.extractCampaignName(lines2)).toContain('Campaign Day 1-5');
    });
  });
});
