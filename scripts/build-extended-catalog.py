"""Build grouped, locally hosted reference catalog. No third-party prices, warranties or contacts."""
from pathlib import Path
import json,re,hashlib,requests,time
from bs4 import BeautifulSoup
from urllib.parse import urlparse,urljoin
from concurrent.futures import ThreadPoolExecutor
BASE='https://arkado-granit.ru';cache=Path('/tmp/istok-arkado-source');out=Path('public/assets/arkado-reference');out.mkdir(exist_ok=True,parents=True)
raw=json.loads(Path('scripts/data/arkado-source-snapshot.json').read_text())
calcfile=Path('/tmp/arkado-models.html')
if not calcfile.exists():
 response=requests.get(BASE+'/calculator/?action=getMonuments',timeout=45);response.raise_for_status();calcfile.write_bytes(response.content)
calc=BeautifulSoup(calcfile.read_text(errors='replace'),'html.parser');previewById={}
for c in calc.select('.card--good-small'):
 m=re.search(r'changeMonument\((\d+)\)',c.get('onclick',''));img=re.search(r"url\(['\"]?([^)'\"]+)",str(c.select_one('.card__side')));n=c.select_one('.card__main p')
 if m and img:
  previewById[m[1]]=urljoin(BASE,img[1])
def membership(path):
 file=cache/(hashlib.sha256((BASE+path).encode()).hexdigest()+'.html')
 if not file.exists():return set()
 return set(re.findall(r'good_(\d+)',file.read_text(errors='replace')))
econom=membership('/catalog/ritualnye-tovary/pamyatniki/ekonom/');elite=membership('/catalog/ritualnye-tovary/elitnye-pamyatniki/')|membership('/catalog/ritualnye-tovary/pamyatniki/elitnye/');family=membership('/catalog/ritualnye-tovary/pamyatniki/semeynye-mramor/')|membership('/catalog/ritualnye-tovary/pamyatniki/standartnye/gorizontalnye1/')|membership('/catalog/ritualnye-tovary/pamyatniki/ekonom/horizontal/')
urls=set()
for p in raw:
 p['originalImageUrl']=re.sub(r'/resize_cache/iblock/([^/]+)/[^/]+/',r'/iblock/\1/',p['sourceImage'])
 p['previewImageUrl']=previewById.get(p['sourceId']) or p['originalImageUrl']
 urls.update([p['originalImageUrl'],p['previewImageUrl']])
def local(url):
 ext=Path(urlparse(url).path).suffix.lower();return out/(hashlib.sha256(url.encode()).hexdigest()[:18]+ext)
def download(url):
 path=local(url)
 if path.exists() and path.stat().st_size>100:return
 for attempt in range(3):
  try:
   r=requests.get(url,timeout=30);r.raise_for_status()
   if not r.headers.get('content-type','').startswith('image/'):raise ValueError('Not an image')
   path.write_bytes(r.content);return
  except Exception:
   if attempt==2:raise
   time.sleep(1+attempt)
with ThreadPoolExecutor(max_workers=6) as pool:
 for i,_ in enumerate(pool.map(download,sorted(urls))):
  if i%20==0:print('IMAGES',i+1,'/',len(urls),flush=True)
groups={}
for p in raw:
 name=p['name'];stone='Мрамор' if 'mramor' in p['sourceUrl'] else 'Гранит'
 dims=[]
 for s in p['specs']:
  if s['label'].lower() in ['стела','стелла']:dims=[int(x) for x in re.findall(r'\d+',s['value'])]
 cat=p['category']
 if cat=='accessories':cat='vases' if 'ваз' in name.lower() else 'slabs'
 if cat=='stone-crosses':cat='crosses'
 if cat=='memorials' and any(k in name.lower() for k in ['поребрик','брусчатка','калифорния']):cat='paving'
 if cat=='paving':stone='Бетон' if 'бетон' in name.lower() else 'Покрытие'
 audience='family' if p['sourceId'] in family or (len(dims)>1 and dims[1]>=dims[0]) or 'семейн' in name.lower() or 'горизонталь' in name.lower() else 'single'
 collection='elite' if p['sourceId'] in elite else 'econom' if p['sourceId'] in econom else 'standard'
 key=(name,stone,audience,cat,collection)
 if key not in groups:groups[key]={'id':'arkado-'+p['sourceId'],'name':name,'category':cat,'stone':stone,'audience':audience,'collection':collection,'image':str(local(p['originalImageUrl']).relative_to('public')),'previewImage':str(local(p['previewImageUrl']).relative_to('public')),'price':None,'source':'arkado','variants':[]}
 materialName=('Мрамор кремовый' if 'mramor_kremov' in p['sourceUrl'] else 'Мрамор серый' if 'mramor_ser' in p['sourceUrl'] else 'Гранит чёрный' if 'granit_chern' in p['sourceUrl'] else 'Гранит серый' if 'granit_ser' in p['sourceUrl'] else 'Гранит красный' if 'granit_krasn' in p['sourceUrl'] else stone)
 groups[key]['variants'].append({'previewIsolated':p['previewImageUrl']!=p['originalImageUrl'],'materialName':materialName,'id':p['id'],'dimensions':dims,'specs':p['specs'],'sourceUrl':p['sourceUrl'],'sourceId':p['sourceId'],'image':str(local(p['originalImageUrl']).relative_to('public')),'previewImage':str(local(p['previewImageUrl']).relative_to('public')),'price':None})
models=list(groups.values())
# Generated studio illustrations replace selected reference renders; exact source geometry remains for the interactive preview.
for m in models:
 for v in m['variants']:
  original=next(p for p in raw if p['id']==v['id'])
  key=Path(urlparse(original['originalImageUrl']).path).stem
  generated=Path('public/assets/arkado-generated')/(key+'.png')
  if generated.exists():v['image']=str(generated.relative_to('public'))
 m['image']=m['variants'][0]['image']
for m in models:
 if m['name'].lower()=='венера' and m['stone']=='Гранит':m['image']='assets/arkado-generated/venus.png'
 m['variants'].sort(key=lambda v:v['dimensions'] or [0])
coverage={'source':'https://arkado-granit.ru/catalog/ritualnye-tovary/','checkedAt':'2026-11-23','referenceVariants':len(raw),'monumentVariants':sum(len(m['variants']) for m in models if m['category']=='monuments'),'models':len(models),'monumentModels':sum(m['category']=='monuments' for m in models),'localImages':len(urls),'excluded':['ograzhdeniya','stoly-i-lavochki'],'note':'Reference shapes and specifications only. All imported prices are null; supplier contacts and claims excluded.'}
Path('src/extended-catalog.json').write_text(json.dumps({'coverage':coverage,'models':models},ensure_ascii=False,indent=2)+'\n')
Path('public/assets/arkado-reference/provenance.json').write_text(json.dumps([{'sourceUrl':u,'localPath':str(local(u).relative_to('public')),'sha256':hashlib.sha256(local(u).read_bytes()).hexdigest()} for u in sorted(urls)],ensure_ascii=False,indent=2)+'\n')
print(json.dumps(coverage,ensure_ascii=False),flush=True)
