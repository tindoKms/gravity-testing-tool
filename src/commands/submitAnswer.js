const answerSubmitter = require('../services/answerSubmitter');
const logger = require('../utils/logger');

/**
 * Parse command line arguments for the submit command
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
 * Command: submit
 * Submit answers from the Excel file to the audit system
 */
async function submitAnswer() {
  try {
    logger.info('Starting answer submission...');

    const { index, questionId } = parseArgs();

    await answerSubmitter.submit({ index, questionId });

  } catch (error) {
    logger.fatal('Answer submission failed', error);
  }
}

module.exports = submitAnswer;
