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
  // file-type icons (brand colors baked in)
  claude: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"/></svg>',
  md: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#519aba"><path d="M22.27 19.385H1.73A1.73 1.73 0 0 1 0 17.655V6.345a1.73 1.73 0 0 1 1.73-1.73h20.54A1.73 1.73 0 0 1 24 6.345v11.31a1.73 1.73 0 0 1-1.73 1.73zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.845zM21.232 12h-2.308V8.077h-2.307V12h-2.308l3.461 4.039z"/></svg>',
  py: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#3776AB"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/></svg>',
  js: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#F7DF1E"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>',
  sh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4EAA25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>',
  json: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#cbcb41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>',
};

// Pick an icon for a file by its name/extension.
function iconForFile(name) {
  if (name === "SKILL.md") return I.claude;
  if (name.endsWith(".md")) return I.md;
  if (name.endsWith(".py")) return I.py;
  if (name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs")) return I.js;
  if (name.endsWith(".sh") || name.endsWith(".bash")) return I.sh;
  if (name.endsWith(".json")) return I.json;
  return I.file;
}
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
const openFolders = new Set();

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
      const base = `plugins/${plugin}/skills/${s.skill}`;
      renderFileTree(sChildren, buildFileTree(s.files), base, sKey);
      pChildren.appendChild(sChildren);
    }
    tree.appendChild(pChildren);
  }
}

// Turn ["SKILL.md","scripts/greet.py"] into nested { dirs, files }.
function buildFileTree(files) {
  const root = { dirs: {}, files: [] };
  for (const f of files) {
    const parts = f.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      node.dirs[parts[i]] = node.dirs[parts[i]] || { dirs: {}, files: [] };
      node = node.dirs[parts[i]];
    }
    node.files.push(parts[parts.length - 1]);
  }
  return root;
}

// Render folders (collapsible) then files. Nesting indents via .children wrappers.
function renderFileTree(container, node, basePath, keyPrefix) {
  for (const name of Object.keys(node.dirs).sort()) {
    const fkey = `${keyPrefix}/${name}`;
    const open = openFolders.has(fkey);
    const dRow = el("button", `row ${open ? "open" : ""}`,
      `${I.chev}<span class="ico">${I.folder}</span><span class="label">${escapeHtml(name)}</span>`);
    dRow.onclick = () => { toggle(openFolders, fkey); renderTree(); };
    container.appendChild(dRow);
    if (open) {
      const sub = el("div", "children");
      renderFileTree(sub, node.dirs[name], `${basePath}/${name}`, fkey);
      container.appendChild(sub);
    }
  }
  for (const name of [...node.files].sort()) {
    const path = `${basePath}/${name}`;
    const fRow = el("button", `row file-row ${current.path === path ? "active" : ""}`,
      `<span class="ico">${iconForFile(name)}</span><span class="label">${escapeHtml(name)}</span>`);
    fRow.onclick = () => openFile(path);
    container.appendChild(fRow);
  }
}

function el(tag, cls, html = "") {
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
    setStatus(`saved · ${res.commit.slice(0, 7)}${res.version ? ` · plugin v${res.version}` : ""}`);
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
  // Pick the plugin only — the skill name comes from the zip's top folder.
  let plugin = importTargetPlugin;
  if (!plugin) {
    const names = pluginGroups().map((g) => g[0]);
    plugin = prompt(`Import into which plugin?\n(${names.join(", ")})`, names[0] || "");
  }
  if (!plugin) { e.target.value = ""; return; }
  setStatus("importing…");
  try {
    const fd = new FormData();
    fd.append("plugin", plugin);
    fd.append("file", file);
    const res = await api("/api/import", { method: "POST", body: fd });
    await refresh();
    openPlugins.add(res.plugin);
    openSkills.add(`${res.plugin}/${res.skill}`);
    renderTree();
    setStatus(`imported ${res.written.length} file(s) → ${res.plugin}/${res.skill}`);
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
