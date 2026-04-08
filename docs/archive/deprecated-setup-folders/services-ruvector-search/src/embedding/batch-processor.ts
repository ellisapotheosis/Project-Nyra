/**
 * Batch Embedding Processor
 * Handles large-scale embedding generation with queuing and rate limiting
 */

import Bull, { Queue, Job } from 'bull';
import pino from 'pino';
import { EmbeddingService } from './embedding-service';
import { BatchEmbeddingJob, EmbeddingProvider, EmbeddingResponse } from '../types';

const logger = pino({ name: 'batch-processor' });

interface BatchJobData {
  jobId: string;
  texts: string[];
  provider: EmbeddingProvider;
  model?: string;
}

export class BatchEmbeddingProcessor {
  private queue: Queue<BatchJobData>;
  private jobs: Map<string, BatchEmbeddingJob> = new Map();

  constructor(
    private embeddingService: EmbeddingService,
    private config: {
      redisHost: string;
      redisPort: number;
      concurrency?: number;
      maxRetries?: number;
      retryDelay?: number;
    }
  ) {
    this.queue = new Bull('embedding-jobs', {
      redis: {
        host: config.redisHost,
        port: config.redisPort,
      },
      defaultJobOptions: {
        attempts: config.maxRetries || 3,
        backoff: {
          type: 'exponential',
          delay: config.retryDelay || 1000,
        },
      },
    });

    this.setupProcessors();
  }

  private setupProcessors(): void {
    this.queue.process(
      this.config.concurrency || 5,
      async (job: Job<BatchJobData>) => {
        return await this.processJob(job);
      }
    );

    this.queue.on('completed', (job: Job<BatchJobData>, result: EmbeddingResponse) => {
      logger.info({ jobId: job.data.jobId }, 'Batch job completed');
      this.updateJobStatus(job.data.jobId, 'completed', result);
    });

    this.queue.on('failed', (job: Job<BatchJobData>, err: Error) => {
      logger.error({ jobId: job.data.jobId, error: err.message }, 'Batch job failed');
      this.updateJobStatus(job.data.jobId, 'failed', undefined, err.message);
    });

    this.queue.on('progress', (job: Job<BatchJobData>, progress: number) => {
      this.updateJobProgress(job.data.jobId, progress);
    });

    logger.info('Batch processor initialized');
  }

  async submitBatch(
    texts: string[],
    provider: EmbeddingProvider,
    model?: string
  ): Promise<string> {
    const jobId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const batchJob: BatchEmbeddingJob = {
      id: jobId,
      texts,
      provider,
      model,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.set(jobId, batchJob);

    await this.queue.add({
      jobId,
      texts,
      provider,
      model,
    });

    logger.info({ jobId, count: texts.length, provider }, 'Batch job submitted');
    return jobId;
  }

  private async processJob(job: Job<BatchJobData>): Promise<EmbeddingResponse> {
    const { jobId, texts, provider, model } = job.data;

    logger.debug({ jobId, count: texts.length }, 'Processing batch job');
    this.updateJobStatus(jobId, 'processing');

    // Process in chunks to show progress
    const chunkSize = 100;
    const allEmbeddings: number[][] = [];
    let totalTokens = 0;

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);

      const response = await this.embeddingService.embed({
        text: chunk,
        provider,
        model,
      });

      allEmbeddings.push(...response.embeddings);
      totalTokens += response.tokensUsed || 0;

      const progress = Math.round(((i + chunk.length) / texts.length) * 100);
      await job.progress(progress);
    }

    const result: EmbeddingResponse = {
      embeddings: allEmbeddings,
      model: model || 'default',
      provider,
      dimensions: allEmbeddings[0]?.length || 0,
      tokensUsed: totalTokens,
    };

    return result;
  }

  private updateJobStatus(
    jobId: string,
    status: BatchEmbeddingJob['status'],
    result?: EmbeddingResponse,
    error?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = status;
    if (result) job.result = result;
    if (error) job.error = error;
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date();
    }

    this.jobs.set(jobId, job);
  }

  private updateJobProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress = progress;
    this.jobs.set(jobId, job);
  }

  getJobStatus(jobId: string): BatchEmbeddingJob | undefined {
    return this.jobs.get(jobId);
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Queue resumed');
  }

  async clearCompleted(): Promise<void> {
    await this.queue.clean(0, 'completed');

    // Clean up completed jobs from memory
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.completedAt) {
        const age = Date.now() - job.completedAt.getTime();
        if (age > 3600000) { // 1 hour
          this.jobs.delete(jobId);
        }
      }
    }

    logger.info('Completed jobs cleared');
  }

  async close(): Promise<void> {
    await this.queue.close();
    this.jobs.clear();
    logger.info('Batch processor closed');
  }
}
