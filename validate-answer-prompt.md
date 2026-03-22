# validate_answer.md

## Context

I am building an internal application used to audit company projects.

A key component of the system is a **Pre-Audit Checklist**, which contains many questions across multiple domains, including:

* Software Development
* Security
* Project Management
* Requirements Engineering
* Engineering Best Practices

Auditees provide answers to these questions, and the system uses an **LLM** to validate whether each answer sufficiently addresses its corresponding question.

To evaluate the reliability and consistency of this AI validation system, I am building a **Node.js automation tool** that can automatically trigger validation and track results.

Your task is to **read the existing source code, understand the project structure, and implement the command described below.**

Follow the existing architecture, patterns, and coding conventions.

---

# Project Understanding Requirement

Before implementing:

1. Read and understand the current source code.
2. Understand the folder structure and CLI command patterns.
3. Reuse existing utilities and helper functions where possible.

---

# Excel File

The tool must parse the file:

```
data/audit_template.xlsx
```

The Excel sheet contains the following columns:

* InstanceId
* PromptName
* SystemPrompt
* UserPrompt
* PromptId
* PromptVersion
* PromptStatus
* CategoryName
* CategoryId
* SubCategoryName
* SubCategoryId
* SubSubCategoryName
* SubSubCategoryId
* QuestionId
* Question
* ValidateAi
* SubmitValidateStatus
* Answer[index]
* Version[index]
* Status[index]
* AiScore[index]
* AiResponseAt[index]
* AiAnswer[index]

Where:

`index` represents different **test scenarios**.

---

# Command to Implement

```
npm run validate-answer -- --questionId=abc
```

Purpose:

Trigger LLM validation for answers of questions defined in the Excel file.

Parameters:

**questionId (optional)**

* If provided → validate only that specific question.
* If not provided → validate all questions in the Excel file.

---

# Step 1 — Validate questionId

Check whether `questionId` exists in the command.

If it exists:

* Only process that specific question.

If it does not exist:

* Loop through all rows and validate all questions.

---

# Step 2 — Parse Excel File

Read the Excel file and store its contents in memory.

---

# Step 3 — Validate QuestionId in Excel

If `questionId` is provided:

Search for it in:

```
QuestionId
```

If not found:

```
throw "Id not found in excel file"
```

---

# Step 4 — Validate Answer for a Question

If the `QuestionId` exists, perform the following steps:

### Extract Required Fields

Retrieve from the Excel row:

* CategoryId
* CategoryName
* SubCategoryId
* SubSubCategoryId
* QuestionId
* ValidateAi

---

### Skip Invalid Validation

If `ValidateAi` is **null or empty**:

* Skip validation
* Update:

```
SubmitValidateStatus = SKIP
```

---

# Step 5 — Call Validation API

Send the request:

```
POST <SERVER_ENDPOINT>/api/ai/validate
```

Request Body:

```
{
  "questions": [
    {
      "questionId": QuestionId
    }
  ],
  "instanceId": <INSTANCEID from .env>,
  "accountId": <ACCOUNTID from .env>,
  "batchName": <BATCHNAME from .env>,
  "categoryId": CategoryId,
  "subCategoryId": SubCategoryId,
  "subSubCategoryId": SubSubCategoryId,
  "categoryName": CategoryName
}
```

---

# Step 6 — Handle Response

If the API response is successful:

```
SubmitValidateStatus = SUCCESS
```

If the API fails:

```
SubmitValidateStatus = FAILED
```

---

# Step 7 — Add Delay Between Requests

After each validation request:

* Wait approximately **300ms** before sending the next request.

This helps prevent overloading the server or hitting rate limits.

---

# Step 8 — Bulk Validation Mode

If `questionId` is not provided:

1. Loop through all rows in the Excel file.
2. For each row:

   * Apply the same validation logic as above.
3. Update `SubmitValidateStatus` for each question accordingly.

---

# Expected Behavior

The command should:

1. Parse the Excel file.
2. Identify which questions require validation.
3. Trigger LLM validation via API.
4. Update validation status in the Excel file.
5. Support both:

   * single-question validation
   * bulk validation
6. Handle errors gracefully.
7. Respect rate limits using delays.

---

# Important Notes

* Do not overwrite unrelated Excel fields.
* Ensure consistent logging for debugging.
* Skip invalid entries safely.
* Follow the existing CLI structure in the project.
* Ensure the solution scales for large audit datasets.
* Use environment variables for all dynamic values.
