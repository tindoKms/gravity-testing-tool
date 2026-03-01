# Gravity Testing Tool

An internal application testing tool that validates LLM evaluation results for audit processes.

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and provide:
- `SERVER_ENDPOINT`: The API server endpoint (e.g., `localhost:3000`)
- `ACCESS_TOKEN`: Your authentication token
- `BATCHNAME`: The batch name for the audit
- `INSTANCEID`: The instance ID for the audit
- `AUDIT_FILE_PATH`: Path for audit data files (default: `src/data/audit_data.xlsx`)

## Usage

### Generate Audit Template

Creates an Excel template file that can be filled with testing data:

```bash
yarn build-template
```

This command will:
1. Fetch audit questions from the configured API endpoint
2. Generate an Excel file at `data/audit_template.xlsx`
3. Populate it with question data from the API
4. Leave answer fields empty for manual filling

The generated Excel file contains:
- Question hierarchy (Categories, Subcategories, Sub-subcategories)
- All audit questions
- Empty fields for answers and AI evaluation results

## Project Structure

```
gravity-testing-tool/
├── src/
│   ├── index.js                  # Entry point
│   ├── commands/
│   │   └── buildTemplate.js      # Template generation command
│   ├── services/
│   │   ├── apiService.js         # API communication
│   │   ├── excelService.js       # Excel file operations
│   │   └── templateGenerator.js  # Template generation logic
│   └── utils/
│       ├── config.js             # Configuration loader
│       └── logger.js             # Logging utility
└── data/
    └── audit_template.xlsx       # Generated template (gitignored)
```

## Technology Stack

- **Node.js**: JavaScript runtime
- **yarn**: Package manager
- **exceljs**: Excel file generation
- **axios**: HTTP client
- **dotenv**: Environment configuration
- **fs-extra**: Enhanced file system operations

## Error Handling

The tool provides clear error messages for common issues:
- Missing or invalid environment variables
- API connection errors
- Invalid API responses
- File system errors

## License

ISC
