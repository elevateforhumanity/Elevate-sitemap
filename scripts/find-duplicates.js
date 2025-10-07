#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 Finding Duplicate Files Across Repositories\n');

const repos = [
  'apps/lms',
  'apps/marketing',
  'apps/admin',
  'packages/shared',
  'tools/sitemap'
];

// Files to ignore
const ignorePatterns = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  'coverage',
  '.cache',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
];

// Track files by hash
const filesByHash = new Map();
const filesByName = new Map();

function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => filePath.includes(pattern));
}

function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (err) {
    return null;
  }
}

function scanDirectory(dir, repoName) {
  if (!fs.existsSync(dir)) return;
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      
      if (shouldIgnore(fullPath)) return;
      
      if (item.isDirectory()) {
        scanDirectory(fullPath, repoName);
      } else if (item.isFile()) {
        const hash = getFileHash(fullPath);
        if (!hash) return;
        
        const relativePath = fullPath.replace(process.cwd() + '/', '');
        const fileName = item.name;
        
        // Track by hash (exact duplicates)
        if (!filesByHash.has(hash)) {
          filesByHash.set(hash, []);
        }
        filesByHash.get(hash).push({ path: relativePath, repo: repoName, name: fileName });
        
        // Track by name (potential duplicates)
        if (!filesByName.has(fileName)) {
          filesByName.set(fileName, []);
        }
        filesByName.get(fileName).push({ path: relativePath, repo: repoName, hash });
      }
    });
  } catch (err) {
    console.log(`  ⚠️  Error scanning ${dir}: ${err.message}`);
  }
}

// Scan all repos
repos.forEach(repo => {
  const repoPath = path.join(process.cwd(), repo);
  if (fs.existsSync(repoPath)) {
    console.log(`📂 Scanning ${repo}...`);
    scanDirectory(repoPath, repo);
  }
});

console.log('\n📊 Duplicate Analysis:\n');

// Find exact duplicates (same content)
const exactDuplicates = [];
filesByHash.forEach((files, hash) => {
  if (files.length > 1) {
    exactDuplicates.push({ hash, files });
  }
});

console.log(`🔴 Exact Duplicates (${exactDuplicates.length} sets):\n`);

exactDuplicates.forEach((dup, idx) => {
  console.log(`${idx + 1}. ${dup.files[0].name}`);
  dup.files.forEach(file => {
    console.log(`   - ${file.path}`);
  });
  console.log('');
});

// Find name duplicates (same name, different content)
const nameDuplicates = [];
filesByName.forEach((files, name) => {
  if (files.length > 1) {
    const uniqueHashes = new Set(files.map(f => f.hash));
    if (uniqueHashes.size > 1) {
      nameDuplicates.push({ name, files });
    }
  }
});

console.log(`\n🟡 Name Duplicates (${nameDuplicates.length} files with same name, different content):\n`);

nameDuplicates.slice(0, 20).forEach((dup, idx) => {
  console.log(`${idx + 1}. ${dup.name}`);
  dup.files.forEach(file => {
    console.log(`   - ${file.path}`);
  });
  console.log('');
});

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalExactDuplicates: exactDuplicates.length,
    totalNameDuplicates: nameDuplicates.length,
    reposScanned: repos.filter(r => fs.existsSync(path.join(process.cwd(), r)))
  },
  exactDuplicates: exactDuplicates.map(d => ({
    fileName: d.files[0].name,
    count: d.files.length,
    locations: d.files.map(f => f.path)
  })),
  nameDuplicates: nameDuplicates.map(d => ({
    fileName: d.name,
    count: d.files.length,
    locations: d.files.map(f => ({ path: f.path, hash: f.hash }))
  }))
};

fs.writeFileSync('DUPLICATES_REPORT.json', JSON.stringify(report, null, 2));

console.log('\n✅ Full report saved to DUPLICATES_REPORT.json');
console.log('\n📋 Next Steps:');
console.log('  1. Review DUPLICATES_REPORT.json for detailed analysis');
console.log('  2. Run "npm run organize" to automatically deduplicate');
console.log('  3. Move shared code to packages/shared');
console.log('  4. Update imports in consuming apps\n');
