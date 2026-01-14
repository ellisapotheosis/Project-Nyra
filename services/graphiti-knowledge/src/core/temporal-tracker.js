import { formatISO, parseISO, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { logger } from '../utils/logger.js';

/**
 * Temporal Relationship Tracker
 * Manages time-based relationships and historical graph states
 */
export class TemporalTracker {
  constructor() {
    this.entityHistory = new Map();
    this.relationshipHistory = new Map();
    this.snapshots = new Map();
    this.timeIndex = [];
  }

  /**
   * Track entity at a specific timestamp
   */
  async trackEntity(entityId, entityData, timestamp) {
    const timeKey = formatISO(timestamp);

    if (!this.entityHistory.has(entityId)) {
      this.entityHistory.set(entityId, []);
    }

    const history = this.entityHistory.get(entityId);
    history.push({
      timestamp: timeKey,
      data: entityData,
      action: 'create'
    });

    // Update time index
    this.updateTimeIndex(timeKey);

    logger.debug(`Tracked entity ${entityId} at ${timeKey}`);
  }

  /**
   * Track relationship at a specific timestamp
   */
  async trackRelationship(relationshipId, relationshipData, timestamp) {
    const timeKey = formatISO(timestamp);

    if (!this.relationshipHistory.has(relationshipId)) {
      this.relationshipHistory.set(relationshipId, []);
    }

    const history = this.relationshipHistory.get(relationshipId);
    history.push({
      timestamp: timeKey,
      data: relationshipData,
      action: 'create'
    });

    this.updateTimeIndex(timeKey);

    logger.debug(`Tracked relationship ${relationshipId} at ${timeKey}`);
  }

  /**
   * Track changes to entities or relationships
   */
  async trackChange(id, action, data, timestamp) {
    const timeKey = formatISO(timestamp);

    // Try entity history first
    if (this.entityHistory.has(id)) {
      const history = this.entityHistory.get(id);
      history.push({
        timestamp: timeKey,
        data,
        action
      });
    } else if (this.relationshipHistory.has(id)) {
      const history = this.relationshipHistory.get(id);
      history.push({
        timestamp: timeKey,
        data,
        action
      });
    }

    this.updateTimeIndex(timeKey);
  }

  /**
   * Query entities within a time range
   */
  async queryTimeRange(startTime, endTime, entityId = null) {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const results = [];

    const historyMaps = entityId
      ? [[entityId, this.entityHistory.get(entityId)]]
      : Array.from(this.entityHistory.entries());

    for (const [id, history] of historyMaps) {
      if (!history) continue;

      const eventsInRange = history.filter(event => {
        const eventTime = parseISO(event.timestamp);
        return isWithinInterval(eventTime, { start, end });
      });

      if (eventsInRange.length > 0) {
        results.push({
          entityId: id,
          events: eventsInRange
        });
      }
    }

    return results;
  }

  /**
   * Get snapshot of graph state at a specific timestamp
   */
  async getSnapshot(timestamp, entityId = null) {
    const targetTime = parseISO(timestamp);
    const snapshot = {
      timestamp,
      entities: [],
      relationships: []
    };

    // Get entity states at this time
    const entityMaps = entityId
      ? [[entityId, this.entityHistory.get(entityId)]]
      : Array.from(this.entityHistory.entries());

    for (const [id, history] of entityMaps) {
      if (!history) continue;

      // Find latest state before or at target time
      const relevantEvents = history.filter(event => {
        const eventTime = parseISO(event.timestamp);
        return isBefore(eventTime, targetTime) || eventTime.getTime() === targetTime.getTime();
      });

      if (relevantEvents.length > 0) {
        const latestEvent = relevantEvents[relevantEvents.length - 1];

        // Only include if not deleted
        if (latestEvent.action !== 'delete') {
          snapshot.entities.push({
            id,
            ...latestEvent.data,
            lastUpdate: latestEvent.timestamp
          });
        }
      }
    }

    // Get relationship states at this time
    for (const [id, history] of this.relationshipHistory.entries()) {
      const relevantEvents = history.filter(event => {
        const eventTime = parseISO(event.timestamp);
        return isBefore(eventTime, targetTime) || eventTime.getTime() === targetTime.getTime();
      });

      if (relevantEvents.length > 0) {
        const latestEvent = relevantEvents[relevantEvents.length - 1];

        if (latestEvent.action !== 'delete') {
          snapshot.relationships.push({
            id,
            ...latestEvent.data,
            lastUpdate: latestEvent.timestamp
          });
        }
      }
    }

    return snapshot;
  }

  /**
   * Get temporal evolution of an entity
   */
  async getEntityEvolution(entityId) {
    const history = this.entityHistory.get(entityId);

    if (!history) {
      return null;
    }

    return {
      entityId,
      timeline: history.map(event => ({
        timestamp: event.timestamp,
        action: event.action,
        changes: event.data
      })),
      firstSeen: history[0].timestamp,
      lastSeen: history[history.length - 1].timestamp,
      totalEvents: history.length
    };
  }

  /**
   * Get temporal patterns in relationships
   */
  async getTemporalPatterns(timeWindow = '1h') {
    const patterns = {
      frequent: [],
      emerging: [],
      declining: []
    };

    // Analyze relationship creation patterns
    const relationshipsByTime = new Map();

    for (const [id, history] of this.relationshipHistory.entries()) {
      for (const event of history) {
        if (event.action === 'create') {
          const timeKey = event.timestamp.substring(0, 13); // Hour granularity

          if (!relationshipsByTime.has(timeKey)) {
            relationshipsByTime.set(timeKey, []);
          }

          relationshipsByTime.get(timeKey).push({
            id,
            type: event.data.type
          });
        }
      }
    }

    // Identify patterns
    const timeKeys = Array.from(relationshipsByTime.keys()).sort();
    const recentKeys = timeKeys.slice(-5);
    const olderKeys = timeKeys.slice(-10, -5);

    // Calculate relationship type frequencies
    const recentFreq = this.calculateFrequencies(
      recentKeys.flatMap(k => relationshipsByTime.get(k) || [])
    );
    const olderFreq = this.calculateFrequencies(
      olderKeys.flatMap(k => relationshipsByTime.get(k) || [])
    );

    // Identify emerging patterns (increased frequency)
    for (const [type, count] of recentFreq.entries()) {
      const oldCount = olderFreq.get(type) || 0;
      if (count > oldCount * 1.5) {
        patterns.emerging.push({ type, count, growth: count - oldCount });
      }
    }

    // Identify declining patterns
    for (const [type, count] of olderFreq.entries()) {
      const newCount = recentFreq.get(type) || 0;
      if (newCount < count * 0.5) {
        patterns.declining.push({ type, oldCount: count, newCount });
      }
    }

    return patterns;
  }

  /**
   * Create a time-based snapshot for recovery
   */
  async createSnapshot(snapshotId, timestamp = new Date()) {
    const snapshot = await this.getSnapshot(formatISO(timestamp));
    this.snapshots.set(snapshotId, snapshot);

    logger.info(`Created snapshot ${snapshotId} at ${timestamp}`);
    return snapshotId;
  }

  /**
   * Helper: Update time index
   */
  updateTimeIndex(timeKey) {
    if (!this.timeIndex.includes(timeKey)) {
      this.timeIndex.push(timeKey);
      this.timeIndex.sort();
    }
  }

  /**
   * Helper: Calculate type frequencies
   */
  calculateFrequencies(items) {
    const freq = new Map();
    for (const item of items) {
      const type = item.type;
      freq.set(type, (freq.get(type) || 0) + 1);
    }
    return freq;
  }

  /**
   * Get all tracked timestamps
   */
  getTimeIndex() {
    return this.timeIndex;
  }

  /**
   * Clear history before a certain date
   */
  async clearHistoryBefore(timestamp) {
    const cutoffTime = parseISO(timestamp);
    let cleared = 0;

    for (const [id, history] of this.entityHistory.entries()) {
      const filtered = history.filter(event => {
        const eventTime = parseISO(event.timestamp);
        return isAfter(eventTime, cutoffTime);
      });

      cleared += history.length - filtered.length;
      this.entityHistory.set(id, filtered);
    }

    for (const [id, history] of this.relationshipHistory.entries()) {
      const filtered = history.filter(event => {
        const eventTime = parseISO(event.timestamp);
        return isAfter(eventTime, cutoffTime);
      });

      cleared += history.length - filtered.length;
      this.relationshipHistory.set(id, filtered);
    }

    logger.info(`Cleared ${cleared} historical events before ${timestamp}`);
    return cleared;
  }
}
