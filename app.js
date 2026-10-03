"use strict";

// Static files provide the catalog, case contracts, and content-addressed assets.
const PAGE_SIZE = 50;
let catalog;
let renderGeneration = 0;
const detailCache = new Map();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function route(parameters) {
  return "#" + new URLSearchParams(parameters).toString();
}

function contractTable(contract) {
  const rows = ["Input", "Output", "Score"].map(label =>
    `<tr><th style="width:95px">${label}</th><td>${escapeHtml(contract[label] || "—")}</td></tr>`
  ).join("");
  return `<div class="card"><table><tbody>${rows}</tbody></table></div>`;
}

function previewNotice() {
  if (catalog.assets_included) {
    return '<p class="warn">Human case review. Public/stage inputs and model-hidden reference RTL and verification scripts are available here. Do not give an evaluated agent access to the reference assets. Experiment logs, compiled outputs, and credentials are excluded.</p>';
  }
  return `<p class="warn">Public inventory preview. Actual input files, golden RTL, and private verification assets are not published here. Case identifiers are preview identifiers; report them when describing a UI bug.</p>`;
}

function dashboard() {
  let body = `<h1>Benchmark case browser</h1><p class="muted">Browse ${catalog.tasks.length} task entries and ${catalog.total_cases.toLocaleString()} benchmark cases.</p>${previewNotice()}`;
  for (const scope of ["module-level", "project-level"]) {
    body += `<h2>${escapeHtml(scope)}</h2><div class="grid">`;
    for (const task of catalog.tasks.filter(item => item.scope === scope)) {
      body += `<div class="card"><span class="pill">Task ${task.id}</span><h3><a href="${route({task: task.id})}">${escapeHtml(task.name)}</a></h3><strong>${task.count.toLocaleString()}</strong> cases</div>`;
    }
    body += "</div>";
  }
  return body;
}

function options(values, selected, label) {
  return `<option value="">${label}</option>` + values.map(value =>
    `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`
  ).join("");
}

