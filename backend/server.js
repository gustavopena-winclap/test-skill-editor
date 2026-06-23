import "dotenv/config";
import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  listSkills,
  listSkillFiles,
  getFile,
  saveFile,
  upsertFile,
  getHistory,
  getFileAtCommit,
  restoreFile,
  pluginOf,
  bumpPluginVersion,
  config,
} from "./github.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Serve the plain-HTML frontend.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Small wrapper so route handlers can throw and we return a clean 500.
const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((e) => {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message });
  });

app.get("/api/config", (_req, res) => res.json(config));

app.get("/api/skills", wrap(async (_req, res) => {
  res.json(await listSkills());
}));

app.get("/api/file", wrap(async (req, res) => {
  res.json(await getFile(req.query.path));
}));

app.put("/api/file", wrap(async (req, res) => {
  const { path: p, content, message, sha } = req.body;
  const result = await saveFile({ path: p, content, message, sha });
  const plugin = pluginOf(p);
  if (plugin) result.version = await bumpPluginVersion(plugin);
  res.json(result);
}));

app.get("/api/history", wrap(async (req, res) => {
  res.json(await getHistory(req.query.path));
}));

app.get("/api/file-at-commit", wrap(async (req, res) => {
  res.json(await getFileAtCommit(req.query.path, req.query.commit));
}));

app.post("/api/restore", wrap(async (req, res) => {
  const { path: p, commit, message } = req.body;
  const result = await restoreFile({ path: p, commitSha: commit, message });
  const plugin = pluginOf(p);
  if (plugin) result.version = await bumpPluginVersion(plugin);
  res.json(result);
}));

// Export a skill as a .zip (the .skill format is just a renamed zip).
app.get("/api/export", wrap(async (req, res) => {
  const { plugin, skill, format } = req.query;
  const files = await listSkillFiles(plugin, skill);
  if (!files.length) return res.status(404).json({ error: "skill not found" });
  const zip = new AdmZip();
  for (const f of files) {
    const { content } = await getFile(f.path);
    zip.addFile(`${skill}/${f.rel}`, Buffer.from(content, "utf8"));
  }
  const ext = format === "skill" ? "skill" : "zip";
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${skill}.${ext}"`);
  res.send(zip.toBuffer());
}));

// Import a .zip/.skill into a plugin. The skill name is derived from wherever the
// SKILL.md sits inside the archive, so flat zips, single-folder zips and nested
// zips all work. The skill must contain a SKILL.md (REFERENCE.md, FORMS.md,
// scripts/* etc. are optional). One commit per file.

// Junk that archivers (esp. macOS Finder "Compress") inject — never import it.
const isJunk = (name) =>
  name.split("/").some((p) => p === "__MACOSX" || p === ".DS_Store" || p.startsWith("._"));

app.post("/api/import", upload.single("file"), wrap(async (req, res) => {
  const { plugin } = req.body;
  if (!plugin) return res.status(400).json({ error: "plugin required" });
  if (!req.file) return res.status(400).json({ error: "no file uploaded" });

  let zip;
  try {
    zip = new AdmZip(req.file.buffer);
  } catch {
    return res.status(400).json({ error: "not a valid .zip / .skill archive" });
  }
  const entries = zip.getEntries().filter((e) => !e.isDirectory && !isJunk(e.entryName));
  if (!entries.length) return res.status(400).json({ error: "empty archive" });

  // Locate SKILL.md anywhere; its folder is the skill root regardless of how the
  // archive wraps it (flat, single-folder, or nested).
  const skillEntry = entries.find(
    (e) => e.entryName === "SKILL.md" || e.entryName.endsWith("/SKILL.md")
  );
  if (!skillEntry) return res.status(400).json({ error: "archive must contain a SKILL.md" });
  const prefix = skillEntry.entryName.slice(0, -"SKILL.md".length); // "" | "skill/" | "a/b/"

  // Skill name: explicit field > wrapping folder > uploaded file name.
  let skill =
    req.body.skill ||
    (prefix ? prefix.replace(/\/$/, "").split("/").pop() : path.parse(req.file.originalname || "").name);
  if (!skill || !skill.trim())
    return res.status(400).json({ error: "could not determine skill name" });
  skill = skill.trim().replace(/[^A-Za-z0-9._-]/g, "-");

  // Keep only files under the skill root; strip the prefix so they land at root.
  const files = entries
    .filter((e) => e.entryName.startsWith(prefix))
    .map((e) => ({ rel: e.entryName.slice(prefix.length), entry: e }))
    .filter((f) => f.rel && !f.rel.includes(".."));

  if (!files.some((f) => f.rel === "SKILL.md"))
    return res.status(400).json({ error: "skill must contain a SKILL.md at its root" });

  const base = `plugins/${plugin}/skills/${skill}`;
  const written = [];
  for (const f of files) {
    await upsertFile({
      path: `${base}/${f.rel}`,
      content: f.entry.getData().toString("utf8"),
      message: `Import ${f.rel} into ${plugin}/${skill}`,
    });
    written.push(f.rel);
  }
  const version = await bumpPluginVersion(plugin);
  res.json({ plugin, skill, written, version });
}));

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Skill editor on http://localhost:${port}  (repo ${config.owner}/${config.repo}@${config.branch})`)
);
