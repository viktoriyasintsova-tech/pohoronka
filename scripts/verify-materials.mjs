import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {shadeStone,mineralField} from '../src/stone-texture.js';
import {studioSurfaces} from '../src/stone-surfaces.js';

const source=readFileSync(new URL('../src/materials.js',import.meta.url),'utf8').replaceAll('import.meta.env.BASE_URL',"'/'");
const {stoneMaterials,materialSampleStyle}=await import('data:text/javascript,'+encodeURIComponent(source));
assert.equal(stoneMaterials.length,13);
assert.equal(new Set(stoneMaterials.map(m=>m.texture)).size,13);
for(const m of stoneMaterials){
 assert(statSync(new URL('../public/'+m.texture,import.meta.url)).size>10000,m.id);
 const style=materialSampleStyle(m);
 assert(style.backgroundImage.includes(m.texture));
 assert.equal(style.backgroundRepeat,'no-repeat');
}
assert.equal(stoneMaterials.filter(m=>m.uses.includes('monument')).length,9);
assert.equal(stoneMaterials.filter(m=>m.uses.includes('paving')).length,6);

// Geometry is defined separately from color: no material may change the
// silhouette, erase the pedestal side or recolor the floor shadow.
assert.equal(Object.keys(studioSurfaces).length,6);
for(const faces of Object.values(studioSurfaces)){
 assert.deepEqual(Object.keys(faces).sort(),['front','side','top','baseFront','baseSide','baseTop'].sort());
 assert(Object.values(faces).every(path=>path.startsWith('M')&&path.endsWith('Z')));
}
for(const albedo of [[170,90,45],[190,195,200],[240,228,205],[15,15,15]]){
 const front=shadeStone(albedo,32),side=shadeStone(albedo,32,{gain:.56,side:true});
 assert(side.every((v,i)=>v<front[i]),'side must stay darker for every stone');
 const highlight=shadeStone(albedo,180);
 assert(highlight.every((v,i)=>v>front[i]),'polished highlight survives material change');
 const groove=shadeStone(albedo,0);
 assert(groove.every((v,i)=>v<front[i]),'milling keeps its depth');
}
const brown=shadeStone([170,90,45],32);assert(brown[0]>brown[1]&&brown[1]>brown[2]);
// Constant inputs must stay constant at every patch boundary and negative
// sample coordinate; an out-of-range sample creates thin black streaks.
const flat=new Uint8ClampedArray(17*17*4);
for(let i=0;i<flat.length;i+=4)flat.set([145,95,65,255],i);
for(const side of [false,true]){
 const field=mineralField(flat,17,17,128,{side,span:19,offset:137});
 for(let i=0;i<field.length;i+=4)assert.deepEqual([...field.slice(i,i+4)],[145,95,65,255]);
}
console.log('PASS: 13 textures; 9 monument / 6 paving options; 6 models with separate stele and pedestal faces; side lighting, polished highlights, milling depth and brown hue preserved.');
