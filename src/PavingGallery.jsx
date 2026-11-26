import React,{useRef,useState} from 'react';
import {materialSampleStyle} from './materials';
import PavingPreview from './PavingPreview';
export default function PavingGallery({item,material}){
 const ref=useRef(null),[page,setPage]=useState(0);
 function show(index){const el=ref.current;if(!el)return;el.scrollTo({left:index*el.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});setPage(index)}
 return <div className="paving-gallery"><div ref={ref} className="paving-gallery-track" onScroll={e=>{const el=e.currentTarget;setPage(Math.round(el.scrollLeft/el.clientWidth))}}><div className="paving-gallery-slide"><div className="paving-large-sample" role="img" aria-label={`Образец материала: ${material?.name||'гранит'}`} style={material?.hex?{backgroundColor:material.hex}:material?materialSampleStyle(material):{}}/></div><div className="paving-gallery-slide"><PavingPreview item={item} material={material}/></div></div><div className="paving-gallery-switch" role="group" aria-label="Изображения плитки"><button type="button" aria-pressed={page===0} onClick={()=>show(0)}>Образец</button><button type="button" aria-pressed={page===1} onClick={()=>show(1)}>В плитке</button></div></div>
}
