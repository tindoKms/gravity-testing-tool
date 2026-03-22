const apiService = require('./apiService');
const excelService = require('./excelService');
const logger = require('../utils/logger');
const config = require('../utils/config');
const path = require('path');

/**
 * Validation status constants
 */
const VALIDATE_STATUS = {
  SKIP: 'SKIP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

/**
 * Delay helper to prevent rate limiting
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Service for triggering AI validation of answers
 */
class AnswerValidator {
  /**
   * Main entry point for validating answers
   * @param {Object} options - Command options
   * @param {string} [options.questionId] - Optional specific question ID
   * @returns {Promise<void>}
   */
  async validate({ questionId }) {
    // Step 2: Parse Excel file
    const excelPath = path.join(process.cwd(), 'data', 'audit_template.xlsx');
    logger.info(`Reading Excel file: ${excelPath}`);
    const rows = await excelService.readTemplate(excelPath);
    logger.info(`Loaded ${rows.length} rows from Excel file`);

    if (questionId) {
      // Step 3: Validate questionId exists in Excel
      const rowIndex = rows.findIndex(row => row.QuestionId === questionId);
      if (rowIndex === -1) {
        throw new Error('Id not found in excel file');
      }

      logger.info(`Validating answer for question: ${questionId}`);
      await this.processRow(rows[rowIndex], rowIndex, excelPath);
    } else {
      // Step 8: Bulk validation - loop through all rows
      logger.info('Validating answers for all questions...');
      for (let i = 0; i < rows.length; i++) {
        await this.processRow(rows[i], i, excelPath);

        // Step 7: Add delay between requests
        if (i < rows.length - 1) {
          await delay(300);
        }
      }
    }

    logger.success('Answer validation complete!');
  }

  /**
   * Process a single row - validate answer or skip
   * @param {Object} row - The Excel row data
   * @param {number} rowIndex - The 0-based row index in the data
   * @param {string} excelPath - Path to the Excel file
   * @returns {Promise<void>}
   */
  async processRow(row, rowIndex, excelPath) {
    // Step 4: Extract required fields
    const questionId = row.QuestionId;
    const categoryId = row.CategoryId;
    const categoryName = row.CategoryName;
    const subCategoryId = row.SubCategoryId;
    const subSubCategoryId = row.SubSubCategoryId;
    const validateAi = row.ValidateAi;

    // Skip invalid validation - if ValidateAi is null or empty
    if (!validateAi || (typeof validateAi === 'string' && validateAi.trim() === '')) {
      logger.info(`Skipping question ${questionId} - ValidateAi is empty`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'SubmitValidateStatus', value: VALIDATE_STATUS.SKIP }
      ]);
      return;
    }

    // Step 5: Call Validation API
    try {
      await apiService.validateAnswer({
        questions: [{ questionId }],
        instanceId: config.instanceId,
        accountId: config.accountId,
        batchName: config.batchName,
        categoryId,
        subCategoryId,
        subSubCategoryId,
        categoryName
      });

      // Step 6: Handle successful response
      logger.success(`Question ${questionId} validation triggered successfully`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'SubmitValidateStatus', value: VALIDATE_STATUS.SUCCESS }
      ]);

    } catch (error) {
      // Step 6: Handle failed response
      logger.error(`Failed to validate question ${questionId}`, error);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'SubmitValidateStatus', value: VALIDATE_STATUS.FAILED }
      ]);
    }
  }
}

module.exports = new AnswerValidator();
