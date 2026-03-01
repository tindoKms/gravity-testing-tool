const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
function validateConfig() {
  const required = [
    'SERVER_ENDPOINT',
    'ACCESS_TOKEN',
    'BATCHNAME',
    'INSTANCEID',
    'AUDIT_FILE_PATH'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please create a .env file based on .env.example`
    );
  }
}

/**
 * Configuration object with all environment variables
 */
const config = {
  serverEndpoint: process.env.SERVER_ENDPOINT,
  accessToken: process.env.ACCESS_TOKEN,
  batchName: process.env.BATCHNAME,
  instanceId: process.env.INSTANCEID,
  auditFilePath: process.env.AUDIT_FILE_PATH,
  
  /**
   * Get the full API URL for fetching instance data
   */
  getApiUrl() {
    return `${this.serverEndpoint}/api/instance/${this.batchName}/${this.instanceId}`;
  },

  /**
   * Validate configuration on load
   */
  validate() {
    validateConfig();
  }
};

module.exports = config;
