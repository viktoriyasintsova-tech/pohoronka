import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import Icon from './Icon';
import {siteConfig} from './config';
const ContactContext=createContext(null);
export const defaultContactMessage='Здравствуйте! Хочу обсудить памятник или благоустройство места захоронения.';
export function messengerLinks(message=defaultContactMessage){
 const phone=(siteConfig.messengers?.whatsappPhone||siteConfig.phone).replace(/\D/g,'');
 const whatsapp=new URL(`https://wa.me/${phone}`);whatsapp.searchParams.set('text',message);
 const telegram=new URL(siteConfig.messengers?.telegramUrl||`https://t.me/${siteConfig.phone}`);telegram.searchParams.set('text',message);
 return {call:`tel:${siteConfig.phone}`,whatsapp:whatsapp.href,telegram:telegram.href,max:siteConfig.messengers?.maxUrl||null};
}
export function ContactButton({children,message=defaultContactMessage,className='',...props}){
 const open=useContext(ContactContext);
 return <button type="button" {...props} className={`${className} contact-trigger`} aria-haspopup="dialog" onClick={()=>open({message})}>{children}</button>;
}
export function ContactProvider({children}){
 const [request,setRequest]=useState(null);
 return <ContactContext.Provider value={setRequest}>{children}{request&&<ContactDialog message={request.message} onClose={()=>setRequest(null)}/>}</ContactContext.Provider>;
}
function ContactDialog({message,onClose}){
 const ref=useRef(null);const [status,setStatus]=useState(''),[maxHelp,setMaxHelp]=useState(false);
 const links=messengerLinks(message),hasDetails=message!==defaultContactMessage;
 useEffect(()=>{const dialog=ref.current;const trigger=document.activeElement;dialog.showModal();const saved=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{if(dialog.open)dialog.close();document.body.style.overflow=saved;if(trigger?.isConnected)trigger.focus({preventScroll:true})}},[]);
 async function copy(text,success){try{await navigator.clipboard.writeText(text);setStatus(success)}catch{setStatus('Не удалось скопировать автоматически. Выделите текст ниже и скопируйте его.')}}
 const methods=[{label:'WhatsApp',hint:'Открыть чат',icon:'comment',href:links.whatsapp},{label:'Telegram',hint:'Открыть чат',icon:'paper-plane',href:links.telegram}];
 return <dialog ref={ref} className="dialog contact-dialog" aria-labelledby="contact-choice-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="dialog-content"><button className="icon-button dialog-close" type="button" aria-label="Закрыть выбор способа связи" onClick={onClose}><Icon name="cross"/></button><p className="eyebrow">МЫ НА СВЯЗИ</p><h2 id="contact-choice-title">Как вам удобнее?</h2><p className="contact-choice-intro">Выберите мессенджер или позвоните напрямую. Ответим на вопросы и обсудим ваш вариант.</p><div className="contact-methods"><a className="contact-method" href={links.call}><span className="method-icon"><Icon name="phone-call" size={24}/></span><span><strong>Позвонить</strong><small>{siteConfig.phoneLabel}</small></span><Icon name="arrow-right" size={20}/></a>{methods.map(m=><a className="contact-method" href={m.href} target="_blank" rel="noopener noreferrer" key={m.label}><span className="method-icon"><Icon name={m.icon} size={24}/></span><span><strong>{m.label}</strong><small>{m.hint}</small></span><Icon name="arrow-right" size={20}/></a>)}{links.max?<a className="contact-method" href={links.max} target="_blank" rel="noopener noreferrer"><span className="method-icon"><Icon name="comment" size={24}/></span><span><strong>MAX</strong><small>Открыть чат</small></span><Icon name="arrow-right" size={20}/></a>:<button type="button" className="contact-method" onClick={()=>{setMaxHelp(!maxHelp);setStatus('')}} aria-expanded={maxHelp}><span className="method-icon"><Icon name="comment" size={24}/></span><span><strong>MAX</strong><small>Найти по номеру телефона</small></span><Icon name="arrow-right" size={20}/></button>}</div>{maxHelp&&!links.max&&<div className="max-contact-help"><p>Найдите нас в MAX по номеру <strong>{siteConfig.phoneLabel}</strong>.</p><div className="contact-secondary-actions"><button type="button" onClick={()=>copy(siteConfig.phone,'Номер скопирован')}><Icon name="copy" size={16}/> Скопировать номер</button><a href="https://web.max.ru/" target="_blank" rel="noopener noreferrer">Открыть MAX <Icon name="arrow-right" size={16}/></a></div></div>}{hasDetails&&<details className="contact-message"><summary>Параметры для расчёта</summary><pre>{message}</pre><button type="button" onClick={()=>copy(message,'Параметры скопированы')}><Icon name="copy" size={16}/> Скопировать параметры</button></details>}<p className="contact-hours">На связи {siteConfig.hours}</p><p className="contact-feedback" role="status">{status}</p></div></dialog>
}
