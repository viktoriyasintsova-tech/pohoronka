// Creates a standalone visual review with browser pixel checks; no server.
// node scripts/review-materials.mjs /tmp/istok-materials.html
import fs from 'node:fs';
const geometry=fs.readFileSync(new URL('../src/stone-surfaces.js',import.meta.url),'utf8').replace('export const','const');
const renderer=fs.readFileSync(new URL('../src/stone-texture.js',import.meta.url),'utf8').replace(/^import.*\n/,'').replaceAll('export function','function');
const image=p=>'data:image/'+(p.endsWith('.jpg')?'jpeg':'png')+';base64,'+fs.readFileSync(new URL('../public/'+p,import.meta.url)).toString('base64');
const models=JSON.parse(fs.readFileSync(new URL('../src/current-catalog.json',import.meta.url))).map(m=>({id:m.id,image:image(m.image)}));
const materials=['shanxi','red','gray','marble-gray','marble-cream','tan-brown'].map(id=>({id,kind:id.startsWith('marble')?'Мрамор':'Гранит',image:image('assets/materials/textures/'+id+'.jpg')}));
const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f3f1ed;font:20px Arial}main{display:grid;grid-template-columns:repeat(3,600px)}canvas{width:600px;height:600px}p{margin:8px 20px}#checks{font-size:16px;margin:10px}</style><div id="checks">Rendering…</div><main id="main"></main><script>${geometry}\n${renderer}\n
const models=${JSON.stringify(models)},materials=${JSON.stringify(materials)};
const load=src=>new Promise((resolve,reject)=>{const i=new Image;i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
(async()=>{
 let checked=0;const selected=new URLSearchParams(location.search).get('model');
 for(const model of models.filter(m=>!selected||m.id===selected)){
  const original=await load(model.image);
  for(const material of materials){
   const surface=document.createElement('canvas');surface.width=900;surface.height=900;
   const c=surface.getContext('2d',{willReadFrequently:true});c.fillStyle='#f3f1ed';c.fillRect(0,0,900,900);c.drawImage(original,70,70,760,760);
   const before=c.getImageData(0,0,900,900).data;
   renderStoneMaterial({surface,image:await load(material.image),model,material,placement:{x:70,y:70,w:760,h:760}});
   const after=c.getImageData(0,0,900,900).data;
   // Original background and ground shadow outside every model must be exact.
   for(const [x,y] of [[100,100],[700,800],[450,820],[800,780]]){
    const i=(y*900+x)*4;
    for(let k=0;k<4;k++)if(before[i+k]!==after[i+k])throw Error('Background changed: '+model.id+' / '+material.id+' at '+x+','+y);
   }
   let changed=0;for(let i=0;i<after.length;i+=4)if(Math.abs(after[i]-before[i])>5)changed++;
   if(changed<5000)throw Error('Material not applied: '+model.id+' / '+material.id);
   const el=document.createElement('div');el.innerHTML='<p>'+model.id+' · '+material.id+'</p>';el.append(surface);main.append(el);checked++;
  }
 }
 document.title='PASS';document.getElementById('checks').textContent='PASS: '+checked+' rendered combinations; floor, shadow and background unchanged.';
})().catch(e=>{document.title='FAIL';document.getElementById('checks').textContent='FAIL: '+e.message;throw e});</script>`;
const out=process.argv[2]||'/private/tmp/istok-materials-review.html';fs.writeFileSync(out,html);console.log(out);
