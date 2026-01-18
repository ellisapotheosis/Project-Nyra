import chalk from 'chalk';

/**
 * Data structure representing a single thought in the reasoning chain
 */
export interface ThoughtData {
  thought: string;
  nextThoughtNeeded: boolean;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

/**
 * Result returned after processing a thought
 */
export interface ThoughtResult {
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  branches: string[];
  thoughtsLength: number;
}

/**
 * Sequential Thinking Server - manages thought chains with revision and branching support
 */
export class SequentialThinkingServer {
  private thoughts: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private disableLogging: boolean;

  constructor() {
    this.disableLogging = process.env.DISABLE_THOUGHT_LOGGING === 'true';
  }

  /**
   * Process a new thought and add it to the reasoning chain
   */
  async processThought(data: ThoughtData): Promise<ThoughtResult> {
    // Validate thought number
    if (data.thoughtNumber < 1) {
      throw new Error('Thought number must be at least 1');
    }

    // Auto-adjust totalThoughts if current thought exceeds it
    if (data.thoughtNumber > data.totalThoughts) {
      data.totalThoughts = data.thoughtNumber;
    }

    // Handle revision validation
    if (data.isRevision && !data.revisesThought) {
      throw new Error('isRevision requires revisesThought to be specified');
    }

    if (data.revisesThought && (data.revisesThought < 1 || data.revisesThought >= data.thoughtNumber)) {
      throw new Error('revisesThought must be between 1 and current thought number - 1');
    }

    // Handle branch tracking
    if (data.branchId && data.branchFromThought) {
      if (!this.branches[data.branchId]) {
        this.branches[data.branchId] = [];
      }
      this.branches[data.branchId].push(data);
    }

    // Add to main thought chain
    this.thoughts.push(data);

    // Format and log the thought (unless disabled)
    if (!this.disableLogging) {
      const formatted = this.formatThought(data);
      console.log(formatted);
    }

    // Return result
    return {
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      branches: Object.keys(this.branches),
      thoughtsLength: this.thoughts.length
    };
  }

  /**
   * Format a thought for display with visual indicators
   */
  private formatThought(data: ThoughtData): string {
    let prefix = '';
    let color = chalk.cyan;

    if (data.isRevision) {
      prefix = '🔄 Revision';
      color = chalk.yellow;
    } else if (data.branchId) {
      prefix = `🌿 Branch [${data.branchId}]`;
      color = chalk.green;
    } else {
      prefix = '💭 Thought';
      color = chalk.cyan;
    }

    const header = color.bold(`${prefix} ${data.thoughtNumber}/${data.totalThoughts}`);
    const thought = chalk.white(data.thought);

    let metadata = '';
    if (data.isRevision && data.revisesThought) {
      metadata = chalk.gray(`  └─ Revises thought ${data.revisesThought}`);
    } else if (data.branchFromThought) {
      metadata = chalk.gray(`  └─ Branches from thought ${data.branchFromThought}`);
    }

    return `${header}\n${thought}${metadata ? '\n' + metadata : ''}`;
  }

  /**
   * Get the complete thought history
   */
  getThoughts(): ThoughtData[] {
    return [...this.thoughts];
  }

  /**
   * Get thoughts for a specific branch
   */
  getBranch(branchId: string): ThoughtData[] | undefined {
    return this.branches[branchId] ? [...this.branches[branchId]] : undefined;
  }

  /**
   * Get all branch IDs
   */
  getBranches(): string[] {
    return Object.keys(this.branches);
  }

  /**
   * Clear all thoughts and branches (useful for testing)
   */
  clear(): void {
    this.thoughts = [];
    this.branches = {};
  }
}
