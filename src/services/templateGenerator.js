const apiService = require('./apiService');
const excelService = require('./excelService');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Service for generating audit templates
 */
class TemplateGenerator {
  /**
   * Generate audit template Excel file
   * @param {string} outputPath - Path where template should be created
   * @returns {Promise<void>}
   */
  async generate(outputPath) {
    try {
      // Step 1: Fetch audit data from API
      logger.info('Fetching audit data from server...');
      const auditData = await apiService.fetchAuditInstance();

      // Count and log questions
      const questionCount = apiService.countQuestions(auditData);
      const categoryCount = auditData.preAuditTemplate.preAuditCategories.length;
      logger.info(`Received ${questionCount} questions across ${categoryCount} categories`);

      // Step 2: Transform data into rows
      logger.info('Processing audit data...');
      const rows = this.transformToRows(auditData);

      if (rows.length === 0) {
        logger.warn('No questions found in audit data');
        return;
      }

      // Step 3: Generate Excel file
      logger.info('Generating Excel template...');
      await excelService.createTemplate(outputPath, rows, 1);

      logger.success('Build complete!');

    } catch (error) {
      throw error;
    }
  }

  /**
   * Transform API data into Excel row format
   * @param {Object} auditData - Raw audit data from API
   * @returns {Array<Object>} Array of row objects
   */
  transformToRows(auditData) {
    const rows = [];
    const categories = auditData.preAuditTemplate?.preAuditCategories || [];

    categories.forEach(category => {
      const categoryName = category.name || '';
      const categoryId = category.id || '';

      const subCategories = category.subCategories || [];
      
      subCategories.forEach(subCategory => {
        const subCategoryName = subCategory.name || '';
        const subCategoryId = subCategory.id || '';

        const subSubCategories = subCategory.subSubCategories || [];

        subSubCategories.forEach(subSubCategory => {
          const subSubCategoryName = subSubCategory.name || '';
          const subSubCategoryId = subSubCategory.id || '';

          const preAuditItems = subSubCategory.preAuditItems || [];

          preAuditItems.forEach(item => {
            const row = {
              // Fixed fields from environment
              accountId: config.accountId,
              instanceId: config.instanceId,
              promptName: '',
              systemPrompt: '',
              userPrompt: '',
              promptDescription: item.question || '',
              promptId: '',
              promptVersion: '',
              promptStatus: '',

              // Hierarchy fields
              categoryName: categoryName,
              categoryId: categoryId,
              subCategoryName: subCategoryName,
              subCategoryId: subCategoryId,
              subSubCategoryName: subSubCategoryName,
              subSubCategoryId: subSubCategoryId,

              // Question fields
              questionId: item.id || '',
              question: item.question || '',
              validateAi: '',
              submitValidateStatus: '',

              // Scenario 1 fields (empty for user to fill)
              answer1: '',
              version1: '',
              status1: '',
              aiScore1: '',
              aiResponseAt1: '',
              aiAnswer1: ''
            };

            rows.push(row);
          });
        });
      });
    });

    return rows;
  }

  /**
   * Validate that audit data has the expected structure
   * @param {Object} auditData - Audit data to validate
   * @returns {boolean} True if valid
   * @throws {Error} If data is invalid
   */
  validateAuditData(auditData) {
    if (!auditData.preAuditTemplate) {
      throw new Error('Missing preAuditTemplate in API response');
    }

    if (!Array.isArray(auditData.preAuditTemplate.preAuditCategories)) {
      throw new Error('preAuditCategories must be an array');
    }

    return true;
  }
}

module.exports = new TemplateGenerator();
