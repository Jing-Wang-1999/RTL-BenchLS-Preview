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
    interface = ''.join((ROOT / name).read_text()
                        for name in ('index.html', 'app.js', 'home.js', 'README.md'))
    forbidden = (
        'Evaluation availability', 'Validated release snapshot:',
        'formal cases remain incomplete', 'Formal artifacts incomplete',
        'Oracle unresolved', 'Both formal tools qualified',
        'qualified-count', 'incomplete-count', 'coverageSummary',
    )
    if any(marker in interface for marker in forbidden):
        raise ValueError('Internal engineering status in reviewer interface')
    catalog = json.loads((ROOT / 'catalog.json').read_text())
    status = json.loads((ROOT / 'evaluation-status.json').read_text())
    expected = {item['id'] for task in catalog['tasks'] for item in task['cases']}
    if len(expected) != catalog['total_cases'] or set(status['cases']) != expected:
        raise ValueError('Preview and evaluation status memberships differ')
    if status['total_cases'] != catalog['total_cases']:
        raise ValueError('Stale snapshot case count')
    if status['schema'] != 'rtl_benchls.verification_files.v2':
        raise ValueError('Unexpected preview verification metadata schema')
    if set(status) != {'schema', 'total_cases', 'cases'}:
        raise ValueError('Engineering audit annotations in preview metadata')
    for case in status['cases'].values():
        if case['family'] not in ('formal', 'testbench'):
            raise ValueError('Invalid verification method')
        if {'status', 'state', 'missing', 'oracle_status', 'reason'} & case.keys():
            raise ValueError('Engineering audit annotations in preview case')
        if case['family'] == 'testbench' and case.get('package'):
            raise ValueError('Testbench case has an unexpected formal package')
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
    print(json.dumps({'passed': True, 'cases': len(expected)}, indent=2))


if __name__ == '__main__':
    main()
