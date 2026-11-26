import React,{useId} from 'react';
import {materialSampleStyle} from './materials';
export default function MaterialPicker({materials,value,onChange,compact=false}){
 const id=useId(),selected=materials.find(m=>m.id===value);
 return <div className={`product-material-picker${compact?' compact':''}`}><label htmlFor={id}>Материал</label><div>{selected&&<span className="picker-sample" style={selected.hex?{background:selected.hex}:materialSampleStyle(selected)} aria-hidden="true"/>}<select id={id} value={value} onChange={e=>onChange(e.target.value)}><option value="">Как на изображении</option>{materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div>
}
