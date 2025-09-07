#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { promisify } = require('util');

// Server configurations
const servers = [
  {
    name: 'Frontend',
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    timeout: 10000,
    required: true
  },
  {
    name: 'Backend API',
    url: process.env.BACKEND_URL || 'http://localhost:8000',
    timeout: 10000,
    required: true
  },
  {
    name: 'Mobile (Expo Web)',
    url: process.env.MOBILE_URL || 'http://localhost:19006',
    timeout: 10000,
    required: false
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function checkServer(server) {
  return new Promise((resolve) => {
    const url = new URL(server.url);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/',
      method: 'HEAD',
      timeout: server.timeout
    };

    const startTime = Date.now();
    
    const req = httpModule.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      
      resolve({
        name: server.name,
        url: server.url,
        status: 'online',
        statusCode: res.statusCode,
        responseTime,
        required: server.required
      });
    });

    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      
      resolve({
        name: server.name,
        url: server.url,
        status: 'offline',
        error: err.code || err.message,
        responseTime,
        required: server.required
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      
      resolve({
        name: server.name,
        url: server.url,
        status: 'timeout',
        error: 'Request timeout',
        responseTime,
        required: server.required
      });
    });

    req.end();
  });
}

async function waitForServer(server, maxAttempts = 30, delay = 2000) {
  console.log(colorize(`Waiting for ${server.name} at ${server.url}...`, 'yellow'));
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkServer(server);
    
    if (result.status === 'online' && (result.statusCode < 400 || result.statusCode === 404)) {
      console.log(colorize(`✅ ${server.name} is ready (${result.responseTime}ms)`, 'green'));
      return true;
    }
    
    if (attempt === maxAttempts) {
      console.log(colorize(`❌ ${server.name} failed to start after ${maxAttempts} attempts`, 'red'));
      return false;
    }
    
    process.stdout.write(colorize(`.`, 'yellow'));
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return false;
}

async function checkAllServers() {
  console.log(colorize('\n🔍 Checking server availability...', 'cyan'));
  console.log(colorize('=====================================\n', 'cyan'));

  const results = await Promise.all(servers.map(checkServer));
  
  // Display results
  results.forEach(result => {
    const statusSymbol = result.status === 'online' ? '✅' : '❌';
    const statusColor = result.status === 'online' ? 'green' : 'red';
    const requiredText = result.required ? '(required)' : '(optional)';
    
    console.log(`${statusSymbol} ${colorize(result.name, 'bright')}: ${colorize(result.status.toUpperCase(), statusColor)} ${requiredText}`);
    console.log(`   URL: ${result.url}`);
    
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${colorize(result.error, 'red')}`);
    }
    
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log('');
  });

  // Check if all required servers are online
  const requiredServers = results.filter(r => r.required);
  const offlineRequired = requiredServers.filter(r => r.status !== 'online');
  
  if (offlineRequired.length > 0) {
    console.log(colorize('❌ Some required servers are offline:', 'red'));
    offlineRequired.forEach(server => {
      console.log(`   - ${server.name}: ${server.status}`);
    });
    
    if (process.argv.includes('--wait')) {
      console.log(colorize('\n⏳ Waiting for required servers to start...', 'yellow'));
      
      const waitPromises = offlineRequired.map(server => 
        waitForServer(servers.find(s => s.name === server.name))
      );
      
      const waitResults = await Promise.all(waitPromises);
      const stillOffline = waitResults.filter(r => !r);
      
      if (stillOffline.length > 0) {
        console.log(colorize('\n❌ Failed to start required servers. Tests cannot run.', 'red'));
        process.exit(1);
      } else {
        console.log(colorize('\n✅ All required servers are now online!', 'green'));
      }
    } else {
      console.log(colorize('\n❌ Tests cannot run without required servers.', 'red'));
      console.log(colorize('Use --wait flag to wait for servers to start.', 'yellow'));
      process.exit(1);
    }
  } else {
    console.log(colorize('✅ All required servers are online!', 'green'));
    
    const optionalOffline = results.filter(r => !r.required && r.status !== 'online');
    if (optionalOffline.length > 0) {
      console.log(colorize('\n⚠️  Optional servers offline:', 'yellow'));
      optionalOffline.forEach(server => {
        console.log(`   - ${server.name}: ${server.status}`);
      });
    }
  }

  return results;
}

// Health check with retries for CI environments
async function healthCheck() {
  console.log(colorize('\n🏥 Running health check...', 'magenta'));
  
  const healthEndpoints = [
    {
      name: 'Frontend Health',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/health`,
      optional: true
    },
    {
      name: 'Backend Health',
      url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/health`,
      optional: true
    }
  ];

  for (const endpoint of healthEndpoints) {
    try {
      const result = await checkServer({
        name: endpoint.name,
        url: endpoint.url,
        timeout: 5000,
        required: !endpoint.optional
      });
      
      if (result.status === 'online') {
        console.log(colorize(`✅ ${endpoint.name}: Healthy`, 'green'));
      } else {
        console.log(colorize(`⚠️  ${endpoint.name}: No health endpoint`, 'yellow'));
      }
    } catch (error) {
      console.log(colorize(`⚠️  ${endpoint.name}: No health endpoint`, 'yellow'));
    }
  }
}

// Performance check
async function performanceCheck() {
  console.log(colorize('\n⚡ Running performance check...', 'blue'));
  
  const performanceThresholds = {
    acceptable: 1000,
    good: 500,
    excellent: 200
  };

  const results = await Promise.all(servers.map(async (server) => {
    if (server.required) {
      const result = await checkServer(server);
      return { ...server, ...result };
    }
    return null;
  }));

  results.filter(Boolean).forEach(result => {
    let performanceLevel = 'poor';
    let color = 'red';
    
    if (result.responseTime <= performanceThresholds.excellent) {
      performanceLevel = 'excellent';
      color = 'green';
    } else if (result.responseTime <= performanceThresholds.good) {
      performanceLevel = 'good';
      color = 'green';
    } else if (result.responseTime <= performanceThresholds.acceptable) {
      performanceLevel = 'acceptable';
      color = 'yellow';
    }
    
    console.log(`🎯 ${result.name}: ${result.responseTime}ms (${colorize(performanceLevel, color)})`);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  try {
    // Check basic server availability
    const results = await checkAllServers();
    
    // Run additional checks if requested
    if (args.includes('--health')) {
      await healthCheck();
    }
    
    if (args.includes('--performance')) {
      await performanceCheck();
    }
    
    // Generate report for CI
    if (args.includes('--ci-report')) {
      const report = {
        timestamp: new Date().toISOString(),
        servers: results,
        summary: {
          total: results.length,
          online: results.filter(r => r.status === 'online').length,
          offline: results.filter(r => r.status !== 'online').length,
          required_online: results.filter(r => r.required && r.status === 'online').length,
          required_total: results.filter(r => r.required).length
        }
      };
      
      console.log(colorize('\n📊 CI Report:', 'cyan'));
      console.log(JSON.stringify(report, null, 2));
    }
    
    console.log(colorize('\n🎉 Server check completed!', 'bright'));
    
  } catch (error) {
    console.error(colorize(`\n💥 Error during server check: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  checkServer,
  waitForServer,
  checkAllServers,
  servers
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  });
}