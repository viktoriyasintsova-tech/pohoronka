const clamp=v=>Math.max(0,Math.min(1,v));
// Separate geometry from lighting: a reflected dark patch is still stone.
// Isolated contours use their actual alpha; studio photos remove only the
// connected white background, never individual bright mineral pixels.
export function stoneCoverage(data,width,height,{isolated=false,softBackdrop=false}={}){
 const count=width*height,coverage=new Uint8ClampedArray(count),background=new Uint8Array(count);
 if(!isolated){
  const queue=new Int32Array(count);let start=0,end=0;
  const eligible=(p,from)=>{const i=p*4,r=data[i],g=data[i+1],b=data[i+2],low=Math.min(r,g,b),range=Math.max(r,g,b)-low;if(data[i+3]<8||low>228&&range<35)return true;if(!softBackdrop||from===undefined||low<140||range>35)return false;const j=from*4;return Math.max(Math.abs(r-data[j]),Math.abs(g-data[j+1]),Math.abs(b-data[j+2]))<7};
  const visit=(p,from)=>{if(!background[p]&&eligible(p,from)){background[p]=1;queue[end++]=p}};
  for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x)}
  for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1)}
  while(start<end){const p=queue[start++],x=p%width;if(x)visit(p-1,p);if(x<width-1)visit(p+1,p);if(p>=width)visit(p-width,p);if(p<count-width)visit(p+width,p)}
 }
 const stride=width+1,greenIntegral=isolated?null:new Uint32Array((width+1)*(height+1));
 const vegetation=isolated?null:new Uint8Array(count);
 if(vegetation){
  const seen=new Uint8Array(count),queue=new Int32Array(count),regions=[];
  const green=p=>{const i=p*4,r=data[i],g=data[i+1],b=data[i+2];return !!data[i+3]&&g>r*1.08&&g>b*1.08&&g>3};
  for(let p=0;p<count;p++){
   if(seen[p]||!green(p))continue;
   let start=0,end=1,sumY=0;queue[0]=p;seen[p]=1;const members=[];
   const visit=q=>{if(!seen[q]&&green(q)){seen[q]=1;queue[end++]=q}};
   while(start<end){const q=queue[start++],x=q%width;members.push(q);sumY+=Math.floor(q/width);if(x)visit(q-1);if(x<width-1)visit(q+1);if(q>=width)visit(q-width);if(q<count-width)visit(q+width)}
   regions.push({members,y:sumY/members.length});
  }
  const largest=regions.reduce((n,r)=>Math.max(n,r.members.length),0);
  for(const region of regions)if(region.members.length>=Math.max(3,largest*.12)&&(region.y>height*.65||region.members.length>count*.2))for(const p of region.members)vegetation[p]=1;
  for(let y=0;y<height;y++){
   let row=0;
   for(let x=0;x<width;x++){row+=vegetation[y*width+x];greenIntegral[(y+1)*stride+x+1]=greenIntegral[y*stride+x+1]+row}
  }
 }
 for(let p=0;p<count;p++){
  const i=p*4;if(background[p]||!data[i+3])continue;
  if(isolated){coverage[p]=data[i+3];continue}
  const r=data[i],g=data[i+1],b=data[i+2];
  // Continuous vegetation protection avoids black/cream speckles at grass
  // edges. Low-saturation gray reflections are never classified as grass.
  const x=p%width,y=Math.floor(p/width),x0=Math.max(0,x-3),x1=Math.min(width,x+4),y0=Math.max(0,y-3),y1=Math.min(height,y+4);
  const sum=greenIntegral[y1*stride+x1]-greenIntegral[y0*stride+x1]-greenIntegral[y1*stride+x0]+greenIntegral[y0*stride+x0];
  const neighborhood=clamp((sum/((x1-x0)*(y1-y0))-.1)/.5);
  const direct=vegetation[p]?1:0;
  const green=Math.max(neighborhood,direct);
  coverage[p]=Math.round(data[i+3]*(1-green));
 }
 return {coverage,background};
}
