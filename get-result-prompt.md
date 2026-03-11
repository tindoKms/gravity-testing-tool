# get_result_prompt.md

## Context

I am building an internal application used to audit company projects.

A core component of the system is a **Pre-Audit Checklist** containing many questions across multiple domains, including:

* Software Development
* Security
* Project Management
* Requirements Engineering
* Engineering Practices

Auditees provide answers to these questions, and the system uses an **LLM** to validate whether the answers sufficiently address the questions.

To evaluate and test the reliability of this AI validation system, I am building a **Node.js automation tool** that can automatically retrieve and record AI validation results.

Your task is to **read the existing source code, understand the project structure, and implement the command described below.**

Follow the existing coding style and architecture.

---

# Project Understanding Requirement

Before implementing anything:

1. Carefully read the existing source code.
2. Understand the folder structure.
3. Understand how existing commands work.
4. Reuse existing utilities and patterns where possible.

---

# Excel File

The tool must parse the following file:

```
data/audit_template.xlsx
```

The Excel sheet contains these columns:

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
* AiProcessedAt[index]
* AiAnswer[index]

Where:

**index** represents different testing scenarios.
Each scenario may contain a different answer for the same question.

---

# Command to Implement

```
npm run get-result -- --index=1 --questionId=abc
```

Purpose:

Retrieve AI validation results for answers that were previously submitted.

Parameters:

**index**

* Indicates which result columns should be filled.
* Example:
  If `index=1`, update:

  * AiScore1
  * AiProcessedAt1
  * AiAnswer1

**questionId (optional)**

* If provided → retrieve results only for that question.
* If not provided → retrieve results for **all questions**.

---

# Step 1 — Retrieve Instance Data

Send the request:

```
GET <SERVER_ENDPOINT>/api/instance/<BATCHNAME>/<INSTANCEID>
```

