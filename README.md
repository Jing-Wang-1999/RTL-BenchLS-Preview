# RTL-BenchLS case preview

This static website provides human review of 14 paper task entries and 18,851
frozen case records. It preserves the internal reviewer's visual style, filters,
agent contracts, round-trip stages, file browsing, and reference/oracle access.

## Open the website

After GitHub Pages is enabled, the project URL is:

<https://jing-wang-1999.github.io/RTL-BenchLS-Preview/>

For initial setup, select **Settings → Pages → Deploy from a branch → main →
/(root) → Save**. The `.nojekyll` file makes this a static-file deployment.
This repository is separate from the owner's personal profile repository.

## Review a case

Choose a task, filter by case ID, source group, or balanced slice, and open a
case. The page identifies the agent input, expected output, reference RTL, and
verification oracle. Task 2.3 retains both whole-module and masked-region
protocol views. Open a file name to read or download its content.

“Public” and “private” are evaluation boundaries: humans may inspect reference
files, but evaluated models must not receive them. This website does not run
models or verification tools. Some historical cases retain runner-assembled
inputs, linked-parent references, or protocol summaries rather than an exact
standalone prompt; those limitations remain visible.

## Files and updates

| Path | Purpose |
| --- | --- |
| `index.html`, `app.js`, `style.css` | Static review interface |
| `catalog.json` | Task index and case membership |
| `cases/` | Case-specific contracts and file lists |
| `assets/` | Content-addressed specifications, RTL, scripts, and retained metadata |
| `.nojekyll`, `robots.txt` | Static publication and indexing preferences |

There are 214,829 file references backed by 73,738 unique assets. Duplicate
contents are stored once. Logs, compiled outputs, credentials, and one oversized
simulation trace CSV are excluded. Retained scripts may contain historical
server paths; this preview is not a claim of portable verification replay.
Source attribution and license terms remain with the retained files; this
preview grants no new blanket license over upstream designs.

The source exporter is maintained in the engineering project under
`benchmark/review/build_public.py` and `benchmark/review/export_case_assets.py`.
Regenerate from the audited frozen indexes, validate the complete export, then
update only this dedicated preview repository. Report bugs with the task ID,
original case ID, preview ID, and page URL.
