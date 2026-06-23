// Thin wrapper over the GitHub Contents/Git APIs used by the editor.
import { Octokit } from "@octokit/rest";

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
const branch = GITHUB_BRANCH || "main";

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.warn(
    "[github] Missing GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO — copy .env.example to .env."
  );
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const base = { owner: GITHUB_OWNER, repo: GITHUB_REPO };

const b64encode = (s) => Buffer.from(s, "utf8").toString("base64");
const b64decode = (s) => Buffer.from(s, "base64").toString("utf8");

// Skill = any dir matching plugins/<plugin>/skills/<skill>/.
const SKILL_RE = /^plugins\/([^/]+)\/skills\/([^/]+)\/(.+)$/;

// List every skill and its files via one recursive tree call.
export async function listSkills() {
  const { data } = await octokit.git.getTree({
    ...base,
    tree_sha: branch,
    recursive: "true",
  });
  const skills = new Map();
  for (const node of data.tree) {
    if (node.type !== "blob") continue;
    const m = node.path.match(SKILL_RE);
    if (!m) continue;
    const [, plugin, skill, file] = m;
    const key = `${plugin}/${skill}`;
    if (!skills.has(key)) skills.set(key, { plugin, skill, files: [] });
    skills.get(key).files.push(file);
  }
  return [...skills.values()].sort(
    (a, b) => a.plugin.localeCompare(b.plugin) || a.skill.localeCompare(b.skill)
  );
}

// Read a file: returns { path, content, sha }.
export async function getFile(path) {
  const { data } = await octokit.repos.getContent({ ...base, path, ref: branch });
  if (Array.isArray(data)) throw new Error(`${path} is a directory`);
  return { path, content: b64decode(data.content), sha: data.sha };
}

// Create or update a file (one commit). sha required when overwriting.
export async function saveFile({ path, content, message, sha }) {
  const { data } = await octokit.repos.createOrUpdateFileContents({
    ...base,
    path,
    message: message || `Update ${path}`,
    content: b64encode(content),
    branch,
    ...(sha ? { sha } : {}),
  });
  return { path, sha: data.content.sha, commit: data.commit.sha };
}

// Commit history touching a path.
export async function getHistory(path) {
  const { data } = await octokit.repos.listCommits({
    ...base,
    sha: branch,
    path,
    per_page: 30,
  });
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author?.name,
    date: c.commit.author?.date,
  }));
}

// File content at a specific commit (for previewing / restoring).
export async function getFileAtCommit(path, commitSha) {
  const { data } = await octokit.repos.getContent({
    ...base,
    path,
    ref: commitSha,
  });
  if (Array.isArray(data)) throw new Error(`${path} is a directory`);
  return { path, content: b64decode(data.content) };
}

// All file paths under one skill (relative to repo root).
export async function listSkillFiles(plugin, skill) {
  const prefix = `plugins/${plugin}/skills/${skill}/`;
  const { data } = await octokit.git.getTree({
    ...base,
    tree_sha: branch,
    recursive: "true",
  });
  return data.tree
    .filter((n) => n.type === "blob" && n.path.startsWith(prefix))
    .map((n) => ({ path: n.path, rel: n.path.slice(prefix.length) }));
}

// Create or overwrite a file, looking up its current sha if it exists.
export async function upsertFile({ path, content, message }) {
  let sha;
  try {
    ({ sha } = await getFile(path));
  } catch {
    sha = undefined; // new file
  }
  return saveFile({ path, content, message, sha });
}

// Restore a file to its content at an older commit (new commit on top).
export async function restoreFile({ path, commitSha, message }) {
  const old = await getFileAtCommit(path, commitSha);
  const current = await getFile(path); // need current sha to overwrite
  return saveFile({
    path,
    content: old.content,
    message: message || `Restore ${path} to ${commitSha.slice(0, 7)}`,
    sha: current.sha,
  });
}

export const config = { ...base, branch };
