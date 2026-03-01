const path = require('path');
const templateGenerator = require('../services/templateGenerator');
const logger = require('../utils/logger');

/**
 * Command: build-template
 * Generates an audit template Excel file from API data
 */
async function buildTemplate() {
  try {
    logger.info('Starting template generation...');

    // Define output path
    const outputPath = path.join(process.cwd(), 'data', 'audit_template.xlsx');

    // Generate template
    await templateGenerator.generate(outputPath);

  } catch (error) {
    logger.fatal('Template generation failed', error);
  }
}

module.exports = buildTemplate;
