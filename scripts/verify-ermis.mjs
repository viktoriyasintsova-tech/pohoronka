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
const bundle=await build({stdin:{contents:"export * from './src/catalog-data.js';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',define:{'import.meta.env.BASE_URL':'"/"'}});
const {allProducts,catalogProducts,monumentModels,findModel,findProduct}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
assert.equal(new Set(allProducts.map(m=>m.id)).size,allProducts.length);
for(const [oldId] of Object.entries(replacements.aliases)){
 assert(!catalogProducts.some(m=>m.id===oldId),'duplicate card remains '+oldId);
 assert(findProduct(oldId),'old product URL '+oldId);
 assert(findModel(oldId),'old constructor URL '+oldId);
}
for(const m of monumentModels)assert.equal(findModel(m.id).id,m.id);
assert.equal(catalogProducts.filter(m=>m.pavingType).length,1,'one paving selector');
console.log(`PASS: all 753 source entries accounted for; 706 unique images, 47 exact source duplicates consolidated; ${catalog.models.length} imported cards; ${Object.keys(replacements.aliases).length} old cards consolidated; ${monumentModels.length} visible monument forms; legacy links resolve.`);
