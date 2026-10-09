"""Portable, dependency-free static export check. Not browser/device validation."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, re, hashlib

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        for attr in ('href','src','poster'):
            if attrs.get(attr): self.refs.append(attrs[attr])
    handle_startendtag=handle_starttag

def run():
    assert (DIST/'index.html').is_file(), 'Missing dist/index.html'
    config=json.loads((ROOT/'vercel.json').read_text())
    assert config['framework'] is None and config['outputDirectory']=='dist'
    assert config['buildCommand']=='' and config['installCommand']==''
    assert not config.get('rewrites'), 'Avoid routing asset requests to HTML'
    parsed={}
    refs=[]; external=set(); failures=[]
    for p in DIST.rglob('*.html'):
        doc=Page(); doc.feed(p.read_text()); parsed[p.resolve()]=doc
        assert not [key for key,n in Counter(doc.ids).items() if n>1], str(p)+' duplicate IDs'
        refs.extend((p,ref) for ref in doc.refs)
    for p in DIST.rglob('*.css'):
        refs.extend((p,r.strip()) for r in re.findall(r'url\(\s*[\'"]?([^\'"\)]+)',p.read_text()))
    checked=0
    for owner,ref in refs:
        split=urlsplit(ref)
        if split.scheme or split.netloc:
            if split.scheme in ('https','http'):external.add(ref)
            continue
        checked+=1
        target=((DIST/unquote(split.path).lstrip('/')) if split.path.startswith('/') else owner.parent/unquote(split.path)).resolve() if split.path else owner.resolve()
        if not target.is_relative_to(DIST.resolve()) or not target.is_file():
            failures.append({'owner':str(owner.relative_to(ROOT)),'reference':ref})
        elif split.fragment and target in parsed and unquote(split.fragment) not in parsed[target].ids:
            failures.append({'owner':str(owner.relative_to(ROOT)),'fragment':ref})
    assert not failures, json.dumps(failures)
    pdfs=list(DIST.rglob('*.pdf'))
    assert all(p.read_bytes().startswith(b'%PDF-') for p in pdfs), 'Invalid PDF signature'
    manifest=json.loads((ROOT/'SOURCE_MANIFEST.json').read_text())
    changed=[]
    for entry in manifest['website_files']:
        if hashlib.sha256((ROOT/entry['path']).read_bytes()).hexdigest()!=entry['sha256']:changed.append(entry['path'])
    # An intentional metadata edit after deployment is permitted; document it separately.
    assert all(p=='dist/index.html' for p in changed), 'Unexpected changed packaged assets: '+str(changed)
    if changed:print('NOTE: index.html differs from original export; verify intentional metadata/content changes.')
    result={'html_documents':len(parsed),'local_references':checked,'missing_references':0,'pdf_files':len(pdfs),'website_files':len(manifest['website_files']),'unchanged_export_files':len(manifest['website_files'])-len(changed),'vercel_static_config':'PASS','external_urls_not_live_tested':len(external),'scope':'Static file/reference/config checks; no hosted Vercel or browser visual validation'}
    print(json.dumps(result,indent=2))
    return result

if __name__=='__main__':run()
