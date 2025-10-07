#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚠️  EXECUTING DEDUPLICATION PLAN\n');
console.log('This will move and delete files. Make sure you have backups!\n');

// Load plan
const planPath = path.join(process.cwd(), 'DEDUPLICATION_PLAN.json');
if (!fs.existsSync(planPath)) {
  console.log('❌ No DEDUPLICATION_PLAN.json found. Run "npm run organize" first.\n');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

console.log('📊 Plan Summary:');
console.log(`  - ${plan.summary.filesToMove} files to move`);
console.log(`  - ${plan.summary.filesToDelete} files to delete\n`);

// Confirm execution
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Continue? (yes/no): ', (answer) => {
  readline.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Aborted. No changes made.\n');
    process.exit(0);
  }
  
  console.log('\n🔄 Executing deduplication...\n');
  
  let movedCount = 0;
  let deletedCount = 0;
  let errorCount = 0;
  
  // Move files to shared package
  plan.actions.move.forEach((action, idx) => {
    try {
      const sourcePath = path.join(process.cwd(), action.source);
      const targetPath = path.join(process.cwd(), action.target);
      
      if (!fs.existsSync(sourcePath)) {
        console.log(`  ⚠️  Source not found: ${action.source}`);
        return;
      }
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy file (don't delete source yet)
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`  ✅ Moved: ${action.source} → ${action.target}`);
      movedCount++;
      
    } catch (err) {
      console.log(`  ❌ Error moving ${action.source}: ${err.message}`);
      errorCount++;
    }
  });
  
  console.log('');
  
  // Delete duplicate files
  plan.actions.delete.forEach((filePath, idx) => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`  ⚠️  Already deleted: ${filePath}`);
        return;
      }
      
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Deleted: ${filePath}`);
      deletedCount++;
      
    } catch (err) {
      console.log(`  ❌ Error deleting ${filePath}: ${err.message}`);
      errorCount++;
    }
  });
  
  console.log('\n✅ Deduplication complete!\n');
  console.log('📊 Results:');
  console.log(`  - ${movedCount} files moved to shared package`);
  console.log(`  - ${deletedCount} duplicate files deleted`);
  console.log(`  - ${errorCount} errors\n`);
  
  if (errorCount > 0) {
    console.log('⚠️  Some errors occurred. Review the output above.\n');
  }
  
  console.log('📋 Next Steps:');
  console.log('  1. Create index files in packages/shared/src/*/');
  console.log('  2. Update imports in apps to use @elevate/shared');
  console.log('  3. Test all applications');
  console.log('  4. Commit changes to each repository\n');
  
  // Create index files
  console.log('📝 Creating index files...\n');
  
  const categories = ['components', 'utils', 'hooks', 'types', 'lib', 'config'];
  categories.forEach(category => {
    const categoryPath = path.join(process.cwd(), 'packages/shared/src', category);
    const indexPath = path.join(categoryPath, 'index.ts');
    
    if (!fs.existsSync(categoryPath)) return;
    
    try {
      const files = fs.readdirSync(categoryPath)
        .filter(f => f !== 'index.ts' && (f.endsWith('.ts') || f.endsWith('.tsx')));
      
      if (files.length === 0) return;
      
      const exports = files.map(file => {
        const name = file.replace(/\.(ts|tsx)$/, '');
        return `export * from './${name}';`;
      }).join('\n');
      
      fs.writeFileSync(indexPath, exports + '\n');
      console.log(`  ✅ Created ${category}/index.ts (${files.length} exports)`);
      
    } catch (err) {
      console.log(`  ⚠️  Error creating index for ${category}: ${err.message}`);
    }
  });
  
  // Create main index
  const mainIndexPath = path.join(process.cwd(), 'packages/shared/src/index.ts');
  const mainExports = categories
    .map(cat => `export * from './${cat}';`)
    .join('\n');
  
  fs.writeFileSync(mainIndexPath, mainExports + '\n');
  console.log(`  ✅ Created main index.ts\n`);
  
  console.log('✅ All done! Review changes and test your applications.\n');
});
