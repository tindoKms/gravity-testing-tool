const apiService = require('./apiService');
const excelService = require('./excelService');
const config = require('../utils/config');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Submit status constants
 */
const SUBMIT_STATUS = {
  SKIP: 'SKIP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

/**
 * Service for submitting answers to the audit system
 */
class AnswerSubmitter {
  constructor() {
    this.preAuditTemplate = null;
  }

  /**
   * Main entry point for submitting answers
   * @param {Object} options - Command options
   * @param {number} options.index - The answer column index
   * @param {string} [options.questionId] - Optional specific question ID
   * @param {boolean} [options.autoValidate] - Auto-validate after submission
   * @returns {Promise<void>}
   */
  async submit({ index, questionId, autoValidate = false }) {
    // Step 1: Retrieve instance data
    logger.info('Fetching audit instance data from server...');
    const auditData = await apiService.fetchAuditInstance();

    // Step 2: Store template in memory
    this.preAuditTemplate = auditData.preAuditTemplate;
    logger.info('Audit template loaded into memory');

    // Step 3: Validate CLI parameters
    index = this.validateIndex(index);

    // Step 5: Parse Excel file
    const excelPath = path.join(process.cwd(), 'data', 'audit_template.xlsx');
    logger.info(`Reading Excel file: ${excelPath}`);
    const rows = await excelService.readTemplate(excelPath);
    logger.info(`Loaded ${rows.length} rows from Excel file`);

    // Step 4 & 6: Check questionId and validate
    if (questionId) {
      // Submit single question
      const rowIndex = rows.findIndex(row => row.QuestionId === questionId);
      if (rowIndex === -1) {
        throw new Error('Id not found in excel file');
      }

      logger.info(`Submitting answer for question: ${questionId}`);
      await this.processRow(rows[rowIndex], rowIndex, index, excelPath, autoValidate);
    } else {
      // Submit all answers
      logger.info(`Submitting all answers for index ${index}...`);
      for (let i = 0; i < rows.length; i++) {
        await this.processRow(rows[i], i, index, excelPath, autoValidate);
      }
    }

    logger.success('Submit complete!');
  }

  /**
   * Validate the index parameter
   * @param {*} index - The index value to validate
   * @returns {number} The validated index
   * @throws {Error} If index is not a valid number
   */
  validateIndex(index) {
    if (index === null || index === undefined) {
      return 1;
    }

    const parsed = Number(index);
    if (isNaN(parsed)) {
      throw new Error('index must be a number');
    }

    return parsed;
  }

  /**
   * Process a single row - submit answer or skip
   * @param {Object} row - The Excel row data
   * @param {number} rowIndex - The 0-based row index in the data
   * @param {number} index - The scenario index
   * @param {string} excelPath - Path to the Excel file
   * @param {boolean} autoValidate - Auto-validate after submission
   * @returns {Promise<void>}
   */
  async processRow(row, rowIndex, index, excelPath, autoValidate = false) {
    const answerKey = `Answer${index}`;
    const versionKey = `Version${index}`;
    const statusKey = `Status${index}`;
    const answer = row[answerKey];
    const questionId = row.QuestionId;

    // Case 1: Empty answer
    if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
      logger.info(`Skipping question ${questionId} - empty answer`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: statusKey, value: SUBMIT_STATUS.SKIP }
      ]);
      return;
    }

    // Case 2: Answer exists
    try {
      // Locate question in preAuditTemplate and get current version
      const templateItem = this.findQuestionInTemplate(questionId);
      if (!templateItem) {
        logger.warn(`Question ${questionId} not found in audit template, skipping`);
        await excelService.updateAndSave(excelPath, [
          { rowIndex, columnName: statusKey, value: SUBMIT_STATUS.FAILED }
        ]);
        return;
      }
      const currentVersion = templateItem.version || 0;

      // Update Version column in Excel
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: versionKey, value: currentVersion }
      ]);

      // Submit the answer
      const categoryId = row.CategoryId;
      await apiService.submitAnswer(
        config.instanceId,
        categoryId,
        questionId,
        answer,
        currentVersion
      );

      // Step 9: Update status - success
      logger.success(`Question ${questionId} submitted successfully`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: statusKey, value: SUBMIT_STATUS.SUCCESS }
      ]);

      // Auto-validate if flag is set
      if (autoValidate) {
        await this.autoValidateAnswer(row, rowIndex, excelPath);
      }

    } catch (error) {
      // Step 9: Update status - failed
      logger.error(`Failed to submit question ${questionId}`, error);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: statusKey, value: SUBMIT_STATUS.FAILED }
      ]);
    }
  }

  /**
   * Find a question inside the preAuditTemplate by its ID
   * @param {string} questionId - The question ID to search for
   * @returns {Object|null} The preAuditItem if found, null otherwise
   */
  findQuestionInTemplate(questionId) {
    const categories = this.preAuditTemplate?.preAuditCategories || [];

    for (const category of categories) {
      for (const subCategory of (category.subCategories || [])) {
        for (const subSubCategory of (subCategory.subSubCategories || [])) {
          for (const item of (subSubCategory.preAuditItems || [])) {
            if (item.id === questionId) {
              return item;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Auto-validate answer after successful submission
   * @param {Object} row - The Excel row data
   * @param {number} rowIndex - The 0-based row index in the data
   * @param {string} excelPath - Path to the Excel file
   * @returns {Promise<void>}
   */
  async autoValidateAnswer(row, rowIndex, excelPath) {
    const questionId = row.QuestionId;
    const categoryId = row.CategoryId;
    const categoryName = row.CategoryName;
    const subCategoryId = row.SubCategoryId;
    const subSubCategoryId = row.SubSubCategoryId;

    try {
      logger.info(`Auto-validating answer for question: ${questionId}`);

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

      // Update Excel with validation success
      logger.success(`Question ${questionId} validation triggered successfully`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'ValidateAi', value: 'Yes' },
        { rowIndex, columnName: 'SubmitValidateStatus', value: 'SUCCESS' }
      ]);

    } catch (error) {
      // Update Excel with validation failure
      logger.error(`Failed to validate question ${questionId}`, error);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'ValidateAi', value: 'Yes' },
        { rowIndex, columnName: 'SubmitValidateStatus', value: 'FAIL' }
      ]);
    }
  }
}

module.exports = new AnswerSubmitter();
