export const catalogColors=[
 {id:'black',name:'Чёрный',hex:'#292827'},
 {id:'gray',name:'Серый',hex:'#858481'},
 {id:'brown',name:'Коричневый',hex:'#675447'},
 {id:'red',name:'Красный',hex:'#794541'}
];
export function catalogImage(item,colorId='black'){
 return colorId==='black'?item.image:item.image.replace(/\.png$/,`-${colorId}.png`);
}
export function constructorImage(audience,form,colorId='black'){
 if(['straight','shaped','milled'].includes(form))return catalogImage({image:`assets/catalog-generated/${audience}-${form}.png`},colorId);
 if(form==='wave')return catalogImage({image:'assets/catalog-generated/single-shaped.png'},colorId);
 return catalogImage({image:`assets/catalog-generated/form-${form}.png`},colorId);
}
