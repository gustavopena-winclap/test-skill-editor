// Skill Editor frontend — vanilla JS + Monaco. Talks to backend -> GitHub API.
const $ = (id) => document.getElementById(id);
const api = async (url, opts) => {
  const r = await fetch(url, opts);
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("json") ? await r.json() : await r.text();
  if (!r.ok) throw new Error((data && data.error) || r.statusText);
  return data;
};

// ---- lucide-style inline icons ----
const I = {
  chev: '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
  box: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  folder: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>',
  download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>',
  refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>',
  save: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',
  history: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};
// inject icons into data-icon buttons
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.insertAdjacentHTML("afterbegin", I[el.dataset.icon] || "");
});

// ---- state ----
let skills = []; // [{plugin, skill, files:[]}]
let editor = null;
let current = { path: null, sha: null };
const openPlugins = new Set();
const openSkills = new Set();

const setStatus = (msg, isErr = false) => {
  const el = $("status");
  el.textContent = msg;
  el.style.color = isErr ? "var(--danger)" : "var(--muted)";
};
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const langFor = (path) =>
  path.endsWith(".md") ? "markdown" : path.endsWith(".py") ? "python" : path.endsWith(".json") ? "json" : "plaintext";

// ---- Monaco ----
function initMonaco() {
  return new Promise((resolve) => {
    require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
    require(["vs/editor/editor.main"], () => {
      monaco.editor.defineTheme("shadcn-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#0a0a0b",
          "editorGutter.background": "#0a0a0b",
          "editor.lineHighlightBackground": "#18181b",
          "editorLineNumber.foreground": "#52525b",
        },
      });
      editor = monaco.editor.create($("monaco"), {
        value: "",
        language: "markdown",
        theme: "shadcn-dark",
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 12 },
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, save);
      resolve();
    });
  });
}

// ---- tree ----
function pluginGroups() {
  const m = new Map();
  for (const s of skills) {
    if (!m.has(s.plugin)) m.set(s.plugin, []);
    m.get(s.plugin).push(s);
  }
  return [...m.entries()];
}

function renderTree() {
  const tree = $("tree");
  tree.innerHTML = "";
  for (const [plugin, list] of pluginGroups()) {
    const pOpen = openPlugins.has(plugin);
    const pRow = el("button", `row ${pOpen ? "open" : ""}`, `
      ${I.chev}<span class="ico">${I.box}</span><span class="label">${escapeHtml(plugin)}</span>
      <span class="row-act" title="Import skill into ${escapeHtml(plugin)}" data-import-plugin="${escapeHtml(plugin)}">${I.upload}</span>`);
    pRow.onclick = () => { toggle(openPlugins, plugin); renderTree(); };
    tree.appendChild(pRow);
    if (!pOpen) continue;

    const pChildren = el("div", "children");
    for (const s of list) {
      const sKey = `${plugin}/${s.skill}`;
      const sOpen = openSkills.has(sKey);
      const sRow = el("button", `row depth-skill ${sOpen ? "open" : ""}`, `
        ${I.chev}<span class="ico">${I.folder}</span><span class="label">${escapeHtml(s.skill)}</span>
        <span class="row-act" title="Export ${escapeHtml(s.skill)}" data-export="${escapeHtml(sKey)}">${I.download}</span>`);
      sRow.onclick = () => { toggle(openSkills, sKey); renderTree(); };
      pChildren.appendChild(sRow);
      if (!sOpen) continue;

      const sChildren = el("div", "children");
      for (const f of [...s.files].sort()) {
        const path = `plugins/${plugin}/skills/${s.skill}/${f}`;
        const fRow = el("button", `row depth-file ${current.path === path ? "active" : ""}`,
          `<span class="ico">${I.file}</span><span class="label">${escapeHtml(f)}</span>`);
        fRow.onclick = () => openFile(path);
        sChildren.appendChild(fRow);
      }
      pChildren.appendChild(sChildren);
    }
    tree.appendChild(pChildren);
  }
}

function el(tag, cls, html) {
  const n = document.createElement(tag);
  n.className = cls;
  n.innerHTML = html;
  return n;
}
function toggle(set, key) { set.has(key) ? set.delete(key) : set.add(key); }

// row-action clicks (export / import) — stop the row toggle
$("tree").addEventListener("click", (e) => {
  const exp = e.target.closest("[data-export]");
  const imp = e.target.closest("[data-import-plugin]");
  if (exp) { e.stopPropagation(); exportSkill(exp.dataset.export); }
  if (imp) { e.stopPropagation(); startImport(imp.dataset.importPlugin); }
}, true);

