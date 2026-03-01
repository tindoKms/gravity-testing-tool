#!/usr/bin/env node

const config = require('./utils/config');
const logger = require('./utils/logger');
const buildTemplate = require('./commands/buildTemplate');

/**
 * Main entry point for the Gravity Testing Tool CLI
 */
async function main() {
  try {
    // Load and validate configuration
    config.validate();

    // Get command from arguments
    const command = process.argv[2];

    // Route to appropriate command
    switch (command) {
      case 'build-template':
        await buildTemplate();
        break;

      default:
        console.log('Gravity Testing Tool');
        console.log('');
        console.log('Available commands:');
        console.log('  build-template    Generate audit template Excel file');
        console.log('');
        console.log('Usage:');
        console.log('  node src/index.js build-template');
        console.log('  yarn build-template');
        console.log('  npm run build-template');
        process.exit(1);
    }

  } catch (error) {
    logger.fatal('Application error', error);
  }
}

// Run main function
main();
