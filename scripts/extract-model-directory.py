import zipfile,xml.etree.ElementTree as E,json,re
from pathlib import Path
z=zipfile.ZipFile('ПРАЙС 2026 июль (1).xlsx');ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};ss=[''.join(t.text or '' for t in x.findall('.//m:t',ns)) for x in E.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns)]
section='';models={}
for r in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//m:sheetData/m:row',ns):
 vals={re.sub(r'\d','',c.get('r')):ss[int(c.find('m:v',ns).text)] if c.get('t')=='s' else (c.find('m:v',ns).text if c.find('m:v',ns)is not None else '') for c in r.findall('m:c',ns)}
 if int(r.get('r'))>=1440:break
 if vals.get('A') and not vals.get('B') and not vals.get('C'):section=vals['A'].strip()
 code=vals.get('B','');name=re.sub(r'\s+',' ',vals.get('C','')).strip()
 if not code or not name or name.lower() in ['тумба','цветник','подставка','цв-к'] or not vals.get('D','').isdigit() or not vals.get('E','').isdigit():continue
 if name.lower().startswith(('тумб','цветн','подстав','цв-к','цв.')):continue
 k=(name,section)
 if k not in models:models[k]={'name':name,'section':section,'variants':[]}
 models[k]['variants'].append({'code':code,'dimensions':[vals.get(x,'') for x in 'DEF']})
Path('src/model-directory.json').write_text(json.dumps(list(models.values()),ensure_ascii=False,indent=2))
print(len(models),'model/material groups preserved, no old prices published')
