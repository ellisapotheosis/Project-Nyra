import natural from 'natural';
import { logger } from '../utils/logger.js';

/**
 * Relationship Inference Engine
 * Infers relationships between entities based on context and patterns
 */
export class RelationshipInference {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.tfidf = new natural.TfIdf();

    // Common relationship patterns
    this.patterns = {
      ownership: ['has', 'owns', 'possesses', 'belongs to'],
      association: ['works with', 'associated with', 'related to', 'connected to'],
      hierarchy: ['manages', 'reports to', 'supervises', 'leads'],
      temporal: ['before', 'after', 'during', 'since', 'until'],
      spatial: ['near', 'at', 'in', 'located', 'based in'],
      causation: ['causes', 'results in', 'leads to', 'triggers'],
      attribution: ['created by', 'developed by', 'authored by', 'made by']
    };

    // Co-occurrence window size
    this.windowSize = 50;
  }

  /**
   * Infer relationships between entities
   */
  async inferRelationships(entities, text) {
    logger.info(`Inferring relationships for ${entities.length} entities`);

    const relationships = [];
    const entityPositions = this.findEntityPositions(entities, text);

    // Co-occurrence based inference
    const cooccurrences = this.findCooccurrences(entityPositions);

    for (const cooccur of cooccurrences) {
      const relationship = await this.inferRelationshipType(
        cooccur.entity1,
        cooccur.entity2,
        cooccur.context,
        text
      );

      if (relationship) {
        relationships.push(relationship);
      }
    }

    // Pattern-based inference
    const patternRelationships = this.inferFromPatterns(entities, text);
    relationships.push(...patternRelationships);

    // Semantic similarity inference
    const similarityRelationships = this.inferFromSimilarity(entities);
    relationships.push(...similarityRelationships);

    // Remove duplicates
    const uniqueRelationships = this.deduplicateRelationships(relationships);

    logger.info(`Inferred ${uniqueRelationships.length} relationships`);
    return uniqueRelationships;
  }

  /**
   * Find entity positions in text
   */
  findEntityPositions(entities, text) {
    const positions = [];

    for (const entity of entities) {
      const regex = new RegExp(entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        positions.push({
          entity,
          start: match.index,
          end: match.index + entity.text.length,
          text: entity.text
        });
      }
    }

    return positions.sort((a, b) => a.start - b.start);
  }

  /**
   * Find co-occurring entities within window
   */
  findCooccurrences(entityPositions) {
    const cooccurrences = [];

    for (let i = 0; i < entityPositions.length; i++) {
      for (let j = i + 1; j < entityPositions.length; j++) {
        const distance = entityPositions[j].start - entityPositions[i].end;

        if (distance <= this.windowSize) {
          cooccurrences.push({
            entity1: entityPositions[i].entity,
            entity2: entityPositions[j].entity,
            distance,
            context: {
              start: entityPositions[i].start,
              end: entityPositions[j].end
            }
          });
        } else {
          break; // Entities are sorted, no need to continue
        }
      }
    }

    return cooccurrences;
  }

  /**
   * Infer relationship type from context
   */
  async inferRelationshipType(entity1, entity2, context, fullText) {
    const contextText = fullText.substring(context.start, context.end).toLowerCase();

    // Check for explicit relationship patterns
    for (const [relType, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (contextText.includes(pattern)) {
          return {
            source: entity1.id || entity1.text,
            target: entity2.id || entity2.text,
            type: relType.toUpperCase(),
            confidence: 0.8,
            evidence: contextText,
            pattern
          };
        }
      }
    }

    // Default to association if entities co-occur
    return {
      source: entity1.id || entity1.text,
      target: entity2.id || entity2.text,
      type: 'RELATED_TO',
      confidence: 0.5,
      evidence: contextText
    };
  }

  /**
   * Infer relationships from linguistic patterns
   */
  inferFromPatterns(entities, text) {
    const relationships = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();

      // Find entities in this sentence
      const entitiesInSentence = entities.filter(entity =>
        sentenceLower.includes(entity.text.toLowerCase())
      );

      if (entitiesInSentence.length >= 2) {
        // Check for verb phrases between entities
        const tokens = this.tokenizer.tokenize(sentenceLower);
        const pos = this.simplePOSTag(tokens);

        // Look for subject-verb-object patterns
        for (let i = 0; i < entitiesInSentence.length - 1; i++) {
          for (let j = i + 1; j < entitiesInSentence.length; j++) {
            const verb = this.findVerbBetween(
              entitiesInSentence[i].text,
              entitiesInSentence[j].text,
              tokens,
              pos
            );

            if (verb) {
              relationships.push({
                source: entitiesInSentence[i].id || entitiesInSentence[i].text,
                target: entitiesInSentence[j].id || entitiesInSentence[j].text,
                type: this.verbToRelationType(verb),
                confidence: 0.7,
                evidence: sentence,
                verb
              });
            }
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Infer relationships from semantic similarity
   */
  inferFromSimilarity(entities) {
    const relationships = [];

    // Group entities by type
    const entityGroups = new Map();

    for (const entity of entities) {
      if (!entityGroups.has(entity.type)) {
        entityGroups.set(entity.type, []);
      }
      entityGroups.get(entity.type).push(entity);
    }

    // Entities of same type are related
    for (const [type, group] of entityGroups.entries()) {
      if (group.length >= 2) {
        for (let i = 0; i < group.length - 1; i++) {
          for (let j = i + 1; j < group.length; j++) {
            relationships.push({
              source: group[i].id || group[i].text,
              target: group[j].id || group[j].text,
              type: 'SAME_TYPE',
              confidence: 0.6,
              evidence: `Both entities are of type ${type}`
            });
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Simple POS tagging
   */
  simplePOSTag(tokens) {
    // Simplified POS tagging based on common patterns
    const pos = [];

    for (const token of tokens) {
      if (['is', 'are', 'was', 'were', 'has', 'have', 'had'].includes(token)) {
        pos.push('VERB');
      } else if (token.endsWith('ing') || token.endsWith('ed')) {
        pos.push('VERB');
      } else {
        pos.push('NOUN');
      }
    }

    return pos;
  }

  /**
   * Find verb between two entities
   */
  findVerbBetween(entity1, entity2, tokens, pos) {
    const text = tokens.join(' ');
    const e1Index = text.indexOf(entity1.toLowerCase());
    const e2Index = text.indexOf(entity2.toLowerCase());

    if (e1Index === -1 || e2Index === -1) return null;

    const start = Math.min(e1Index, e2Index);
    const end = Math.max(e1Index, e2Index);

    for (let i = 0; i < tokens.length; i++) {
      if (pos[i] === 'VERB') {
        const tokenPosition = text.indexOf(tokens[i]);
        if (tokenPosition > start && tokenPosition < end) {
          return tokens[i];
        }
      }
    }

    return null;
  }

  /**
   * Convert verb to relationship type
   */
  verbToRelationType(verb) {
    const verbMap = {
      'owns': 'OWNS',
      'has': 'HAS',
      'manages': 'MANAGES',
      'leads': 'LEADS',
      'creates': 'CREATES',
      'develops': 'DEVELOPS',
      'uses': 'USES',
      'provides': 'PROVIDES'
    };

    return verbMap[verb] || 'RELATED_TO';
  }

  /**
   * Remove duplicate relationships
   */
  deduplicateRelationships(relationships) {
    const unique = new Map();

    for (const rel of relationships) {
      const key = `${rel.source}-${rel.type}-${rel.target}`;

      if (!unique.has(key) || unique.get(key).confidence < rel.confidence) {
        unique.set(key, rel);
      }
    }

    return Array.from(unique.values());
  }

  /**
   * Calculate relationship confidence score
   */
  calculateConfidence(relationship, evidence) {
    let confidence = 0.5; // Base confidence

    // Boost confidence for explicit patterns
    if (relationship.pattern) {
      confidence += 0.3;
    }

    // Boost for strong evidence
    if (evidence && evidence.length > 20) {
      confidence += 0.1;
    }

    // Boost for entity types compatibility
    if (this.areTypesCompatible(relationship.source, relationship.target)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Check if entity types are compatible for relationship
   */
  areTypesCompatible(source, target) {
    // Define compatible type pairs
    const compatiblePairs = [
      ['PERSON', 'ORGANIZATION'],
      ['PERSON', 'LOCATION'],
      ['ORGANIZATION', 'LOCATION'],
      ['PRODUCT', 'ORGANIZATION']
    ];

    return compatiblePairs.some(pair =>
      (pair.includes(source) && pair.includes(target))
    );
  }
}
