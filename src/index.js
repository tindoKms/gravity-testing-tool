#!/usr/bin/env node

const config = require('./utils/config');
const logger = require('./utils/logger');
const buildTemplate = require('./commands/buildTemplate');
const submitAnswer = require('./commands/submitAnswer');
const getResult = require('./commands/getResult');
const syncPrompt = require('./commands/syncPrompt');
const validateAnswer = require('./commands/validateAnswer');

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

      case 'submit':
        await submitAnswer();
        break;

      case 'get-result':
        await getResult();
        break;

      case 'sync-prompt':
        await syncPrompt();
        break;

      case 'validate-answer':
        await validateAnswer();
        break;

      default:
        console.log('Gravity Testing Tool');
        console.log('');
        console.log('Available commands:');
        console.log('  build-template    Generate audit template Excel file');
        console.log('  submit            Submit answers to the audit system');
        console.log('  get-result        Retrieve AI validation results');
        console.log('  sync-prompt       Sync prompt configurations to iQBR');
        console.log('  validate-answer   Trigger AI validation for answers');
        console.log('');
        console.log('Usage:');
        console.log('  node src/index.js build-template');
        console.log('  node src/index.js submit --index=1 --questionId=abc');
        console.log('  npm run submit -- --index=1 --questionId=abc');
        console.log('  node src/index.js get-result --index=1 --questionId=abc');
        console.log('  npm run get-result -- --index=1 --questionId=abc');
        console.log('  node src/index.js sync-prompt --questionId=abc');
        console.log('  npm run sync-prompt -- --questionId=abc');
        console.log('  node src/index.js validate-answer --questionId=abc');
        console.log('  npm run validate-answer -- --questionId=abc');
        process.exit(1);
    }

  } catch (error) {
    logger.fatal('Application error', error);
  }
}

// Run main function
main();
