const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

// Load .env then .env.local (local overrides base)
['.env', '.env.local'].forEach(name => {
    const file = path.resolve(__dirname, name);
    if (fs.existsSync(file)) {
        fs.readFileSync(file, 'utf8').split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) process.env[match[1].trim()] = match[2].trim();
        });
    }
});

module.exports = {
    ...defaultConfig,
    entry: {
        index: './src/index.js',
        admin: './src/admin/SettingsApp.jsx',
        onboarding: './src/onboarding/OnboardingApp.jsx',
    },
    plugins: [
        ...defaultConfig.plugins,
        new webpack.DefinePlugin({
            // All replaced at build time — no process reference reaches the browser.
            'process.env.MEDIALUME_POLLINATIONS_CLIENT_ID': JSON.stringify(
                process.env.MEDIALUME_POLLINATIONS_CLIENT_ID || ''
            ),
            'process.env.MEDIALUME_API_URL': JSON.stringify(
                process.env.MEDIALUME_API_URL || 'http://localhost:3000'
            ),
            'process.env.MEDIALUME_API_KEY': JSON.stringify(
                process.env.MEDIALUME_API_KEY || ''
            ),
            'process.env.MEDIALUME_MIDDLEWARE_URL': JSON.stringify(
                process.env.MEDIALUME_MIDDLEWARE_URL || 'https://api.medialume.com'
            ),
        }),
    ],
};
