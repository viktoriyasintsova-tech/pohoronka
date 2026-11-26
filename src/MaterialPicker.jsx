import React,{useId} from 'react';
import {materialSampleStyle} from './materials';
export default function MaterialPicker({materials,value,onChange,compact=false}){
 const id=useId(),selected=materials.find(m=>m.id===value);
 const sample=m=>m.hex?{background:m.hex}:materialSampleStyle(m);
 return <fieldset className={`material-swatches${compact?' material-swatches-strip':''}`}><legend>Материал{selected&&<span aria-live="polite"> · {selected.name}</span>}</legend><div className="material-swatches-grid"><label className={`original-swatch ${!value?'is-selected':''}`}><input type="radio" name={id} value="" checked={!value} onChange={()=>onChange('')}/><span>Как на изображении</span></label>{materials.map(m=><label key={m.id} className={`material-swatch ${value===m.id?'is-selected':''}`}><input type="radio" name={id} value={m.id} checked={value===m.id} onChange={()=>onChange(m.id)}/><span className="swatch-circle" style={sample(m)} aria-hidden="true"/><span className="swatch-name">{m.name}</span>{value===m.id&&<span className="swatch-check" aria-hidden="true">✓</span>}</label>)}</div></fieldset>;
}
