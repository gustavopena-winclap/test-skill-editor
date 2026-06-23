# demo-skill-share

A Claude Code **plugin marketplace** plus a small **fullstack web app** to edit the
skills from a browser form. One repo, two parts.

## 1. Marketplace

```
.claude-plugin/marketplace.json   # lists the plugins
plugins/
├── skills-pack/                  # plugin 1
│   └── skills/
│       ├── greet-basic/          # only SKILL.md
│       ├── greet-reference/      # SKILL.md + REFERENCE.md
│       └── greet-full/           # SKILL.md + REFERENCE.md + FORMS.md + scripts/
└── second-plugin-test/           # plugin 2
    └── skills/
        ├── echo-basic/           # only SKILL.md
        ├── echo-reference/       # SKILL.md + REFERENCE.md
        └── echo-full/            # everything
```

Every skill is a hello-world: it takes a little data and prints it back, so you can
confirm the marketplace, references, forms, and scripts all load.

Add it in Claude Code with `/plugin marketplace add <path-or-repo>`, then install a plugin.

## 2. Skill editor (fullstack)

`backend/` — Node + Express, reads/writes skills through the **GitHub REST API**
(commits + history + restore). Serves the frontend too.

`frontend/` — vanilla JS, **dark shadcn-style UI** with a VS Code-style collapsible
sidebar tree (plugin → skill → file) and a **Monaco** code editor. Features:

- edit any file with syntax highlighting, save with a commit message (Ctrl/Cmd+S)
- view history of a file, restore any past version (one new commit)
- **export** a skill as `.skill`/`.zip` (download icon on a skill row)
- **import** a `.zip`/`.skill` into a plugin (upload icon on a plugin row, or the top bar)

Monaco loads from a CDN, so the editor needs internet access.

### Run

```bash
cd backend
npm install
cp .env.example .env     # fill in GITHUB_TOKEN, owner, repo, branch
npm start                # http://localhost:3000
```

The token needs **Contents: Read & Write** on the target repo. Push this repo to GitHub
first so the editor has something to read.
