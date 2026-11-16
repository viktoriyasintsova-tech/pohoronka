import React from "react";
import ReactDOM from "react-dom/client";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import "./style.css";

const projects = [
  { title: "Дом в тишине", place: "Загородный дом · 2025", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85" },
  { title: "Тёплый минимализм", place: "Квартира · Москва", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85" },
  { title: "Тактильный свет", place: "Апартаменты · 2024", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=85" },
];

function App() {
  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top">FORMA<span> / INTERIORS</span></a>
      <nav aria-label="Основная навигация"><a href="#projects">Проекты</a><a href="#studio">Студия</a><a href="#journal">Журнал</a><a href="#contact">Контакт</a></nav>
      <a className="menu-contact" href="mailto:hello@forma.studio">Обсудить проект <ArrowUpRight size={15}/></a>
    </header>
    <section className="hero" id="top">
      <img className="hero-image" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90" alt="Спокойная гостиная с натуральными фактурами" />
      <div className="hero-shade" />
      <div className="hero-kicker"><span>ИНТЕРЬЕРНАЯ СТУДИЯ · МОСКВА</span><span>01 — 04</span></div>
      <div className="hero-copy"><p className="eyebrow">ПРОСТРАНСТВА С ХАРАКТЕРОМ</p><h1>Дом начинается<br/>с ощущения.</h1><a href="#projects" className="round-link" aria-label="Смотреть проекты"><ArrowDownRight size={21}/></a></div>
      <div className="hero-caption"><span>01 / Частный интерьер</span><span>Свет. Материал. Тишина.</span></div>
    </section>
    <section className="intro" id="studio"><p className="section-label">01 — ФИЛОСОФИЯ</p><h2>Создаём интерьеры,<br/>в которых хочется<br/><em>остаться.</em></h2><div className="intro-text"><p>Проектируем частные пространства, в которых архитектура, предметы и свет складываются в естественное целое. Внимательно слушаем, точно работаем с деталями и оставляем место для жизни.</p><a className="text-link" href="#contact">Познакомиться со студией <ArrowUpRight size={15}/></a></div></section>
    <section className="projects" id="projects"><div className="section-heading"><div><p className="section-label">02 — ИЗБРАННОЕ</p><h2>Недавние проекты</h2></div><div className="arrows"><button aria-label="Предыдущие проекты"><ArrowLeft size={18}/></button><button aria-label="Следующие проекты"><ArrowRight size={18}/></button></div></div><div className="project-grid">{projects.map((p, i)=><article className={`project project-${i+1}`} key={p.title}><a href="#contact"><img src={p.image} alt={p.title}/><div className="project-meta"><div><h3>{p.title}</h3><p>{p.place}</p></div><ArrowUpRight size={18}/></div></a></article>)}</div></section>
    <section className="note" id="journal"><p className="section-label">03 — ПОДХОД</p><p>Хороший интерьер не стремится впечатлить.<br/>Он <em>точно чувствует</em> человека, который в нём живёт.</p><span>Фрагмент нашего подхода к проектированию</span></section>
    <footer id="contact"><div><p className="section-label">04 — СЛЕДУЮЩИЙ ШАГ</p><h2>Расскажите<br/>о своём доме.</h2></div><a className="contact-link" href="mailto:hello@forma.studio">Начать разговор <ArrowUpRight size={18}/></a><div className="footer-bottom"><a className="wordmark" href="#top">FORMA<span> / INTERIORS</span></a><span>МОСКВА · РАБОТАЕМ ПО ВСЕЙ РОССИИ</span><span>© FORMA 2025</span></div></footer>
  </main>
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
