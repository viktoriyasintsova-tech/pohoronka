import React,{useEffect,useRef} from 'react';
export const productCategories={all:'Все изделия',monuments:'Памятники',memorials:'Мемориальные комплексы',slabs:'Надгробные плиты',vases:'Вазы',crosses:'Кресты',paving:'Плитка и покрытие',fences:'Оградки',furniture:'Скамейки и столики'};
export const categoryLink=category=>category==='all'?'?page=catalog':category==='monuments'?'?page=catalog&category=monuments':`?page=${category}`;
export function CategoryNav({category}){
 const ref=useRef(null);
 useEffect(()=>{const nav=ref.current,active=nav?.querySelector('[aria-current=page]');if(nav&&active&&nav.scrollWidth>nav.clientWidth)nav.scrollLeft=active.offsetLeft-nav.offsetLeft-nav.clientWidth/2+active.clientWidth/2},[category]);
 return <nav ref={ref} className="catalog-categories" aria-label="Категории каталога">{Object.entries(productCategories).map(([key,label])=><a key={key} href={categoryLink(key)} aria-current={key===category?'page':undefined}>{label}</a>)}</nav>
}
