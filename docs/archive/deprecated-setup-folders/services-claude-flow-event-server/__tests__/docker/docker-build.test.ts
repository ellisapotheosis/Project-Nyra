import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

describe('Event Server Docker Build', () => {
  const projectRoot = path.resolve(__dirname, '../../');
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');

  it('should build Docker image without errors', () => {
    const buildCommand = `docker build -t claude-flow-event-server:test ${projectRoot}`;
    
    try {
      const output = execSync(buildCommand, { encoding: 'utf-8' });
      expect(output).toBeTruthy();
    } catch (error) {
      console.error('Docker build failed:', error);
      throw error;
    }
  });

  it('should have a valid Dockerfile', () => {
    // Verify Dockerfile exists
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    expect(dockerfileContent).toBeTruthy();

    // Basic Dockerfile checks
    expect(dockerfileContent).toContain('FROM node:');
    expect(dockerfileContent).toContain('WORKDIR /app');
    expect(dockerfileContent).toContain('COPY package.json');
    expect(dockerfileContent).toContain('RUN npm install');
    expect(dockerfileContent).toContain('EXPOSE 3004');
  });

  it('should create an image under 500MB', () => {
    const sizeCommand = `docker images claude-flow-event-server:test --format "{{.Size}}"`;
    
    try {
      const size = execSync(sizeCommand, { encoding: 'utf-8' }).trim();
      const sizeInMB = parseFloat(size.replace(/[^\d.]/g, ''));
      
      expect(sizeInMB).toBeLessThan(500);
    } catch (error) {
      console.error('Failed to get image size:', error);
      throw error;
    }
  });

  it('should run container and verify health', () => {
    const runCommand = `docker run -d --name test-event-server -p 3004:3004 claude-flow-event-server:test`;
    const healthCheckCommand = `docker exec test-event-server curl -f http://localhost:3004/health || exit 1`;
    const cleanupCommand = `docker stop test-event-server && docker rm test-event-server`;

    try {
      // Run container
      execSync(runCommand, { encoding: 'utf-8' });

      // Wait a bit for container to start
      execSync('sleep 5', { encoding: 'utf-8' });

      // Check health endpoint
      const healthCheck = execSync(healthCheckCommand, { encoding: 'utf-8' });
      expect(healthCheck).toBeTruthy();
    } catch (error) {
      console.error('Container health check failed:', error);
      // Attempt cleanup even if test fails
      try {
        execSync(cleanupCommand);
      } catch {}
      throw error;
    } finally {
      // Cleanup container
      try {
        execSync(cleanupCommand);
      } catch {}
    }
  });
});
