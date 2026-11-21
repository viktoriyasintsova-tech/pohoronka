import React, {useState} from 'react';
import prices from './price-list.json';
import {siteConfig} from './config';
import Icon from './Icon';
const colors=[{name:'Чёрный',hex:'#292827'},{name:'Серый',hex:'#858481'},{name:'Коричневый',hex:'#675447'},{name:'Красный',hex:'#794541'}];
const formOf=name=>name.includes('зеркально')?'Волна зеркальная':/волна/i.test(name)?'Волна':/АРКА 3/i.test(name)?'Арка 3':/АРКА 4/i.test(name)?'Арка 4':/АРКА 7/i.test(name)?'Арка 7':/АРКА/i.test(name)?'Арка из пяти деталей':'Прямая';
const forms=[...new Set(prices.map(x=>formOf(x.name)))];
const paths={
 'Прямая':'M80 45H220V270H80Z',
 'Волна':'M80 70C125 35 175 90 220 45V270H80Z',
 'Волна зеркальная':'M80 45C125 90 175 35 220 70V270H80Z',
 'Арка 3':'M60 270V130Q60 30 150 30Q240 30 240 130V270H210V130Q210 65 150 65Q90 65 90 130V270Z M105 125Q150 85 195 125V270H105Z',
 'Арка 4':'M60 270V115L150 30L240 115V270H210V130L150 70L90 130V270Z M105 145L150 105L195 145V270H105Z',
 'Арка 7':'M60 270V90Q150 15 240 90V270H215V110Q150 55 85 110V270Z M105 135Q150 100 195 135V270H105Z',
 'Арка из пяти деталей':'M50 270V80H80V270Z M220 270V80H250V270Z M50 80Q150 -5 250 80L235 100Q150 35 65 100Z M100 135Q150 100 200 135V270H100Z'
};
const rub=value=>'от '+new Intl.NumberFormat('ru-RU').format(value)+' ₽';
export default function MonumentConstructor({requestedCode}){
 const [form,setForm]=useState('Прямая'),[color,setColor]=useState(colors[0]),[code,setCode]=useState(''),[bundle,setBundle]=useState(false),[notice,setNotice]=useState('');
 const models=prices.filter(x=>formOf(x.name)===form);
 const requested=prices.find(x=>x.code===requestedCode);
 const [previousRequest,setPreviousRequest]=useState(requestedCode);
 if(requestedCode!==previousRequest){setPreviousRequest(requestedCode);if(requested){setForm(formOf(requested.name));setCode(requested.code)}}
 const selected=models.find(x=>x.code===code)||models[0];
 const amount=bundle?selected?.set:selected?.price;
 const summary=`Форма: ${form}\nЦвет: ${color.name}\nРазмер: ${selected?.h} × ${selected?.w} × ${selected?.t} мм\nАртикул: ${selected?.code}\nКомплектация: ${bundle?'Комплект по прайсу':'Стела'}\nСтоимость: ${amount?rub(amount):'По запросу'}`;
 function restore(){try{const v=JSON.parse(localStorage.getItem('istok-drawing'));if(!v||!forms.includes(v.form)||!colors.some(c=>c.name===v.color))throw Error();setForm(v.form);setColor(colors.find(c=>c.name===v.color));setCode(v.code||'');setBundle(Boolean(v.bundle));setNotice('Сохранённый вариант восстановлен')}catch{setNotice('Сохранённого варианта пока нет')}}
 return <section className="drawing-constructor" id="builder"><div className="constructor-heading"><p className="eyebrow">ПОДБЕРИТЕ ВАШ ВАРИАНТ</p><h2>Конструктор памятника</h2><p>Выберите форму, цвет и размер. Рисунок покажет выбранный вариант.</p></div><div className="drawing-layout"><div className="drawing-preview"><svg viewBox="0 0 300 350" role="img" aria-label={`${form}, ${color.name.toLowerCase()} цвет`}><g fill={color.hex} stroke="#352B26" strokeWidth="1.3"><path d={paths[form]}/><rect x="60" y="275" width="180" height="24"/>{bundle&&<path d="M65 308H235V333H65Z M76 314V327H224V314Z" fillRule="evenodd"/>}</g><path d="M35 340H265" stroke="#bfbab3"/></svg><small>Схематичный рисунок. Точная форма и оттенок согласовываются при заказе.</small></div><div className="drawing-controls"><fieldset><legend>Форма памятника</legend><div className="drawing-forms">{forms.map(f=><button key={f} className={form===f?'chosen':''} aria-pressed={form===f} onClick={()=>{setForm(f);setCode('')}}><svg viewBox="0 0 300 310" aria-hidden="true"><path d={paths[f]} fill="#352b26"/><rect x="60" y="275" width="180" height="24" fill="#352b26"/></svg><span>{f}</span></button>)}</div></fieldset><fieldset><legend>Цвет памятника</legend><div className="drawing-colors">{colors.map(c=><button key={c.name} className={color.name===c.name?'chosen':''} aria-pressed={color.name===c.name} onClick={()=>setColor(c)}><span style={{backgroundColor:c.hex}}/>{c.name}</button>)}</div></fieldset><label>Размеры, мм<select value={selected?.code||''} onChange={e=>setCode(e.target.value)}>{models.map((x,i)=><option key={`${x.code}-${i}`} value={x.code}>{x.h} × {x.w} × {x.t} · {rub(x.price)} · {x.code}</option>)}</select></label><label className="check"><input type="checkbox" checked={bundle} onChange={e=>setBundle(e.target.checked)}/> Комплект по прайсу</label><div className="drawing-price"><span>Предварительная стоимость</span><strong>{amount?rub(amount):'По запросу'}</strong></div><p className="drawing-note">Цена указана для выбранной позиции прайса. Цвет служит для подбора внешнего вида. Материал, оформление, доставка и установка рассчитываются отдельно.</p><div className="drawing-actions"><button onClick={()=>{localStorage.setItem('istok-drawing',JSON.stringify({form,color:color.name,code:selected?.code,bundle}));setNotice('Вариант сохранён')}}>Сохранить вариант</button><button onClick={restore}>Восстановить</button><button onClick={async()=>{try{await navigator.clipboard.writeText(summary);setNotice('Конфигурация скопирована')}catch{setNotice('Копирование недоступно — параметры указаны выше')}}}>Скопировать</button><a className="pill dark" href={`tel:${siteConfig.phone}`}>Обсудить расчёт <Icon name="phone-call" size={20}/></a></div><p role="status">{notice}</p></div></div></section>
}
