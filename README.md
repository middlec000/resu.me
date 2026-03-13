# Resu.me

## Development Phases

### V0

Inputs
Expansive Resume Dataset (formatted)
Job Description (formatted)
LLM Prompt

Output
Tailored Resume (formatted)

### V1

Add Resume (formatted) -> formatted PDF

### V2

Update expansive resume format to be more comprehensive

### V3

Add ingestion of existing resume to JSON format

### V4

Hire Jason to build website

## Notes

Google Gemini API Key: https://aistudio.google.com/api-keys?projectFilter=gen-lang-client-0692511141

```bash
# Validate resume conforms to schema
./node_modules/.bin/resumed validate examples/json_schema_example.json

# Transform resume to html with specific format
./node_modules/.bin/resumed render examples/json_resume.json --theme jsonresume-theme-straightforward --output examples/json_resume.html

# Tailor resume to job posting
node src/tailor_resume.js; tput bel

node src/format_resume.js; tput bel

node src/run.js

# Transform resume to html with specific format
./node_modules/.bin/resumed render model_output/resume_tailored_1.json --theme jsonresume-theme-straightforward --output model_output/resume_tailored_1.html

# Validate resume conforms to schema
./node_modules/.bin/resumed validate "model_output copy/resume_tailored_1.json"

npx resumed validate model_output/resume_tailored.json
```

## Data Sources

- `examples/json_schema_example.json`
  - https://jsonresume.org/schema
- `examples/job_posting_example_1.txt`
  - https://icrunchdata.com/job/10305028/staff-data-scientist-product-applied-ai/

## To Do
