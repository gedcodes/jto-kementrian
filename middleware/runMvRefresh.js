const { sequelize } = require('../api/models');
const MVRefreshService = require('./mvRefreshServices');

console.log('---------------------::Starting MV Refresh Service::---------------------');
console.log('MV Refresh Service starting at ' + new Date().toISOString());

// Start MV Refresh Service
MVRefreshService.start();

console.log('✅ MV Refresh Service is now running in background');
console.log('📊 Service Status:', MVRefreshService.getStatus());

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MV Refresh Service...');
    MVRefreshService.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down MV Refresh Service...');
    MVRefreshService.stop();
    process.exit(0);
});