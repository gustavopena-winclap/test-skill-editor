# How Skills work

Skills leverage Claude's VM environment to provide capabilities beyond what's possible with prompts alone. Claude operates in a virtual machine with filesystem access, allowing Skills to exist as directories containing instructions, executable code, and reference materials, organized like an onboarding guide you'd create for a new team member.

This filesystem-based architecture enables progressive disclosure: Claude loads information in stages as needed, rather than consuming context upfront.

Three types of Skill content, three levels of loading
Skills can contain three types of content, each loaded at different times:

## Level 1: Metadata (always loaded)
Content type: Instructions. The Skill's YAML frontmatter provides discovery information:

---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
Claude loads this metadata at startup and includes it in the system prompt. This lightweight approach means you can install many Skills without context penalty; Claude only knows each Skill exists and when to use it.

## Level 2: Instructions (loaded when triggered)
Content type: Instructions. The main body of SKILL.md contains procedural knowledge: workflows, best practices, and guidance:

PDF Processing

Quick start

Use pdfplumber to extract text from PDFs:

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For advanced form filling, see [FORMS.md](FORMS.md).
When you request something that matches a Skill's description, Claude reads SKILL.md from the filesystem via bash. Only then does this content enter the context window.

## Level 3: Resources and code (loaded as needed)
Content types: Instructions, code, and resources. Skills can bundle additional materials:

pdf-skill/
├── SKILL.md (main instructions)
├── FORMS.md (form-filling guide)
├── REFERENCE.md (detailed API reference)
└── scripts/
    └── fill_form.py (utility script)
Instructions: Additional markdown files (FORMS.md, REFERENCE.md) containing specialized guidance and workflows

Code: Executable scripts (fill_form.py, validate.py) that Claude runs via bash; scripts provide deterministic operations without consuming context

Resources: Reference materials like database schemas, API documentation, templates, or examples

Claude accesses these files only when referenced. The filesystem model means each content type has different strengths: instructions for flexible guidance, code for reliability, resources for factual lookup.

Level	When Loaded	Token Cost	Content
Level 1: Metadata	Always (at startup)	~100 tokens per Skill	name and description from YAML frontmatter
Level 2: Instructions	When Skill is triggered	Under 5k tokens	SKILL.md body with instructions and guidance
Level 3+: Resources	As needed	Effectively unlimited	Bundled files executed via bash without loading contents into context
Progressive disclosure ensures only relevant content occupies the context window at any given time.



## Where Skills work:
### claude.ai supports both pre-built Agent Skills and custom Skills.

Pre-built Agent Skills: These Skills are already working behind the scenes when you create documents. Claude uses them without requiring any setup.

Custom Skills: Upload your own Skills as zip files through Settings > Features. Available on Pro, Max, Team, and Enterprise plans with code execution enabled. Custom Skills are individual to each user; they are not shared organization-wide and cannot be centrally managed by admins.