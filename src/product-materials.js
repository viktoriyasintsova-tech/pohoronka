import {monumentMaterials,stoneMaterials} from './materials';
export const concreteMaterials=[{id:'concrete-gray',name:'Бетон · серый',hex:'#9b9992'},{id:'concrete-graphite',name:'Бетон · графит',hex:'#555655'},{id:'concrete-brown',name:'Бетон · коричневый',hex:'#7b5b46'},{id:'concrete-red',name:'Бетон · красный',hex:'#a16450'},{id:'concrete-sand',name:'Бетон · песочный',hex:'#c4ae85'}];
const nativeStoneIds={gabbro:'ermis-k06',red:'ermis-k05',gray:'ermis-k03','tan-brown':'ermis-k12'};
export function materialsFor(item){
 if(item.materialOptions){
  if(item.category!=='monuments')return item.materialOptions;
  const nativeIds=new Set(item.materialOptions.map(m=>m.id));
  // Supplier photographs supplement the workshop palette rather than replace
  // it. Prefer native photographs for matching stones without duplicate chips.
  return [...item.materialOptions,...monumentMaterials.filter(m=>!nativeIds.has(nativeStoneIds[m.id]))];
 }
 if(item.stone==='Металл')return [];
 if(item.pavingType==='concrete')return concreteMaterials;
 if(item.pavingType==='selection')return [...materialsFor({category:'paving'}),...concreteMaterials];
 if(item.category==='paving')return [...stoneMaterials.filter(m=>m.uses.includes('paving')),{id:'pearl',name:'Жемчужный цветок',texture:'assets/paving/tile-zhemchuzhnyy-tsvetok.jpg'}];
 return monumentMaterials;
}

// Map older shared-stone URLs to the matching native photograph when available.
export function materialIdFor(item,id){
 const options=materialsFor(item);
 if(options.some(m=>m.id===id))return id;
 const wanted=item.materialOptions?(nativeStoneIds[id]||id):id;
 return options.some(m=>m.id===wanted)?wanted:(item.defaultMaterial||"");
}
