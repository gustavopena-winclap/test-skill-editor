# Skill Editor — Project Plan & Architecture

> A web interface for non-technical users to edit Claude Cowork plugin skills stored in a private GitHub repo, with version history and rollback. No GitHub account required for end users.

---

## Objective

Replace the GitHub branch/PR workflow for skill editing with a simple form-based UI. Non-technical users open the app, pick a skill, edit it, and save. All Git operations happen invisibly in the background via the GitHub REST API.

---

## Core User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Non-tech user | Sign in with my @wincap.com Google account | I don't need a separate password |
| Non-tech user | See a list of all skills | I know what I can edit |
| Non-tech user | Open a skill and read its content | I understand what it does |
| Non-tech user | Edit a skill in a simple text area | I can update it without knowing Git |
| Non-tech user | Save my changes with a note | My update is committed to the repo |
| Non-tech user | See the history of a skill | I can track who changed what |
| Non-tech user | Restore a previous version | I can roll back a bad edit in one click |
| Admin | Add this app to the existing Clerk instance | Only @wincap.com users get access, no extra auth system needed |

---

## Architecture Overview

```
┌─────────────────────────────┐
│        Browser (SPA)        │
│                             │
│  Skill List  │  Editor      │
│  History     │  Save / Roll │
└──────┬──────────────────────┘
       │                │
       │ GitHub API     │ Clerk SDK
       │ (PAT in env)   │ (auth check)
       ▼                ▼
┌──────────────┐  ┌─────────────────────┐
│ GitHub REST  │  │   Clerk (existing)  │
│ API v3       │  │                     │
│              │  │  OAuth via Google   │
│ GET/PUT      │  │  Domain whitelist:  │
│ /contents    │  │  @wincap.com only   │
│ /commits     │  └─────────────────────┘
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│   Your Private GitHub Repo  │
│                             │
│  plugins/                   │
│  └── my-plugin/             │
│      └── skills/            │
│          ├── skill-a/       │
│          │   └── SKILL.md   │
│          └── skill-b/       │
│              └── SKILL.md   │
└─────────────────────────────┘
```

**No backend server required.** Clerk runs entirely client-side. The GitHub PAT lives in env vars baked at build time — users never see it.

---

## Technical Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React (Vite) | Fast setup, component-friendly |
| Styling | Tailwind CSS | Utility-first, no design system needed |
| Auth | Clerk (existing company instance) | Already set up, handles @wincap.com domain restriction |
| Markdown editor | CodeMirror or plain `<textarea>` | SKILL.md is plain text, simple is fine |
| GitHub calls | Native `fetch` | No extra dependencies |
| State | `useState` / `useReducer` | No backend, no need for Redux |
| Hosting | Vercel / Netlify | Free, static, env vars supported natively |

---

## GitHub API Operations

All calls use a shared **Personal Access Token (PAT)** with `repo` scope.

### 1. List skills (scan repo directory)

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{skills-root-path}
```

Returns an array of directories. For each, fetch `SKILL.md` metadata.

### 2. Read a skill

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}/SKILL.md
```

Response includes `content` (base64-encoded) and `sha` (needed for updates).

```js
const content = atob(response.content); // decode base64
const sha = response.sha;               // store this — required for PUT
```

### 3. Save a skill (direct commit to main)

```
PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}/SKILL.md

Body:
{
  "message": "Update skill-name — <user note>",
  "content": btoa(newContent),   // base64-encode
  "sha": "<current file sha>",   // from step 2
  "branch": "main"
}
```

### 4. Fetch version history

```
GET https://api.github.com/repos/{owner}/{repo}/commits?path={path}/SKILL.md&per_page=20
```

Returns array of commits with `sha`, `commit.message`, `commit.author.name`, `commit.author.date`.

