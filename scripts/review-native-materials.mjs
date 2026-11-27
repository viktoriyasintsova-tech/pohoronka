import fs from 'node:fs';
import {build} from 'esbuild';
const base='file://'+process.cwd()+'/public/';
const bundle=await build({stdin:{contents:"import data from './src/ermis-catalog.json';import {prepareNativePreview} from './src/native-preview';window.audit={data,prepareNativePreview};",resolveDir:process.cwd()},bundle:true,write:false,format:'iife'});
const checks=`(async()=>{
const {data,prepareNativePreview}=window.audit;let checked=0;const records=[];
for(const model of data.models){
 for(const material of model.materialOptions){
  const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(material.previewImage));i.src=${JSON.stringify(base)}+material.previewImage});
  if(image.width<100||image.height<100)throw Error('Small source '+material.previewImage);
  checked++;records.push({model:model.id,material:material.id,width:image.width,height:image.height});
  if(material.id===model.defaultMaterial){const output=prepareNativePreview(image);if(output.width<60||output.height<60)throw Error('Empty native preview '+model.id);const figure=document.createElement('figure'),canvas=document.createElement('canvas');canvas.width=156;canvas.height=156;const scale=Math.min(144/output.width,144/output.height);canvas.getContext('2d').drawImage(output,(156-output.width*scale)/2,(156-output.height*scale)/2,output.width*scale,output.height*scale);figure.append(canvas);const label=document.createElement('figcaption');label.textContent=model.id+' · '+model.name;figure.append(label);document.querySelector('main').append(figure);}
 }
 document.getElementById('progress').textContent=checked+' / '+data.coverage.uniqueImages;await new Promise(r=>setTimeout(r,0));
}
window.auditResult={models:data.models.length,images:checked,records};const report=document.createElement('output');report.id='qa-result';report.textContent='PASS '+data.models.length+' models / '+checked+' native images';document.body.prepend(report);document.title='PASS';
})().catch(e=>{document.title='FAIL';document.getElementById('progress').textContent=e.message});`;
fs.writeFileSync(process.argv[2]||'/private/tmp/istok-mobile-review/ermis.html',`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f3f1ed;font:11px Arial}main{display:grid;grid-template-columns:repeat(8,176px)}figure{margin:0;padding:10px}figcaption{height:30px}#progress{position:fixed;bottom:0;background:white}</style><div id="progress">Loading</div><main></main><script>${bundle.outputFiles[0].text}</script><script>${checks}</script>`);
