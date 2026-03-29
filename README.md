# resu.me

Two tools for creating and tailoring a [JSON Resume](https://jsonresume.org/).

| Tool                   | Purpose                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **JSON Resume Wizard** | Extract a JSON Resume from a PDF or plain-text file (AI), or build one manually in the browser |
| **Resume Tailor**      | Tailor an existing JSON Resume to a specific job posting (AI) and optionally render to HTML    |

---

## Quick start

```bash
# Install dependencies
npm install

# Start the web server (serves from repo root)
npm run serve
# → http://localhost:8080/tools/wizard/web/   JSON Resume Wizard
# → http://localhost:8080/tools/tailor/web/   Resume Tailor
```

Set your Gemini API key once so you don't have to paste it every time:

```bash
export GEMINI_API_KEY=your_key_here
```

Get a free key at <https://aistudio.google.com/api-keys>.

---

## JSON Resume Wizard

Create a standardised JSON Resume from a PDF, plain-text file, or from scratch.

### Web UI

```
http://localhost:8080/tools/wizard/web/
```

1. Drop a PDF or fill in the form manually.
2. Review all fields in the Resume Editor.
3. Download `resume.json`.

### CLI

```bash
# From a PDF
npm run wizard -- --input path/to/resume.pdf --output output/wizard/resume.json

# From a plain-text file
npm run wizard -- --input path/to/resume.txt

# All options
npm run wizard -- --help
```

Options:

| Flag                  | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `-i, --input <path>`  | Resume PDF (`.pdf`) or plain-text (`.txt`) file — **required** |
| `-o, --output <path>` | Output JSON path (default: `output/wizard/<basename>.json`)    |
| `-k, --api-key <key>` | Gemini API key (falls back to `GEMINI_API_KEY` env var)        |

---

## Resume Tailor

Tailor an existing JSON Resume to a specific job posting.

### Web UI

```
http://localhost:8080/tools/tailor/web/
```

1. Upload your JSON Resume and paste or upload the job posting.
2. Click **Tailor Resume**.
3. Download the tailored JSON, or open it in the Resume Editor.

### CLI

```bash
# Tailor only (outputs JSON)
npm run tailor -- --resume path/to/resume.json --job path/to/job_posting.txt

# Tailor and render to HTML
npm run tailor -- --resume path/to/resume.json --job path/to/job_posting.txt --render

# All options
npm run tailor -- --help
```

Options:

| Flag                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `-r, --resume <path>` | Input JSON Resume — **required**                            |
| `-j, --job <path>`    | Job posting `.txt` file — **required**                      |
| `-o, --output <path>` | Output JSON path (default: `output/tailor/<basename>.json`) |
| `--render`            | Also render the tailored resume to HTML alongside the JSON  |
| `-k, --api-key <key>` | Gemini API key (falls back to `GEMINI_API_KEY` env var)     |

---

## Repo structure

```
shared/
  validate_resume_schema.js   Lightweight JSON Schema validator (shared by CLI + browser)
  json_resume_schema.json     JSON Resume schema (responseSchema for Gemini + browser validation)

tools/
  wizard/
    cli.js                    CLI entry point  (`npm run wizard`)
    lib/
      pdf_to_json.js          Gemini: PDF → JSON Resume
      text_to_json.js         Gemini: plain text → JSON Resume
    web/
      index.html              Get Started page (PDF upload or manual entry)
      editor.html             Full-featured Resume Editor SPA

  tailor/
    cli.js                    CLI entry point (`npm run tailor`)
    lib/
      tailor_resume.js        Gemini: JSON Resume + job posting → tailored JSON Resume
      format_output.js        JSON Resume → HTML (via `resumed` + theme)
    web/
      index.html              Resume Tailor SPA

artifacts/
  tailor_resume_to_job_posting/   Prompt text files for the tailor tool
  text_to_formatted_json/         Prompt text files for the wizard text→JSON tool

examples/                     Sample resumes and job postings for testing
output/                       Generated artefacts (gitignored)
```