### 5. Read a specific old version

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}/SKILL.md?ref={commit-sha}
```

Returns file content at that commit. Decode and show it in the editor.

### 6. Rollback (restore old version)

Same as **Save (step 3)** — just pass the old content as the new content. Add a commit message like `"Rollback skill-name to version from <date>"`.

---

## App Structure

```
src/
├── main.jsx                   # ClerkProvider wraps everything
├── App.jsx                    # SignedIn/SignedOut guard + layout
├── components/
│   ├── SkillList.jsx          # Left sidebar: list of skills
│   ├── SkillEditor.jsx        # Right panel: textarea + save
│   ├── HistoryPanel.jsx       # Drawer: list of past versions
│   └── VersionViewer.jsx      # Show old content + restore button
├── hooks/
│   ├── useGitHub.js           # All GitHub API calls
│   └── useSkills.js           # Skills state management
└── config.js                  # Repo path constants (from env vars)
```

---

## UI Layout

```
┌────────────────────────────────────────────────────────┐
│  🔧 Skill Editor             [repo: org/my-plugin]     │
├──────────────────┬─────────────────────────────────────┤
│                  │                                      │
│  Skills          │  skill-name / SKILL.md               │
│  ──────────      │  ──────────────────────────────────  │
│  ✦ skill-a  ←── │  [                                 ] │
│    skill-b       │  [   textarea: editable content    ] │
│    skill-c       │  [                                 ] │
│                  │  ──────────────────────────────────  │
│                  │  Save note: [________________]       │
│                  │  [💾 Save]         [🕐 History]      │
└──────────────────┴─────────────────────────────────────┘
```

History drawer (slides in from right on "History" click):

```
┌───────────────────────────────┐
│  Version History              │
│  ─────────────────────────    │
│  ● 2h ago · Maria · "Update..." │  [View]
│  ● 1d ago · Juan  · "Fix..."  │  [View]
│  ● 3d ago · Ana   · "Add..."  │  [View]
└───────────────────────────────┘
```

Version viewer (replaces editor panel):

```
┌──────────────────────────────────────────┐
│  Viewing version from: Jan 12 · Maria    │
│  ──────────────────────────────────────  │
│  [  read-only content preview          ] │
│  ──────────────────────────────────────  │
│  [↩ Restore this version]  [← Back]     │
└──────────────────────────────────────────┘
```

---

## Authentication — Clerk

The app uses your **existing Clerk instance** for auth. Users sign in with their `@wincap.com` Google account. Anyone outside that domain is rejected by Clerk before they ever see the app.

### How it works

```
User opens app
      ↓
Clerk checks session
      ↓ (not signed in)
Redirect → Clerk-hosted sign-in page
      ↓
User clicks "Continue with Google"
      ↓
Clerk checks email domain → must be @wincap.com
      ↓ (domain OK)
Redirect back to app, session established
      ↓
App renders — GitHub PAT loaded from env vars (user never sees it)
```

### Clerk setup (one-time, in your Clerk dashboard)

1. Add this app's URL as an allowed redirect origin
2. In **Restrictions → Allowlist**, enable "Email address allowlist" and add `@wincap.com` as an allowed domain (or use the existing restriction if already configured for other apps)
3. Copy your **Publishable Key** (`pk_live_...`) for the env vars below

### Install & wrap the app

```bash
npm install @clerk/clerk-react
```

Wrap `App.jsx` with `ClerkProvider`:

```jsx
// main.jsx
import { ClerkProvider } from '@clerk/clerk-react'

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

Protect the app with `<SignedIn>` / `<SignedOut>`:

```jsx
// App.jsx
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react'

export default function App() {
  return (
    <>
      <SignedIn>
        {/* full app here */}
        <UserButton />  {/* shows avatar + sign out in the header */}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

### Using the logged-in user's name in commits

Clerk exposes the user's name and email. Pull it to attribute commits correctly — no need to ask users their name:

```jsx
import { useUser } from '@clerk/clerk-react'

const { user } = useUser()
const authorName = user.fullName        // "Maria García"
const authorEmail = user.emailAddresses[0].emailAddress  // "maria@wincap.com"

// Use in commit message:
`Update ${skillName} — saved by ${authorName}`

