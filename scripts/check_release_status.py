"""Check preview status membership and script payload integrity."""

from collections import Counter
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def check_documentation():
    internal_names = {'AGENTS.MD', 'RELEASE_STATUS.MD', 'TASK_CASE_STATUS.MD'}
    draft_markers = re.compile(
        r'(?im)^\s*#{1,6}\s+.*\b(?:unreleased|handoff|readiness|internal notes)\b'
        r'|\breviewer update prepared\b|\blocal candidate update\b'
        r'|\bunder review\b|\bprovisional\b|\bunder development\b'
        r'|\blatest status\s*[—:]|\bmanual upload\b'
    )
    for path in ROOT.rglob('*.md'):
        if '.git' in path.relative_to(ROOT).parts:
            continue
        if path.name.upper() in internal_names or path.name.upper().startswith('HANDOFF'):
            raise ValueError('Internal documentation in preview: ' + str(path.relative_to(ROOT)))
        if draft_markers.search(path.read_text()):
            raise ValueError('Draft/preparation prose in preview: ' + str(path.relative_to(ROOT)))


def main():
    check_documentation()
    catalog = json.loads((ROOT / 'catalog.json').read_text())
    status = json.loads((ROOT / 'evaluation-status.json').read_text())
    expected = {item['id'] for task in catalog['tasks'] for item in task['cases']}
    if len(expected) != catalog['total_cases'] or set(status['cases']) != expected:
        raise ValueError('Preview and evaluation status memberships differ')
    if status['total_cases'] != catalog['total_cases']:
        raise ValueError('Stale snapshot case count')
    allowed = {'dual_qualified': 'formal', 'formal_incomplete': 'formal',
               'oracle_unresolved': 'formal', 'retained_testbench': 'testbench'}
    for case in status['cases'].values():
        if allowed.get(case['status']) != case['family']:
            raise ValueError('Invalid evaluation family/status pair')
    counts = Counter(case['status'] for case in status['cases'].values())
    formal = status['formal_artifacts']
    if (counts['dual_qualified'] != formal['dual_packages']
            or counts['oracle_unresolved'] != formal['oracle_unresolved']
            or counts['formal_incomplete'] + counts['oracle_unresolved'] != formal['incomplete']
            or counts['retained_testbench'] != status['families']['testbench']
            or sum(status['families'].values()) != status['total_cases']):
        raise ValueError('Stale evaluation status totals')
    for filename, payload in [('catalog', catalog), ('evaluation-status', status)]:
        script = (ROOT / f'viewer-data/{filename}.js').read_text()
        prefix = f'window.RTLBenchLSData.register("{filename}.json",'
        if not script.startswith(prefix) or not script.endswith(');\n'):
            raise ValueError('Invalid script data wrapper')
        if json.loads(script[len(prefix):-3]) != payload:
            raise ValueError('JSON and script data differ')
        if len(script.encode()) >= 8 * 1024 * 1024:
            raise ValueError('Data script exceeds the anonymous host file limit')
    navigation = (ROOT / 'index.html').read_text() + (ROOT / 'app.js').read_text()
    if re.search(r'https?://(?:jing-wang-1999|github\.com/Jing-Wang-1999)', navigation, re.I):
        raise ValueError('Personal navigation link in preview')
    for task in catalog['tasks']:
        for item in task['cases']:
            if not (ROOT / item['detail']).is_file():
                raise ValueError('Missing case detail file')
    print(json.dumps({'passed': True, 'cases': len(expected), 'statuses': dict(counts)}, indent=2))


if __name__ == '__main__':
    main()
