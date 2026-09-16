const { sequelize } = require('../api/models');
const { Op } = require('sequelize');
var cron = require('node-cron');
var hrstart = 0; // Fixed: inisialisasi yang benar
var time_str = 5;

const cleanupStuckTransactions = async () => {
    console.log('---------------------::Processing Transaction Cleanup::---------------------');
    console.log('Running stuck transaction cleanup at ' + new Date().toISOString());
    try {
        const result = await sequelize.query(`
            SELECT pid, query, state, state_change 
            FROM pg_stat_activity 
            WHERE state = 'idle in transaction' 
            AND state_change < NOW() - INTERVAL '5 minutes'
        `);
        
        console.log(`Found ${result[0].length} stuck transactions`);
        
        for (const row of result[0]) {
            console.log(`Terminating stuck transaction PID: ${row.pid}, Query: ${row.query}, State Change: ${row.state_change}`);
            await sequelize.query(`SELECT pg_terminate_backend(${row.pid})`);
            console.log(`Successfully terminated PID: ${row.pid}`);
        }
    } catch (error) {
        console.error('Error cleaning up stuck transactions:', error);
    }
};

// Jalankan sekali saat startup
cleanupStuckTransactions();

// Loop Setiap 5 Menit
cron.schedule(`*/${time_str} * * * *`, async () => {
    try {
        console.log(`Running stuck transaction cleanup at ${new Date().toISOString()}`);
        await cleanupStuckTransactions();
    } catch (error) {
        console.log('Error in cron job:', error);
    }
});