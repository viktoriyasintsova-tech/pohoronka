"""Read public product references, excluding fences/furniture. No supplier prices imported.
Requires requests + beautifulsoup4. Cached source HTML stays outside the repository.
"""
import requests,json,re,time,hashlib,sys
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urljoin,urlparse,parse_qsl,urlencode
from concurrent.futures import ThreadPoolExecutor
BASE='https://arkado-granit.ru';ROOT='/catalog/ritualnye-tovary/'
cache=Path('/tmp/istok-arkado-source');cache.mkdir(exist_ok=True)
assets=Path('public/assets/arkado-reference');assets.mkdir(parents=True,exist_ok=True)
def fetch(url):
 path=cache/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if not path.exists() or '--refresh' in sys.argv:
  r=requests.get(url,timeout=45);r.raise_for_status();path.write_bytes(r.content);time.sleep(.12)
 return BeautifulSoup(path.read_text(errors='replace'),'html.parser')
def clean(s):return re.sub(r'\s+',' ',s).strip()
def category(url):
 if '/pamyatniki/' in url or '/elitnye-pamyatniki/' in url:return 'monuments'
 if '/blagoustroystvo/' in url:return 'memorials'
 if '/nadgrobnye-plity-vazy/' in url:return 'accessories'
 return 'stone-crosses'
roots=[ROOT+x+'/' for x in ['pamyatniki','blagoustroystvo','nadgrobnye-plity-vazy','elitnye-pamyatniki','kresty']]
queue=[BASE+x for x in roots]+[BASE+roots[0]+'?PAGEN_1=1'];visited=set();products={}
while queue:
 url=queue.pop(0)
 parsed=urlparse(url);paging={k:v for k,v in parse_qsl(parsed.query) if k.startswith('PAGEN')};url=BASE+parsed.path+('?' + urlencode(paging) if paging else '')
 if url in visited:continue
 visited.add(url);s=fetch(url);cards=s.select('a.card--good[href]');print('LIST',len(visited),len(cards),url,flush=True)
 for card in cards:
  link=urljoin(BASE,card['href']);name=card.select_one('.card__main > p') or card.select_one('img');name=clean(name.get_text() if name.name!='img' else name.get('alt',''))
  img=card.select_one('img');specs=[]
  for li in card.select('li'):
   ps=li.select('p')
   if len(ps)>=2:specs.append({'label':clean(ps[0].get_text()).rstrip(':'),'value':clean(ps[1].get_text())})
  match=re.search(r'good_(\d+)',str(card.get('class')));pid=match[1] if match else hashlib.sha256(link.encode()).hexdigest()[:10]
  if pid not in products:products[pid]={'id':'ag-'+pid,'name':name.title(),'category':category(link),'sourceUrl':link,'sourceId':pid,'sourceImage':urljoin(BASE,img['src']) if img else None,'specs':specs,'price':None}
  elif len(specs)>len(products[pid]['specs']):products[pid]['specs']=specs
 Path('scripts/data/arkado-source-snapshot.json').write_text(json.dumps(list(products.values()),ensure_ascii=False,indent=2)+'\n')
 # Only category nav and pagination. Never traverse product details as list pages.
 for a in s.select('a[href]'):
  href=urljoin(BASE,a['href']);p=urlparse(href)
  if p.netloc!='arkado-granit.ru' or not p.path.startswith(ROOT):continue
  if any(x in p.path for x in ['/ograzhdeniya/','/stoly-i-lavochki/']):continue
  if href in [p['sourceUrl'] for p in products.values()]:continue
  if not any(p.path.startswith(root) for root in roots):continue
  if a.select_one('img') or a.select_one('.card__main'):continue
  # Product links are already excluded; category text/nav and PAGEN links are safe.
  query=dict(parse_qsl(p.query))
  if query and not any(k.startswith('PAGEN') for k in query):continue
  href=BASE+p.path+('?' + urlencode({k:v for k,v in query.items() if k.startswith('PAGEN')}) if any(k.startswith('PAGEN') for k in query) else '')
  if href not in visited and href not in queue:queue.append(href)
print('PRODUCTS',len(products),'lists',len(visited),flush=True)
Path('scripts/data/arkado-source-snapshot.json').write_text(json.dumps(list(products.values()),ensure_ascii=False,indent=2)+'\n')
if '--details' not in sys.argv:sys.exit(0)
# Detail images, material and specifications.
def details(item):
 s=fetch(item['sourceUrl'])
 (cache/(item['id']+'.html')).write_text(str(s))
 return item
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(details,products.values()))
print('Detail HTML cached',flush=True)