The response structure will look like the example provided earlier.
{
    "id": "691495d7b0497c6e88880388",
    "batchName": "Test",
    "preAuditTemplate": {
        "id": "68e49f0ea7b11b00085a821b",
        "name": "iQBR Pre-audit Checklist (Q2 - FY26)",
        "preAuditCategories": [
            {
                "id": "1759813398052",
                "name": "Engineering Practices",
                "description": "",
                "displayOrder": 0,
                "subCategories": [
                    {
                        "id": "1759813430436",
                        "name": "Requirement",
                        "description": "",
                        "subSubCategories": [
                            {
                                "id": "1759813455328",
                                "name": "Elicitation",
                                "description": "",
                                "preAuditItems": [
                                    {
                                        "id": "1759813469991",
                                        "question": "How are project requirements gathered from stakeholders?",
                                        "answer": "<p>Test Elicitation 1đậ ashdkfhsakdf khkajds kasdhfkjsha aksdhfksajd kashdfksahdkf jhsakdfhksajdhfksajhdfkjsahkjf hsakdjfhskjahf sak ahsdfkjhsdakjfhaskjhfkjsahkfjhsadkjfhsdkajhfkjashkfhsakjhfjksad</p><p>Test Elicitation 1đậ ashdkfhsakdf khkajds kasdhfkjsha aksdhfksajd kashdfksahdkf jhsakdfhksajdhfksajhdfkjsahkjf hsakdjfhskjahf sak ahsdfkjhsdakjfhaskjhfkjsahkfjhsadkjfhsdkajhfkjashkfhsakjhfjksad</p><p>Test Elicitation 1đậ ashdkfhsakdf khkajds kasdhfkjsha aksdhfksajd kashdfksahdkf jhsakdfhksajdhfksajhdfkjsahkjf hsakdjfhskjahf sak ahsdfkjhsdakjfhaskjhfkjsahkfjhsadkjfhsdkajhfkjashkfhsakjhfjksad</p><p>Test Elicitation 1đậ ashdkfhsakdf khkajds kasdhfkjsha aksdhfksajd kashdfksahdkf jhsakdfhksajdhfksajhdfkjsahkjf hsakdjfhskjahf sak ahsdfkjhsdakjfhaskjhfkjsahkfjhsadkjfhsdkajhfkjashkfhsakjhfjksad</p><p>adsfbsakjbfkjsahkljfhsadkjhfdsa</p>",
                                        "aiAnswer": "SCORE: 0\nSUMMARY: The provided answer consists entirely of placeholder text and gibberish, failing to address the question in any meaningful way. It offers no relevant information on how project requirements are gathered from stakeholders.\nSTRENGTHS:\n*   Uses HTML paragraph formatting.\nWEAKNESSES:\n*   Content is completely nonsensical and irrelevant to the question.\n*   Does not provide any information or techniques related to gathering project requirements.\n*   Appears to be random character strings and placeholder text.\n*   Lacks any coherence, structure, or informative value.\nRECOMMENDATIONS:\n*   Replace the placeholder text with actual, relevant information on methods for gathering project requirements from stakeholders.\n*   List and describe common elicitation techniques such as interviews, workshops, surveys, prototyping, observation, and document analysis.\n*   Explain the purpose and benefits of each technique.\n*   Structure the answer with clear headings and bullet points for readability.",
                                        "aiScore": 0,
                                        "aiProcessedAt": "2025-11-26T22:25:57.66",
                                        "aiProcessing": false,
                                        "version": 7,
                                        "lastModified": "2025-11-23T21:51:11.097",
                                        "lastModifiedBy": "tindo",
                                        "attachmentIds": [
                                            "691496bdb0497c6e888c429a"
                                        ],
                                        "attachments": [
                                            {
                                                "id": "691496bdb0497c6e888c429a",
                                                "name": "option1.PNG",
                                                "size": 52572,
                                                "submitted": false,
                                                "uploaded": true,
                                                "url": "upload/691495d7b0497c6e88880388/option1.PNG"
                                            }
                                        ],
                                        "cloned": false
                                    },
                                    {
                                        "id": "1759813502835",
                                        "question": "What techniques are used for requirement elicitation (e.g., interviews, workshops, surveys)?",
                                        "answer": "<p>Test Elicitation 2</p>",
                                        "aiAnswer": "AI validation is the process of ensuring an AI system functions as intended by evaluating its accuracy, reliability, and safety. It goes beyond basic testing to systematically assess a model's performance on new data, checking for issues like bias, errors, and unexpected failures, especially in real-world conditions. Validation is crucial for building trust, meeting regulatory requirements, and ensuring the AI remains effective over time. ",
                                        "aiScore": 71,
                                        "aiProcessedAt": "2025-11-23T21:51:11.097",
                                        "aiProcessing": false,
                                        "version": 2,
                                        "lastModified": "2025-11-12T21:16:36.215",
                                        "lastModifiedBy": "tindo",
                                        "attachmentIds": [
                                            "691496cbb0497c6e888c4963"
                                        ],
                                        "attachments": [
                                            {
                                                "id": "691496cbb0497c6e888c4963",
                                                "name": "option2.PNG",
                                                "size": 42004,
                                                "submitted": false,
                                                "uploaded": true,
                                                "url": "upload/691495d7b0497c6e88880388/option2.PNG"
                                            }
                                        ],
                                        "cloned": false
                                    }
                                ],
                                "questionGroups": [],
                                "alreadyCloned": false,
                                "displayOrder": 0
                            }
                        ],
                        "questionGroups": [],
                        "alreadyCloned": false,
                        "displayOrder": 0
                    },
                    {
                        "id": "1759819929354",
                        "name": "Development",
                        "description": "",
                        "subSubCategories": [
                            {
                                "id": "1759819935164",
                                "name": "Processes",
                                "description": "",
                                "preAuditItems": [
                                    {
                                        "id": "1759819956751",
                                        "question": "What software development methodology is being followed (e.g., Agile, Scrum, Waterfall)?",
                                        "answer": "<p>I don't follow any thing &nbsp;1</p>",
                                        "aiAnswer": "SCORE: 25\nSUMMARY: The answer directly states that no software development methodology is followed. While this is a literal response to the question, it reveals a critical absence of structured processes, which represents a major deficiency from an internal audit and software engineering best practices perspective. The response indicates a significant control gap without offering any context or alternative practices.\nSTRENGTHS:\n*   Provides a direct answer to the question asked.\nWEAKNESSES:\n*   Indicates a complete absence of any defined software development methodology.\n*   Fails to demonstrate adherence to fundamental software engineering best practices for managing projects and ensuring quality.\n*   Provides no context, rationale, or details about any informal or ad-hoc approaches that might be in place.\n*   Highlights a significant control deficiency that can lead to increased project risks, inconsistencies, lack of predictability, and quality issues.\nRECOMMENDATIONS:\n*   Implement a suitable software development methodology (e.g., Agile, Scrum, Kanban, Waterfall, or a hybrid approach) that aligns with project requirements and organizational goals.\n*   Document the chosen methodology, outlining its key principles, phases, roles, responsibilities, and expected deliverables.\n*   Provide comprehensive training to the development team on the selected methodology to ensure consistent understanding and application across all projects.\n*   Establish a system for monitoring adherence to the defined methodology and regularly evaluate its effectiveness to identify areas for continuous improvement.",
                                        "aiScore": 25,
                                        "aiProcessedAt": "2026-02-11T21:19:00.885",
                                        "aiProcessing": false,
                                        "version": 3,
                                        "lastModified": "2026-02-24T20:58:34.415",
                                        "lastModifiedBy": "tindo",
                                        "attachmentIds": [],
                                        "attachments": [],
                                        "cloned": false
                                    }
                                ],
                                "questionGroups": [],
                                "alreadyCloned": false,
                                "displayOrder": 0
                            }
                        ],
                        "questionGroups": [],
                        "alreadyCloned": false,
                        "displayOrder": 0
                    }
                ],
                "preAuditItems": [],
                "alreadyCloned": false
            }
        ],
        "defaultTemplate": true
    }
}

