import paving from './paving-catalog.json';
export const pavingProducts=paving;
export const pavingFamily={id:'paving-selection',name:'Плитка для благоустройства',category:'paving',stone:'Гранит и бетон',source:'paving',collection:'standard',pavingType:'selection',defaultMaterial:'g603',price:null,image:paving[2].image,variants:paving.flatMap(p=>p.variants)};
export function resolvePaving(item,materialId,variantId){
 if(!item.pavingType)return item;
 const concrete=materialId?.startsWith('concrete-');
 if(concrete)return paving.find(p=>p.pavingType==='concrete'&&p.variants.some(v=>v.id===variantId))||paving.find(p=>p.pavingType==='concrete');
 return paving.find(p=>p.defaultMaterial===materialId)||paving.find(p=>p.id===item.id)||paving[2];
}
