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
  res.json(await saveFile({ path: p, content, message, sha }));
}));

app.get("/api/history", wrap(async (req, res) => {
  res.json(await getHistory(req.query.path));
}));

app.get("/api/file-at-commit", wrap(async (req, res) => {
  res.json(await getFileAtCommit(req.query.path, req.query.commit));
}));

app.post("/api/restore", wrap(async (req, res) => {
  const { path: p, commit, message } = req.body;
  res.json(await restoreFile({ path: p, commitSha: commit, message }));
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

// Import a .zip/.skill into plugins/<plugin>/skills/<skill>/ (one commit per file).
app.post("/api/import", upload.single("file"), wrap(async (req, res) => {
  const { plugin, skill } = req.body;
  if (!plugin || !skill) return res.status(400).json({ error: "plugin and skill required" });
  if (!req.file) return res.status(400).json({ error: "no file uploaded" });
  const zip = new AdmZip(req.file.buffer);
  const base = `plugins/${plugin}/skills/${skill}`;
  const written = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    // Drop a leading top-level folder (e.g. "skill-name/SKILL.md" -> "SKILL.md").
    const rel = entry.entryName.replace(/^[^/]+\//, "");
    if (!rel || rel.includes("..")) continue;
    await upsertFile({
      path: `${base}/${rel}`,
      content: entry.getData().toString("utf8"),
      message: `Import ${rel} into ${plugin}/${skill}`,
    });
    written.push(rel);
  }
  res.json({ plugin, skill, written });
}));

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Skill editor on http://localhost:${port}  (repo ${config.owner}/${config.repo}@${config.branch})`)
);
