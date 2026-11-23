const crop=(x,y)=>({backgroundImage:`url('${import.meta.env.BASE_URL}assets/materials/samples.jpg')`,backgroundSize:'1500% 2000%',backgroundPosition:`${x/1344*100}% ${y/1824*100}%`});
export const stoneMaterials=[
{id:'shanxi',name:'Shanxi Black',kind:'Гранит',color:'black',uses:['monument','paving'],sample:[265,190],description:'Ровный глубокий чёрный тон.'},
{id:'gabbro',name:'Габбро',kind:'Гранит',color:'black',uses:['monument'],sample:[265,360],description:'Чёрный камень с мелким природным зерном.'},
{id:'diamond',name:'Алмазно-чёрный',kind:'Гранит',color:'black',uses:['monument'],sample:[265,525],description:'Тёмный фон с заметными минеральными вкраплениями.'},
{id:'tulun',name:'Tulunblack',kind:'Гранит',color:'black',uses:['monument'],sample:[205,700],description:'Насыщенный тёмный оттенок.'},
{id:'tan-brown',name:'Tan Brown',kind:'Гранит',color:'brown',uses:['monument','paving'],sample:[180,900],description:'Коричневые и тёмные минеральные включения.'},
{id:'red',name:'Red',kind:'Гранит',color:'red',uses:['monument'],sample:[180,1080],description:'Красный камень с тёмным природным рисунком.'},
{id:'gray',name:'Гранит серый',kind:'Гранит',color:'gray',uses:['monument'],sample:[160,1280],description:'Светло-серая зернистая поверхность.'},
{id:'marble-cream',name:'Мрамор кремовый',kind:'Мрамор',color:'gray',uses:['monument'],sample:[150,1460],description:'Тёплый светлый оттенок с естественными прожилками.'},
{id:'marble-gray',name:'Мрамор серый',kind:'Мрамор',color:'gray',uses:['monument'],sample:[130,1690],description:'Серо-голубой камень с выразительными прожилками.'},
{id:'g654',name:'G 654 · Синяя звезда',kind:'Гранит',color:'gray',uses:['paving'],sample:[820,900],description:'Тёмно-серый зернистый камень для покрытия.'},
{id:'g603',name:'G 603 · Кантри',kind:'Гранит',color:'gray',uses:['paving'],sample:[820,1080],description:'Светлый гранит с мелкими контрастными включениями.'},
{id:'g664',name:'G 664 · Спелый персик',kind:'Гранит',color:'brown',uses:['paving'],sample:[800,1280],description:'Тёплая серо-розовая палитра.'},
{id:'imperial-red',name:'Imperial Red',kind:'Гранит',color:'red',uses:['paving'],sample:[800,1490],description:'Насыщенная красная палитра с крупным зерном.'}
];
export const materialSampleStyle=material=>crop(...material.sample);
export const monumentMaterials=stoneMaterials.filter(x=>x.uses.includes('monument'));
