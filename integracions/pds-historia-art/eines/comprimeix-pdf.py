"""Redueix el pes d'un PDF exportat: les imatges es passen a JPEG de com a màxim MAXPX px de costat.

Ús: python3 comprimeix-pdf.py entrada.pdf sortida.pdf [MAXPX]
"""
import io
import sys

import pikepdf
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
MAXPX = int(sys.argv[3]) if len(sys.argv) > 3 else 1100
pdf = pikepdf.open(src)
n = 0
for page in pdf.pages:
    for name, raw in list(page.images.items()):
        try:
            pim = pikepdf.PdfImage(raw)
            im = pim.as_pil_image()
        except Exception:
            continue
        if im.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', im.size, 'white')
            im2 = im.convert('RGBA')
            bg.paste(im2, mask=im2.split()[-1])
            im = bg
        elif im.mode != 'RGB':
            im = im.convert('RGB')
        if max(im.size) > MAXPX:
            im.thumbnail((MAXPX, MAXPX), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=82, optimize=True)
        if len(buf.getvalue()) >= len(raw.read_raw_bytes()):
            continue
        raw.write(buf.getvalue(), filter=pikepdf.Name.DCTDecode)
        raw.ColorSpace = pikepdf.Name.DeviceRGB
        raw.BitsPerComponent = 8
        raw.Width, raw.Height = im.size
        for k in ('/SMask', '/DecodeParms', '/Mask'):
            if k in raw:
                del raw[k]
        n += 1
pdf.save(dst, compress_streams=True)
print('imatges', n)