function taskList(task, parameters) {
  const query = parameters.get("q") || "";
  const group = parameters.get("group") || "";
  const slice = parameters.get("slice") || "";
  const groups = [...new Set(task.cases.map(item => item.group).filter(Boolean))].sort();
  const slices = [...new Set(task.cases.map(item => item.slice).filter(Boolean))].sort();
  const rows = task.cases.filter(item =>
    (!group || item.group === group) && (!slice || item.slice === slice) &&
    (!query || `${item.id} ${item.original_id || ""} ${item.parent} ${item.group} ${item.slice}`.toLowerCase().includes(query.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(parameters.get("page")) || 1));
  const selected = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  let body = `<p><a href="#">← All tasks</a></p><h1>Task ${task.id}: ${escapeHtml(task.name)}</h1><p><strong>${task.count.toLocaleString()}</strong> cases · ${rows.length.toLocaleString()} match the filters</p>${contractTable(task.contract)}`;
  body += `<form id="filters" class="card row"><input name="q" value="${escapeHtml(query)}" placeholder="Search case or parent"><select name="group">${options(groups, group, "All source groups")}</select><select name="slice">${options(slices, slice, "All slices")}</select><button>Filter</button></form>`;
  body += `<div class="scroll"><table><thead><tr><th>Case</th><th>Parent</th><th>Source group</th><th>Balanced slice</th></tr></thead><tbody>`;
  for (const item of selected) {
    body += `<tr><td><a href="${route({task: task.id, case: item.id})}">${escapeHtml(item.original_id || item.id)}</a></td><td>${escapeHtml(item.parent)}</td><td>${escapeHtml(item.group || "—")}</td><td>${escapeHtml(item.slice || "—")}</td></tr>`;
  }
  if (!selected.length) body += '<tr><td colspan="4">No matching cases.</td></tr>';
  body += "</tbody></table></div><div class=\"pager\">";
  const pageParameters = {task: task.id, q: query, group, slice};
  body += page > 1 ? `<a href="${route({...pageParameters, page: page - 1})}">← Previous</a>` : "<span></span>";
  body += `<span>Page ${page} / ${totalPages}</span>`;
  body += page < totalPages ? `<a href="${route({...pageParameters, page: page + 1})}">Next →</a>` : "<span></span>";
  return body + "</div>";
}

function stagePanel(stage, index) {
  return `<div class="card"><div class="stage-step">STAGE ${index + 1}</div><table><tbody><tr><th>Input</th><td>${escapeHtml(stage.input)}</td></tr><tr><th>Instruction</th><td>${escapeHtml(stage.instruction)}<p class="muted small">Protocol summary; exact case/runtime prompt is not included in this public preview.</p></td></tr><tr><th>Output</th><td><strong>${escapeHtml(stage.output)}</strong></td></tr></tbody></table></div>`;
}

function caseDetail(task, caseId) {
  const item = task.cases.find(row => row.id === caseId);
  if (!item) return "<h1>Unknown case</h1>";
  let body = `<p><a href="${route({task: task.id})}">← Task ${task.id}</a></p><h1>Case ${escapeHtml(item.id)}</h1><p class="muted">${escapeHtml(task.name)}</p><span class="pill">${escapeHtml(item.parent)}</span>`;
  if (item.group) body += `<span class="pill">${escapeHtml(item.group)}</span>`;
  if (item.slice) body += `<span class="pill">${escapeHtml(item.slice)}</span>`;
  body += previewNotice();
  if (task.stages.length) {
    body += '<h2>Round-trip: Stage 1 → generated text → Stage 2</h2>';
    if (task.id === "2.3") {
      body += '<p class="muted">The panels show the newer specialist/targeted masked-region protocol. Historical case-package templates instead request a whole-module specification in Stage 1 and supply that specification with masked RTL in Stage 2. Existing results retain their recorded protocol.</p>';
    }
    body += `<div class="stage-grid">${task.stages.map(stagePanel).join("")}</div><div class="flow">Stage 1 output → abstraction gate → fresh Stage 2 input. The intermediate prose is generated by the evaluated model. Stage 2 receives neither the clean RTL nor the Stage 1 conversation.</div>`;
    body += `<h2>Private final evaluation</h2><div class="card">${escapeHtml(task.contract.Score)}<p class="muted">Reference RTL and oracle files remain private and are absent from this website.</p></div>`;
  } else {
    body += '<h2>Agent input, submission, and evaluation</h2>' + contractTable(task.contract);
  }
  body += '<h2>Case assets</h2><div class="card"><p>The public preview contains inventory metadata and task-level contracts. It does not include this case’s specification, RTL context, reference implementation, or formal/testbench scripts. The internal reviewer contains the full case assets.</p></div>';
  return body;
}

async function loadDetail(item) {
  if (!detailCache.has(item.detail)) {
    const response = await fetch("./" + item.detail);
    if (!response.ok) throw new Error(`Case request failed: ${response.status}`);
    detailCache.set(item.detail, await response.json());
  }
  return detailCache.get(item.detail);
}

function fileList(task, item, detail, parameters) {
  const query = parameters.get("file_q") || "";
  const files = detail.files.filter(file => file.name.toLowerCase().includes(query.toLowerCase()));
  const protocol = parameters.get("protocol") || "stored";
  let body = `<h2>Retained case files</h2><form id="file-filters" class="card row"><input name="file_q" value="${escapeHtml(query)}" placeholder="Filter file names, e.g. golden or tcl"><button>Filter files</button></form><p class="muted">${files.length.toLocaleString()} matching files. “Private” labels mean hidden from the evaluated model, not hidden from human reviewers.</p>`;
  const sections = [...new Set(files.map(file => file.section))];
  for (const section of sections) {
    const style = section.startsWith("Private") ? "private" : section.startsWith("Public") ? "public" : "";
    body += `<div class="card"><h3><span class="pill ${style}">${escapeHtml(section)}</span></h3><table><tbody>`;
    for (const file of files.filter(row => row.section === section)) {
      body += `<tr><td class="path"><a href="${route({task: task.id, case: item.id, protocol, file: file.name})}">${escapeHtml(file.name)}</a></td><td>${file.size.toLocaleString()} bytes</td></tr>`;
    }
    body += "</tbody></table></div>";
  }
  return body;
}

async function fullCaseDetail(task, item, parameters) {
  const detail = await loadDetail(item);
  const protocol = parameters.get("protocol") === "region" ? "region" : "stored";
  const fileName = parameters.get("file");
  if (fileName) {
    const file = detail.files.find(row => row.name === fileName);
    if (!file) return '<h1>File not exported</h1><p>Logs, compiled outputs, and unrelated files are excluded from the public reviewer.</p>';
    let body = `<p><a href="${route({task: task.id, case: item.id, protocol})}">← Case ${escapeHtml(detail.case_id)}</a></p><h1>${escapeHtml(file.name)}</h1><p><a href="./${file.url}" target="_blank" rel="noopener">Open raw file</a> · <a href="./${file.url}" download="${escapeHtml(file.name.split("/").pop())}">Download</a></p>`;
    if (file.binary) return body + '<div class="card">Use Open raw file to inspect this binary asset.</div>';
    const response = await fetch("./" + file.url);
    if (!response.ok) throw new Error(`Asset request failed: ${response.status}`);
    const text = await response.text();
    return body + `<pre>${escapeHtml(text)}</pre>`;
  }
  let body = `<p><a href="${route({task: task.id})}">← Task ${task.id}</a></p><h1>${escapeHtml(detail.case_id)}</h1><p class="muted">${escapeHtml(task.name)}</p>${previewNotice()}`;
  body += `<div class="card"><table><tbody><tr><th>Browser ID</th><td>${escapeHtml(item.id)}</td></tr><tr><th>Parent</th><td>${escapeHtml(detail.parent_id || "—")}</td></tr><tr><th>Source group</th><td>${escapeHtml(item.group || "—")}</td></tr><tr><th>Balanced slice</th><td>${escapeHtml(item.slice || "—")}</td></tr></tbody></table></div>`;
  body += detail.entry_point || "";
  body += detail.panels[protocol] || detail.panels.stored;
  return body + fileList(task, item, detail, parameters);
}

function guide() {
  if (catalog.assets_included) {
    return '<h1>Review guide</h1><div class="card"><p>Select a task, filter its case inventory, and open a case. Start with <strong>Agent entry point — start here</strong>: it identifies the starting instruction separately from supporting input files and required outputs. Task 1.2 also shows recorded Codex launch wording and a linked input-file sequence.</p><p>The case page separates the agent-facing input, expected output, model-hidden reference, and verification oracle. Round-trip module tasks have two separate stage panels. Open a file name to read or download a specification, RTL file, or verification script. Task 2.3 retains both whole-module and masked-region protocol views. Exact prompt-retention gaps are labeled as in the internal viewer.</p><p>Private/reference labels describe the evaluation boundary. Humans may inspect these files, but evaluated agents must not receive them. This static reviewer does not execute evaluations. Some historical cases retain linked-parent or runner-assembled inputs rather than a standalone workspace.</p><p>Experiment logs, compiler outputs, and credentials are excluded. Report bugs using the task, original case ID, browser ID, and page URL.</p><p>This site is public. Removing it later cannot retract copies already downloaded.</p></div>';
  }
  return `<h1>Review guide</h1><div class="card"><p>Select a task, filter its case inventory, and open a case to inspect the agent input, expected submission, and scoring contract. Round-trip case pages separate Stage 1 and Stage 2.</p><p>This is a metadata preview, not a downloadable benchmark release. Case pages show task-level contracts rather than exact retained prompts. All input files and private verification assets remain on the internal server.</p><p>To report a bug, include the task ID, browser case ID, page URL, and observed behavior. Preview IDs map to original case IDs in a private local manifest.</p><p>This link is public. Search-engine indexing is discouraged, but access is not restricted. Removing the deployment later cannot retract copies already downloaded.</p></div>`;
}

async function render() {
  const generation = ++renderGeneration;
  const hash = window.location.hash.slice(1);
  const parameters = new URLSearchParams(hash);
  const task = catalog.tasks.find(item => item.id === parameters.get("task"));
  let body;
  if (hash === "guide") body = guide();
  else if (!hash) body = dashboard();
  else if (!task) body = "<h1>Unknown task</h1>";
  else if (parameters.has("case")) {
    const item = task.cases.find(row => row.id === parameters.get("case"));
    if (catalog.assets_included && item) {
      document.getElementById("content").innerHTML = '<p>Loading case assets…</p>';
      try {
        body = await fullCaseDetail(task, item, parameters);
      } catch (error) {
        body = `<h1>Could not load case</h1><p>${escapeHtml(error.message)}</p>`;
      }
    } else body = caseDetail(task, parameters.get("case"));
  }
  else body = taskList(task, parameters);
  if (generation !== renderGeneration) return;
  document.getElementById("content").innerHTML = body;
  const form = document.getElementById("filters");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      window.location.hash = route({task: task.id, ...values}).slice(1);
    });
  }
  const fileForm = document.getElementById("file-filters");
  if (fileForm) {
    fileForm.addEventListener("submit", event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(fileForm));
      window.location.hash = route({
        task: task.id,
        case: parameters.get("case"),
        protocol: parameters.get("protocol") || "stored",
        ...values,
      }).slice(1);
    });
  }
  window.scrollTo(0, 0);
}

async function start() {
  try {
    const response = await fetch("./catalog.json");
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    catalog = await response.json();
    window.addEventListener("hashchange", render);
    render();
  } catch (error) {
    document.getElementById("content").textContent = `Could not load the preview: ${error.message}`;
  }
}

start();
