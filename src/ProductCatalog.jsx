import React from 'react';
export const productCategories={all:'Все изделия',monuments:'Памятники',memorials:'Мемориальные комплексы',slabs:'Надгробные плиты',vases:'Вазы',crosses:'Кресты',paving:'Плитка и покрытие',fences:'Оградки',furniture:'Скамейки и столики'};
export const categoryLink=category=>category==='all'?'?page=catalog':category==='monuments'?'?page=catalog&category=monuments':`?page=${category}`;
export function CategoryNav({category}){
 return <nav className="catalog-categories" aria-label="Категории каталога">{Object.entries(productCategories).map(([key,label])=><a key={key} href={categoryLink(key)} aria-current={key===category?'page':undefined}>{label}</a>)}</nav>
}
