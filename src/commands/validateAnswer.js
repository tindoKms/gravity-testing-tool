const answerValidator = require('../services/answerValidator');
const logger = require('../utils/logger');

/**
 * Parse command line arguments for the validate-answer command
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
 * Command: validate-answer
 * Trigger AI validation for answers of questions in the Excel file
 */
async function validateAnswer() {
  try {
    logger.info('Starting answer validation...');

    const { questionId } = parseArgs();

    await answerValidator.validate({ questionId });

  } catch (error) {
    logger.fatal('Answer validation failed', error);
  }
}

module.exports = validateAnswer;