// Or pass as commit author if using the GitHub API's author field:
"author": { "name": authorName, "email": authorEmail }
```

This means every commit in GitHub shows the real person's name — full audit trail with zero extra effort from users.

### Auth flow in the UI

No setup screen needed. On first visit:

```
┌─────────────────────────────────────────┐
│                                         │
│         Sign in to Skill Editor         │
│                                         │
│    [  Continue with Google  ]           │
│                                         │
│    Only @wincap.com accounts allowed    │
│                                         │
└─────────────────────────────────────────┘
```

After sign-in, the app loads directly. The header shows the user's avatar and a sign-out option via Clerk's `<UserButton />`.

### Configuration & Auth section removed

The old PAT setup screen is **no longer needed**. The GitHub token lives entirely in env vars — users never configure anything.

---

## Environment Variables

```env
# .env.local (not committed to git)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
VITE_REPO=your-org/your-repo
VITE_SKILLS_PATH=plugins/my-plugin/skills
```

On Vercel/Netlify, add these in the project's environment variables settings. The build bakes them in — users never see or touch them.

---

## Key Implementation Notes

### SHA requirement for updates
GitHub requires the current file SHA on every PUT. Always fetch the file fresh before saving to get the latest SHA. Store it in state after reading.

### Base64 encoding
GitHub API sends and receives file content as base64.
- Read: `atob(response.content)`
- Write: `btoa(unescape(encodeURIComponent(content)))` — use this version to safely handle non-ASCII characters (accents, etc.)

### Commit author attribution
Clerk provides the logged-in user's name and email automatically via `useUser()`. Pass these directly into the GitHub commit — no need to ask users anything. Every commit shows the real person's name in GitHub history.

### Rate limits
GitHub's API allows 5,000 requests/hour per token. For an internal team, this is never an issue.

### Error handling
Handle these cases explicitly in the UI:
- `409 Conflict` on PUT → SHA mismatch (someone else saved between your read and write) → re-fetch and prompt user to retry
- `401 Unauthorized` → bad or expired token → redirect to setup screen
- `404` → wrong path configured → show clear error message

---

## Rollout Plan

### Phase 1 — MVP (1–2 days)
- [ ] Vite + React + Tailwind scaffold
- [ ] Install `@clerk/clerk-react`, add `VITE_CLERK_PUBLISHABLE_KEY` to env
- [ ] Wrap app in `ClerkProvider`, add `<SignedIn>` / `<RedirectToSignIn>` guard
- [ ] List skills from GitHub
- [ ] Read and display a skill
- [ ] Edit and save a skill (direct commit to main, author from Clerk `useUser()`)

### Phase 2 — History & Rollback (1 day)
- [ ] Fetch commit history for a skill
- [ ] View old version (read-only)
- [ ] Restore old version (commit with rollback message)

### Phase 3 — Polish (1 day)
- [ ] Diff view: show what changed between versions
- [ ] Unsaved changes warning before navigation
- [ ] Success/error toast notifications
- [ ] Loading skeletons

### Phase 4 — Optional
- [ ] Markdown preview toggle (render SKILL.md as formatted text)
- [ ] Search/filter skills by name
- [ ] Multi-skill support across multiple plugin folders
- [ ] Deploy to GitHub Pages or Vercel

---

## Out of Scope

- Per-user GitHub accounts (one shared PAT for all)
- PR/approval workflow (Option A: direct commit only)
- Creating or deleting skills (edit only)
- Multi-repo support
- Real-time collaboration / conflict resolution beyond retry prompt

---

## Quick Start Commands

```bash
# Scaffold
npm create vite@latest skill-editor -- --template react
cd skill-editor
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @clerk/clerk-react
npx tailwindcss init -p

# Dev
npm run dev

# Build & deploy
npm run build
# → deploy dist/ to Vercel or Netlify, set env vars in their dashboard
```

---

## Summary

| Question | Answer |
|----------|--------|
| Backend needed? | No |
| Database needed? | No |
| GitHub account per user? | No |
| Who can access the app? | Only `@wincap.com` Google accounts (enforced by Clerk) |
| How do users log in? | "Continue with Google" — uses existing Clerk instance |
| How are changes saved? | Direct commit to `main` via GitHub API |
| Commit attribution? | Automatic — Clerk provides user's name and email |
| How is rollback done? | Re-commit old file content |
| Where is the GitHub token? | Env vars baked at build time — users never see it |
| Where is it hosted? | Vercel or Netlify |
| Time to build MVP? | ~2 days |
