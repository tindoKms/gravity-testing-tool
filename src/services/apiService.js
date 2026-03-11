const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Service for making API calls to the audit server
 */
class ApiService {
  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Fetch audit instance data from the server
   * @returns {Promise<Object>} The audit instance data
   * @throws {Error} If the request fails or response is invalid
   */
  async fetchAuditInstance() {
    try {
      const url = config.getApiUrl();
      logger.info(`Fetching audit data from: ${url}`);

      const response = await this.client.get(url);

      if (!response.data) {
        throw new Error('API returned empty response');
      }

      // Validate response structure
      if (!response.data.preAuditTemplate) {
        throw new Error('Invalid API response: missing preAuditTemplate');
      }

      if (!response.data.preAuditTemplate.preAuditCategories) {
        throw new Error('Invalid API response: missing preAuditCategories');
      }

      return response.data;

    } catch (error) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        throw new Error(
          `API request failed with status ${status}: ${message}\n` +
          `URL: ${config.getApiUrl()}`
        );
      } else if (error.request) {
        // Request made but no response received
        throw new Error(
          `No response from server. Please check:\n` +
          `1. Server is running at ${config.serverEndpoint}\n` +
          `2. Network connectivity\n` +
          `Original error: ${error.message}`
        );
      } else {
        // Error in request setup or validation
        throw error;
      }
    }
  }

  /**
   * Submit an answer for a specific question
   * @param {string} instanceId - The instance ID
   * @param {string} categoryId - The category ID
   * @param {string} questionId - The question ID
   * @param {string} answer - The answer text
   * @param {number} version - The version number to submit
   * @returns {Promise<Object>} The API response
   * @throws {Error} If the request fails
   */
  async submitAnswer(instanceId, categoryId, questionId, answer, version) {
    try {
      const url = `${config.serverEndpoint}/api/instance/update-answer/${instanceId}/categoryId/${categoryId}`;
      logger.info(`Submitting answer to: ${url}`);

      const body = {
        id: questionId,
        data: `<p>${answer}</p>`,
        version: version
      };

      const response = await this.client.post(url, body);
      return response.data;

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        throw new Error(
          `API request failed with status ${status}: ${message}\n` +
          `URL: ${config.serverEndpoint}/api/instance/update-answer/${instanceId}/categoryId/${categoryId}`
        );
      } else if (error.request) {
        throw new Error(
          `No response from server. Please check:\n` +
          `1. Server is running at ${config.serverEndpoint}\n` +
          `2. Network connectivity\n` +
          `Original error: ${error.message}`
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Count total questions in the audit data
   * @param {Object} auditData - The audit data from API
   * @returns {number} Total number of questions
   */
  countQuestions(auditData) {
    let count = 0;
    const categories = auditData.preAuditTemplate?.preAuditCategories || [];

    categories.forEach(category => {
      (category.subCategories || []).forEach(subCategory => {
        (subCategory.subSubCategories || []).forEach(subSubCategory => {
          count += (subSubCategory.preAuditItems || []).length;
        });
      });
    });

    return count;
  }
}

module.exports = new ApiService();
