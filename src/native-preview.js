// Remove only the edge-connected white studio backdrop. Stone, carving,
// grass and interior highlights keep their original RGB values.
const prepared=new WeakMap();
export function prepareNativePreview(image){
 if(prepared.has(image))return prepared.get(image);
 const scale=Math.min(1,1800/Math.max(image.width,image.height));
 const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
 const {width:w,height:h}=canvas,data=ctx.getImageData(0,0,w,h),pixels=data.data;
 const seen=new Uint8Array(w*h),queue=new Uint32Array(w*h);let head=0,tail=0;
 function add(index){if(seen[index])return;seen[index]=1;const p=index*4,low=Math.min(pixels[p],pixels[p+1],pixels[p+2]),high=Math.max(pixels[p],pixels[p+1],pixels[p+2]);if(pixels[p+3]<8||(low>245&&high-low<8)){queue[tail++]=index;pixels[p+3]=0}}
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}
 for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
 while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);if(x)add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w)}
 let left=w,top=h,right=0,bottom=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
 ctx.putImageData(data,0,0);
 const cropped=document.createElement('canvas');cropped.width=Math.max(1,right-left+1);cropped.height=Math.max(1,bottom-top+1);
 cropped.getContext('2d').drawImage(canvas,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
 prepared.set(image,cropped);return cropped;
}
