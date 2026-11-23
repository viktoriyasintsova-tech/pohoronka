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
  // Preserve original lighting on imported studio images. The conservative
  // fallback mask does not paint pale backgrounds or foliage.
  const d=original.data;
  for(let i=0;i<d.length;i+=4){
   const r=d[i],g=d[i+1],b=d[i+2],lum=(r+g+b)/3;
   if(!d[i+3]||g>r*1.22&&g>b*1.15)continue;
   if(lum>150||Math.max(r,g,b)-Math.min(r,g,b)>90)continue;
   const color=shadeStone([texture[i],texture[i+1],texture[i+2]],lum,{marble:material.kind==='Мрамор'});
   for(let k=0;k<3;k++)out.data[i+k]=color[k];
  }
 }
 c.putImageData(out,0,0);
}
