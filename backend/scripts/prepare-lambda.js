const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing Prisma for Lambda deployment...');

// Clean only .prisma cache
const dirsToClean = [
  'node_modules/.prisma',
  'node_modules/.cache'
];

dirsToClean.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✓ Cleaned ${dir}`);
  }
});

// Generate Prisma Client for Linux
console.log('📦 Generating Prisma Client for Linux...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('✅ Lambda preparation complete!');
