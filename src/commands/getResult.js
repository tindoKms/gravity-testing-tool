const resultRetriever = require('../services/resultRetriever');
const logger = require('../utils/logger');

/**
 * Parse command line arguments for the get-result command
 * @returns {Object} Parsed arguments { index, questionId }
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
    index: args.index,
    questionId: args.questionId
  };
}

/**
 * Command: get-result
 * Retrieve AI validation results and write them to the Excel file
 */
async function getResult() {
  try {
    logger.info('Starting result retrieval...');

    const { index, questionId } = parseArgs();

    await resultRetriever.retrieve({ index, questionId });

  } catch (error) {
    logger.fatal('Result retrieval failed', error);
  }
}

module.exports = getResult;
