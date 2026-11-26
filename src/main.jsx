import React,{useEffect,useRef,useState} from 'react';
import ReactDOM from 'react-dom/client';
import catalog from './current-catalog.json';
import MonumentConstructor from './MonumentConstructor';
import TriplexInfo from './TriplexInfo';
import {ContactButton,ContactProvider} from './ContactOptions';
import useReveal from './useReveal';
import UnifiedCatalog,{UnifiedProductPage} from './UnifiedCatalog';
import {allProducts} from './catalog-data';
import Materials from './MaterialsPage';
import {productCategories} from './ProductCatalog';
import Icon from './Icon';
import {siteConfig as company} from './config';
import '@flaticon/flaticon-uicons/css/regular/rounded.css';
import './style.css';
const asset=path=>import.meta.env.BASE_URL+path;
const price=value=>value==null?'По запросу':`от ${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const home=(hash='')=>`${import.meta.env.BASE_URL}${hash}`;
function Dialog({title,children,onClose,className=''}){
 const ref=useRef(null);
 useEffect(()=>{ref.current.showModal();const dialog=ref.current;return()=>{if(dialog.open)dialog.close()}},[]);
 return <dialog ref={ref} className={`dialog ${className}`} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="dialog-content"><button type="button" className="icon-button dialog-close" onClick={onClose} aria-label="Закрыть"><Icon name="cross"/></button><h2>{title}</h2>{children}</div></dialog>
}
function App(){
 const page=new URLSearchParams(location.search).get('page')||'home';
 const [mobile,setMobile]=useState(false),[photo,setPhoto]=useState(null);
 const categoryPages=['fences','furniture','crosses','vases','memorials','slabs','paving'];
 const isCatalog=page==='catalog'||categoryPages.includes(page),isBuilder=page==='builder',isProduct=page==='product',isMaterials=page==='materials',isHome=!isCatalog&&!isBuilder&&!isProduct&&!isMaterials;
 const requestedCategory=new URLSearchParams(location.search).get('category')||'all';
 const category=categoryPages.includes(page)?page:(Object.hasOwn(productCategories,requestedCategory)?requestedCategory:'all');
 const product=allProducts.find(x=>x.id===new URLSearchParams(location.search).get('item'));
 useReveal([page],!isCatalog&&!isProduct&&!isMaterials);
 const featured=catalog;
 useEffect(()=>{document.title=`${isMaterials?'Материалы и оттенки':isProduct?(product?.name||'Изделие'):isCatalog?(category==='all'?'Каталог изделий':productCategories[category]):isBuilder?'Конструктор памятника':'Памятники и благоустройство'} — ИСТОК`},[isCatalog,isBuilder,isProduct,isMaterials,category,product]);
 useEffect(()=>{if(photo===null)return;function key(e){if(e.key==='ArrowRight')setPhoto(p=>(p+1)%8);if(e.key==='ArrowLeft')setPhoto(p=>(p+7)%8)}document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[photo]);
 return <><a className="skip-link" href="#main">К содержимому</a><header className="site-header"><div className="header-inner"><a className="brand" href={home()} aria-label="ИСТОК — главная"><img src={asset('assets/istok_white.png')} alt="ИСТОК — памятники и благоустройство" width="190" height="64"/></a><nav className={mobile?'navigation open':'navigation'} aria-label="Основная навигация"><a href="?page=catalog&category=monuments" aria-current={isCatalog&&category==='monuments'?'page':undefined}>Памятники</a><a href="?page=fences" aria-current={category==='fences'&&isCatalog?'page':undefined}>Оградки</a><a href="?page=furniture" aria-current={category==='furniture'&&isCatalog?'page':undefined}>Скамейки и столики</a><a href={home('#services')}>Благоустройство</a><a href="?page=materials" aria-current={isMaterials?'page':undefined}>Материалы</a><a href={home('#works')}>Наши работы</a><a href={home('#contact')}>Контакты</a></nav><a className="button button-dark header-cta" href="?page=builder">Конструктор памятника <Icon name="arrow-right" size={16}/></a><button className="icon-button mobile-toggle" onClick={()=>setMobile(!mobile)} aria-expanded={mobile} aria-label={mobile?'Закрыть меню':'Открыть меню'}><Icon name={mobile?'cross':'menu-burger'} size={24}/></button></div></header><main id="main">
 {isHome&&<><section className="hero" style={{backgroundImage:`linear-gradient(90deg,rgba(19,18,16,.68),rgba(19,18,16,.16)),url('${asset('assets/hero-background.png')}')`}}><div className="container"><div className="hero-copy"><p className="eyebrow">РЕСПУБЛИКА АЛТАЙ · КУЗБАСС</p><h1>Памятники<br/>и благоустройство</h1><p>Памятники на заказ и бережное благоустройство мест захоронения. Поможем выбрать форму и материал, согласуем каждую деталь.</p><a className="button button-light" href="?page=builder">Создать свой вариант <Icon name="arrow-right"/></a></div></div></section><section id="services" className="section container"><div className="section-heading"><div><p className="eyebrow">ОТ ВЫБОРА ДО УСТАНОВКИ</p><h2>Услуги и изделия</h2></div><p className="section-intro">Продумываем место памяти целиком: от памятника и ограждения до покрытия и деталей участка.</p></div><div className="services-grid">{['Памятники на заказ','Оградки, лавочки и кресты','Благоустройство участка','Гранитная тротуарная плитка','Керамогранит','Доставка и установка'].map((x,i)=><a key={x} href={i===0?'?page=catalog&category=monuments':i===1?'?page=fences':i===3?'?page=paving':'#contact'}><span className="service-number">0{i+1}</span><h3>{x}</h3><Icon name="arrow-right"/></a>)}</div></section></>}
 {isCatalog&&<UnifiedCatalog category={category}/>}
 {isMaterials&&<Materials/>}
 {isHome&&<section className="section container featured-catalog" id="catalog"><div className="section-heading"><div><p className="eyebrow">КАТАЛОГ ПАМЯТНИКОВ</p><h2>Разные формы — единый подход</h2><p className="muted">От спокойной классики до выразительных силуэтов. В каталоге — модели, материалы и варианты размеров.</p></div><a className="text-link" href="?page=catalog&category=monuments">Весь каталог <Icon name="arrow-right" size={16}/></a></div><div className="catalog-grid">{featured.map(item=><article className="featured-card" key={item.id}><a className="featured-image" href={`?page=product&item=${item.id}`} aria-label={`Подробнее: ${item.name}`}><img src={asset(item.image)} alt={item.name} width="640" height="640" loading="lazy"/></a><h3>{item.audience==='family'?'Семейный':'Одинарный'} · {({straight:'прямой',shaped:'фигурный',milled:'с фрезеровкой'})[item.form]}</h3><a className="featured-details" href={`?page=product&item=${item.id}`}>Подробнее<span className="sr-only">: {item.name}</span></a></article>)}</div><p className="image-caption">Иллюстрации форм. Размеры, материал и комплектация согласовываются по выбранной модели.</p></section>}
 {(isHome||isCatalog&&(category==='all'||category==='monuments'))&&<TriplexInfo/>}
 {isProduct&&<UnifiedProductPage item={product}/>}
 {(isHome||isBuilder)&&<MonumentConstructor/>}
 {isHome&&<section className="section gallery-section" id="works"><div className="container"><div className="section-heading"><div><p className="eyebrow">ФОТОГРАФИИ ВЫПОЛНЕННЫХ РАБОТ</p><h2>Места памяти,<br/>созданные с вниманием</h2></div><p className="section-intro">Памятники, ограждения и благоустройство. Реальные фотографии наших работ.</p></div><div className="gallery-grid">{Array.from({length:8},(_,i)=><button onClick={()=>setPhoto(i)} key={i} aria-label={`Открыть фотографию работы ${i+1}`}><img src={asset(`assets/gallery/work-${String(i+1).padStart(2,'0')}.jpg`)} alt={`Выполненная работа: памятник и благоустроенный участок, фото ${i+1}`} width="700" height="525" loading="lazy"/><span>Работа {String(i+1).padStart(2,'0')} <Icon name="expand" size={16}/></span></button>)}</div></div></section>}
 <section className="contact-section section" id="contact"><div className="container contact-layout"><div><p className="eyebrow">ДАВАЙТЕ ОБСУДИМ ВАШУ ЗАДАЧУ</p><h2>Поможем с выбором.<br/>Ответим на вопросы.</h2><p className="contact-intro">Позвоните или приезжайте к нам. Обсудим форму памятника, материалы и необходимые работы.</p><ContactButton className="button button-light"><Icon name="phone-call" size={20}/>{company.phoneLabel}</ContactButton></div><dl className="contact-details"><div><dt><Icon name="marker" size={20}/>Адрес</dt><dd>{company.address}</dd></div><div><dt><Icon name="clock" size={20}/>Время работы</dt><dd>{company.hours}</dd></div><div><dt><Icon name="map-marker" size={20}/>География работ</dt><dd>Республика Алтай: Турочакский и Чойский районы.<br/>Кузбасс: Таштагольский район.</dd></div><div><dt><Icon name="phone-call" size={20}/>Телефон</dt><dd><ContactButton className="contact-number">{company.phoneLabel}</ContactButton></dd></div></dl></div></section></main><footer><div className="container footer-inner"><a className="footer-brand" href={home()}>ИСТОК<span>Памятники и благоустройство</span></a><p>© {new Date().getFullYear()} · {company.address}</p><a href="#main">Наверх <Icon name="angle-small-up" size={16}/></a></div></footer>
 {photo!==null&&<Dialog className="gallery-dialog" title={`Наши работы · ${photo+1} из 8`} onClose={()=>setPhoto(null)}><img className="gallery-full" src={asset(`assets/gallery/work-${String(photo+1).padStart(2,'0')}.jpg`)} alt={`Фотография выполненной работы ${photo+1}`}/><div className="gallery-controls"><button className="icon-button" onClick={()=>setPhoto((photo+7)%8)} aria-label="Предыдущая фотография"><Icon name="arrow-left"/></button><span>{photo+1} / 8</span><button className="icon-button" onClick={()=>setPhoto((photo+1)%8)} aria-label="Следующая фотография"><Icon name="arrow-right"/></button></div></Dialog>}
 </>
}
ReactDOM.createRoot(document.getElementById('root')).render(<ContactProvider><App/></ContactProvider>);
