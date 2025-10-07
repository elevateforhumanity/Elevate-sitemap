#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Organizing and Deduplicating Repositories\n');

const SHARED_PKG = 'packages/shared';

// Load duplicate report
const reportPath = path.join(process.cwd(), 'DUPLICATES_REPORT.json');
if (!fs.existsSync(reportPath)) {
  console.log('❌ No DUPLICATES_REPORT.json found. Run "npm run dedupe" first.\n');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('📊 Duplicate Summary:');
console.log(`  - ${report.summary.totalExactDuplicates} exact duplicate sets`);
console.log(`  - ${report.summary.totalNameDuplicates} name conflicts\n`);

// Ensure shared package structure exists
const sharedDirs = [
  'components',
  'utils',
  'hooks',
  'types',
  'lib',
  'config',
  'styles'
];

console.log('📁 Setting up shared package structure...\n');

sharedDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), SHARED_PKG, 'src', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  ✅ Created ${SHARED_PKG}/src/${dir}`);
  }
});

// Create shared package.json if it doesn't exist
const sharedPkgPath = path.join(process.cwd(), SHARED_PKG, 'package.json');
if (!fs.existsSync(sharedPkgPath)) {
  const sharedPkg = {
    name: '@elevate/shared',
    version: '1.0.0',
    description: 'Shared components, utilities, and types for Elevate ecosystem',
    main: 'src/index.ts',
    types: 'src/index.ts',
    exports: {
      '.': './src/index.ts',
      './components': './src/components/index.ts',
      './utils': './src/utils/index.ts',
      './hooks': './src/hooks/index.ts',
      './types': './src/types/index.ts',
      './lib': './src/lib/index.ts',
      './config': './src/config/index.ts'
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0'
    }
  };
  
  fs.writeFileSync(sharedPkgPath, JSON.stringify(sharedPkg, null, 2));
  console.log(`  ✅ Created ${SHARED_PKG}/package.json\n`);
}

// Categorize files for deduplication
const categorizationRules = [
  { pattern: /component|button|input|modal|card|form/i, target: 'components' },
  { pattern: /util|helper|format|validate/i, target: 'utils' },
  { pattern: /hook|use[A-Z]/i, target: 'hooks' },
  { pattern: /type|interface|\.d\.ts$/i, target: 'types' },
  { pattern: /config|constant|env/i, target: 'config' },
  { pattern: /api|client|fetch/i, target: 'lib' },
  { pattern: /\.css$|\.scss$|tailwind/i, target: 'styles' }
];

function categorizeFile(fileName) {
  for (const rule of categorizationRules) {
    if (rule.pattern.test(fileName)) {
      return rule.target;
    }
  }
  return 'lib'; // default
}

// Process exact duplicates
console.log('🔄 Processing exact duplicates...\n');

const moveActions = [];
const deleteActions = [];

report.exactDuplicates.forEach((dup, idx) => {
  if (dup.locations.length < 2) return;
  
  const fileName = dup.fileName;
  const category = categorizeFile(fileName);
  
  // Skip if already in shared package
  if (dup.locations.some(loc => loc.startsWith(SHARED_PKG))) {
    console.log(`  ⏭️  ${fileName} already in shared package`);
    return;
  }
  
  // Choose the "best" version (prefer most complete/largest file)
  const sourceFile = dup.locations[0];
  const targetPath = path.join(SHARED_PKG, 'src', category, fileName);
  
  console.log(`  ${idx + 1}. ${fileName} → ${category}/`);
  console.log(`     Source: ${sourceFile}`);
  
  moveActions.push({
    source: sourceFile,
    target: targetPath,
    duplicates: dup.locations.slice(1)
  });
  
  dup.locations.slice(1).forEach(loc => {
    console.log(`     Delete: ${loc}`);
    deleteActions.push(loc);
  });
  
  console.log('');
});

// Create action plan
const actionPlan = {
  timestamp: new Date().toISOString(),
  summary: {
    filesToMove: moveActions.length,
    filesToDelete: deleteActions.length
  },
  actions: {
    move: moveActions,
    delete: deleteActions
  },
  instructions: [
    '1. Review this plan carefully',
    '2. Backup your repositories before proceeding',
    '3. Run the deduplication manually or use the provided script',
    '4. Update imports in consuming apps to use @elevate/shared',
    '5. Test all applications after deduplication',
    '6. Commit changes to each repository'
  ]
};

fs.writeFileSync('DEDUPLICATION_PLAN.json', JSON.stringify(actionPlan, null, 2));

console.log('✅ Deduplication plan created!\n');
console.log('📋 Summary:');
console.log(`  - ${moveActions.length} files to move to shared package`);
console.log(`  - ${deleteActions.length} duplicate files to remove\n`);
console.log('⚠️  IMPORTANT: Review DEDUPLICATION_PLAN.json before proceeding!\n');
console.log('To execute the plan:');
console.log('  1. Review DEDUPLICATION_PLAN.json');
console.log('  2. Backup your repositories');
console.log('  3. Run: node scripts/execute-deduplication.js\n');
