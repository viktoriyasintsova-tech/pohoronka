import re,json,html,urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
base='https://arkado-granit.ru'
listing=Path('/private/tmp/istok-granite.html').read_text()
urls=sorted(set(re.findall(r'href="(/catalog/granitnaya-plitka/plitka-iz[^"?#]+)',listing)))
def fetch(path):
 data=urllib.request.urlopen(base+path,timeout=40).read().decode()
 text=html.unescape(re.sub('<[^>]+>',' ',data));text=re.sub(r'\s+',' ',text)
 title=re.search(r'<h1[^>]*>(.*?)</h1>',data,re.S).group(1).strip()
 sizes=list(dict.fromkeys(re.findall(r'(\d{3})\s*[хx×]\s*(\d{3})\s*[хx×]\s*(\d{2})',text)))
 image=re.search(r'property="og:image"\s+content="([^"]+)',data)
 return {'name':html.unescape(title),'sourceUrl':base+path,'sizes':sizes,'sourceImage':image.group(1) if image else None}
rows=list(ThreadPoolExecutor(4).map(fetch,urls))
Path('scripts/data/paving-source.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(rows,ensure_ascii=False,indent=2))
