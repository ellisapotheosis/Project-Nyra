/**
 * Performance Benchmarks
 * Measure performance of critical operations
 */

const { performance } = require('perf_hooks');

// Benchmark configuration
const ITERATIONS = 1000;
const WARMUP_ITERATIONS = 100;

/**
 * Run benchmark
 */
async function runBenchmark(name, fn, iterations = ITERATIONS) {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await fn();
  }

  // Actual benchmark
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  // Calculate statistics
  const sorted = times.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    name,
    iterations,
    mean,
    median,
    p95,
    p99,
    min,
    max,
  };
}

/**
 * Format results
 */
function formatResults(results) {
  console.log('\n=== Performance Benchmark Results ===\n');

  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`  Mean:   ${result.mean.toFixed(3)}ms`);
    console.log(`  Median: ${result.median.toFixed(3)}ms`);
    console.log(`  P95:    ${result.p95.toFixed(3)}ms`);
    console.log(`  P99:    ${result.p99.toFixed(3)}ms`);
    console.log(`  Min:    ${result.min.toFixed(3)}ms`);
    console.log(`  Max:    ${result.max.toFixed(3)}ms`);
    console.log('');
  });
}

/**
 * Main benchmarks
 */
async function main() {
  const results = [];

  // JSON parsing
  results.push(await runBenchmark(
    'JSON Parse (small)',
    () => JSON.parse('{"name":"test","value":123}')
  ));

  results.push(await runBenchmark(
    'JSON Parse (large)',
    () => JSON.parse(JSON.stringify(generateLargeObject()))
  ));

  // Object creation
  results.push(await runBenchmark(
    'Object Creation',
    () => ({ name: 'test', value: 123, nested: { a: 1, b: 2 } })
  ));

  // Array operations
  results.push(await runBenchmark(
    'Array Map',
    () => [1, 2, 3, 4, 5].map(x => x * 2)
  ));

  results.push(await runBenchmark(
    'Array Filter',
    () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => x % 2 === 0)
  ));

  // String operations
  results.push(await runBenchmark(
    'String Concatenation',
    () => 'Hello' + ' ' + 'World' + '!'
  ));

  results.push(await runBenchmark(
    'Template Literals',
    () => `Hello ${'World'}!`
  ));

  // Promise operations
  results.push(await runBenchmark(
    'Promise Creation',
    () => new Promise(resolve => resolve(true))
  ));

  results.push(await runBenchmark(
    'Promise.all (3 promises)',
    () => Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ])
  ));

  // Async operations
  results.push(await runBenchmark(
    'Async Function',
    async () => {
      await Promise.resolve();
      return 123;
    }
  ));

  // Format and display results
  formatResults(results);

  // Export to JSON
  const fs = require('fs');
  fs.writeFileSync(
    'performance-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('Results exported to performance-results.json');
}

/**
 * Generate large object for testing
 */
function generateLargeObject() {
  return {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      metadata: {
        createdAt: new Date().toISOString(),
        active: true,
        roles: ['user', 'viewer'],
      },
    })),
  };
}

// Run benchmarks
main().catch(console.error);
