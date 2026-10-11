# Genera una resposta manuscrita de prova (foto de mòbil simulada) i les posicions de cada línia.
import json, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

random.seed(7)
BASE = sys.argv[1]
W, H = 3024, 4032
img = Image.new('RGB', (W, H), (247, 245, 238))
d = ImageDraw.Draw(img)
PAS, TOP, ESQ = 118, 300, 330
for y in range(TOP, H - 150, PAS):
    d.line([(120, y + 22), (W - 120, y + 22)], fill=(196, 214, 232), width=3)
d.line([(ESQ - 60, 120), (ESQ - 60, H - 120)], fill=(226, 160, 160), width=4)

font = ImageFont.truetype(sys.argv[2], 92)
font.set_variation_by_axes([430])
tinta = (28, 40, 92)

blocs = [
    ('1.1', "La primera idea és que la sobirania és compartida entre el rei i les Corts, perquè les lleis les fan les Corts amb el rei. La segona idea es que el rei té molt poder, ja que pot convocar i disoldre les Corts."),
    ('1.2', "Costa diu que el poble no és més lliure que abans i que la sobirania no és realment de la nació. També diu que el Parlament és \"paper pintat\", és a dir, una aparença."),
    ('1.3', "Les dues fonts parlen del sistema polític de la Restauració. La font 1 és de 1876 i diu com havia de funcionar el sistema, en canvi la font 2 és del 1901 i diu que tot és mentida. Això passava perquè conservadors i liberals es repartien el govern amb el torn pacífic i les eleccions es manipulaven amb el caciquisme. A més des del 1876 hi havia sufragi universal. En conclusió el sistema no era democràtic."),
]

linies = []
y = TOP - 70
amplada = W - ESQ - 700
for n, text in blocs:
    y += PAS
    d.text((ESQ - 20, y), n, font=font, fill=tinta)
    x0 = ESQ + 150
    paraules = text.split(' ')
    linia, xs = [], x0
    def escriu(paraules_linia, y):
        x = x0
        caixes = []
        for p in paraules_linia:
            dy = random.randint(-6, 6)
            d.text((x, y + dy), p, font=font, fill=tinta)
            bb = d.textbbox((x, y + dy), p, font=font)
            caixes.append(bb)
            x = bb[2] + random.randint(26, 40)
        return caixes
    actual = []
    for p in paraules:
        prova = ' '.join(actual + [p])
        if d.textlength(prova, font=font) > amplada and actual:
            cx = escriu(actual, y)
            linies.append({'pregunta': n, 'text': ' '.join(actual), 'caixa': [min(c[0] for c in cx), min(c[1] for c in cx), max(c[2] for c in cx), max(c[3] for c in cx)]})
            actual = [p]
            y += PAS
        else:
            actual.append(p)
    if actual:
        cx = escriu(actual, y)
        linies.append({'pregunta': n, 'text': ' '.join(actual), 'caixa': [min(c[0] for c in cx), min(c[1] for c in cx), max(c[2] for c in cx), max(c[3] for c in cx)]})
    y += PAS

# Aspecte de foto: ombra suau i una mica de desenfocament
ombra = Image.new('L', (W, H), 0)
od = ImageDraw.Draw(ombra)
for i in range(60):
    od.rectangle([i * 4, i * 4, W - i * 4, H - i * 4], outline=int(i * 1.2))
img = Image.composite(img, Image.new('RGB', (W, H), (222, 219, 210)), ombra.point(lambda v: 255 - max(0, 72 - v)))
img = img.filter(ImageFilter.GaussianBlur(1.1))
img.save(BASE + '.jpg', quality=88)
json.dump({'w': W, 'h': H, 'linies': linies}, open(BASE + '.json', 'w'), ensure_ascii=False, indent=1)
print(W, H, len(linies), 'línies')
for l in linies:
    print(l['pregunta'], l['caixa'], l['text'][:70])
