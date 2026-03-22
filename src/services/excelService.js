const ExcelJS = require('exceljs');
const path = require('path');
const fsExtra = require('fs-extra');
const logger = require('../utils/logger');

/**
 * Service for Excel file operations
 */
class ExcelService {
  /**
   * Create an Excel template with the given rows
   * @param {string} outputPath - Path where the Excel file should be created
   * @param {Array<Object>} rows - Array of row data objects
   * @param {number} scenarioCount - Number of test scenarios (default: 1)
   * @returns {Promise<void>}
   */
  async createTemplate(outputPath, rows, scenarioCount = 1) {
    try {
      // Ensure output directory exists
      await fsExtra.ensureDir(path.dirname(outputPath));

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Audit1');

      // Define fixed columns
      const fixedColumns = [
        { header: 'AccountId', key: 'accountId', width: 15 },
        { header: 'InstanceId', key: 'instanceId', width: 15 },
        { header: 'PromptName', key: 'promptName', width: 20 },
        { header: 'PromptDescription', key: 'promptDescription', width: 50 },
        { header: 'SystemPrompt', key: 'systemPrompt', width: 30 },
        { header: 'UserPrompt', key: 'userPrompt', width: 30 },
        { header: 'PromptId', key: 'promptId', width: 15 },
        { header: 'PromptVersion', key: 'promptVersion', width: 10 },
        { header: 'PromptStatus', key: 'promptStatus', width: 10 },
        { header: 'CategoryName', key: 'categoryName', width: 25 },
        { header: 'CategoryId', key: 'categoryId', width: 15 },
        { header: 'SubCategoryName', key: 'subCategoryName', width: 25 },
        { header: 'SubCategoryId', key: 'subCategoryId', width: 15 },
        { header: 'SubSubCategoryName', key: 'subSubCategoryName', width: 25 },
        { header: 'SubSubCategoryId', key: 'subSubCategoryId', width: 15 },
        { header: 'QuestionId', key: 'questionId', width: 15 },
        { header: 'Question', key: 'question', width: 50 },
        { header: 'ValidateAi', key: 'validateAi', width: 15 },
        { header: 'SubmitValidateStatus', key: 'submitValidateStatus', width: 20 }
      ];

      // Add dynamic columns for each scenario
      const dynamicColumns = [];
      for (let i = 1; i <= scenarioCount; i++) {
        dynamicColumns.push(
          { header: `Answer${i}`, key: `answer${i}`, width: 40 },
          { header: `Version${i}`, key: `version${i}`, width: 15 },
          { header: `Status${i}`, key: `status${i}`, width: 30 },
          { header: `AiScore${i}`, key: `aiScore${i}`, width: 15 },
          { header: `AiProcessedAt${i}`, key: `aiProcessedAt${i}`, width: 30 },
          { header: `AiAnswer${i}`, key: `aiAnswer${i}`, width: 40 },
        );
      }

      // Set all columns
      worksheet.columns = [...fixedColumns, ...dynamicColumns];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      rows.forEach(row => {
        worksheet.addRow(row);
      });

      // Auto-fit columns (approximate)
      worksheet.columns.forEach(column => {
        if (!column.width) {
          column.width = 15;
        }
      });

      // Write to file
      await workbook.xlsx.writeFile(outputPath);
      
      logger.success(`Template created: ${outputPath}`);

    } catch (error) {
      if (error.code === 'EACCES') {
        throw new Error(
          `Permission denied: Cannot write to ${outputPath}\n` +
          `Please check file permissions or close the file if it's open.`
        );
      } else if (error.code === 'ENOSPC') {
        throw new Error('No space left on device');
      } else {
        throw new Error(`Failed to create Excel file: ${error.message}`);
      }
    }
  }

  /**
   * Read an Excel file and return rows with header mapping
   * @param {string} filePath - Path to the Excel file
   * @returns {Promise<Array<Object>>} Array of row data
   */
  async readTemplate(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet('Audit1');
      if (!worksheet) {
        throw new Error('Worksheet "Audit1" not found');
      }

      const rows = [];
      const headers = [];

      // Extract headers from first row
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value;
      });

      // Extract data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            rowData[header] = cell.value;
          }
        });

        rows.push(rowData);
      });

      return rows;

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      } else {
        throw new Error(`Failed to read Excel file: ${error.message}`);
      }
    }
  }

  /**
   * Update specific cells in the Excel file and save
   * @param {string} filePath - Path to the Excel file
   * @param {Array<Object>} updates - Array of { rowIndex, columnName, value }
   *   rowIndex is 0-based (relative to data rows, excluding header)
   * @returns {Promise<void>}
   */
  async updateAndSave(filePath, updates) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet('Audit1');
      if (!worksheet) {
        throw new Error('Worksheet "Audit1" not found');
      }

      // Build header-to-column mapping
      const headerMap = {};
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headerMap[cell.value] = colNumber;
      });

      // Apply updates
      updates.forEach(({ rowIndex, columnName, value }) => {
        const colNumber = headerMap[columnName];
        if (!colNumber) {
          throw new Error(`Column "${columnName}" not found in Excel file`);
        }
        // rowIndex is 0-based data row, +2 for 1-based and header row
        const excelRow = rowIndex + 2;
        worksheet.getRow(excelRow).getCell(colNumber).value = value;
      });

      // Save workbook
      await workbook.xlsx.writeFile(filePath);

    } catch (error) {
      if (error.code === 'EACCES') {
        throw new Error(
          `Permission denied: Cannot write to ${filePath}\n` +
          `Please check file permissions or close the file if it's open.`
        );
      } else {
        throw new Error(`Failed to update Excel file: ${error.message}`);
      }
    }
  }
}

module.exports = new ExcelService();