// ---- file ops ----
async function openFile(path) {
  setStatus("loading…");
  try {
    const f = await api(`/api/file?path=${encodeURIComponent(path)}`);
    current = { path: f.path, sha: f.sha };
    monaco.editor.setModelLanguage(editor.getModel(), langFor(path));
    editor.setValue(f.content);
    $("filepath").textContent = path;
    $("btn-save").disabled = false;
    renderTree();
    if (!$("history-panel").classList.contains("hidden")) loadHistory();
    setStatus("loaded");
  } catch (e) { setStatus(e.message, true); }
}

async function save() {
  if (!current.path) return;
  $("btn-save").disabled = true;
  setStatus("saving…");
  try {
    const res = await api("/api/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: current.path, content: editor.getValue(),
        message: $("message").value || `Update ${current.path}`, sha: current.sha,
      }),
    });
    current.sha = res.sha;
    $("message").value = "";
    if (!$("history-panel").classList.contains("hidden")) loadHistory();
    setStatus(`saved · ${res.commit.slice(0, 7)}`);
  } catch (e) { setStatus(e.message, true); }
  finally { $("btn-save").disabled = false; }
}

// ---- history ----
async function loadHistory() {
  if (!current.path) { $("history").innerHTML = '<li class="muted">Open a file first.</li>'; return; }
  const commits = await api(`/api/history?path=${encodeURIComponent(current.path)}`);
  $("history").innerHTML = commits.map((c) => `<li>
    <span class="msg">${escapeHtml(c.message.split("\n")[0])}</span>
    <span class="meta">${escapeHtml(c.author || "?")} · ${fmt(c.date)} · ${c.sha.slice(0, 7)}</span>
    <span class="acts">
      <button class="mini" data-view="${c.sha}">view</button>
      <button class="mini danger" data-restore="${c.sha}">restore</button>
    </span></li>`).join("");
}
$("history").addEventListener("click", async (e) => {
  const view = e.target.dataset.view, restore = e.target.dataset.restore;
  if (view) {
    const f = await api(`/api/file-at-commit?path=${encodeURIComponent(current.path)}&commit=${view}`);
    editor.setValue(f.content);
    setStatus(`viewing ${view.slice(0, 7)} — edit & Save to keep`);
  }
  if (restore) {
    if (!confirm(`Restore to ${restore.slice(0, 7)}? Creates a new commit.`)) return;
    setStatus("restoring…");
    try {
      const res = await api("/api/restore", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: current.path, commit: restore }),
      });
      await openFile(current.path);
      setStatus(`restored · ${res.commit.slice(0, 7)}`);
    } catch (err) { setStatus(err.message, true); }
  }
});

// ---- export / import ----
function exportSkill(key) {
  const [plugin, skill] = key.split("/");
  window.location.href = `/api/export?plugin=${encodeURIComponent(plugin)}&skill=${encodeURIComponent(skill)}&format=skill`;
}
let importTargetPlugin = null;
function startImport(plugin) {
  importTargetPlugin = plugin;
  $("import-file").click();
}
$("import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  let plugin = importTargetPlugin;
  if (!plugin) plugin = prompt("Import into which plugin?", pluginGroups()[0]?.[0] || "");
  if (!plugin) return;
  const def = file.name.replace(/\.(zip|skill)$/i, "");
  const skill = prompt("Skill name (folder):", def);
  if (!skill) return;
  setStatus("importing…");
  try {
    const fd = new FormData();
    fd.append("plugin", plugin); fd.append("skill", skill); fd.append("file", file);
    const res = await api("/api/import", { method: "POST", body: fd });
    await refresh();
    openPlugins.add(plugin); openSkills.add(`${plugin}/${skill}`); renderTree();
    setStatus(`imported ${res.written.length} file(s) into ${plugin}/${skill}`);
  } catch (err) { setStatus(err.message, true); }
  finally { e.target.value = ""; importTargetPlugin = null; }
});

// ---- boot ----
const fmt = (d) => (d ? new Date(d).toLocaleString() : "");
async function refresh() {
  skills = await api("/api/skills");
  renderTree();
}
async function boot() {
  await initMonaco();
  try {
    const cfg = await api("/api/config");
    $("repo").textContent = `${cfg.owner}/${cfg.repo}@${cfg.branch}`;
    await refresh();
    const first = pluginGroups()[0];
    if (first) openPlugins.add(first[0]), renderTree();
  } catch (e) { setStatus(e.message, true); }
}

$("btn-refresh").onclick = refresh;
$("btn-save").onclick = save;
$("btn-import").onclick = () => startImport(null);
$("btn-history").onclick = () => { $("history-panel").classList.toggle("hidden"); loadHistory(); };
$("btn-history-close").onclick = () => $("history-panel").classList.add("hidden");
boot();
