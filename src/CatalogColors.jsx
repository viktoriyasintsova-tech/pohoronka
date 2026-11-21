import React from 'react';
import {catalogColors} from './catalog-colors';
export default function CatalogColors({value,onChange,compact=false}){
 return <fieldset className={compact?'catalog-colors compact':'catalog-colors'}><legend>Цвет памятника</legend><div>{catalogColors.map(color=><button type="button" key={color.id} title={color.name} aria-label={color.name} aria-pressed={value===color.id} className={value===color.id?'active':''} onClick={()=>onChange(color.id)}><span className="color-chip" style={{backgroundColor:color.hex}}/>{!compact&&<span>{color.name}</span>}</button>)}</div>{compact&&<small>{catalogColors.find(c=>c.id===value)?.name}</small>}</fieldset>
}
