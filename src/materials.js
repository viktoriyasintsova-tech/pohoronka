export const stoneMaterials=[
{id:'shanxi',name:'Shanxi Black',kind:'Гранит',color:'black',uses:['monument','paving'],description:'Ровный глубокий чёрный тон.'},
{id:'gabbro',name:'Габбро',kind:'Гранит',color:'black',uses:['monument'],description:'Чёрный камень с мелким природным зерном.'},
{id:'diamond',name:'Алмазно-чёрный',kind:'Гранит',color:'black',uses:['monument'],description:'Тёмный фон с заметными минеральными вкраплениями.'},
{id:'tulun',name:'Tulunblack',kind:'Гранит',color:'black',uses:['monument'],description:'Насыщенный тёмный оттенок.'},
{id:'tan-brown',name:'Tan Brown',kind:'Гранит',color:'brown',uses:['monument','paving'],description:'Коричневые и тёмные минеральные включения.'},
{id:'red',name:'Red',kind:'Гранит',color:'red',uses:['monument'],description:'Красный камень с тёмным природным рисунком.'},
{id:'gray',name:'Гранит серый',kind:'Гранит',color:'gray',uses:['monument'],description:'Светло-серая зернистая поверхность.'},
{id:'marble-cream',name:'Мрамор кремовый',kind:'Мрамор',color:'gray',uses:['monument'],description:'Тёплый светлый оттенок с естественными прожилками.'},
{id:'marble-gray',name:'Мрамор серый',kind:'Мрамор',color:'gray',uses:['monument'],description:'Серо-голубой камень с выразительными прожилками.'},
{id:'g654',name:'G 654 · Синяя звезда',kind:'Гранит',color:'gray',uses:['paving'],description:'Тёмно-серый зернистый камень для покрытия.'},
{id:'g603',name:'G 603 · Кантри',kind:'Гранит',color:'gray',uses:['paving'],description:'Светлый гранит с мелкими контрастными включениями.'},
{id:'g664',name:'G 664 · Спелый персик',kind:'Гранит',color:'brown',uses:['paving'],description:'Тёплая серо-розовая палитра.'},
{id:'imperial-red',name:'Imperial Red',kind:'Гранит',color:'red',uses:['paving'],description:'Насыщенная красная палитра с крупным зерном.'}
];
// The same independent, evenly lit texture is used in swatches and the renderer.
for(const material of stoneMaterials)material.texture=`assets/materials/textures/${material.id}.jpg`;
export function materialSampleStyle(material){
 const size=material.sampleSize||(material.native?'900%':'cover'),position=material.samplePosition||'center';
 return {backgroundImage:`${material.sampleSplit?'linear-gradient(90deg,transparent 62%,#151515 62%),':''}url('${import.meta.env.BASE_URL}${material.texture}')`,backgroundSize:material.sampleSplit?`100%, ${size}`:size,backgroundPosition:material.sampleSplit?`center, ${position}`:position,backgroundRepeat:'no-repeat'};
}
export const monumentMaterials=stoneMaterials.filter(x=>x.uses.includes('monument'));
