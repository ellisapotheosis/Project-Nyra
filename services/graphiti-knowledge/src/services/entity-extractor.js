import compromise from 'compromise';
import { NlpManager } from 'node-nlp';
import { logger } from '../utils/logger.js';

/**
 * Entity Extraction Service
 * Extracts named entities and concepts from text using NLP
 */
export class EntityExtractor {
  constructor() {
    this.nlpManager = new NlpManager({ languages: ['en'] });
    this.initializeNLP();
  }

  /**
   * Initialize NLP models
   */
  async initializeNLP() {
    // Add common entity patterns
    this.entityPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      date: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g
    };

    logger.info('Entity extraction service initialized');
  }

  /**
   * Extract entities from text
   */
  async extract(text, options = {}) {
    const {
      extractPeople = true,
      extractOrganizations = true,
      extractLocations = true,
      extractDates = true,
      extractCustom = true,
      minConfidence = 0.5
    } = options;

    logger.info('Extracting entities from text');

    const entities = [];

    try {
      // Use Compromise for NER
      const doc = compromise(text);

      // Extract people
      if (extractPeople) {
        const people = doc.people().out('array');
        people.forEach(person => {
          entities.push({
            text: person,
            type: 'PERSON',
            confidence: 0.8,
            properties: {
              category: 'named_entity'
            }
          });
        });
      }

      // Extract organizations
      if (extractOrganizations) {
        const orgs = doc.organizations().out('array');
        orgs.forEach(org => {
          entities.push({
            text: org,
            type: 'ORGANIZATION',
            confidence: 0.8,
            properties: {
              category: 'named_entity'
            }
          });
        });
      }

      // Extract locations
      if (extractLocations) {
        const places = doc.places().out('array');
        places.forEach(place => {
          entities.push({
            text: place,
            type: 'LOCATION',
            confidence: 0.8,
            properties: {
              category: 'named_entity'
            }
          });
        });
      }

      // Extract dates
      if (extractDates) {
        const dates = doc.dates().out('array');
        dates.forEach(date => {
          entities.push({
            text: date,
            type: 'DATE',
            confidence: 0.9,
            properties: {
              category: 'temporal'
            }
          });
        });
      }

      // Extract custom patterns
      if (extractCustom) {
        const customEntities = this.extractCustomPatterns(text);
        entities.push(...customEntities);
      }

      // Extract concepts and topics
      const concepts = this.extractConcepts(doc);
      entities.push(...concepts);

      // Extract nouns as potential entities
      const nouns = doc.nouns().out('array');
      nouns.forEach(noun => {
        if (noun.length > 2 && !entities.some(e => e.text === noun)) {
          entities.push({
            text: noun,
            type: 'CONCEPT',
            confidence: 0.6,
            properties: {
              category: 'noun_phrase'
            }
          });
        }
      });

      // Filter by confidence
      const filtered = entities.filter(e => e.confidence >= minConfidence);

      // Deduplicate
      const deduplicated = this.deduplicateEntities(filtered);

      logger.info(`Extracted ${deduplicated.length} entities`);
      return deduplicated;

    } catch (error) {
      logger.error('Entity extraction error:', error);
      throw error;
    }
  }

  /**
   * Extract custom pattern-based entities
   */
  extractCustomPatterns(text) {
    const entities = [];

    // Extract emails
    const emails = text.match(this.entityPatterns.email) || [];
    emails.forEach(email => {
      entities.push({
        text: email,
        type: 'EMAIL',
        confidence: 0.95,
        properties: {
          category: 'contact'
        }
      });
    });

    // Extract URLs
    const urls = text.match(this.entityPatterns.url) || [];
    urls.forEach(url => {
      entities.push({
        text: url,
        type: 'URL',
        confidence: 0.95,
        properties: {
          category: 'reference'
        }
      });
    });

    // Extract phone numbers
    const phones = text.match(this.entityPatterns.phone) || [];
    phones.forEach(phone => {
      entities.push({
        text: phone,
        type: 'PHONE',
        confidence: 0.9,
        properties: {
          category: 'contact'
        }
      });
    });

    return entities;
  }

  /**
   * Extract concepts and topics
   */
  extractConcepts(doc) {
    const concepts = [];

    // Extract topics (capitalized phrases)
    const topics = doc.topics().out('array');
    topics.forEach(topic => {
      concepts.push({
        text: topic,
        type: 'TOPIC',
        confidence: 0.7,
        properties: {
          category: 'concept'
        }
      });
    });

    // Extract noun phrases
    const phrases = doc.match('#Adjective? #Noun+').out('array');
    phrases.forEach(phrase => {
      if (phrase.length > 3) {
        concepts.push({
          text: phrase,
          type: 'CONCEPT',
          confidence: 0.65,
          properties: {
            category: 'noun_phrase'
          }
        });
      }
    });

    return concepts;
  }

  /**
   * Deduplicate entities
   */
  deduplicateEntities(entities) {
    const unique = new Map();

    for (const entity of entities) {
      const normalizedText = entity.text.toLowerCase().trim();

      if (!unique.has(normalizedText)) {
        unique.set(normalizedText, entity);
      } else {
        // Keep entity with higher confidence
        const existing = unique.get(normalizedText);
        if (entity.confidence > existing.confidence) {
          unique.set(normalizedText, entity);
        }
      }
    }

    return Array.from(unique.values());
  }

  /**
   * Enrich entities with additional properties
   */
  async enrichEntities(entities, text) {
    const enriched = [];

    for (const entity of entities) {
      const enrichedEntity = { ...entity };

      // Add context
      enrichedEntity.properties.context = this.extractContext(entity.text, text);

      // Add frequency
      enrichedEntity.properties.frequency = this.calculateFrequency(entity.text, text);

      // Add sentiment if available
      enrichedEntity.properties.sentiment = this.analyzeSentiment(entity.text, text);

      enriched.push(enrichedEntity);
    }

    return enriched;
  }

  /**
   * Extract context around entity
   */
  extractContext(entityText, fullText, windowSize = 50) {
    const index = fullText.toLowerCase().indexOf(entityText.toLowerCase());

    if (index === -1) return '';

    const start = Math.max(0, index - windowSize);
    const end = Math.min(fullText.length, index + entityText.length + windowSize);

    return fullText.substring(start, end);
  }

  /**
   * Calculate entity frequency
   */
  calculateFrequency(entityText, text) {
    const regex = new RegExp(entityText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Analyze sentiment around entity
   */
  analyzeSentiment(entityText, text) {
    const context = this.extractContext(entityText, text, 100);
    const doc = compromise(context);

    // Simple sentiment analysis
    const positiveWords = doc.match('#Positive').out('array').length;
    const negativeWords = doc.match('#Negative').out('array').length;

    if (positiveWords > negativeWords) return 'positive';
    if (negativeWords > positiveWords) return 'negative';
    return 'neutral';
  }

  /**
   * Extract entities with relationships
   */
  async extractWithRelationships(text, options = {}) {
    const entities = await this.extract(text, options);
    const enriched = await this.enrichEntities(entities, text);

    return {
      entities: enriched,
      text,
      metadata: {
        entityCount: enriched.length,
        typeDistribution: this.getTypeDistribution(enriched),
        extractedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get type distribution
   */
  getTypeDistribution(entities) {
    const distribution = {};

    for (const entity of entities) {
      distribution[entity.type] = (distribution[entity.type] || 0) + 1;
    }

    return distribution;
  }
}
