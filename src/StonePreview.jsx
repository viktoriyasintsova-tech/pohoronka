import React,{forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {asset} from './catalog-data';
import Icon from './Icon';
import {prepareNativePreview} from './native-preview';
import {renderStoneMaterial} from './stone-texture';
const imageCache=new Map();
function loadImage(src){
 if(!imageCache.has(src)){
  const promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{imageCache.delete(src);reject(Error('image unavailable'))};image.src=src});
  imageCache.set(src,promise);if(imageCache.size>24)imageCache.delete(imageCache.keys().next().value);
 }
 return imageCache.get(src);
}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function wrappedText(ctx,text,x,y,maxWidth,lineHeight){
 const words=text.split(/\s+/);let line='',lines=[];
 for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);
 for(const [i,l] of lines.slice(0,5).entries())ctx.fillText(l,x,y+i*lineHeight);
}
export default forwardRef(function StonePreview({model,variant,material,config={},tools=false},ref){
 const canvasRef=useRef(null),dialogRef=useRef(null),readyRef=useRef(false),savedOverflow=useRef(null);const [state,setState]=useState('loading'),[snapshot,setSnapshot]=useState('');
 const dimensionsKey=(variant?.dimensions||[]).join('x');
 const src=asset(material?.native?material.previewImage:variant?.previewImage||model.previewImage||variant?.image||model.image);
 useImperativeHandle(ref,()=>({enlarge(){if(!readyRef.current)return false;enlarge();return true},download(){const canvas=canvasRef.current;if(!canvas||!readyRef.current)return false;const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='istok-'+model.id+'.png';a.click();return true}}),[model.id]);
 useEffect(()=>{let cancelled=false;readyRef.current=false;setState('loading');
 async function paint(){try{
  const loaded=await loadImage(src);if(cancelled)return;const original=model.source==='ermis'?prepareNativePreview(loaded):loaded;
  const size=900,canvas=canvasRef.current,ctx=canvas.getContext('2d');canvas.width=size;canvas.height=size;
  const surface=document.createElement('canvas');surface.width=size;surface.height=size;const c=surface.getContext('2d',{willReadFrequently:true});
  const pad=70,available=size-pad*2,aspect=variant?.previewIsolated&&variant.dimensions?.length>1?variant.dimensions[1]/variant.dimensions[0]:original.width/original.height;
  const w=aspect>=1?available:available*aspect,h=aspect>=1?available/aspect:available;
  c.drawImage(original,(size-w)/2,(size-h)/2,w,h);const pixels=c.getImageData(0,0,size,size),d=pixels.data;
  // Determine transparency from the original, never from the new stone's
  // white crystals: otherwise light marble/granite develops transparent holes.
  for(let i=0;i<d.length;i+=4){
   const low=Math.min(d[i],d[i+1],d[i+2]),high=Math.max(d[i],d[i+1],d[i+2]);
   if(model.source==='price'&&low>243&&high-low<12)d[i+3]=0;
  }
  if(material&&!material.native){
   const image=await loadImage(asset(material.texture));if(cancelled)return;
   c.putImageData(pixels,0,0);
   renderStoneMaterial({surface,image,material,model,variant,placement:{x:(size-w)/2,y:(size-h)/2,w,h}});
  }else{
   c.putImageData(pixels,0,0);
  }
  ctx.fillStyle='#f3f1ed';ctx.fillRect(0,0,size,size);ctx.drawImage(surface,0,0);
  if(config.portrait){const photo=await loadImage(config.portrait);if(cancelled)return;const pw=config.triplex?170:150,ph=200,px=clamp(Number(config.portraitX)||50,10,90)/100*size,py=clamp(Number(config.portraitY)||36,10,85)/100*size;ctx.save();ctx.beginPath();if(config.triplex)ctx.rect(px-pw/2,py-ph/2,pw,ph);else ctx.ellipse(px,py,pw/2,ph/2,0,0,Math.PI*2);ctx.clip();const fill=Math.max(pw/photo.width,ph/photo.height);ctx.drawImage(photo,px-photo.width*fill/2,py-photo.height*fill/2,photo.width*fill,photo.height*fill);ctx.restore();if(config.triplex){ctx.strokeStyle='#d5d9d9';ctx.lineWidth=4;ctx.strokeRect(px-pw/2,py-ph/2,pw,ph);for(const sx of [-1,1])for(const sy of [-1,1]){ctx.beginPath();ctx.arc(px+sx*(pw/2-9),py+sy*(ph/2-9),3,0,Math.PI*2);ctx.fillStyle='#e2e2dd';ctx.fill()}}}
  const name=config.name?.trim(),dates=config.dates?.trim(),epitaph=config.epitaph?.trim();
  if(name||dates||epitaph){const x=clamp(Number(config.textX)||50,10,90)/100*size,y=clamp(Number(config.textY)||57,15,90)/100*size;const font=config.font==='serif'?'Georgia':'Arial',fontSize=clamp(Number(config.fontSize)||27,16,44);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=config.textColor==='dark'?'#352b26':'#f6f3e9';ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=2;ctx.font=`${fontSize}px ${font}`;if(name)wrappedText(ctx,name,x,y,370,fontSize*1.35);ctx.font=`${fontSize*.7}px ${font}`;if(dates)wrappedText(ctx,dates,x,y+fontSize*2.5,370,fontSize);ctx.font=`italic ${fontSize*.65}px ${font}`;if(epitaph)wrappedText(ctx,epitaph,x,y+fontSize*4.1,370,fontSize*.95);}
  if(!cancelled){readyRef.current=true;setState('ready');}
 }catch{if(!cancelled)setState('error')}}
 paint();return()=>{cancelled=true};
 },[src,dimensionsKey,model.stone,material?.id,config.name,config.dates,config.epitaph,config.font,config.fontSize,config.textX,config.textY,config.textColor,config.portrait,config.portraitX,config.portraitY,config.triplex]);
 function restoreScroll(){if(savedOverflow.current!==null){document.body.style.overflow=savedOverflow.current;savedOverflow.current=null}}
 useEffect(()=>()=>restoreScroll(),[]);
 function enlarge(){savedOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden';setSnapshot(canvasRef.current.toDataURL('image/png'));dialogRef.current.showModal()}
 return <div className="stone-preview"><canvas ref={canvasRef} width="900" height="900" role="img" aria-label={`${model.name}${material?', материал '+material.name:''}${config.name?', надпись '+config.name:''}`} aria-busy={state==='loading'}/>{state==='loading'&&<p className="preview-status" role="status">Обновляем изображение…</p>}{state==='error'&&<p className="preview-status" role="alert">Не удалось загрузить изображение. Обновите страницу.</p>}{tools&&<div className="preview-tools"><button type="button" onClick={enlarge} disabled={state!=='ready'}><Icon name="expand" size={16}/> Увеличить</button></div>}<dialog className="dialog preview-dialog" ref={dialogRef} aria-label="Увеличенный предпросмотр памятника" onClose={restoreScroll} onCancel={restoreScroll} onClick={e=>{if(e.target===e.currentTarget)dialogRef.current.close()}}><button type="button" className="icon-button dialog-close" aria-label="Закрыть предпросмотр" onClick={()=>dialogRef.current.close()}><Icon name="cross"/></button>{snapshot&&<img src={snapshot} alt={`Предварительный вид: ${model.name}`}/>}</dialog></div>
});
