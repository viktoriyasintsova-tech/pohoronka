import json,re
from pathlib import Path
rows=json.loads(Path('scripts/data/paving-source.json').read_text())
mapping={'chernyy':('Чёрный гранит','shanxi'),'imperial-red':('Imperial Red','imperial-red'),'kantri':('G 603 · Кантри','g603'),'sinyaya-zvezda':('G 654 · Синяя звезда','g654'),'spelyy-persik':('G 664 · Спелый персик','g664'),'tan-braun':('Tan Brown','tan-brown'),'zhemchuzhnyy-tsvetok':('Жемчужный цветок','pearl')}
items=[]
for row in rows:
 slug=row['sourceUrl'].strip('/').split('/')[-1].replace('plitka-iz-granita-','');name,mat=mapping[slug];dims=list(map(int,row['sizes'][0]));pid='tile-'+slug
 items.append(dict(id=pid,name='Гранитная плитка · '+name,category='paving',stone='Гранит',collection='standard',source='paving',pavingType='granite',tileForm='rectangle',defaultMaterial=mat,sourceUrl=row['sourceUrl'],image='assets/paving/'+pid+'.jpg',price=None,variants=[dict(id=pid+'-size',dimensions=dims,price=None,specs=[dict(label='Размер',value=' × '.join(map(str,dims))+' мм'),dict(label='Материал',value=name),dict(label='Единица расчёта',value='м²')])]))
for shape,name,variants,url in [('rectangle','Кирпичик',[[200,100,40],[200,100,60],[200,100,80]],'https://braer.ru/catalog/trotuarnaya-plitka/trotuarnaya-plitka-pryamougolnik-pesochnyj-h-60-mm/'),('old-town','Старый город',[[172,115,60],[115,115,60],[86,115,60]],'https://artikospb.ru/f/prajs-list.pdf')]:
 pid='paving-'+shape
 items.append(dict(id=pid,name='Тротуарная плитка · '+name,category='paving',stone='Бетон',collection='standard',source='paving',pavingType='concrete',tileForm=shape,defaultMaterial='concrete-gray',image='assets/materials/textures/gray.jpg',price=None,sourceUrl=url,imageNote='Визуализация типовой формы. Оттенки, наличие и комплектацию уточняем перед заказом.',variants=[dict(id=pid+'-'+str(i),dimensions=d,price=None,specs=[dict(label='Размер элемента',value=' × '.join(map(str,d))+' мм'),dict(label='Комплектация',value='Набор трёх форматов' if shape=='old-town' else 'Прямоугольный элемент'),dict(label='Единица расчёта',value='м²')]) for i,d in enumerate(variants)]))
Path('src/paving-catalog.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
