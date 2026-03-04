#!/usr/bin/env node
/**
 * Agentic Jujutsu Setup Script for Project Nyra
 * Initializes self-learning version control with ReasoningBank
 */

const { JjWrapper } = require('agentic-jujutsu');

async function setupAgenticJujutsu() {
    console.log('🚀 Setting up Agentic Jujutsu for Project Nyra...\n');

    const jj = new JjWrapper();

    try {
        // Initialize learning trajectory
        console.log('📚 Starting learning trajectory...');
        const trajectoryId = jj.startTrajectory('Initialize agentic-jujutsu for Project Nyra');

        // Check status
        console.log('📊 Checking repository status...');
        const status = await jj.status();
        console.log('Status:', status.success ? '✅ Ready' : '⚠️ Needs attention');

        // Get initial stats
        console.log('\n📈 Initial Statistics:');
        const stats = JSON.parse(jj.getStats());
        console.log(`  Total operations: ${stats.total_operations}`);
        console.log(`  Success rate: ${(stats.success_rate * 100).toFixed(1)}%`);

        // Record operations
        jj.addToTrajectory();

        // Finalize setup
        jj.finalizeTrajectory(1.0, 'Agentic Jujutsu successfully initialized with ReasoningBank learning');

        console.log('\n✅ Setup Complete!\n');
        console.log('📖 Key Features Enabled:');
        console.log('  ✓ Self-learning AI with ReasoningBank');
        console.log('  ✓ Lock-free concurrent commits (23x faster)');
        console.log('  ✓ Automatic conflict resolution (87% success)');
        console.log('  ✓ Quantum-resistant security');
        console.log('  ✓ Multi-agent coordination');
        console.log('  ✓ Pattern discovery and suggestions');

        console.log('\n🎯 Next Steps:');
        console.log('  1. Use jj.startTrajectory(task) before major work');
        console.log('  2. Let agents work concurrently without locks');
        console.log('  3. Call jj.finalizeTrajectory(score) to record learning');
        console.log('  4. Use jj.getSuggestion(task) for AI recommendations');

        console.log('\n📚 Examples:');
        console.log('  const jj = new JjWrapper();');
        console.log('  jj.startTrajectory("Add authentication feature");');
        console.log('  await jj.newCommit("Add JWT auth");');
        console.log('  jj.addToTrajectory();');
        console.log('  jj.finalizeTrajectory(0.9, "Feature complete");');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
if (require.main === module) {
    setupAgenticJujutsu().catch(console.error);
}

module.exports = { setupAgenticJujutsu };
