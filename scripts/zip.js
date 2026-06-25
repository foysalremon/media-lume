/**
 * Creates the distributable plugin zip at media-lume.zip.
 *
 * Run: npm run zip
 *
 * The zip contains a single top-level `media-lume/` folder (required by
 * WordPress) with forward-slash entry paths (required by the ZIP spec so
 * the archive extracts correctly on Linux/macOS/WP installer).
 */

const { ZipArchive } = require('archiver');
const archiver = (opts) => new ZipArchive(opts);
const fs       = require('fs');
const path     = require('path');

const root   = path.join(__dirname, '..');
const zipOut = path.join(root, 'media-lume.zip');

const included = [
    'build/admin.asset.php',
    'build/admin.js',
    'build/index.asset.php',
    'build/index.css',
    'build/index.js',
    'build/index-rtl.css',
    'build/onboarding.asset.php',
    'build/onboarding.js',
    'includes/class-medialume.php',
    'includes/class-medialume-admin.php',
    'includes/class-medialume-generator.php',
    'includes/class-medialume-onboarding.php',
    'includes/class-medialume-rest.php',
    'includes/class-medialume-settings.php',
    'includes/providers/class-provider-base.php',
    'includes/providers/class-provider-fal-byok.php',
    'includes/providers/class-provider-pollinations.php',
    'languages/media-lume.pot',
    'LICENSE',
    'media-lume.php',
    'readme.txt',
    'uninstall.php',
];

const output  = fs.createWriteStream(zipOut);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('warning', err => { if (err.code !== 'ENOENT') throw err; });
archive.on('error',   err => { throw err; });

output.on('close', () => {
    const sizeKB = (archive.pointer() / 1024).toFixed(1);
    console.log(`Created media-lume.zip (${sizeKB} KB, ${included.length} files)`);
});

archive.pipe(output);

for (const rel of included) {
    archive.file(path.join(root, rel), { name: `media-lume/${rel}` });
}

archive.finalize();
