(async()=>{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const settle=async()=>{await new Promise(requestAnimationFrame);await pause(150)};
 const expect=(ok,msg)=>{if(!ok)throw Error(msg)};
 await settle();await settle();
 const page=new URLSearchParams(location.search).get('page'),item=new URLSearchParams(location.search).get('item');
 if(page==='home'){
  const cards=[...document.querySelectorAll('.featured-card')];expect(cards.length===6,'Six featured forms');
  expect(!document.querySelector('.featured-catalog input,.featured-catalog select'),'No home configuration fields');
  if(innerWidth<701)expect(Math.abs(cards[0].getBoundingClientRect().top-cards[1].getBoundingClientRect().top)<2,'Two forms per mobile row');
  document.querySelector('.featured-catalog').scrollIntoView({behavior:'instant'});
 }else if(page==='product'){
  const heading=document.querySelector('.product-heading'),visual=document.querySelector('.product-visual'),config=document.querySelector('.product-config');
  expect(heading.compareDocumentPosition(visual)&Node.DOCUMENT_POSITION_FOLLOWING,'Heading precedes picture');
  expect(config.firstElementChild.classList.contains('material-swatches'),'Materials immediately after visual');
  const sample=document.querySelector('input[value="'+(item==='paving-selection'?'g664':'tan-brown')+'"]');sample.click();await settle();
  expect(sample.checked,'Visual material selection');
  if(item==='paving-selection'){
   expect(document.querySelector('.product-selection-caption').textContent.includes('18'),'Peach thickness 18 mm');
   const gallery=document.querySelector('.paving-gallery');gallery.querySelectorAll('button')[1].click();await pause(600);expect(gallery.querySelectorAll('button')[1].getAttribute('aria-pressed')==='true','Second gallery view');
   document.querySelector('input[value="concrete-brown"]').click();await settle();
   expect(document.querySelector('select[aria-label="Форма плитки"]'),'Concrete form selector');
  }else expect(document.querySelector('.product-order a').href.includes('material=tan-brown'),'Material passed to builder');
  window.scrollTo({top:scrollY+config.getBoundingClientRect().top-visual.getBoundingClientRect().height-12,behavior:'instant'});await settle();
  if(innerWidth<701)expect(visual.getBoundingClientRect().top>=-1&&visual.getBoundingClientRect().top<20,'Object stays visible');
  const before=scrollY;sample.click();await settle();expect(Math.abs(scrollY-before)<4,'No scroll jump on selection');
 }else{
  const cards=[...document.querySelectorAll('.catalog-card')];expect(cards.length===1,'One paving family card');
  const card=cards[0],sample=card.querySelector('input[value="g664"]');sample.click();await settle();
  expect(card.querySelector('.card-sizes').textContent.includes('18'),'Size matches selected material');
  expect(card.querySelector('.card-bottom a').href.includes('material=g664'),'Material in product URL');
  expect(card.querySelector('.card-bottom').textContent.includes('По запросу'),'Inquiry price');
  card.scrollIntoView({behavior:'instant'});
 }
 await settle();expect(document.documentElement.scrollWidth<=innerWidth+1,'No horizontal page overflow');
 const report=document.createElement('output');report.id='qa-result';report.textContent='PASS: '+page+' '+(item||'')+'; compact layout, visual choices, correct selection and viewport fit';document.body.append(report);document.title='PASS';
})().catch(e=>{document.title='FAIL';console.error(e);const p=document.createElement('pre');p.textContent=e.message;document.body.append(p)});
