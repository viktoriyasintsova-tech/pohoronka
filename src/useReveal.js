import {useEffect} from 'react';
export default function useReveal(dependencies=[],enabled=true){
 useEffect(()=>{
  if(!enabled)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches||!('IntersectionObserver' in window))return;
  const nodes=[...document.querySelectorAll('.section-heading, .services-grid>a, .catalog-card, .triplex-layout>div, .gallery-grid>button, .contact-layout>div, .contact-details>div')];
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}})},{threshold:0.08,rootMargin:'0px 0px -12px 0px'});
  nodes.forEach((node,index)=>{if(node.getBoundingClientRect().top>window.innerHeight){node.style.setProperty('--reveal-delay',`${index%3*60}ms`);node.classList.add('reveal-pending');observer.observe(node)}});
  const finish=()=>{if(preference.matches){observer.disconnect();nodes.forEach(node=>node.classList.remove('reveal-pending','is-revealed'))}};
  preference.addEventListener('change',finish);
  return()=>{observer.disconnect();preference.removeEventListener('change',finish);nodes.forEach(node=>{node.classList.remove('reveal-pending','is-revealed');node.style.removeProperty('--reveal-delay')})};
 },[...dependencies,enabled]);
}
