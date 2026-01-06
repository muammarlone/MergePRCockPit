#!/usr/bin/env node

/**
 * Package evidence files for archival or sharing
 * Creates manifest files for each test's evidence
 */

const fs = require('fs-extra');
const path = require('path');

async function packageEvidence() {
  console.log('Packaging UAT evidence...');

  const evidenceDir = path.join(__dirname, '..', 'evidence');

  try {
    // Ensure evidence directory exists
    await fs.ensureDir(evidenceDir);

    // Get all evidence directories
    const entries = await fs.readdir(evidenceDir);
    const testDirs = [];

    for (const entry of entries) {
      const entryPath = path.join(evidenceDir, entry);
      const stat = await fs.stat(entryPath);
      if (stat.isDirectory() && entry.startsWith('UAT-')) {
        testDirs.push(entry);
      }
    }

    console.log(`Found ${testDirs.length} test evidence directories`);

    // Create package manifest for each test
    let totalFiles = 0;
    const packages = [];

    for (const testDir of testDirs) {
      const testPath = path.join(evidenceDir, testDir);
      const files = await fs.readdir(testPath);

      const manifest = {
        testId: testDir,
        timestamp: new Date().toISOString(),
        fileCount: files.length,
        files: files.map((f) => ({
          name: f,
          path: path.join(testPath, f),
        })),
      };

      // Write manifest
      const manifestPath = path.join(testPath, 'package-manifest.json');
      await fs.writeJson(manifestPath, manifest, { spaces: 2 });

      totalFiles += files.length;
      packages.push({
        testId: testDir,
        fileCount: files.length,
      });

      console.log(`  ✓ ${testDir}: ${files.length} files`);
    }

    // Create master manifest
    const masterManifest = {
      timestamp: new Date().toISOString(),
      totalPackages: packages.length,
      totalFiles,
      packages,
    };

    const masterPath = path.join(evidenceDir, 'packages-manifest.json');
    await fs.writeJson(masterPath, masterManifest, { spaces: 2 });

    console.log('\n✅ Evidence packaging complete!');
    console.log(`   Total packages: ${packages.length}`);
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Master manifest: ${masterPath}`);
  } catch (error) {
    console.error('Error packaging evidence:', error);
    process.exit(1);
  }
}

packageEvidence();
