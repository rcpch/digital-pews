#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
# SPDX-License-Identifier: LGPL-3.0-or-later
"""Check local URLs in built docs, including embedded demo and asset paths."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent / '_site'
BASE = '/digital-pews/'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                self.urls.append(value)


errors = []
pages = list(ROOT.rglob('*.html'))
if not pages:
    raise SystemExit('No built documentation found. Run s/build-site first.')
for page in pages:
    # The mirrored standalone demo contains relative runtime imports and is
    # verified in browser tests; its docs backlink is set by demo.js.
    if '_demo' in page.relative_to(ROOT).parts:
        continue
    parser = Links()
    parser.feed(page.read_text())
    for url in parser.urls:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        link = unquote(parsed.path)
        if link.startswith(BASE):
            target = ROOT / link[len(BASE):]
        elif link.startswith('/'):
            errors.append(f'{page.relative_to(ROOT)}: unexpected absolute path {url}')
            continue
        else:
            target = page.parent / link
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            errors.append(f'{page.relative_to(ROOT)}: missing {url}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Local documentation links and assets checked across {len(pages)} HTML files.')
