# submit_answer_prompt.md

## Context

I am building an internal application used to audit company projects.
A major component of the system is a **pre-audit checklist** that contains many questions across different areas such as:

* Software development
* Security
* Management
* Requirements
* Engineering and operational practices

Auditees provide answers to these questions, and the application uses AI to evaluate whether the answers properly address the questions.

To test the reliability of the AI system, I am building a **Node.js automation tool** that can submit answers and validate the results automatically.

Your task is to **read the existing source code, understand the project structure, and implement the command described below.**

Do not ignore any details in the requirements.

---

# Project Understanding Requirement

Before implementing the feature:

1. Read the source code carefully.
2. Understand the folder structure.
3. Understand how the existing commands work.
4. Follow the same coding style and architecture used in the project.

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
* AiResponse[index]

Where:

**index** represents different testing scenarios.

Each scenario can contain a different answer to the same question.

---

# Command to Implement

```
npm run submit -- --index=1 --questionId=abc
```

Purpose:

Submit answers from the Excel file to the audit system.

Parameters:

index
→ identifies which Answer column should be used.

questionId (optional)
→ if provided, only submit the answer for that specific question.
→ if not provided, submit all answers from the selected column.

---

# Step 1 — Retrieve Instance Data

Send the following request:

```
GET <SERVER_ENDPOINT>/api/instance/<BATCHNAME>/<INSTANCEID>
```

The response structure will look similar to the following.
You must understand the format, especially the **preAuditTemplate** field.

(Example response omitted here for brevity but should be assumed identical to the provided structure.)

Important structure:

```
preAuditTemplate
 └── preAuditCategories
      └── subCategories
           └── subSubCategories
                └── preAuditItems
```

Each **preAuditItem** represents a question.

---

# Step 2 — Store Template in Memory

Store the value of:

```
preAuditTemplate
```

in memory so it can be used later when submitting answers.

---

# Step 3 — Validate CLI Parameters

Validate the command line arguments.

Rules:

* `index` is null or undefined => set `index`=1
* `index` must be a number => if invalid, throw `index must be a number`

---

# Step 4 — Check questionId

Check whether `questionId` exists in the command.

If it exists:

* Only submit that specific question.

If it does not exist:

* Submit all answers in the selected column.

---

# Step 5 — Parse Excel File

Read the Excel file and store its contents in memory.

---

# Step 6 — Validate QuestionId in Excel

If `questionId` is provided:

Search the Excel rows for:

```
QuestionId == questionId
```

If not found:

```
throw "Id not found in excel file"
```

---

# Step 7 — Submit Logic

Define a constant representing submit statuses:

```
SKIP
SUCCESS
FAILED
```

For the selected question (or for each question when looping):

### Case 1 — Empty Answer

If the answer is empty:

* Do not call the API
* Update the column:

```
Status[index] = SKIP
```

---

### Case 2 — Answer Exists

1. Locate the question inside **preAuditTemplate**.
2. Determine the current version.
3. Update the Excel column:

```
Version[index]
```

Then submit the answer.

---

# Step 8 — Submit API

Endpoint:

```
POST <SERVER_ENDPOINT>/api/instance/update-answer/<INSTANCEID>/categoryId/<CATEGORYID>
```

Body:

```
{
  id: questionId,
  data: "<p>Answer[index]</p>",
  version: Version[index] + 1
}
```

Where:

INSTANCEID comes from the `.env` configuration.

---

# Step 9 — Update Status

After submitting:

If success:

```
Status[index] = SUCCESS
```

If error:

```
Status[index] = FAILED
```

---

# Step 10 — Submit All Answers (If questionId Not Provided)

If `questionId` is not defined:

Loop through all rows in the Excel file and submit answers using the same logic described in Steps 7–9.

Each answer must be processed sequentially.

---

# Expected Behavior

The command should:

1. Validate inputs.
2. Load the audit template from the server.
3. Parse the Excel file.
4. Submit answers correctly.
5. Track submission status for each row.
6. Update Version and Status columns accordingly.
7. Handle errors safely.
8. Work reliably for both single-question submission and bulk submission.
