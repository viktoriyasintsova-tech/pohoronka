import React from 'react';
import data from './forged-catalog.json';
import Icon from './Icon';
import {ContactButton} from './ContactOptions';
export const forgedProducts=data.items;
export const productCategories={all:'Все изделия',monuments:'Памятники',fences:'Оградки',furniture:'Скамейки и столики',crosses:'Кресты',vases:'Вазы'};
export const categoryLink=category=>category==='all'?'?page=catalog':category==='monuments'?'?page=catalog&category=monuments':`?page=${category}`;
const asset=path=>import.meta.env.BASE_URL+path;
export function CategoryNav({category}){
 return <nav className="catalog-categories" aria-label="Категории каталога">{Object.entries(productCategories).map(([key,label])=><a key={key} href={categoryLink(key)} aria-current={key===category?'page':undefined}>{label}</a>)}</nav>
}
export function ForgedCard({item}){
 const href=`?page=product&item=${item.id}`;
 return <article className="catalog-card forged-card"><a className="card-image" href={href}><img src={asset(item.image)} alt={item.name} width="640" height="640" loading="lazy"/></a><div className="card-copy"><p className="eyebrow">{productCategories[item.category]}</p><h3><a href={href}>{item.name}</a></h3><p className="card-sizes">{item.specs[0].label}: {item.specs[0].value}</p><div className="card-bottom"><strong>По запросу</strong><a className="icon-button" href={href} aria-label={`Подробнее: ${item.name}`}><Icon name="arrow-right"/></a></div></div></article>
}
export function ProductPage({item}){
 if(!item)return <section className="section container"><h1>Изделие не найдено</h1><p className="product-intro">Вернитесь в каталог и выберите нужную модель.</p><a className="text-link" href="?page=catalog">В каталог <Icon name="arrow-right"/></a></section>;
 const message=`Здравствуйте! Хочу обсудить расчёт: ${item.name}.\n${item.specs.map(s=>`${s.label}: ${s.value}`).join('\n')}\nПрошу уточнить стоимость, доставку и установку.`;
 const related=forgedProducts.filter(x=>x.category===item.category&&x.id!==item.id).slice(0,3);
 return <><section className="section container product-page"><nav className="breadcrumbs" aria-label="Хлебные крошки"><a href="?page=catalog">Каталог</a><span aria-hidden="true">/</span><a href={categoryLink(item.category)}>{productCategories[item.category]}</a></nav><div className="product-detail"><div className="forged-photo"><img src={asset(item.image)} alt={item.name} width="640" height="640"/>{item.imageNote&&<p className="image-caption">{item.imageNote}</p>}</div><div><p className="eyebrow">{productCategories[item.category]}</p><h1>{item.name}</h1><p className="product-intro">Кованое изделие для обустройства места захоронения. Подберём комплектацию и согласуем установку.</p><dl className="product-specs">{item.specs.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl><strong className="detail-price">Стоимость по запросу</strong><p className="muted">Рассчитаем стоимость с учётом комплектации, доставки и установки. Характеристики указаны по предоставленному каталогу.</p><ContactButton className="button button-dark" message={message}>Обсудить расчёт <Icon name="arrow-right"/></ContactButton></div></div></section>{related.length>0&&<section className="section container related-products"><div className="section-heading"><h2>В этой категории</h2><a href={categoryLink(item.category)} className="text-link">Все изделия <Icon name="arrow-right" size={16}/></a></div><div className="catalog-grid">{related.map(x=><ForgedCard key={x.id} item={x}/>)}</div></section>}</>
}
