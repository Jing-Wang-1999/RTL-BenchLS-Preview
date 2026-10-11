# RTL-BenchLS case preview

We provide **18,851 cases** for RTL generation, completion, and debugging at
Module-level and Project-level scopes, using Direct and Round-trip protocols.
The benchmark includes **12 task formulations**, organized into **14 task
entries** with the three Direct Project-level debugging subtypes listed separately.

This website presents the benchmark overview and design-size figures. Its case
browser provides filters, agent contracts, round-trip stages, file browsing,
and reference/oracle access.

## Our website: [RTL-BenchLS overview and case browser](https://anonymous.4open.science/w/RTL-BenchLS-Preview-D301/)

Open the [benchmark homepage](https://anonymous.4open.science/w/RTL-BenchLS-Preview-D301/) or the
[case browser](https://anonymous.4open.science/w/RTL-BenchLS-Preview-D301/review.html).

## Review a case

Choose a task, filter by case ID, source group, or balanced slice, and open a
case. The page identifies the agent input, expected output, reference RTL, and
verification oracle. Task 2.3 retains both whole-module and masked-region
protocol views. Open a file name to read or download its content.

Use the evaluation filter to find cases with qualified formal evaluation packages.

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
| `evaluation-status.json` | Availability from validated public evaluation manifests |
| `viewer-data/` | Script-loadable data for anonymous hosting |
| `cases/` | Case-specific contracts and file lists |
| `assets/` | Content-addressed specifications, RTL, scripts, and retained metadata |
| `.nojekyll`, `robots.txt` | Static publication and indexing preferences |
