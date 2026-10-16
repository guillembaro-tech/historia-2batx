#!/bin/bash
# Exporta el tema i les obres de l'art grec a Word i PDF (PDF comprimit). Ús: bash exporta-tot.sh carpeta-de-sortida
set -e
OUT="${1:?carpeta}"
mkdir -p "$OUT"
cd "$(dirname "$0")"
export NODE_PATH=/opt/npm-tools/node_modules
B=https://professordesocials.cat/2n-batxillerat/historia-art/art-grec/
while IFS='|' read -r k slug nom; do
  [ -z "$k" ] && continue
  timeout 300 node exporta.js "$k" "$B$slug" "$OUT/raw-$k" | tail -1
  python3 comprimeix-pdf.py "$OUT/raw-$k.pdf" "$OUT/$nom.pdf" 2>/dev/null | tail -1
  mv "$OUT/raw-$k.docx" "$OUT/$nom.docx"
  rm -f -- "$OUT/raw-$k.pdf"
done <<'LLISTA'
tema||L'art grec
o3|parteno/|3. Partenó
o4|teatre-depidaure/|4. Teatre d'Epidaure
o5|kore-del-peplum/|5. Kore del pèplum
o6|dorifor-de-policlet/|6. Dorífor de Policlet
o7|afrodita-de-cnidos/|7. Venus de Cnidos (Afrodita de Cnidos)
o8|laocoont-i-els-seus-fills/|8. Laocoont i els seus fills
LLISTA
ls -la "$OUT"
