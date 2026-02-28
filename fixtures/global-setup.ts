/**
 * Global Setup
 * 
 * Runs once before all tests.
 * Used for:
 * - Starting test environment
 * - Creating shared test resources
 * - Setting up global state
 */

async function globalSetup() {
  console.log('🚀 Starting test suite...');
  
  // Ensure auth directory exists
  const fs = require('fs');
  const path = require('path');
  const authDir = path.join(process.cwd(), 'playwright', '.auth');
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
