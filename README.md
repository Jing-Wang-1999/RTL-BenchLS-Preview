# RTL-BenchLS case preview

This website introduces RTL-BenchLS through the paper's benchmark overview and
design-size figures. Its separate case browser provides human review of 14 task
entries and 18,851 case records, with filters, agent contracts, round-trip stages,
file browsing, and reference/oracle access.

## Open the website

Open the [benchmark homepage](index.html) or the [case browser](review.html).
These relative links use the website's current hosting address.

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
| `index.html`, `home.css`, `home.js` | Benchmark homepage and compatibility redirects |
| `figures/` | Vector exports of paper figures |
| `review.html`, `app.js`, `style.css` | Case browser |
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
Regenerate from the validated case indexes, validate the complete export, then
update only this dedicated preview repository. Report bugs with the task ID,
original case ID, browser ID, and page URL. The homepage describes 12 task
formulations; the browser has 14 entries because direct project debugging
lists three subtypes separately.
