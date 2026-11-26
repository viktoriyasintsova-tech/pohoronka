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
const {stoneCoverage}=await import('../src/stone-segmentation.js');
const width=15,height=15,pixels=new Uint8ClampedArray(width*height*4);
for(let i=0;i<pixels.length;i+=4)pixels.set([255,255,255,255],i);
for(let y=2;y<13;y++)for(let x=2;x<13;x++)pixels.set([65,65,65,255],(y*width+x)*4);
for(const [x,level] of [[4,0],[5,150],[6,151],[7,220],[8,255]])pixels.set([level,level,level,255],(5*width+x)*4);
const coverage=stoneCoverage(pixels,width,height).coverage;
for(const x of [4,5,6,7,8])assert.equal(coverage[5*width+x],255,'reflections and bright internal pixels remain stone');
assert.equal(coverage[0],0,'connected studio backdrop excluded');
const isolated=stoneCoverage(pixels,width,height,{isolated:true}).coverage;
assert(isolated.every(a=>a===255),'isolated contours never use brightness cutoffs');
const grass=new Uint8ClampedArray(15*15*4);
for(let i=0;i<grass.length;i+=4)grass.set([15,60,12,255],i);
grass.set([0,0,0,255],(7*15+7)*4);
assert.equal(stoneCoverage(grass,15,15).coverage[7*15+7],0,'dark grass gaps do not become bright stone speckles');
console.log('PASS: full-surface coverage across reflections; alpha contours; studio backdrop; vegetation gaps protected.');
const reflection=new Uint8ClampedArray(25*25*4);
for(let i=0;i<reflection.length;i+=4)reflection.set([80,80,80,255],i);
for(let y=4;y<8;y++)for(let x=9;x<17;x++)reflection.set([15,55,12,255],(y*25+x)*4);
for(let y=18;y<24;y++)for(let x=3;x<23;x++)reflection.set([15,55,12,255],(y*25+x)*4);
const separated=stoneCoverage(reflection,25,25).coverage;
assert.equal(separated[5*25+12],255,'green reflection on stele is still stone');
assert.equal(separated[21*25+12],0,'actual lower flowerbed is preserved');
console.log('PASS: grass protection does not leave a dark reflected patch on the stele.');
