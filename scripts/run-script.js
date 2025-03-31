#!/usr/bin/env node

/**
 * Script runner for TypeScript scripts
 * 
 * This script sets up the proper environment for running TypeScript scripts
 * with the correct module resolution and TypeScript configuration.
 */

const path = require('path');
const fs = require('fs');

// Register ts-node with the scripts-specific tsconfig
require('ts-node').register({
  project: path.resolve(__dirname, '../tsconfig.scripts.json'),
  transpileOnly: true
});

// Get the script path from command line arguments
const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error('Error: No script path provided');
  console.log('Usage: node run-script.js <script-path>');
  process.exit(1);
}

// Resolve the absolute path to the script
const absolutePath = path.resolve(process.cwd(), scriptPath);

// Check if the file exists
if (!fs.existsSync(absolutePath)) {
  console.error(`Error: Script file not found: ${absolutePath}`);
  process.exit(1);
}

console.log(`Executing script: ${absolutePath}`);

// Execute the specified script
try {
  require(absolutePath);
} catch (error) {
  console.error(`Error executing script ${scriptPath}:`, error);
  process.exit(1);
}
