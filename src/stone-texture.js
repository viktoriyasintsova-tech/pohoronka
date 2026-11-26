import {stoneCoverage} from './stone-segmentation.js';
import {studioSurfaces} from './stone-surfaces.js';
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const canvas=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

const smooth=t=>t*t*(3-2*t);
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const mirror=(v,n)=>{const i=Math.floor(v),x=((i%(2*n))+2*n)%(2*n);return x<n?x:2*n-x-1};

// Four independently rotated/offset patches blend with smooth weights. This
// avoids the wallpaper symmetry of mirrored repeat while retaining fine grain.
export function mineralField(source,width,height,size,{span=size*.19,side=false,offset=0}={}){
 const out=new Uint8ClampedArray(size*size*4);
 const columns=Math.ceil(size/span*(side?3.5:1))+2,rows=Math.ceil(size/span)+2;
 const patches=Array.from({length:rows},(_,y)=>Array.from({length:columns},(_,x)=>({
  ox:hash(x+offset,y)*width,oy:hash(y+77,x+offset)*height,turn:Math.floor(hash(x+19,y+offset)*4)
 })));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/span*(side?3.5:1),v=y/span,ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;
  const sx=smooth(fx),sy=smooth(fy),i=(y*size+x)*4;
  const rgb=[0,0,0];
  for(let cy=0;cy<2;cy++)for(let cx=0;cx<2;cx++){
   const patch=patches[iy+cy][ix+cx],weight=(cx?sx:1-sx)*(cy?sy:1-sy);
   let px=(fx-cx)*width,py=(fy-cy)*height;
   for(let r=0;r<patch.turn;r++){const t=px;px=-py;py=t}
   const si=(Math.floor(mirror(py+patch.oy,height))*width+Math.floor(mirror(px+patch.ox,width)))*4;
   for(let k=0;k<3;k++)rgb[k]+=source[si+k]*weight;
  }
  for(let k=0;k<3;k++)out[i+k]=rgb[k];out[i+3]=255;
 }
 return out;
}

// Bound memory on phones when visitors compare many stones (each field is
// roughly 3 MB); retain the last two materials for quick back-and-forth.
const textureCache=new Map();
const coverageCache=new Map();
function textureLayer(image,size,material,side=false,offset=0){
 const key=[size,material.kind,side,offset].join(':');
 if(!textureCache.has(image)){
  if(textureCache.size>=2)textureCache.delete(textureCache.keys().next().value);
  textureCache.set(image,new Map());
 }
 const cached=textureCache.get(image);
 if(cached.has(key))return cached.get(key);
 const sample=canvas(image.width,image.height),s=sample.getContext('2d',{willReadFrequently:true});
 s.drawImage(image,0,0);
 if(material.kind!=='Мрамор'){
  const data=mineralField(s.getImageData(0,0,image.width,image.height).data,image.width,image.height,size,{side,offset});
  cached.set(key,data);return data;
 }
 // Marble veins extend naturally over a slab; a different cut is used for
 // the pedestal, and the side compresses the pattern in perspective.
 const layer=canvas(size),c=layer.getContext('2d');
 c.drawImage(image,offset?image.width*.22:0,offset?image.height*.27:0,image.width*(offset?.78:1),image.height*(offset?.73:1),0,0,side?size*.28:size,size);
 if(side){const strip=c.getImageData(0,0,Math.ceil(size*.28),size);const temp=canvas(strip.width,strip.height);temp.getContext('2d').putImageData(strip,0,0);c.fillStyle=c.createPattern(temp,'repeat');c.fillRect(0,0,size,size)}
 const data=c.getImageData(0,0,size,size).data;cached.set(key,data);return data;
}

export function shadeStone(albedo,sourceLight,{gain=1,side=false,marble=false}={}){
 // Reflection is separate from diffuse albedo. Deep milling stays dark even
 // in white marble; bevel highlights survive every material change.
 const light=sourceLight/255;
 const diffuse=clamp(.48+Math.sqrt(Math.max(0,sourceLight)/32)*.52,.38,1.16)*gain;
 const reflection=clamp((light-.09)*1.2,0,.78)*(side?.3:1);
 const detail=marble?.86:1;
 return albedo.map(v=>Math.round(clamp(v*diffuse*detail*(1-reflection)+235*reflection,0,255)));
}

