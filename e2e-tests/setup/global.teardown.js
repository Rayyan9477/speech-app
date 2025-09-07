const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Calculate total test time
  if (global.__E2E_START_TIME__) {
    const totalTime = Date.now() - global.__E2E_START_TIME__;
    console.log(`📊 Total E2E test execution time: ${totalTime}ms`);
  }
  
  // Clean up temporary files if needed
  try {
    const tempDir = path.join(__dirname, '..', 'temp');
    const exists = await fs.access(tempDir).then(() => true).catch(() => false);
    
    if (exists) {
      await fs.rmdir(tempDir, { recursive: true });
      console.log('🗑️  Cleaned up temporary files');
    }
  } catch (error) {
    console.warn('Warning: Could not clean up temporary files:', error.message);
  }
  
  // Log test completion
  console.log('✅ E2E test environment cleanup complete');
};