"""Transcribed from supplied 'ПРАЙС актуальный.jpeg' (April 2026).
The user explicitly designated this image as the current monument price source.
The source date does not imply it is newer than the old wholesale Excel.
"""
import json
from pathlib import Path
single=[('600x400x50',18000,None,None),('800x450x50',35000,39000,47000),('1000x500x50',40000,44000,52000),('1100x600x60',50000,54000,65000),('1200x600x80',65000,72000,85000),('1200x700x80',70000,77000,90000),('1400x600x80',75000,80000,100000),('1500x700x80',110000,120000,150000),('1600x700x80',180000,'request',None),('1800x900x120',250000,'request',None)]
family=[('900x700x50',44000,49000,60000),('1100x600x60',54000,59000,69000),('1200x700x80',74000,78000,94000),('1000x900x80',82000,88000,100000)]
catalog=[]
for audience,table in [('single',single),('family',family)]:
 for i,(form,title) in enumerate([('straight','Прямые'),('shaped','Фигурные'),('milled','Фрезерные')],1):
  variants=[]
  for row in table:
   amount=row[i]
   if amount is None:continue
   dims=[int(v) for v in row[0].split('x')]
   variants.append({'id':f'{audience}-{form}-{row[0]}','dimensions':dims,'price':amount if isinstance(amount,int) else None})
  catalog.append({'id':f'{audience}-{form}','name':f'{title} '+('одинарные памятники' if audience=='single' else 'семейные памятники'),'audience':audience,'form':form,'portraits':1 if audience=='single' else 2,'variants':variants,'price':min(v['price'] for v in variants if v['price'] is not None),'image':f'assets/catalog-generated/{audience}-{form}.png'})
Path('src/current-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
print('Current catalogue:',len(catalog),'series,',sum(len(x['variants']) for x in catalog),'size/type entries')
