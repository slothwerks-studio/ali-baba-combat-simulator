const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

// Generate version.js file
const versionFileContent = `// Auto-generated file - do not edit manually
// Generated from package.json version

/**
 * Application version from package.json
 * @type {string}
 */
export const VERSION = '${packageJson.version}';

/**
 * Application name from package.json
 * @type {string}
 */
export const APP_NAME = '${packageJson.name}';
`;

// Write to src/js/version.js
const outputPath = path.join(__dirname, '../src/js/version.js');
fs.writeFileSync(outputPath, versionFileContent, 'utf8');

console.log(`✓ Generated version.js (v${packageJson.version})`);
