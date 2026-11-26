import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const source=read('scripts/data/arkado-source-snapshot.json');
const {coverage,models}=read('src/extended-catalog.json');
const sourceIds=source.map(x=>x.sourceId).sort(),variants=models.flatMap(m=>m.variants);
assert.equal(sourceIds.length,370,'full public category crawl');
assert.equal(new Set(sourceIds).size,sourceIds.length);
assert.deepEqual(variants.map(v=>v.sourceId).sort(),sourceIds,'every source variant occurs exactly once');
assert.equal(models.filter(m=>m.category==='monuments').flatMap(m=>m.variants).length,332);
assert.equal(models.length,163);
assert(models.filter(m=>m.category==='monuments'&&!m.variants.every(v=>v.dimensions.length)).every(m=>m.collection==='elite'),'only custom elite sets omit standard stele dimensions');
assert(models.filter(m=>m.name==='Волна Горизонтальная').every(m=>m.audience==='family'),'horizontal classification follows source categories');
assert.equal(coverage.monumentModels,125);
assert(models.every(m=>!['fences','furniture'].includes(m.category)),'excluded source categories');
assert(models.every(m=>m.price===null&&m.variants.every(v=>v.price===null)),'supplier prices must never become local quotes');
for(const m of models){assert(m.variants.length>0);for(const path of [m.image,m.previewImage,...m.variants.flatMap(v=>[v.image,v.previewImage])])assert(existsSync(new URL('../public/'+path,import.meta.url)),path)}
const forged=read('src/forged-catalog.json').items;
assert.equal(forged.filter(x=>x.category==='fences').length,10);
assert.equal(forged.filter(x=>x.category==='furniture').length,5);
assert.equal(forged.length,22,'original PDF assortment retained');
const own=read('src/current-catalog.json');assert.equal(own.length,6);assert.equal(own[0].variants[0].price,18000,'own starting price retained');
const text=JSON.stringify(models);for(const forbidden of ['office.arkado','3852','Гарантия 2 года','Изготовление до 1 месяца'])assert(!text.includes(forbidden),forbidden);
console.log('PASS: 370 source variants, 125 monument models / 332 monument variants; all local images present; excluded source categories and prices absent; original 22 PDF products and own prices retained.');
const paving=read('src/paving-catalog.json'),pavingSource=read('scripts/data/paving-source.json');
assert.equal(paving.length,9);
assert.equal(paving.filter(p=>p.pavingType==='granite').length,7);
assert.equal(paving.filter(p=>p.pavingType==='concrete').length,2);
for(const p of paving){
 assert.equal(p.price,null);assert(existsSync(new URL('../public/'+p.image,import.meta.url)));
 for(const v of p.variants){assert.equal(v.price,null);assert.equal(v.dimensions.length,3);assert(v.dimensions.every(n=>n>0));}
 if(p.pavingType==='granite')assert.deepEqual(p.variants[0].dimensions,pavingSource.find(x=>x.sourceUrl===p.sourceUrl).sizes[0].map(Number));
}
console.log('PASS: 7 granite tile dimensions match source; 2 concrete paving models; all tile prices null and images local.');