export function renderStoneMaterial({surface,image,material,model,variant,placement}){
 const size=surface.width,c=surface.getContext('2d',{willReadFrequently:true});
 const original=c.getImageData(0,0,size,size),out=c.createImageData(size,size);out.data.set(original.data);
 const geometry=studioSurfaces[model.id];
 if(geometry){
  const mask=canvas(size),m=mask.getContext('2d',{willReadFrequently:true});
  const {x,y,w,h}=placement;
  // Pedestal first; the stele occludes its top. Antialiased geometric masks
  // cannot turn a dark cast shadow into a piece of stone.
  const faces=[['baseTop',1.04],['baseFront',.92],['baseSide',.53],['top',1.08],['side',.56],['front',1]];
  for(const [face,gain] of faces){
   m.clearRect(0,0,size,size);m.save();m.translate(x,y);m.scale(w/1254,h/1254);
   m.fillStyle='#fff';m.fill(new Path2D(geometry[face]));m.restore();
   const alpha=m.getImageData(0,0,size,size).data;
   const side=face.toLowerCase().includes('side');
   const texture=textureLayer(image,size,material,side,face.startsWith('base')?137:0);
   for(let i=0;i<alpha.length;i+=4){
    if(!alpha[i+3])continue;
    const light=(original.data[i]+original.data[i+1]+original.data[i+2])/3;
    const color=shadeStone([texture[i],texture[i+1],texture[i+2]],light,{gain,side,marble:material.kind==='Мрамор'});
    const background=clamp((220-light)/30);
    const a=alpha[i+3]/255*background;
    for(let k=0;k<3;k++)out.data[i+k]=Math.round(out.data[i+k]*(1-a)+color[k]*a);
   }
  }
 }else{
  const texture=textureLayer(image,size,material);
  const d=original.data,key=[model.id,variant?.id,size,placement.x,placement.y,placement.w,placement.h].join(':');
  if(!coverageCache.has(key)){
   if(coverageCache.size>=4)coverageCache.delete(coverageCache.keys().next().value);
   coverageCache.set(key,stoneCoverage(d,size,size,{isolated:variant?.previewIsolated,softBackdrop:model.stone!=='Мрамор'}));
  }
  const {coverage,background}=coverageCache.get(key);
  for(let p=0;p<coverage.length;p++){
   const i=p*4;
   if(background[p]){if(Math.min(d[i],d[i+1],d[i+2])>243)out.data[i+3]=0;continue}
   const a=coverage[p]/255;if(!a)continue;
   const lum=(d[i]+d[i+1]+d[i+2])/3;
   const light=variant?.previewIsolated?28+lum*.18:model.stone==='Мрамор'?lum*.18:lum;
   const color=shadeStone([texture[i],texture[i+1],texture[i+2]],light,{marble:material.kind==='Мрамор'});
   for(let k=0;k<3;k++)out.data[i+k]=Math.round(d[i+k]*(1-a)+color[k]*a);
  }
 }
 if(variant?.previewIsolated){
  // Give a real transparent contour physical thickness. The front outline is
  // unchanged; the back is offset by the supplied slab thickness and lit as a
  // separate face. Unlike brightness masking, no offset copies remain visible
  // on top of the front surface.
  const front=canvas(size);front.getContext('2d').putImageData(out,0,0);
  const side=canvas(size),s=side.getContext('2d'),sidePixels=s.createImageData(size,size);
  const texture=textureLayer(image,size,material,true);
  let left=size,right=0,bottom=0;
  for(let p=0;p<size*size;p++){
   const i=p*4;if(!original.data[i+3])continue;
   sidePixels.data[i+3]=original.data[i+3];
   for(let k=0;k<3;k++)sidePixels.data[i+k]=Math.round(texture[i+k]*.48);
   const x=p%size,y=Math.floor(p/size);left=Math.min(left,x);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  s.putImageData(sidePixels,0,0);c.clearRect(0,0,size,size);
  c.save();c.filter=`blur(${size*.009}px)`;c.fillStyle='#352b2624';c.beginPath();c.ellipse((left+right)/2,bottom+size*.006,Math.max(1,(right-left)*.48),size*.009,0,0,Math.PI*2);c.fill();c.restore();
  const depth=clamp(placement.h/(variant.dimensions?.[0]||1000)*(variant.dimensions?.[2]||50)*.35,2,size*.027);
  for(let step=Math.ceil(depth);step>0;step--)c.drawImage(side,step,-step*.35);
  c.drawImage(front,0,0);
 }else c.putImageData(out,0,0);
}
