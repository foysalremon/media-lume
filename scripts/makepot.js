/**
 * Generates languages/media-lume.pot covering both PHP and JS/JSX strings.
 *
 * PHP strings: extracted via wp-pot (class-based API)
 * JS strings:  extracted via regex scanning of src/**\/*.{js,jsx}
 *
 * Run: npm run makepot
 */

const { WP_Pot } = require('wp-pot');
const fs   = require('fs');
const path = require('path');
const glob = require('glob');

const root    = path.join(__dirname, '..');
const outFile = path.join(root, 'languages/media-lume.pot');
const domain  = 'media-lume';

// ── Step 1: extract PHP strings via wp-pot ────────────────────────────────────

const pot = new WP_Pot({
    pathsRelativeTo: root,
    pot: {
        domain,
        package:      'Media Lume',
        bugReport:    'https://github.com/foysalremon/media-lume/issues',
        metadataFile: 'media-lume.php',
    },
}).parse([
    'includes/**/*.php',
    'media-lume.php',
    '!node_modules/**',
]);

// ── Step 2: extract JS strings via regex ─────────────────────────────────────

const seen = new Set();

// Track strings already found in PHP pass so we don't duplicate
for (const t of pot.translations) {
    seen.add(t.msgid);
}

const jsSrcFiles = glob.sync('src/**/*.{js,jsx}', { cwd: root });

// Patterns we care about:
//   __( 'string', 'media-lume' )
//   _x( 'string', 'context', 'media-lume' )
//   _n( 'singular', 'plural', count, 'media-lume' )
const patterns = [
    // __( '...', 'domain' )
    { re: /__\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*(['"`])media-lume\3/g, type: 'simple' },
    // _x( '...', 'context', 'domain' )
    { re: /_x\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*(['"`])((?:\\.|(?!\3).)*)\3\s*,\s*(['"`])media-lume\5/g, type: 'context' },
    // _n( 'singular', 'plural', ..., 'domain' )
    { re: /_n\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*(['"`])((?:\\.|(?!\3).)*)\3/g, type: 'plural' },
];

const jsEntries = [];

for (const relFile of jsSrcFiles) {
    const absFile  = path.join(root, relFile);
    const content  = fs.readFileSync(absFile, 'utf8');
    const lines    = content.split('\n');

    // Find line number for a given match index
    function lineOf(index) {
        let pos = 0;
        for (let i = 0; i < lines.length; i++) {
            pos += lines[i].length + 1;
            if (pos > index) return i + 1;
        }
        return lines.length;
    }

    for (const { re, type } of patterns) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
            const msgid   = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
            const context = type === 'context'  ? m[4] : undefined;
            const plural  = type === 'plural'   ? m[4].replace(/\\'/g, "'").replace(/\\"/g, '"') : undefined;
            const key     = `${msgid}${context || ''}`;
            if (seen.has(key)) continue;
            seen.add(key);
            jsEntries.push({ msgid, context, plural, file: relFile.replace(/\\/g, '/'), line: lineOf(m.index) });
        }
    }
}

// ── Step 3: write combined .pot ───────────────────────────────────────────────

let potContent = pot.generatePot();

if (jsEntries.length > 0) {
    // Strip trailing newline from PHP section before appending
    potContent = potContent.trimEnd() + '\n';

    for (const { msgid, context, plural, file, line } of jsEntries) {
        potContent += `\n#: ${file}:${line}\n`;
        if (context) potContent += `msgctxt "${context}"\n`;
        potContent += `msgid "${msgid.replace(/"/g, '\\"')}"\n`;
        if (plural) {
            potContent += `msgid_plural "${plural.replace(/"/g, '\\"')}"\n`;
            potContent += `msgstr[0] ""\nmsgstr[1] ""\n`;
        } else {
            potContent += `msgstr ""\n`;
        }
    }
}

fs.writeFileSync(outFile, potContent);

const phpCount = pot.translations.length;
const jsCount  = jsEntries.length;
console.log(`Generated languages/media-lume.pot`);
console.log(`  PHP strings: ${phpCount}`);
console.log(`  JS strings:  ${jsCount}`);
console.log(`  Total:       ${phpCount + jsCount}`);
