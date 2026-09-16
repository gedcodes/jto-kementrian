const { sequelize } = require('../api/models');
const cron = require('node-cron');

const MVRefreshService = {
    isRunning: false,
    jobs: new Map(),
    
    // Konfigurasi MV schedules
    schedules: [
        {
            name: 'mv_wim_status',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wim_status;',
            enabled: true
        },
        {
            name: 'mv_resume_wim_summary',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resume_wim_summary;',
            enabled: true
        },
        {
            name: 'mv_resume_masuk_uppkb_summary',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resume_masuk_uppkb_summary;',
            enabled: true
        },
        {
            name: 'mv_resume_vr_summary',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resume_vr_summary;',
            enabled: true
        },
        {
            name: 'mv_hourly_wim_traffic',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_wim_traffic;',
            enabled: true
        },
        {
            name: 'mv_heatmap_volume_kendaraan',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_heatmap_volume_kendaraan;',
            enabled: true
        },
        {
            name: 'mv_resume_penimbangan',
            schedule: '*/10 * * * *', // Setiap 10 menit
            query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resume_penimbangan;',
            enabled: true
        }
        // Tambahkan MV lain di sini...
    ],

    /**
     * Execute refresh untuk satu MV
     */
    executeRefresh: async function(schedule) {
        const startTime = Date.now();
        
        try {
            console.log(`🔄 Refreshing MV: ${schedule.name}...`);
            
            await sequelize.query(schedule.query);
            
            const duration = Date.now() - startTime;
            console.log(`✅ MV ${schedule.name} refreshed in ${duration}ms`);
            
        } catch (error) {
            console.error(`❌ Failed to refresh MV ${schedule.name}:`, error.message);
        }
    },

    /**
     * Schedule MV refresh
     */
    scheduleMVRefresh: function(schedule) {
        const job = cron.schedule(schedule.schedule, async () => {
            await this.executeRefresh(schedule);
        });

        this.jobs.set(schedule.name, job);
        console.log(`📅 Scheduled MV: ${schedule.name} - ${schedule.schedule}`);
    },

    /**
     * Start MV Refresh Service
     */
    start: function() {
        if (this.isRunning) {
            console.log('⚠️ MV Refresh Service already running');
            return;
        }

        console.log('🔄 Starting MV Refresh Service...');

        this.schedules.forEach(schedule => {
            if (schedule.enabled) {
                this.scheduleMVRefresh(schedule);
            }
        });

        this.isRunning = true;
        console.log('✅ MV Refresh Service started successfully');
        
        // Jalankan sekali di startup
        this.schedules.forEach(async (schedule) => {
            if (schedule.enabled) {
                await this.executeRefresh(schedule);
            }
        });
    },

    /**
     * Stop MV Refresh Service
     */
    stop: function() {
        this.jobs.forEach((job, mvName) => {
            job.stop();
            console.log(`⏹️ Stopped MV: ${mvName}`);
        });
        
        this.jobs.clear();
        this.isRunning = false;
        console.log('🛑 MV Refresh Service stopped');
    },

    /**
     * Manual refresh MV tertentu
     */
    refreshNow: async function(mvName) {
        const schedule = this.schedules.find(s => s.name === mvName);
        if (!schedule) {
            throw new Error(`MV ${mvName} not found in schedules`);
        }

        return await this.executeRefresh(schedule);
    },

    /**
     * Get service status
     */
    getStatus: function() {
        return {
            isRunning: this.isRunning,
            totalSchedules: this.schedules.length,
            enabledSchedules: this.schedules.filter(s => s.enabled).length,
            runningJobs: this.jobs.size
        };
    }
};

module.exports = MVRefreshService;