"""Optionally update ONLY public canonical/Open Graph metadata, not product links."""
from pathlib import Path
from urllib.parse import urlsplit
import re, sys

def update(markup, origin):
    parsed = urlsplit(origin)
    if (parsed.scheme != 'https' or not parsed.hostname or parsed.username
        or parsed.password or parsed.query or parsed.fragment
        or parsed.path not in ('', '/') or not re.fullmatch(r'[A-Za-z0-9.-]+', parsed.hostname)
        or parsed.port not in (None, 443)):
        raise ValueError('Use your real HTTPS website origin, without a path, query or credentials.')
    origin = 'https://' + parsed.hostname
    count = 0
    def replace_tag(match):
        nonlocal count
        tag = match.group()
        key = re.search(r'\b(?:rel|property)="([^"]+)"', tag)
        if not key or key.group(1) not in ('canonical','og:url','og:image','og:image:secure_url'):
            return tag
        attr = 'href' if key.group(1) == 'canonical' else 'content'
        value = origin + ('/assets/beacon-case-preview.png' if 'image' in key.group(1) else '/')
        tag, n = re.subn(r'\b'+attr+r'="[^"]*"', attr+'="'+value+'"', tag)
        count += n
        return tag
    result = re.sub(r'<(?:link|meta)\b[^>]*>', replace_tag, markup)
    if count != 4:
        raise ValueError('Expected four canonical/Open Graph URL fields; no file was changed.')
    return result

if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python3 scripts/set-site-url.py https://your-real-domain.example')
    path = Path(__file__).resolve().parents[1] / 'dist/index.html'
    try:
        result = update(path.read_text(), sys.argv[1])
    except ValueError as exc:
        raise SystemExit(str(exc))
    path.write_text(result)
    print('Updated four canonical/Open Graph metadata URLs. Product links and documents are unchanged.')
