import userModels from './user-catalog.json';
import {pavingFamily} from './paving-products';
import paving from './paving-catalog.json';
import current from './current-catalog.json';
import extended from './extended-catalog.json';
import forged from './forged-catalog.json';
export const ownMonuments=current.map(m=>({...m,category:'monuments',stone:'Гранит',collection:'standard',source:'price',previewImage:m.image,variants:m.variants.map(v=>({...v,specs:[{label:'Стела',value:v.dimensions.join(' × ')+' мм'}],image:m.image,previewImage:m.image}))}));
export const referenceModels=extended.models;
export const monumentModels=[...ownMonuments,...userModels,...referenceModels.filter(m=>m.category==='monuments')];
export const allProducts=[pavingFamily,...userModels,...paving,...ownMonuments,...referenceModels,...forged.items.map(m=>({...m,source:'forged',stone:'Металл',collection:'forged',variants:[{id:m.id,specs:m.specs,price:null,image:m.image}]}))];
export const catalogCoverage=extended.coverage;
export const collectionLabels={standard:'Стандартные',econom:'Эконом',elite:'Элитные',forged:'Кованые'};
export const rub=value=>value==null?'По запросу':`от ${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
export const variantLabel=v=>v.dimensions?.length?v.dimensions.join(' × ')+' мм'+(v.materialName?' · '+v.materialName:''):v.specs?.length?v.specs.map(s=>`${s.label}: ${s.value}`).join(' · '):'Размер и комплектация по запросу';
export const asset=path=>import.meta.env.BASE_URL+path;
export function findModel(id){return monumentModels.find(m=>m.id===id)||monumentModels.find(m=>m.variants.some(v=>v.id===id))}

export const matchesCategory=(item,category)=>category==='all'||item.category===category||(category==='crosses'&&item.category==='monuments'&&item.name.toLowerCase().startsWith('крест'));

// Retain old product URLs, but show one configurable paving family in lists.
export const catalogProducts=allProducts.filter(p=>p.category!=='paving'||p.id===pavingFamily.id);
