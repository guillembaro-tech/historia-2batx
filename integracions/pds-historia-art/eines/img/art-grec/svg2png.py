"""Render SVG files to PNG with Chromium (white background). Usage: svg2png.py in.svg out.png width"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

src, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
svg = Path(src).read_text(encoding='utf-8')
html = ('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}'
        'svg{display:block;width:%dpx;height:auto}</style></head><body>%s</body></html>') % (width, svg)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-proxy-server'])
    pg = b.new_page(viewport={'width': width, 'height': 400}, device_scale_factor=1)
    pg.set_content(html)
    pg.wait_for_timeout(300)
    el = pg.query_selector('svg')
    el.screenshot(path=out, omit_background=False)
    b.close()
print(out)
