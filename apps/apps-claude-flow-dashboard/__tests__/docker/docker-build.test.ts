import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

describe('Dashboard Docker Build', () => {
  const projectRoot = path.resolve(__dirname, '../../');
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');

  it('should build Docker image without errors', () => {
    const buildCommand = `docker build -t claude-flow-dashboard:test ${projectRoot}`;
    
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
    expect(dockerfileContent).toContain('EXPOSE 3003');
  });

  it('should create an image under 500MB', () => {
    const sizeCommand = `docker images claude-flow-dashboard:test --format "{{.Size}}"`;
    
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
    const runCommand = `docker run -d --name test-dashboard -p 3003:3003 claude-flow-dashboard:test`;
    const healthCheckCommand = `docker exec test-dashboard curl -f http://localhost:3003/health || exit 1`;
    const cleanupCommand = `docker stop test-dashboard && docker rm test-dashboard`;

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
