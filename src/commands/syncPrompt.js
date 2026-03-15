const promptSyncer = require('../services/promptSyncer');
const logger = require('../utils/logger');

/**
 * Parse command line arguments for the sync-prompt command
 * @returns {Object} Parsed arguments { questionId }
 */
function parseArgs() {
  const args = {};

  process.argv.slice(3).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value;
    }
  });

  return {
    questionId: args.questionId
  };
}

/**
 * Command: sync-prompt
 * Synchronize prompt configurations from the Excel file into the iQBR system
 */
async function syncPrompt() {
  try {
    logger.info('Starting prompt synchronization...');

    const { questionId } = parseArgs();

    await promptSyncer.sync({ questionId });

  } catch (error) {
    logger.fatal('Prompt synchronization failed', error);
  }
}

module.exports = syncPrompt;
