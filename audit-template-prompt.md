# Audit Tool Design Prompt

## Context

I am building an internal application used to audit company projects. One key component of the system is a **pre-audit checklist** that contains many questions covering different areas of a project, including:

* Software development
* Security
* Management
* Requirements
* Other engineering and operational practices

Auditees must answer these questions, and the application uses an AI model to evaluate whether the answers sufficiently address the questions.

I want to build a **testing tool** that validates whether the LLM’s evaluation results are reasonable and consistent.

Your task is to design a **Node.js testing tool** that automates this process.

**Important:**
Before implementing anything, you must first produce a **detailed execution plan for review.**

---

# Technical Requirements

## Technology

The tool must use:

* **Node.js (JavaScript only, no TypeScript)**
* **yarn** for dependency management

---

# Excel File Structure

The tool must read and generate `.xlsx` files that contain the following columns:

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
* AiScore[index]
* AiResponse[index]

Where:

`index` represents different testing scenarios.
Each scenario may contain a different answer for the same question.

---

# Environment Configuration

Create a `.env` file containing:

SERVER_ENDPOINT=localhost:3000
ACCESS_TOKEN=abcdshfk...
BATCHNAME=Test
INSTANCEID=abcdfasc
AUDIT_FILE_PATH=src/data/audit_data.xlsx

The application must load and use these variables dynamically.

---

# First Feature to Implement

Command:

npm run build-template

Purpose:
Generate an Excel template that users will later fill with testing data.

Output file:

data/audit_template.xlsx

---

# Step 1 — Call API

Send the request:

GET <SERVER_ENDPOINT>/api/instance/<BATCHNAME>/<INSTANCEID>

The API response contains a structure similar to:

preAuditTemplate
└── preAuditCategories
  └── subCategories
    └── subSubCategories
      └── preAuditItems

Each **preAuditItem** represents a question in the audit checklist.

---

# Step 2 — Generate Excel File

Create the file:

data/audit_template.xlsx

Create a sheet named:

Audit1

The sheet must contain the following columns:

InstanceId
PromptName
SystemPrompt
UserPrompt
CategoryName
CategoryId
SubCategoryName
SubCategoryId
SubSubCategoryName
SubSubCategoryId
QuestionId
Question
Answer1
AiScore1
AiResponse1

---

# Step 3 — Populate Data

Loop through:

preAuditTemplate.preAuditCategories

And populate rows using the following mapping:

InstanceId
→ value from environment variable INSTANCEID

PromptName
→ leave empty

SystemPrompt
→ leave empty

UserPrompt
→ leave empty

CategoryName
→ preAuditCategory.name

CategoryId
→ preAuditCategory.id

SubCategoryName
→ subCategory.name

SubCategoryId
→ subCategory.id

SubSubCategoryName
→ subSubCategory.name

SubSubCategoryId
→ subSubCategory.id

QuestionId
→ preAuditItem.id

Question
→ preAuditItem.question

Answer1
→ empty (user fills later)

AiScore1
→ empty

AiResponse1
→ empty

---

# Requirement Before Coding

Before writing any code, you must:

1. Analyze the problem carefully.
2. Produce a clear **execution plan**.
3. Explain:

   * overall architecture
   * folder structure
   * libraries used
   * Excel processing strategy
   * API integration
   * error handling
4. Wait for approval before implementing the solution.

Do not generate implementation code until the execution plan has been reviewed.
