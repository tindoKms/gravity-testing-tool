/**
 * Simple logging utility with colored output
 */

const logger = {
  /**
   * Log an informational message
   */
  info(message) {
    console.log(`[INFO] ${message}`);
  },

  /**
   * Log a success message
   */
  success(message) {
    console.log(`[SUCCESS] ${message}`);
  },

  /**
   * Log a warning message
   */
  warn(message) {
    console.warn(`[WARNING] ${message}`);
  },

  /**
   * Log an error message
   */
  error(message, error) {
    console.error(`[ERROR] ${message}`);
    if (error && error.stack) {
      console.error(error.stack);
    }
  },

  /**
   * Log an error and exit the process
   */
  fatal(message, error) {
    this.error(message, error);
    process.exit(1);
  }
};

module.exports = logger;