Important structure:

```
preAuditTemplate
 └── preAuditCategories
      └── subCategories
           └── subSubCategories
                └── preAuditItems
```

Each **preAuditItem** represents a question and contains the AI validation result fields.

Key fields:

* aiScore
* aiProcessedAt
* aiAnswer

---

# Step 2 — Store Template in Memory

Store the entire:

```
preAuditTemplate
```

in memory for later lookup operations.

---

# Step 3 — Validate CLI Parameters

Validate the command arguments.

Rules:

If `index`:

* is missing → set `index = 1`
* is not a number → throw error

```
index is required number
```

---

# Step 4 — Check questionId

Determine whether `questionId` is provided.

If provided:

* Retrieve the result for that single question.

If not provided:

* Retrieve results for **all questions**.

---

# Step 5 — Parse Excel File

Read the Excel file and store its contents in memory for processing.

---

# Step 6 — Validate QuestionId in Excel

If `questionId` is provided:

Search for it in the Excel column:

```
QuestionId
```

If not found:

```
throw "Id not found in excel file"
```

---

# Step 7 — Lookup Result in preAuditTemplate

If the question exists:

Locate the matching question inside:

```
preAuditTemplate → preAuditCategories → subCategories → subSubCategories → preAuditItems
```

Find the object with:

```
preAuditItem.id == questionId
```

Extract the following values:

* aiScore
* aiProcessedAt
* aiAnswer

---

# Step 8 — Write Results to Excel

Update the corresponding row in the Excel sheet.

Fill these columns:

```
AiScore[index]
AiProcessedAt[index]
AiAnswer[index]
```

Where:

```
index = CLI parameter
```

Example:

If `index=1`, update:

```
AiScore1
AiProcessedAt1
AiAnswer1
```

---

# Step 9 — Retrieve All Results (If questionId Not Provided)

If `questionId` is not defined:

1. Loop through all rows in the Excel file.
2. Read each `QuestionId`.
3. Find the corresponding question inside `preAuditTemplate`.
4. Extract:

   * aiScore
   * aiProcessedAt
   * aiAnswer
5. Write the results into the corresponding columns using the same logic as Step 8.

---

# Expected Behavior

The command should:

1. Retrieve the latest audit instance data.
2. Parse the Excel file.
3. Locate each question inside the template.
4. Extract AI validation results.
5. Write results back into the Excel sheet.
6. Support both:

   * Single question retrieval
   * Bulk retrieval for all questions
7. Fail safely when invalid inputs are provided.

---

# Important Notes

* Maintain consistent logging.
* Handle missing data gracefully.
* Do not overwrite unrelated Excel fields.
* Ensure performance remains acceptable when processing large checklists.
* Reuse existing helper utilities from the project whenever possible.
