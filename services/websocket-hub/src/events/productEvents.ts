import { z } from 'zod';
import { ProductEvent, ProductEventChannel, ProductEventPayload, SystemEvent } from '../types';

export const PRODUCT_EVENT_CHANNELS = [
  'lead:updates',
  'hotlead:alerts',
  'quote:viewed',
  'quote:lock_expiring',
  'campaign:reply',
  'campaign:blocked',
  'pipeline:milestone',
  'service:health',
] as const satisfies readonly ProductEventChannel[];

const productEventSchema = z.object({
  type: z.enum(PRODUCT_EVENT_CHANNELS),
  source: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  correlationId: z.string().min(1),
  traceId: z.string().min(1).optional(),
  state: z.string().min(1),
  mode: z.enum(['live', 'mock']).default('live'),
  data: z.record(z.string(), z.unknown()).default({}),
});

export type ProductEventInput = z.input<typeof productEventSchema>;

export function parseProductEvent(input: unknown): ProductEvent {
  const parsed = productEventSchema.parse(input);

  return {
    ...parsed,
    timestamp: parsed.timestamp ?? new Date().toISOString(),
    data: parsed.data as ProductEventPayload,
  };
}

export function isProductEventChannel(channel: string): channel is ProductEventChannel {
  return PRODUCT_EVENT_CHANNELS.includes(channel as ProductEventChannel);
}

export function toSystemEvent(event: ProductEvent): SystemEvent {
  return {
    type: event.type,
    source: event.source,
    timestamp: event.timestamp,
    correlationId: event.correlationId,
    traceId: event.traceId,
    state: event.state,
    mode: event.mode,
    data: event.data,
  };
}
