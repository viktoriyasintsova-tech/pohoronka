(async()=>{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const settle=async()=>{await new Promise(requestAnimationFrame);await pause(150)};
 const expect=(ok,msg)=>{if(!ok)throw Error(msg)};
 await settle();await settle();
 const page=new URLSearchParams(location.search).get('page'),item=new URLSearchParams(location.search).get('item');
 if(page==='home'){
  const cards=[...document.querySelectorAll('.bento-card')];expect(cards.length===6,'Six bento sections');
  expect(!document.querySelector('.featured-card,.featured-catalog'),'No monument product list on home');
  expect(document.querySelector('#builder'),'Constructor retained on home');
  expect(cards.every(card=>card.querySelector('img')&&card.querySelector('h3')),'Bento images and section names');
  document.querySelector('#services').scrollIntoView({behavior:'instant'});
 }else if(page==='product'){
  const heading=document.querySelector('.product-heading'),visual=document.querySelector('.product-visual'),config=document.querySelector('.product-config');
  expect(heading.compareDocumentPosition(visual)&Node.DOCUMENT_POSITION_FOLLOWING,'Heading precedes picture');
  expect(config.firstElementChild.classList.contains('material-swatches'),'Materials immediately after visual');
  const sample=config.querySelector('input[value="'+(item==='paving-selection'?'g664':'tan-brown')+'"]')||config.querySelector('input[value="ermis-k12"]')||config.querySelectorAll('input[type=radio]')[1]||config.querySelector('input[type=radio]');sample.click();await settle();
  expect(sample.checked,'Visual material selection');
  if(item==='paving-selection'){
   expect(document.querySelector('.product-selection-caption').textContent.includes('18'),'Peach thickness 18 mm');
   const gallery=document.querySelector('.paving-gallery');gallery.querySelectorAll('button')[1].click();await pause(600);expect(gallery.querySelectorAll('button')[1].getAttribute('aria-pressed')==='true','Second gallery view');
   document.querySelector('input[value="concrete-brown"]').click();await settle();
   expect(document.querySelector('select[aria-label="Форма плитки"]'),'Concrete form selector');
  }else expect(document.querySelector('.product-order a').href.includes('material='+sample.value),'Material passed to builder');
  window.scrollTo({top:scrollY+config.getBoundingClientRect().top-visual.getBoundingClientRect().height-12,behavior:'instant'});await settle();
  if(innerWidth<701)expect(visual.getBoundingClientRect().top>=-1&&visual.getBoundingClientRect().top<20,'Object stays visible');
  const before=scrollY;sample.click();await settle();expect(Math.abs(scrollY-before)<4,'No scroll jump on selection');
  if(item!=='paving-selection'){
   const canvas=visual.querySelector('canvas');const beforeMarble=canvas.toDataURL();
   for(const id of ['marble-gray','marble-cream']){
    const input=config.querySelector('input[value="'+id+'"]');expect(input,'Restored '+id);input.click();await settle();
    for(let i=0;i<60&&canvas.getAttribute('aria-busy')==='true';i++)await pause(100);
    expect(canvas.getAttribute('aria-busy')==='false'&&!visual.querySelector('[role=alert]'),'Marble preview loaded');
    expect(input.checked&&document.querySelector('.product-order a').href.includes('material='+id),'Marble passed to constructor');
   }
   expect(canvas.toDataURL()!==beforeMarble,'Restored marble changes the rendered object');
  }
 }else if(page==='builder'){
  const preview=document.querySelector('#constructor-preview'),controls=document.querySelector('.drawing-controls');
  expect(preview&&controls,'Constructor workspace');
  const materialButtons=[...controls.querySelectorAll('.material-picker button')];expect(materialButtons.length>=4,'Native carved material choices');expect(materialButtons.some(b=>b.textContent.includes('Мрамор кремовый'))&&materialButtons.some(b=>b.textContent.includes('Мрамор серый')),'Both marbles restored in constructor');
  const black=materialButtons.find(b=>b.textContent.includes('Black Gabbro'));black.click();await pause(500);
  expect(preview.querySelector('canvas').getAttribute('aria-label').includes('Black Gabbro'),'Native material in constructor preview');
  expect(black.getAttribute('aria-pressed')==='true','Native material selected');
  localStorage.setItem('istok-project-v3',JSON.stringify({model:'user-form-26',variant:'user-form-26-custom',material:'marble-cream',quantity:1}));
  [...controls.querySelectorAll('button')].find(b=>b.textContent==='Восстановить').click();await pause(500);
  expect(document.querySelector('.modern-preview h3').textContent.includes('26'),'Old saved form restored to replacement');
  expect(preview.querySelector('canvas').getAttribute('aria-label').includes('Мрамор кремовый'),'Restored marble remains selected');
  expect(document.querySelector('.status').textContent==='Вариант восстановлен','Old project remains usable');
 }else if(page==='catalog'){
  const search=document.querySelector('input[aria-label="Поиск изделия"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(search,'Цефея');search.dispatchEvent(new Event('input',{bubbles:true}));await settle();
  const cards=[...document.querySelectorAll('.catalog-card')];expect(cards.length===1&&cards[0].querySelector('h3').textContent==='Цефея','Cephée appears once by familiar name');
  const filter=document.querySelector('select[aria-label="Материал"]');expect([...filter.options].some(o=>o.value==='Мрамор'),'Marble available in catalog filter');filter.value='Мрамор';filter.dispatchEvent(new Event('change',{bubbles:true}));await settle();
  expect(document.querySelectorAll('.catalog-card').length===1,'Cephée remains available in marble');
  const cream=cards[0].querySelector('input[value="marble-cream"]');expect(cream,'Cream marble on catalog card');cream.click();await settle();
  expect(cards[0].querySelector('.card-bottom a').href.includes('material=marble-cream'),'Cream selection passed from catalog');
 }else{
  const cards=[...document.querySelectorAll('.catalog-card')];expect(cards.length===1,'One paving family card');
  const card=cards[0],sample=card.querySelector('input[value="g664"]');sample.click();await settle();
  expect(card.querySelector('.card-sizes').textContent.includes('18'),'Size matches selected material');
  expect(card.querySelector('.card-bottom a').href.includes('material=g664'),'Material in product URL');
  expect(card.querySelector('.card-bottom').textContent.includes('По запросу'),'Inquiry price');
  card.querySelector('input[value="pearl"]').click();await settle();
  const gallery=card.querySelector('.paving-gallery');gallery.querySelectorAll('button')[1].click();await pause(600);
  expect(gallery.querySelectorAll('.paving-gallery-slide')[1].querySelector('svg.paving-preview'),'Pearl second view is actual tile geometry, not duplicate sample');
  card.scrollIntoView({behavior:'instant'});
 }
 await settle();expect(document.documentElement.scrollWidth<=innerWidth+1,'No horizontal page overflow');
 const report=document.createElement('output');report.id='qa-result';report.textContent='PASS: '+page+' '+(item||'')+'; compact layout, visual choices, correct selection and viewport fit';document.body.append(report);document.title='PASS';
})().catch(e=>{document.title='FAIL';console.error(e);const p=document.createElement('pre');p.textContent=e.message;document.body.append(p)});
