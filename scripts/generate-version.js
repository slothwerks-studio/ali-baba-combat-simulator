import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

// Generate version.ts file
const versionFileContent = `// Auto-generated file - do not edit manually
// Generated from package.json version

export const VERSION: string = '${packageJson.version}';

export const APP_NAME: string = '${packageJson.name}';
`;

// Write to src/js/version.ts
const outputPath = path.join(__dirname, '../src/js/version.ts');
fs.writeFileSync(outputPath, versionFileContent, 'utf8');

console.log(`✓ Generated version.ts (v${packageJson.version})`);
