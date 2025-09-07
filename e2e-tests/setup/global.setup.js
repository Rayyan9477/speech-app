const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up E2E test environment...');
  
  // Ensure screenshots directories exist
  const screenshotDirs = [
    path.join(__dirname, '..', 'screenshots'),
    path.join(__dirname, '..', 'screenshots', 'snapshots'),
    path.join(__dirname, '..', 'screenshots', 'diffs'),
    path.join(__dirname, '..', 'screenshots', 'failures'),
    path.join(__dirname, '..', 'reports')
  ];
  
  for (const dir of screenshotDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.warn(`Warning: Could not create directory ${dir}:`, error.message);
    }
  }
  
  // Set global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.HEADLESS = process.env.HEADLESS || 'true';
  
  // Store start time for performance metrics
  global.__E2E_START_TIME__ = Date.now();
  
  console.log('✅ E2E test environment setup complete');
};