import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {applyStoneTexture} from '../src/stone-texture.js';

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

// A continuous gradient crossing the former 80-pixel tile boundaries must
// remain continuous on both the stele and the bottom of the pedestal.
const size=900,count=size*size;
const original=new Uint8ClampedArray(count*4),texture=original.slice(),light=original.slice();
for(let i=0;i<count;i++){
 original.set([35,35,35,255],i*4);
 texture.set([60+Math.floor(i%size/8),45,25,255],i*4);
 light.set([35,35,35,255],i*4);
}
applyStoneTexture(original,texture,light);
for(const y of [300,780]){
 for(let x=1;x<size;x++)assert(Math.abs(original[(y*size+x)*4]-original[(y*size+x-1)*4])<=2);
 assert(original[(y*size+800)*4]>original[(y*size+80)*4]+60);
}
const paint=(pixel,material=[160,90,45,255])=>{
 const result=new Uint8ClampedArray(pixel);
 applyStoneTexture(result,new Uint8ClampedArray(material),new Uint8ClampedArray([60,60,60,255]));
 return [...result];
};
for(const untouched of [[250,250,250,255],[230,227,220,255],[30,100,25,255],[0,0,0,0]])assert.deepEqual(paint(untouched),untouched);
const brown=paint([35,35,35,255]);assert(brown[0]>brown[1]&&brown[1]>brown[2]);
const white=paint([35,35,35,255],[255,255,255,255]);assert.equal(white[3],255);
console.log('PASS: 13 distinct texture assets; 9 monument / 6 paving options; shared swatches; continuous fill across old tile boundaries and pedestal; background, greenery and alpha preserved; warm brown retained.');
