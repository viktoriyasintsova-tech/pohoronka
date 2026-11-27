import {monumentMaterials,stoneMaterials} from './materials';
export const concreteMaterials=[{id:'concrete-gray',name:'Бетон · серый',hex:'#9b9992'},{id:'concrete-graphite',name:'Бетон · графит',hex:'#555655'},{id:'concrete-brown',name:'Бетон · коричневый',hex:'#7b5b46'},{id:'concrete-red',name:'Бетон · красный',hex:'#a16450'},{id:'concrete-sand',name:'Бетон · песочный',hex:'#c4ae85'}];
export function materialsFor(item){
 if(item.materialOptions)return item.materialOptions;
 if(item.stone==='Металл')return [];
 if(item.pavingType==='concrete')return concreteMaterials;
 if(item.pavingType==='selection')return [...materialsFor({category:'paving'}),...concreteMaterials];
 if(item.category==='paving')return [...stoneMaterials.filter(m=>m.uses.includes('paving')),{id:'pearl',name:'Жемчужный цветок',texture:'assets/paving/tile-zhemchuzhnyy-tsvetok.jpg'}];
 return monumentMaterials;
}

// Map older shared-stone URLs to the matching native photograph when available.
export function materialIdFor(item,id){
 const options=materialsFor(item),legacy={gabbro:"ermis-k06",red:"ermis-k05",gray:"ermis-k03","tan-brown":"ermis-k12"};
 const wanted=item.materialOptions?(legacy[id]||id):id;
 return options.some(m=>m.id===wanted)?wanted:(item.defaultMaterial||"");
}
