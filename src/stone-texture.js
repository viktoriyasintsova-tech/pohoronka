const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const smoothstep=(lo,hi,v)=>{const t=clamp((v-lo)/(hi-lo),0,1);return t*t*(3-2*t)};

// Both inputs cover the full canvas: never repeat a crop and its lighting.
export function applyStoneTexture(pixels,texture,shading,{marble=false}={}){
 for(let i=0;i<pixels.length;i+=4){
  if(!pixels[i+3])continue;
  const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
  const low=Math.min(r,g,b),high=Math.max(r,g,b),lum=(r+g+b)/3;
  // Preserve the studio background, foliage and the soft ground shadow.
  if(low>243&&high-low<12)continue;
  if(g>r*1.22&&g>b*1.15)continue;
  const coverage=1-smoothstep(marble?232:155,marble?249:210,lum);
  if(!coverage)continue;
  const light=(shading[i]+shading[i+1]+shading[i+2])/3;
  // Keep broad bevels/highlights, without stamping the old grain onto the
  // new stone or turning light marble into charcoal.
  const shade=marble?clamp(light/210,.65,1.12):clamp(.76+light/255,.76,1.35);
  const reflection=marble?0:Math.max(0,light-60)*.34;
  for(let k=0;k<3;k++){
   const color=clamp(texture[i+k]*shade+reflection,0,255);
   pixels[i+k]=Math.round(pixels[i+k]*(1-coverage)+color*coverage);
  }
 }
 return pixels;
}
