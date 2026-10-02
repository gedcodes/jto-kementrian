module.exports = {
    apps: [
        {
            name: 'jto-backend',
            script: './api/api.js',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
