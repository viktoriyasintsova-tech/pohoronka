// Exhaustive source variant/material audit, without a server.
import {build} from 'esbuild';
import fs from 'node:fs';
const reviewIds=(process.argv[3]||'').split(',').filter(Boolean),size=reviewIds.length?540:144;
const base='file://'+process.cwd()+'/public/';
const entry=`import {renderStoneMaterial} from './src/stone-texture.js';import {monumentModels} from './src/catalog-data.js';import {monumentMaterials} from './src/materials.js';window.audit={renderStoneMaterial,monumentModels,monumentMaterials};`;
const result=await build({stdin:{contents:entry,resolveDir:process.cwd()},bundle:true,write:false,format:'iife',define:{'import.meta.env.BASE_URL':JSON.stringify(base)}});
const test=`(async()=>{
 const {renderStoneMaterial,monumentModels,monumentMaterials}=window.audit;
 const images=new Map(),load=src=>{if(!images.has(src))images.set(src,new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=${JSON.stringify(base)}+src}));return images.get(src)};
 const ids=${JSON.stringify(reviewIds)},models=ids.length?monumentModels.filter(m=>ids.includes(m.id)):monumentModels;
 let checked=0;const records=[];
 for(const model of models){for(const variant of (ids.length?[model.variants[0]]:model.variants)){
  const original=await load(variant.previewImage||model.previewImage||variant.image||model.image),size=${size},pad=${Math.round(size/12)};
  const aspect=variant.previewIsolated&&variant.dimensions?.length>1?variant.dimensions[1]/variant.dimensions[0]:original.width/original.height;
  const w=aspect>=1?size-2*pad:(size-2*pad)*aspect,h=aspect>=1?(size-2*pad)/aspect:size-2*pad;
  const placement={x:(size-w)/2,y:(size-h)/2,w,h};
  for(const material of monumentMaterials){
   const surface=document.createElement('canvas');surface.width=size;surface.height=size;
   const c=surface.getContext('2d',{willReadFrequently:true});c.drawImage(original,placement.x,placement.y,w,h);
   const before=c.getImageData(0,0,size,size).data;
   renderStoneMaterial({surface,image:await load(material.texture),material,model,variant,placement});
   const after=c.getImageData(0,0,size,size).data;
   let changed=0;for(let i=0;i<after.length;i+=4){if(after[i+3]&&Math.abs(after[i]-before[i])+Math.abs(after[i+1]-before[i+1])+Math.abs(after[i+2]-before[i+2])>12)changed++;if(!variant.previewIsolated&&after[i+3]>before[i+3])throw Error('Photo alpha expanded '+variant.id)}
   if(changed<8)throw Error('Material not applied '+variant.id+' '+material.id);
   checked++;
   if(variant===model.variants[0]&&['red','marble-cream','tan-brown'].includes(material.id)){
    const tile=document.createElement('figure');tile.innerHTML='<figcaption>'+model.id+' · '+material.id+'</figcaption>';tile.append(surface);document.querySelector('main').append(tile);
   }
  }
  records.push({model:model.id,variant:variant.id,materials:monumentMaterials.length});
 }
 document.getElementById('progress').textContent=model.name+' · '+checked;
 await new Promise(r=>setTimeout(r,0));
 }
 window.auditResult={models:models.length,variants:records.length,combinations:checked,records};
 const report=document.createElement('output');report.id='qa-result';report.textContent='PASS '+JSON.stringify({models:models.length,variants:records.length,combinations:checked});document.body.prepend(report);document.title='PASS';
})().catch(e=>{document.title='FAIL';document.getElementById('progress').textContent=e.message;console.error(e)});`;
fs.writeFileSync(process.argv[2]||'/private/tmp/istok-stone-audit.html',`<!doctype html><style>body{margin:0;font:11px Arial;background:#f3f1ed}main{display:grid;grid-template-columns:repeat(${reviewIds.length?3:9},${reviewIds.length?556:160}px)}figure{margin:0;padding:8px}canvas{width:${size}px;height:${size}px}figcaption{height:24px;font-size:10px}#progress{position:fixed;bottom:0;background:#fff}</style><div id="progress">Preparing…</div><main></main><script>${result.outputFiles[0].text}</script><script>${test}</script>`);
