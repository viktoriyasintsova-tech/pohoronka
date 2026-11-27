import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const source=read('scripts/data/ermis-source-snapshot.json'),catalog=read('src/ermis-catalog.json'),replacements=read('scripts/data/ermis-replacements.json');
const expected=source.models.flatMap(m=>m.products.map(p=>`${m.id}/${p.id}`));
const photos=catalog.models.flatMap(m=>m.materialOptions),seen=photos.map(p=>`${p.sourceGroup}/${p.sourceProduct}`);
assert.equal(expected.length,753);assert.equal(catalog.models.length,135);assert.equal(photos.length,706);assert.equal(catalog.duplicateImages.length,47);
assert.deepEqual([...seen,...catalog.duplicateImages.map(p=>`${p.sourceGroup}/${p.sourceProduct}`)].sort(),expected.sort());
const hashFor=p=>createHash('sha256').update(fs.readFileSync(`public/assets/ermis/${p.sourceGroup}-${p.sourceProduct}.webp`)).digest('hex');
assert.equal(new Set(photos.map(hashFor)).size,706,'no identical images hidden behind different model or stone names');
for(const d of catalog.duplicateImages){assert.equal(hashFor(d),hashFor(d.canonical));assert.equal(hashFor(d),d.sha256);assert(seen.includes(`${d.canonical.sourceGroup}/${d.canonical.sourceProduct}`))}
for(const m of catalog.models){
 assert.equal(m.price,null);assert(m.variants.every(v=>!v.dimensions.length&&v.price===null),'no guessed specifications');
 assert.equal(new Set(m.materialOptions.map(p=>p.id)).size,m.materialOptions.length,'no duplicate stone choices');
 assert(m.materialOptions.some(p=>p.id===m.defaultMaterial));
 for(const p of m.materialOptions){assert(p.native);for(const asset of [p.texture,p.previewImage]){const bytes=fs.readFileSync('public/'+asset);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP')}}
}
const bundle=await build({stdin:{contents:"export * from './src/catalog-data.js';export {materialsFor,materialIdFor} from './src/product-materials.js';export {monumentMaterials} from './src/materials.js';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',define:{'import.meta.env.BASE_URL':'"/"'}});
const {allProducts,catalogProducts,monumentModels,findModel,findProduct,materialsFor,materialIdFor,monumentMaterials}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
assert.equal(new Set(allProducts.map(m=>m.id)).size,allProducts.length);
for(const [oldId] of Object.entries(replacements.aliases)){
 assert(!catalogProducts.some(m=>m.id===oldId),'duplicate card remains '+oldId);
 assert(findProduct(oldId),'old product URL '+oldId);
 assert(findModel(oldId),'old constructor URL '+oldId);
}
for(const m of monumentModels)assert.equal(findModel(m.id).id,m.id);
assert.equal(catalogProducts.filter(m=>m.pavingType).length,1,'one paving selector');
console.log(`PASS: all 753 source entries accounted for; 706 unique images, 47 exact source duplicates consolidated; ${catalog.models.length} imported cards; ${Object.keys(replacements.aliases).length} old cards consolidated; ${monumentModels.length} visible monument forms; legacy links resolve.`);

for(const model of monumentModels){
 const options=materialsFor(model);
 assert.equal(new Set(options.map(m=>m.id)).size,options.length,'unique choices '+model.id);
 for(const stone of monumentMaterials){const id=materialIdFor(model,stone.id);assert(options.some(m=>m.id===id),'missing '+stone.id+' on '+model.id);assert(id===stone.id||({gabbro:'ermis-k06',red:'ermis-k05',gray:'ermis-k03','tan-brown':'ermis-k12'})[stone.id]===id,'must not silently reset '+stone.id+' on '+model.id);}
 for(const id of ['marble-cream','marble-gray','shanxi','diamond','tulun'])assert(options.some(m=>m.id===id),'original workshop stone '+id+' on '+model.id);
}
console.log('PASS: all nine workshop stones remain selectable on every monument; matching native photos are preferred; restored stones retain their IDs for URLs and saved projects.');

assert.equal(findModel('arkado-3908').name,'Цефея');
assert.equal(catalogProducts.filter(m=>[m.name,...(m.searchAliases||[])].some(name=>name.toLowerCase().includes('цефея'))).length,1,'one searchable Cephée card');
for(const [oldId] of Object.entries(replacements.aliases)){
 const legacy=[...read('src/current-catalog.json'),...read('src/user-catalog.json'),...read('src/extended-catalog.json').models].find(m=>m.id===oldId);
 const target=findProduct(oldId);assert(target.searchAliases.includes(legacy.name),'legacy name searchable: '+legacy.name);
}
console.log('PASS: Цефея has its familiar display name; all 124 consolidated product names remain searchable without duplicate cards.');
