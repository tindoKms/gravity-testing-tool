# sync_prompt.md

## Context

I am building an internal application used to audit company projects.

A key component of this system is a **Pre-Audit Checklist** that contains many questions across different areas of a project, including:

* Software Development
* Security
* Project Management
* Requirements Engineering
* Engineering Best Practices

Auditees provide answers to these questions, and the system uses an **LLM** to verify whether the answers sufficiently address the questions.

To test and evaluate the reliability of the AI validation system, I am building a **Node.js automation tool** that can automatically:

* submit answers
* retrieve AI validation results
* synchronize prompts used for LLM evaluation

Your task is to **read the existing source code, understand the project structure, and implement the command described below.**

Follow the current project architecture and coding conventions.

---

# Project Understanding Requirement

Before implementing anything:

1. Read the existing source code carefully.
2. Understand the folder structure.
3. Understand how current CLI commands are implemented.
4. Reuse existing utilities and patterns whenever possible.

---

# Excel File

The tool must parse the file:

```
data/audit_template.xlsx
```

The Excel sheet contains the following columns:

* InstanceId
* PromptName
* PromptDescription
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
* Answer[index]
* Version[index]
* Status[index]
* AiScore[index]
* AiResponseAt[index]
* AiAnswer[index]

Where:

`index` represents different **test scenarios** where users can provide different answers for the same question.

---

# Command to Implement

```
npm run sync-prompt -- --questionId=abc
```

Purpose:

Synchronize prompt configurations from the Excel file into the **iQBR system**.

Parameters:

**questionId (optional)**

* If provided → sync the prompt for that specific question only.
* If not provided → sync prompts for **all questions**.

---

# Step 1 — Validate questionId

Check whether `questionId` exists in the command.

If it exists:

* Sync the prompt only for that specific question.

If it does not exist:

* Loop through all rows in the Excel file and sync prompts for all questions.

---

# Step 2 — Parse Excel File

Read the Excel file and store its contents in memory for processing.

---

# Step 3 — Validate QuestionId in Excel

If `questionId` is provided:

Search for it in the column:

```
QuestionId
```

If no matching row is found:

```
throw "Id not found in excel file"
```

---

# Step 4 — Submit Prompt

If the `QuestionId` exists in the Excel file, perform the following steps:

### Extract Required Fields

Retrieve the following columns from the Excel row:

* PromptName
* PromptDescription
* SystemPrompt
* UserPrompt

---

### Skip Invalid Prompts

If either of the following is **null or empty**:

* PromptName
* UserPrompt

Then:

* Skip submission
* Update the Excel column:

```
PromptStatus = SKIP
```

---

# Step 5 — Call Prompt API

Send the following request:

```
POST <SERVER_ENDPOINT>/api/prompt
```

Request Body:

```
{
  "description": PromptDescription,
  "name": PromptName,
  "systemPrompt": SystemPrompt,
  "userPrompt": UserPrompt
}
```

---

# Step 6 — Process API Response

The API response will look similar to:

```
{
  "id": "69aed1799065697590cb0128",
  "name": "prompt1",
  "description": "",
  "systemPrompt": "aaaa",
  "userPrompt": "aaaa",
  "version": 1,
  "isActive": true,
  "createdAt": "2026-03-09T20:56:09.0084364",
  "updatedAt": "2026-03-09T20:56:09.0084364"
}
```

---

# Step 7 — Update Excel File

If the API response status is **200 (success)**:

Update the Excel row using the response data:

* `PromptId` = response.id
* `PromptVersion` = response.version
* `PromptStatus` = SUCCESS

If the response status is **not 200**:

```
PromptStatus = FAILED
```

---

# Step 8 — Bulk Sync Mode

If `questionId` is **not defined**:

1. Loop through all rows in the Excel file.
2. Perform the same prompt submission logic for each question.
3. Update `PromptStatus`, `PromptId`, and `PromptVersion` accordingly.

---

# Expected Behavior

The command should:

1. Parse the Excel template.
2. Identify prompts that need to be synchronized.
3. Submit prompts to the iQBR system.
4. Record synchronization results back into the Excel file.
5. Support both:

   * single-question prompt sync
   * bulk prompt synchronization.
6. Handle errors gracefully.
7. Maintain consistent logging and status tracking.

---

# Important Notes

* Do not overwrite unrelated Excel fields.
* Ensure proper error handling for API failures.
* Skip invalid prompts safely.
* Follow the project's existing CLI command patterns.
* Ensure the command works reliably for large audit checklists.
