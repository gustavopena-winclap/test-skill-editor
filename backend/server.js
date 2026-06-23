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

// Import a .zip/.skill into a plugin. The skill name comes from the zip's single
// top-level folder; the skill must contain a SKILL.md (REFERENCE.md, FORMS.md,
// scripts/* etc. are optional). One commit per file.
app.post("/api/import", upload.single("file"), wrap(async (req, res) => {
  const { plugin } = req.body;
  if (!plugin) return res.status(400).json({ error: "plugin required" });
  if (!req.file) return res.status(400).json({ error: "no file uploaded" });

  const entries = new AdmZip(req.file.buffer).getEntries().filter((e) => !e.isDirectory);
  if (!entries.length) return res.status(400).json({ error: "empty zip" });

  // Every entry must live under one shared top-level folder = the skill name.
  const tops = new Set(entries.map((e) => e.entryName.split("/")[0]));
  const wrapped = tops.size === 1 && entries.every((e) => e.entryName.includes("/"));
  let skill = req.body.skill;
  if (!skill) {
    if (!wrapped)
      return res.status(400).json({
        error: "zip must contain a single top-level folder named after the skill",
      });
    skill = [...tops][0];
  }
  skill = skill.trim().replace(/[^A-Za-z0-9._-]/g, "-");

  // Strip the leading "<skill>/" so files land at the skill root.
  const files = entries
    .map((e) => ({ rel: wrapped ? e.entryName.replace(/^[^/]+\//, "") : e.entryName, entry: e }))
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
