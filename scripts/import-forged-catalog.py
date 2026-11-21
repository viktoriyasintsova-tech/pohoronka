"""Import the supplied PDF: python import-forged-catalog.py [оградки.pdf]. Requires PyMuPDF."""
import json,sys,hashlib
from pathlib import Path
import fitz
source=Path(sys.argv[1] if len(sys.argv)>1 else 'оградки.pdf')
doc=fitz.open(source)
output=Path('public/assets/forged');output.mkdir(parents=True,exist_ok=True)
# Page, image in visual reading order, ID, category, name, verbatim specifications.
rows=[
(1,0,'victoria','fences','Оградка «Виктория»', [('Высота','400 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','25 × 25 мм')]),
(1,1,'square','fences','Оградка «Квадрат в квадрате»',[('Высота','400 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','25 × 25 мм')]),
(1,2,'wave','fences','Оградка «Волна»',[('Высота','550 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Нижний пояс усиления','25 × 25 мм'),('Ножка','30 × 30 мм')]),
(2,0,'victoria-top','fences','Оградка «Виктория с навершием»',[('Высота','400 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','25 × 25 мм')]),
(2,1,'lily','fences','Оградка «Лилия»',[('Высота','400 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','25 × 25 мм')]),
(2,2,'arc','fences','Оградка «Дуга»',[('Высота','400 мм'),('Дуга','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','20 × 20 мм')]),
(3,0,'corner-1','fences','Угол № 1',[('Высота','530 мм'),('Длина','700 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Столбик','25 × 25 мм')]),
(3,1,'corner-2','fences','Угол № 2',[('Высота','580 мм'),('Длина','800 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Столбик','30 × 30 мм')]),
(3,2,'corner-3','fences','Угол № 3',[('Высота','600 мм'),('Длина','850 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Столбик','40 × 40 мм')]),
(4,0,'heart','fences','Оградка «Сердце»',[('Высота','500 мм'),('Рисунок','15 × 15 мм'),('Пояса','20 × 20 мм'),('Ножка','25 × 25 мм')]),
(4,1,'cross-1','crosses','Крест № 1',[('Высота','1500 мм'),('Основание','25 × 50 мм'),('Рисунок','0,6 мм')]),
(4,2,'cross-b1','crosses','Крест «Б1»',[('Высота','1500 мм'),('Основание','20 × 40 мм'),('Рисунок','15 × 15 мм')]),
(5,0,'cross-b2','crosses','Крест «Б2»',[('Высота','1500 мм'),('Основание','25 × 25 мм'),('Рисунок','15 × 15 мм')]),
(5,1,'cross-m1','crosses','Крест «М1»',[('Высота','1000 мм'),('Основание','25 × 25 мм'),('Рисунок','15 × 15 мм')]),
(5,2,'cross-m2','crosses','Крест «М2»',[('Высота','1000 мм'),('Основание','25 × 25 мм'),('Рисунок','15 × 15 мм')]),
(6,0,'table-forged','furniture','Стол «Кованый»',[('Размер (В × Ш × Д)','850 × 500 × 600 мм'),('Рисунок','20 × 20 мм')]),
(6,1,'table-pattern','furniture','Стол «Узор»',[('Размер (В × Ш × Д)','800 × 500 × 500 мм'),('Рисунок','20 × 20 мм')]),
(6,1,'bench-pattern','furniture','Лавка «Узор»',[('Размер (В × Ш × Д)','480 × 200 × 1000 мм')]),
(6,2,'bench-forged','furniture','Лавка «Кованая»',[('Размер (В × Ш × Д)','500 × 260 × 1000 мм'),('Рисунок','20 × 20 мм')]),
(7,0,'bench-back','furniture','Лавка «Кованая» со спинкой',[('Размер (В × Ш × Д)','500 × 260 × 1000 мм'),('Высота со спинкой','1085 мм'),('Рисунок спинки','15 × 15 мм'),('Рисунок ножки','20 × 20 мм')]),
(7,1,'vase-1','vases','Ритуальная ваза № 1',[('Высота','350 мм')]),
(7,2,'vase-2','vases','Ритуальная ваза № 2',[('Высота','350 мм')]),
]
items=[];images={}
for page,index,id,category,name,specs in rows:
 image=sorted(doc[page-1].get_image_info(xrefs=True),key=lambda x:x['bbox'][1])[index]
 xref=image['xref']
 if xref not in images:
  raw=doc.extract_image(xref);path=output/f'page-{page}-{index+1}.{raw["ext"]}';path.write_bytes(raw['image']);images[xref]=str(path.relative_to('public'))
 item=dict(id=id,category=category,name=name,image=images[xref],specs=[dict(label=a,value=b) for a,b in specs],price=None,sourcePage=page)
 if id in ['table-pattern','bench-pattern']:item['imageNote']='На фотографии показаны стол и лавка «Узор». Каждое изделие рассчитывается отдельно.'
 items.append(item)
Path('src/forged-catalog.json').write_text(json.dumps(dict(source=source.name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),items=items),ensure_ascii=False,indent=2)+'\n')
print(f'Imported {len(items)} products and {len(images)} original photographs. No supplier contacts or invented prices published.')
