#!/usr/bin/env node
/**
 * Reads .env and writes includes/generated-env.php so secrets never live
 * in committed PHP source. Run automatically via prebuild / prestart.
 */
const fs   = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function parseEnv(src) {
    const out = {};
    for (const line of src.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        out[k] = v;
    }
    return out;
}

const envFile = path.join(root, '.env');
const env     = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};

const key = (env.MEDIALUME_POLLINATIONS_CLIENT_ID || '').replace(/'/g, "\\'");

const php = `<?php
// Auto-generated from .env at build time — do not edit or commit this file.
if ( ! defined( 'MEDIALUME_POLLINATIONS_CLIENT_ID' ) ) {
    define( 'MEDIALUME_POLLINATIONS_CLIENT_ID', '${key}' );
}
`;

fs.writeFileSync(path.join(root, 'includes', 'generated-env.php'), php, 'utf8');
console.log('[medialume] Generated includes/generated-env.php');
