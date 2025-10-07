#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing Elevate for Humanity Ecosystem Structure\n');

const repos = [
  { path: 'apps/lms', name: 'LMS Platform', purpose: 'Learning Management System' },
  { path: 'apps/marketing', name: 'Marketing Site', purpose: 'Public-facing website' },
  { path: 'apps/admin', name: 'Admin Dashboard', purpose: 'Admin tools and analytics' },
  { path: 'packages/shared', name: 'Shared Packages', purpose: 'Shared components and utilities' },
  { path: 'tools/sitemap', name: 'Sitemap Generator', purpose: 'SEO sitemap automation' }
];

const analysis = {
  timestamp: new Date().toISOString(),
  repos: []
};

repos.forEach(repo => {
  const repoPath = path.join(process.cwd(), repo.path);
  
  if (!fs.existsSync(repoPath)) {
    console.log(`⚠️  ${repo.name} not found at ${repo.path}`);
    return;
  }
  
  console.log(`📦 Analyzing ${repo.name}...`);
  
  const repoAnalysis = {
    name: repo.name,
    path: repo.path,
    purpose: repo.purpose,
    packageJson: null,
    structure: {},
    dependencies: [],
    devDependencies: [],
    scripts: {},
    frameworks: [],
    hasTypeScript: false,
    hasTailwind: false,
    hasSupabase: false,
    hasAuth: false
  };
  
  // Read package.json
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      repoAnalysis.packageJson = pkg.name;
      repoAnalysis.dependencies = Object.keys(pkg.dependencies || {});
      repoAnalysis.devDependencies = Object.keys(pkg.devDependencies || {});
      repoAnalysis.scripts = pkg.scripts || {};
      
      // Detect frameworks and tools
      const allDeps = [...repoAnalysis.dependencies, ...repoAnalysis.devDependencies];
      repoAnalysis.hasTypeScript = allDeps.includes('typescript');
      repoAnalysis.hasTailwind = allDeps.some(d => d.includes('tailwind'));
      repoAnalysis.hasSupabase = allDeps.some(d => d.includes('supabase'));
      repoAnalysis.hasAuth = allDeps.some(d => d.includes('auth') || d.includes('clerk') || d.includes('next-auth'));
      
      if (allDeps.includes('next')) repoAnalysis.frameworks.push('Next.js');
      if (allDeps.includes('react')) repoAnalysis.frameworks.push('React');
      if (allDeps.includes('vue')) repoAnalysis.frameworks.push('Vue');
      if (allDeps.includes('vite')) repoAnalysis.frameworks.push('Vite');
      if (allDeps.includes('remix')) repoAnalysis.frameworks.push('Remix');
      
    } catch (err) {
      console.log(`  ⚠️  Could not parse package.json: ${err.message}`);
    }
  }
  
  // Analyze directory structure
  const checkDirs = ['src', 'app', 'pages', 'components', 'lib', 'utils', 'public', 'styles', 'api', 'hooks', 'contexts'];
  checkDirs.forEach(dir => {
    const dirPath = path.join(repoPath, dir);
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        repoAnalysis.structure[dir] = files.length;
      } catch (err) {
        repoAnalysis.structure[dir] = 'error';
      }
    }
  });
  
  analysis.repos.push(repoAnalysis);
  console.log(`  ✅ ${repo.name} analyzed`);
});

// Write analysis to file
const outputPath = path.join(process.cwd(), 'STRUCTURE_ANALYSIS.json');
fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

console.log('\n📊 Analysis Summary:\n');

analysis.repos.forEach(repo => {
  console.log(`${repo.name} (${repo.path})`);
  console.log(`  Purpose: ${repo.purpose}`);
  console.log(`  Frameworks: ${repo.frameworks.join(', ') || 'None detected'}`);
  console.log(`  TypeScript: ${repo.hasTypeScript ? '✅' : '❌'}`);
  console.log(`  Tailwind: ${repo.hasTailwind ? '✅' : '❌'}`);
  console.log(`  Supabase: ${repo.hasSupabase ? '✅' : '❌'}`);
  console.log(`  Dependencies: ${repo.dependencies.length}`);
  console.log(`  Structure: ${Object.keys(repo.structure).join(', ') || 'No standard dirs'}`);
  console.log('');
});

console.log(`✅ Full analysis saved to STRUCTURE_ANALYSIS.json\n`);
