// Build the real React application into a standalone file for browser QA.
// No local server or additional browser packages are needed.
// node scripts/review-mobile.mjs /tmp/istok-mobile.html
import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL, fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=pathToFileURL(root+'public/').href;
const result=await build({entryPoints:[root+'src/main.jsx'],bundle:true,write:false,format:'iife',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':JSON.stringify(base),'process.env.NODE_ENV':'"production"'}});
const css=readFileSync(root+'src/style.css','utf8').replaceAll("url('/assets/",`url('${base}assets/`);
const tests=String.raw`
(async()=>{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const settle=async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await pause(100)};
 const expect=(value,message)=>{if(!value)throw Error(message+' '+JSON.stringify({scrollY,innerHeight,preview:document.querySelector('.modern-preview')?.getBoundingClientRect().toJSON(),position:getComputedStyle(document.querySelector('.modern-preview')).position,viewport:visualViewport?.height}))};
 const wait=async predicate=>{for(let n=0;n<100;n++){if(predicate())return;await pause(50)}throw Error('Timed out')};
 const checks=[];
 await settle();await wait(()=>document.querySelector('.preview-tools button')?.disabled===false);
 const mobile=matchMedia('(max-width:700px)').matches;
 if(mobile){
  const preview=document.querySelector('.modern-preview'),nav=[...document.querySelectorAll('.mobile-constructor-nav button')];
  expect(document.querySelectorAll('.constructor-step[open]').length===1,'Initially one mobile step');
  nav[1].click();await settle();
  expect(document.querySelector('#constructor-step-1').open,'Material step opens');
  expect(document.querySelectorAll('.constructor-step[open]').length===1,'Previous step closes');
  expect(preview.getBoundingClientRect().top>=-1&&preview.getBoundingClientRect().top<20,'Preview remains visible');
  checks.push('step navigation and pinned preview');
  const material=[...document.querySelectorAll('.material-picker button')].find(b=>b.textContent.includes('Tan Brown'));
  const before=scrollY;material.click();await settle();await wait(()=>document.querySelector('.preview-tools button')?.disabled===false);
  expect(Math.abs(scrollY-before)<4,'No jump on material change');
  expect(document.querySelector('.mobile-preview-summary').textContent.includes('Tan Brown'),'Selected material shown');
  checks.push('material selection without scroll jump');
  nav[2].click();await settle();
  const input=document.querySelector('input[placeholder="Введите текст для предпросмотра"]');
  input.focus({preventScroll:true});const textScroll=scrollY;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Память');input.dispatchEvent(new Event('input',{bubbles:true}));
  await pause(250);
  expect(Math.abs(scrollY-textScroll)<4,'Typing does not scroll');
  expect(getComputedStyle(input).fontSize==='16px','Readable input without iPhone focus zoom');
  checks.push('text entry without scroll jump');
  input.blur();nav[1].click();await settle();await settle();await wait(()=>document.querySelector('.preview-tools button')?.disabled===false);
  document.querySelector('.mobile-preview-summary button').click();await pause(150);
  expect(document.querySelector('.preview-dialog').open,'Enlarged result opens');
  document.querySelector('.preview-dialog .dialog-close').click();await settle();
  expect(!document.querySelector('.preview-dialog').open,'Enlarged result closes');
  expect(document.body.style.overflow!=='hidden','Body scroll restored');
  checks.push('enlarged result and scroll restoration');
  expect(document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,'No horizontal overflow');
  expect(preview.getBoundingClientRect().height<innerHeight*.57,'Preview leaves room for controls');
  checks.push('viewport fit and touch-sized navigation');
 }else{
  expect(getComputedStyle(document.querySelector('.mobile-constructor-nav')).display==='none','Mobile navigation hidden on desktop');
  const layout=getComputedStyle(document.querySelector('.drawing-layout'));
  expect(layout.display==='grid','Desktop grid retained');
  checks.push('desktop layout retained');
 }
 const report=document.createElement('output');report.id='qa-result';report.textContent='PASS: '+checks.join('; ');report.style='position:fixed;bottom:0;left:0;right:0;z-index:999;background:#fff;color:#26231f;font:11px Arial;padding:4px;border-top:1px solid #ccc';document.body.append(report);document.title='PASS';await settle();
})().catch(error=>{document.title='FAIL';const report=document.createElement('pre');report.textContent='FAIL: '+error.message;report.style='position:fixed;top:0;left:0;right:0;z-index:999;background:#fcc;color:#000;padding:16px;white-space:pre-wrap';document.body.append(report);console.error(error)});
`;
const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root"></div><script>${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script><script>${tests}</script></html>`;
const destination=process.argv[2]||'/private/tmp/istok-mobile.html';writeFileSync(destination,html);console.log(destination);
