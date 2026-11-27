// Rebuild from the checked-in official snapshot. Image files retain source bytes.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const source=JSON.parse(fs.readFileSync('scripts/data/ermis-source-snapshot.json','utf8').replace(/^\uFEFF/,''));
const groups=new Map(),seenImages=new Map(),duplicateImages=[];
for(const m of source.models)for(const p of m.products){
 const digest=createHash('sha256').update(fs.readFileSync(`public/assets/ermis/${m.id}-${p.id}.webp`)).digest('hex');
 if(seenImages.has(digest)){duplicateImages.push({sourceGroup:m.id,sourceProduct:p.id,canonical:seenImages.get(digest),sha256:digest});continue}
 seenImages.set(digest,{sourceGroup:m.id,sourceProduct:p.id});
 let key=`ermis-${m.id}`,name=m.title,category='monuments',audience=m.type==='family'||m.id===1?'family':'single';
 if(m.type==='elit')name=`Резной памятник № ${m.title.replace('Модель ','')}`;
 else if(m.type==='rect-shaped'||m.type==='family')name=m.id<3?m.title:`${m.type==='family'?'Семейный':'Фигурный'} памятник № ${m.title.replace('Модель ','')}`;
 else if(m.type==='combined'){const form=p.name.split(/\s/)[0].replaceAll('В','V');key=`ermis-combined-${form}`;name=`Комбинированный памятник ${form.replaceAll('V','В')}`;audience=[17,46,66,86,87].includes(parseInt(form))?'family':'single';}
 else if(m.type==='arches'){const n=p.name.split(' ')[0];key=`ermis-arch-${n}`;name=`Арка № ${n}`;}
 else if(m.type==='tombstones')category='slabs';
 else if(m.type==='tile')category='slabs';
 else if(m.type==='fences'){category='fences';key=`ermis-fence-${p.id}`;name=`Гранитная ограда ${p.name}`;}
 else if(m.type==='tables'){category='furniture';key=`ermis-table-${p.id}`;name=`Стол и скамья ${p.name}`;}
 if([42,43,61,69,78,79].includes(m.id))name=`Крест № ${m.title.replace('Модель ','')}`;
 if(!groups.has(key))groups.set(key,{id:key,name,category,stone:'Гранит',collection:['elit','arches'].includes(m.type)?'elite':'standard',source:'ermis',sourceUrl:'https://ermiswc.su/base-models',sourceType:m.type,audience,form:[42,43,61,69,78,79].includes(m.id)?'cross':m.id<3?'straight':'shaped',price:null,materialOptions:[],variants:[],imageNote:'Изображение модели в выбранной породе камня из каталога изготовителя. Рисунок конкретной заготовки, размеры, отделку и комплектацию согласуем перед заказом.'});
 const item=groups.get(key),image=`assets/ermis/${m.id}-${p.id}.webp`;
 let materialName=['fences','tables','tile','tombstones'].includes(m.type)?(p.variant||'Как на изображении'):p.name.replace(/^\S+\s+(?=[КK]\d)/,'').replace(/^[КK]\d+[ВV]?\s*/,'');
 if(p.variant.includes('вставкой'))materialName+=' · с чёрной вставкой';
 const code=p.name.match(/[КK]\d+[ВV]?/)?.[0].replace('К','K').replace('В','V')||`${m.id}-${p.id}`;
 item.materialOptions.push({id:`ermis-${code.toLowerCase()}`,name:materialName,kind:p.variant||'Гранит',texture:image,previewImage:image,native:true,samplePosition:'50% 36%',sourceGroup:m.id,sourceProduct:p.id,sourceImage:p.image});
}
const models=[...groups.values()];
const samples=new Map();
for(const m of models)for(const option of m.materialOptions)if(!samples.has(option.id)||option.sourceGroup===2)samples.set(option.id,option);
for(const m of models){
 for(const option of m.materialOptions){const sample=samples.get(option.id);option.texture=sample.previewImage;option.samplePosition=sample.sourceGroup===2?'70% 28%':'50% 18%';
  if(option.id==='ermis-k03v'){option.texture=samples.get('ermis-k03').previewImage;option.samplePosition='70% 28%';option.sampleSplit=true;}
  if(option.id==='ermis-k26'){option.samplePosition='34% 45%';option.sampleSize='2400%';}
  if(option.id==='ermis-k08v'){option.samplePosition='29% 93%';option.sampleSize='2500%';option.sampleSplit=true;}}
 m.materialOptions.sort((a,b)=>Number(b.id==='ermis-k06')-Number(a.id==='ermis-k06'));
 const image=m.materialOptions[0].previewImage;m.image=image;m.previewImage=image;m.defaultMaterial=m.materialOptions[0].id;
 m.variants=[{id:m.id+'-custom',dimensions:[],specs:[{label:'Размер',value:'По согласованию'},{label:'Комплектация',value:'По выбранному проекту'}],price:null,image,previewImage:image,previewIsolated:false}];
}
fs.writeFileSync('src/ermis-catalog.json',JSON.stringify({coverage:{source:'https://ermiswc.su/base-models',checkedAt:'2026-11-27',sourceGroups:source.models.length,sourceImages:source.models.reduce((n,m)=>n+m.products.length,0),uniqueImages:seenImages.size,models:models.length},duplicateImages,models},null,2)+'\n');
console.log(`${models.length} models, ${models.reduce((n,m)=>n+m.materialOptions.length,0)} native material images`);

fs.writeFileSync('public/assets/ermis/provenance.json',JSON.stringify({source:'https://ermiswc.su/base-models',retrievedAt:'2026-11-27',images:source.models.flatMap(m=>m.products.map(p=>({file:`assets/ermis/${m.id}-${p.id}.webp`,sourceUrl:new URL(p.image,'https://www.ermiswc.su/').href,sha256:createHash('sha256').update(fs.readFileSync(`public/assets/ermis/${m.id}-${p.id}.webp`)).digest('hex')})))},null,2)+'\n');
