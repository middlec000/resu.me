# Resu.me

## JSON Resume Wizard

Create a standardized JSON Resume.

Steps

1. (Optional) Upload file + Google Gemini API Key.
1. Review and optionally manually update resume.
1. Download.

## Resume Tailor

Tailor the content of your JSON Resume to a specific job posting.

Steps

1. Upload JSON Resume, Job Posting, paste Google Gemini API Key.
1. Review and download tailored JSON Resume.

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
./node_modules/.bin/resumed validate examples/fred_weasley.json
./node_modules/.bin/resumed validate examples/luna_lovegood.json
./node_modules/.bin/resumed validate examples/moaning_mertle.json
./node_modules/.bin/resumed validate examples/neville_longbottom.json

npx resumed validate model_output/resume_tailored.json
```

## Data Sources

- `examples/json_schema_example.json`
  - https://jsonresume.org/schema
- `artifacts/json_resume_schema.json`
  - Generated from https://jsonresume.org/schema

## To Do
