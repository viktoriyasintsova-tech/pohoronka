import React,{useState} from 'react';
import directory from './model-directory.json';
import {ContactButton} from './ContactOptions';
export default function ModelDirectory(){
 const [query,setQuery]=useState('');
 const found=directory.filter(m=>`${m.name} ${m.section} ${m.variants.map(v=>v.code).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
 return <details className="model-directory"><summary>Дополнительные модели и серии</summary><p>Шанси, эконом, элитные и комбинированные варианты. Уточним материал, доступные размеры и комплектацию при расчёте.</p><label>Поиск дополнительных моделей<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Название, серия или артикул"/></label><div className="directory-list">{found.map(m=><details key={m.name+m.section}><summary><span>{m.name}<small>{m.section}</small></span><span className="muted">По запросу</span></summary>{m.variants.map((v,i)=><p key={i}>{v.dimensions.join(' × ')} мм · {v.code}</p>)}<ContactButton className="text-link" message={`Здравствуйте! Хочу уточнить модель: ${m.name} (${m.section}).`}>Уточнить модель</ContactButton></details>)}</div>{!found.length&&<p role="status">Модель не найдена. Попробуйте другое название или артикул.</p>}</details>
}
