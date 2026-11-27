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
 }else if(page==='builder'){
  const preview=document.querySelector('#constructor-preview'),controls=document.querySelector('.drawing-controls');
  expect(preview&&controls,'Constructor workspace');
  const materialButtons=[...controls.querySelectorAll('.material-picker button')];expect(materialButtons.length===4,'Native carved material choices');
  const black=materialButtons.find(b=>b.textContent.includes('Black Gabbro'));black.click();await pause(500);
  expect(preview.querySelector('canvas').getAttribute('aria-label').includes('Black Gabbro'),'Native material in constructor preview');
  expect(black.getAttribute('aria-pressed')==='true','Native material selected');
  localStorage.setItem('istok-project-v3',JSON.stringify({model:'user-form-26',variant:'user-form-26-custom',material:'tan-brown',quantity:1}));
  [...controls.querySelectorAll('button')].find(b=>b.textContent==='Восстановить').click();await pause(500);
  expect(document.querySelector('.modern-preview h3').textContent.includes('26'),'Old saved form restored to replacement');
  expect(document.querySelector('.status').textContent==='Вариант восстановлен','Old project remains usable');
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
