const apiService = require('./apiService');
const excelService = require('./excelService');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Prompt sync status constants
 */
const SYNC_STATUS = {
  SKIP: 'SKIP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

/**
 * Service for synchronizing prompt configurations to the iQBR system
 */
class PromptSyncer {
  /**
   * Main entry point for syncing prompts
   * @param {Object} options - Command options
   * @param {string} [options.questionId] - Optional specific question ID
   * @returns {Promise<void>}
   */
  async sync({ questionId }) {
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

      logger.info(`Syncing prompt for question: ${questionId}`);
      await this.processRow(rows[rowIndex], rowIndex, excelPath);
    } else {
      // Step 8: Bulk sync - loop through all rows
      logger.info('Syncing prompts for all questions...');
      for (let i = 0; i < rows.length; i++) {
        await this.processRow(rows[i], i, excelPath);
      }
    }

    logger.success('Prompt sync complete!');
  }

  /**
   * Process a single row - sync prompt or skip
   * @param {Object} row - The Excel row data
   * @param {number} rowIndex - The 0-based row index in the data
   * @param {string} excelPath - Path to the Excel file
   * @returns {Promise<void>}
   */
  async processRow(row, rowIndex, excelPath) {
    const questionId = row.QuestionId;

    // Step 4: Extract required fields
    const promptName = row.PromptName;
    const promptDescription = row.PromptDescription;
    const systemPrompt = row.SystemPrompt;
    const userPrompt = row.UserPrompt;

    // Skip invalid prompts - if PromptName or UserPrompt is null/empty
    if (!promptName || (typeof promptName === 'string' && promptName.trim() === '') ||
        !userPrompt || (typeof userPrompt === 'string' && userPrompt.trim() === '')) {
      logger.info(`Skipping question ${questionId} - missing PromptName or UserPrompt`);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'PromptStatus', value: SYNC_STATUS.SKIP }
      ]);
      return;
    }

    // Step 5: Call Prompt API
    try {
      const response = await apiService.syncPrompt({
        name: promptName,
        description: promptDescription || '',
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt
      });

      // Step 6 & 7: Process API response and update Excel
      if (response.data && response.data?.id) {
        const data = response.data;
        logger.success(`Question ${questionId} prompt synced successfully`);
        await excelService.updateAndSave(excelPath, [
          { rowIndex, columnName: 'PromptId', value: data.id },
          { rowIndex, columnName: 'PromptVersion', value: data.version },
          { rowIndex, columnName: 'PromptStatus', value: SYNC_STATUS.SUCCESS }
        ]);
      } else {
        logger.error(`Failed to sync prompt for question ${questionId} - status ${response.status}`);
        await excelService.updateAndSave(excelPath, [
          { rowIndex, columnName: 'PromptStatus', value: SYNC_STATUS.FAILED }
        ]);
      }

    } catch (error) {
      logger.error(`Failed to sync prompt for question ${questionId}`, error);
      await excelService.updateAndSave(excelPath, [
        { rowIndex, columnName: 'PromptStatus', value: SYNC_STATUS.FAILED }
      ]);
    }
  }
}

module.exports = new PromptSyncer();
