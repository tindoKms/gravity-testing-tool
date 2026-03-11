const apiService = require('./apiService');
const excelService = require('./excelService');
const config = require('../utils/config');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Service for retrieving AI validation results from the audit system
 */
class ResultRetriever {
  constructor() {
    this.preAuditTemplate = null;
  }

  /**
   * Main entry point for retrieving results
   * @param {Object} options - Command options
   * @param {number} options.index - The result column index
   * @param {string} [options.questionId] - Optional specific question ID
   * @returns {Promise<void>}
   */
  async retrieve({ index, questionId }) {
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
      // Retrieve result for single question
      const rowIndex = rows.findIndex(row => row.QuestionId === questionId);
      if (rowIndex === -1) {
        throw new Error('Id not found in excel file');
      }

      logger.info(`Retrieving result for question: ${questionId}`);
      await this.processRow(rows[rowIndex], rowIndex, index, excelPath);
    } else {
      // Step 9: Retrieve results for all questions
      logger.info(`Retrieving all results for index ${index}...`);
      for (let i = 0; i < rows.length; i++) {
        await this.processRow(rows[i], i, index, excelPath);
      }
    }

    logger.success('Get result complete!');
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
   * Process a single row - retrieve AI result and write to Excel
   * @param {Object} row - The Excel row data
   * @param {number} rowIndex - The 0-based row index in the data
   * @param {number} index - The scenario index
   * @param {string} excelPath - Path to the Excel file
   * @returns {Promise<void>}
   */
  async processRow(row, rowIndex, index, excelPath) {
    const aiScoreKey = `AiScore${index}`;
    const aiProcessedAtKey = `AiProcessedAt${index}`;
    const aiAnswerKey = `AiAnswer${index}`;
    const questionId = row.QuestionId;

    if (!questionId) {
      logger.warn(`Skipping row ${rowIndex + 1} - missing QuestionId`);
      return;
    }

    try {
      // Step 7: Lookup result in preAuditTemplate
      const templateItem = this.findQuestionInTemplate(questionId);
      if (!templateItem) {
        logger.warn(`Question ${questionId} not found in audit template, skipping`);
        return;
      }

      const aiScore = templateItem.aiScore !== undefined ? templateItem.aiScore : '';
      const aiProcessedAt = templateItem.aiProcessedAt || '';
      const aiAnswer = templateItem.aiAnswer || '';

      // Step 8: Write results to Excel
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: aiScoreKey, value: aiScore },
        { rowIndex, columnName: aiProcessedAtKey, value: aiProcessedAt },
        { rowIndex, columnName: aiAnswerKey, value: aiAnswer }
      ]);

      logger.success(`Question ${questionId} - AiScore: ${aiScore}, AiProcessedAt: ${aiProcessedAt}`);

    } catch (error) {
      logger.error(`Failed to retrieve result for question ${questionId}`, error);
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
}

module.exports = new ResultRetriever();
