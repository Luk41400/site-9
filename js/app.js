/* Interações sem dependências. Dados e créditos vivem exclusivamente em data.js. */
(() => {
  'use strict';
  const D = window.BRASIL_DATA;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const photo = id => D.images.find(image => image.id === id);
  const photoHTML = (id, extraClass = '') => {
    const image = photo(id);
    if (!image) return '';
    return `<img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" class="${extraClass}">`;
  };
  const extLink = (url, text) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)}<span class="sr-only"> (abre em nova aba)</span></a>`;
  const number = value => Number(value).toLocaleString('pt-BR');

  // Tema persistido; falhas de armazenamento não interrompem a página.
  const themeButton = $('.theme-toggle');
  function updateThemeButton() {
    const light = document.documentElement.dataset.theme === 'light';
    themeButton.setAttribute('aria-label', `Ativar modo ${light ? 'escuro' : 'claro'}`);
    themeButton.setAttribute('title', `Ativar modo ${light ? 'escuro' : 'claro'}`);
    themeButton.innerHTML = `<span aria-hidden="true">${light ? '☾' : '☼'}</span>`;
    $('meta[name="theme-color"]').content = light ? '#f4f3eb' : '#081611';
  }
  themeButton.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('brasil-theme', theme); } catch (error) { /* Navegação privada: tema funciona sem persistência. */ }
    updateThemeButton();
  });
  updateThemeButton();

  const menuButton = $('.menu-toggle');
  function closeMenu() { $('#main-nav').classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menu'); }
  menuButton.addEventListener('click', () => {
    const open = $('#main-nav').classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#main-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!$('.site-header').contains(event.target)) closeMenu(); });

  $('#hero-stats').innerHTML = D.heroStats.map(stat => `<div class="stat"><strong data-count="${stat.value}" data-pad="${stat.pad || 0}">${String(stat.value).padStart(stat.pad || 0,'0')}</strong><span>${escape(stat.label)}</span></div>`).join('');

  // Linha do tempo: tabs com foco móvel e suporte a setas/Home/End.
  let filter = 'all';
  let selectedYear = 1970;
  const editions = () => D.editions.filter(edition => filter === 'all' || (filter === 'champion' ? edition.position === 1 : edition.position <= 2));
  function renderEdition() {
    const edition = D.editions.find(item => item.year === selectedYear);
    const image = photo(edition.image);
    $('#edition-detail').setAttribute('aria-labelledby', `tab-${edition.year}`);
    $('#edition-detail').innerHTML = `<div class="edition-visual">${photoHTML(edition.image)}<strong>${edition.year}</strong><span>${escape(image.caption)}</span></div><div class="edition-info"><p class="eyebrow">${escape(edition.host)} / COPA DO MUNDO</p><span class="result-badge">${edition.position === 1 ? '★ ' : ''}${escape(edition.result.toUpperCase())}</span><h3>${edition.year === 1970 ? 'UM TIME. SEIS VITÓRIAS. A ETERNIDADE.' : escape(edition.host.toUpperCase()) + ', ' + edition.year + '.'}</h3><p>${escape(edition.note)}</p><div class="edition-last"><strong>${escape(edition.lastMatch)}</strong><span>ÚLTIMO JOGO · ${escape(edition.lastStage)}</span></div>${edition.penalties ? `<p class="penalty-note">${escape(edition.penalties)}.</p>` : ''}${edition.decisiveMatch ? `<p class="penalty-note">Jogo que encerrou a chance de título: ${escape(edition.decisiveMatch)}.</p>` : ''}<div class="edition-record">${[['JOGOS',edition.played],['VITÓRIAS',edition.wins],['EMPATES',edition.draws],['DERROTAS',edition.losses],['GOLS',edition.gf]].map(([label,value])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div></div>`;
    $$('.year-tab').forEach(tab => { const selected = Number(tab.dataset.year) === selectedYear; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  }
  function selectYear(year, focus = false) {
    selectedYear = year;
    renderEdition();
    const selected = $(`#tab-${year}`);
    if (focus) selected.focus({preventScroll:true});
    // Rolar apenas o trilho, sem deslocar verticalmente a página.
    $('#year-rail').scrollTo({left:selected.offsetLeft - $('#year-rail').offsetLeft - 25,behavior:motion.matches?'instant':'smooth'});
  }
  function renderTimeline() {
    const list = editions();
    if (!list.some(edition => edition.year === selectedYear)) selectedYear = list[0].year;
    $('#year-rail').innerHTML = list.map(edition => `<button class="year-tab ${edition.position===1?'champion':''}" role="tab" id="tab-${edition.year}" data-year="${edition.year}" aria-controls="edition-detail" aria-selected="${edition.year===selectedYear}" tabindex="${edition.year===selectedYear?0:-1}"><strong>${edition.year}</strong><span class="tab-host">${escape(edition.host)}</span><span class="tab-result">${edition.position===1?'★ ':''}${escape(edition.result)}</span></button>`).join('');
    renderEdition();
  }
  function moveYear(direction) { const list=editions(); const index=list.findIndex(item=>item.year===selectedYear); selectYear(list[(index+direction+list.length)%list.length].year,true); }
  $('#year-rail').addEventListener('click', event => { const tab=event.target.closest('[data-year]'); if(tab) selectYear(Number(tab.dataset.year)); });
  $('#year-rail').addEventListener('keydown', event => {
    if (event.key==='ArrowRight'||event.key==='ArrowLeft') {event.preventDefault();moveYear(event.key==='ArrowRight'?1:-1);}
    if (event.key==='Home'||event.key==='End') {event.preventDefault();selectYear(editions()[event.key==='Home'?0:editions().length-1].year,true);}
  });
  $('#year-prev').addEventListener('click',()=>moveYear(-1));
  $('#year-next').addEventListener('click',()=>moveYear(1));
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.filter;
    $$('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    renderTimeline();selectYear(selectedYear);
  }));
  renderTimeline();
  $('#future-cup').innerHTML = `<strong>${D.future.year}</strong><div><h3>${escape(D.future.host)}</h3><p>${escape(D.future.result || D.future.text)}</p></div><span class="future-tag">${escape(D.future.status.toUpperCase())}</span>`;

  $('#title-cards').innerHTML = D.titles.map((title,index)=>`<article class="title-card reveal" style="--delay:${index%3*80}ms"><div class="title-image">${photoHTML(title.image)}<strong>${title.year}</strong><span aria-label="${index+1}º título">★</span></div><div class="title-body"><p class="eyebrow">${escape(title.imageLabel)}</p><h3>${escape(title.heading)}</h3><div class="final-score"><span>Brasil</span><strong>${escape(title.score)}</strong><span>${escape(title.opponent)}</span></div>${title.penalties?`<p class="penalty-note">Brasil venceu: ${escape(title.penalties)}.</p>`:''}<dl class="title-meta"><div><dt>Técnico</dt><dd>${escape(title.coach)}</dd></div><div><dt>Capitão</dt><dd>${escape(title.captain)}</dd></div></dl><p class="title-highlight">${escape(title.highlights)}</p></div></article>`).join('');
  $('#moment-cards').innerHTML = D.moments.map((moment,index)=>`<article class="moment-card reveal" style="--delay:${index*70}ms"><span class="moment-year">${moment.year}</span><span class="moment-label">${escape(moment.label)}</span><h3>${escape(moment.title)}</h3><p>${escape(moment.text)}</p></article>`).join('');
  $('#legends').innerHTML = D.legends.map((legend,index)=>`<article class="legend-card"><div class="legend-photo">${photoHTML(legend.image)}<span class="legend-index">${String(index+1).padStart(2,'0')} / LENDAS</span><span class="legend-position">${escape(legend.position)}</span></div><div class="legend-body"><h3>${escape(legend.name)}</h3><p class="legend-cups">EM CAMPO: ${legend.editions.join(' · ')}</p><p>${escape(legend.feat)}${legend.note?`<br><small>${escape(legend.note)}</small>`:''}</p></div></article>`).join('');
  $$('[data-carousel]').forEach(button=>button.addEventListener('click',()=>{
    const track=$('#'+button.dataset.carousel);track.scrollBy({left:Number(button.dataset.dir)*(track.clientWidth*.8),behavior:motion.matches?'instant':'smooth'});
  }));
  $('#legends').addEventListener('keydown',event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();event.currentTarget.scrollBy({left:event.key==='ArrowRight'?288:-288,behavior:motion.matches?'instant':'smooth'});}});

  // Gráficos CSS acessíveis: cada valor também está disponível em texto.
  function bars(items,label,value,max) {return items.map(item=>`<div class="bar-row"><span class="bar-label">${escape(item[label])}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="--value:${item[value]/max*100}%"></div></div><strong>${item[value]}</strong></div>`).join('');}
  $('#country-chart').innerHTML = bars(D.countryTitles,'country','titles',5);
  $('#scorer-chart').innerHTML = bars(D.scorers,'name','goals',15);
  $('#record-legend').innerHTML = [['Vitórias',D.totals.wins],['Empates',D.totals.draws],['Derrotas',D.totals.losses]].map(([label,value])=>`<div class="record-row"><span class="record-dot" aria-hidden="true"></span><span>${label}</span><strong>${value}</strong></div>`).join('');
  const percentage = (100*(D.totals.wins*3+D.totals.draws)/(D.totals.matches*3)).toLocaleString('pt-BR',{maximumFractionDigits:1,minimumFractionDigits:1});
  $('#performance-value').innerHTML = `${percentage}<span>%</span>`;
  $('.donut').setAttribute('aria-label',`Aproveitamento de ${percentage} por cento dos pontos possíveis. Vitórias: ${D.totals.wins}; empates: ${D.totals.draws}; derrotas: ${D.totals.losses}.`);
  $('.donut').style.background = `conic-gradient(var(--green) 0 ${D.totals.wins/D.totals.matches*100}%,var(--yellow) ${D.totals.wins/D.totals.matches*100}% ${(D.totals.wins+D.totals.draws)/D.totals.matches*100}%,var(--surface-2) 0 100%)`;
  $('#goals-chart').innerHTML = D.editions.map(edition=>`<div class="goal-column ${edition.position===1?'champion':''}"><button class="goal-bar" style="--height:${edition.gf/22*100}%" aria-label="${edition.year}: ${edition.gf} gols" title="${edition.year}: ${edition.gf} gols"><span class="goal-value">${edition.gf}</span></button><span class="goal-year" aria-hidden="true">${String(edition.year).slice(2)}</span></div>`).join('');
  // Remover role=img preserva os controles e valores para leitores de tela.
  $('#goals-chart').setAttribute('role','group');

  $('#gallery-grid').innerHTML = D.gallery.map((item,index)=>`<button class="gallery-item reveal" data-gallery="${index}" aria-label="Abrir imagem: ${escape(item.title)}">${photoHTML(item.image)}<span class="gallery-caption"><small>${escape(item.year)}</small><strong>${escape(item.title)}</strong></span><span class="gallery-zoom" aria-hidden="true">↗</span></button>`).join('');
  $('#divider-image').innerHTML = photoHTML('maracana');
  const lightbox = $('#lightbox');
  let currentImage=0, galleryTrigger=null;
  function showImage(index) {
    currentImage=(index+D.gallery.length)%D.gallery.length;
    const item=D.gallery[currentImage],image=photo(item.image);
    $('#lightbox-image').src=image.src;$('#lightbox-image').alt=image.alt;
    $('#lightbox-caption').innerHTML=`<strong>${escape(item.title)}</strong><br>${escape(image.caption)}<br><small>${currentImage+1} / ${D.gallery.length} · ${escape(image.author)} · ${extLink(image.licenseUrl,image.license)} · ${extLink(image.source,'Original no Wikimedia Commons')}</small>`;
  }
  $('#gallery-grid').addEventListener('click',event=>{
    const button=event.target.closest('[data-gallery]');if(!button)return;
    galleryTrigger=button;showImage(Number(button.dataset.gallery));lightbox.showModal();document.body.classList.add('modal-open');$('.lightbox-close').focus();
  });
  $('.lightbox-close').addEventListener('click',()=>lightbox.close());
  $('.lightbox-prev').addEventListener('click',()=>showImage(currentImage-1));
  $('.lightbox-next').addEventListener('click',()=>showImage(currentImage+1));
  lightbox.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showImage(currentImage+(event.key==='ArrowRight'?1:-1));}
    // Reforçar o ciclo do diálogo nativo ao alcançar os limites com Tab.
    if(event.key==='Tab'){
      const focusable=$$('button:not([disabled]),a[href]',lightbox),first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
  lightbox.addEventListener('close',()=>{document.body.classList.remove('modal-open');galleryTrigger?.focus({preventScroll:true});});

  // Quiz: somente uma resposta por pergunta; feedback, foco e reinício explícitos.
  let questionIndex=0,score=0,answered=false;
  function renderQuestion(focus=false) {
    answered=false;
    const question=D.quiz[questionIndex];
    $('#quiz-content').innerHTML=`<div class="quiz-meta"><span>PERGUNTA ${String(questionIndex+1).padStart(2,'0')} / ${String(D.quiz.length).padStart(2,'0')}</span><strong>${score} ${score===1?'ACERTO':'ACERTOS'}</strong></div><div class="quiz-progress" aria-hidden="true"><span style="--value:${questionIndex/D.quiz.length*100}%"></span></div><h3 tabindex="-1" id="question-heading">${escape(question.question)}</h3><div class="quiz-answers" role="group" aria-labelledby="question-heading">${question.options.map((option,index)=>`<button class="quiz-answer" data-answer="${index}"><span aria-hidden="true">${String.fromCharCode(65+index)}</span>${escape(option)}</button>`).join('')}</div><p class="answer-feedback" id="answer-feedback" role="status" tabindex="-1"></p><button class="button button-yellow quiz-next" hidden>${questionIndex===D.quiz.length-1?'Ver meu resultado':'Próxima pergunta'} <span aria-hidden="true">→</span></button>`;
    if(focus)$('#question-heading').focus({preventScroll:true});
  }
  function answer(index) {
    if(answered)return;answered=true;
    const question=D.quiz[questionIndex],correct=index===question.correct;
    if(correct)score++;
    $$('.quiz-answer').forEach((button,answerIndex)=>{button.disabled=true;if(answerIndex===question.correct)button.classList.add('correct');else if(answerIndex===index)button.classList.add('incorrect');});
    $('#answer-feedback').textContent=`${correct?'Gol! Você acertou.':'Quase! Resposta correta: '+question.options[question.correct]+'.'} ${question.explanation}`;
    $('.quiz-next').hidden=false;
    $('#answer-feedback').focus({preventScroll:true});
  }
  function renderResult() {
    const title=score===D.quiz.length?'Craque da memória!':score>=5?'A camisa tem história.':'A história sempre ensina.';
    $('#quiz-content').innerHTML=`<div class="quiz-result"><span class="five-stars" aria-hidden="true">★ ★ ★ ★ ★</span><strong class="score-number" aria-label="${score} acertos em ${D.quiz.length} perguntas"><span data-count="${score}">${score}</span><small> / ${D.quiz.length}</small></strong><h3 id="result-heading" tabindex="-1">${title}</h3><p>${score===D.quiz.length?'Atuação de campeão. Você conhece o caminho das cinco estrelas.':'Cada Copa tem uma história para descobrir. Explore a linha do tempo e entre em campo de novo.'}</p><button class="button button-yellow" id="quiz-restart">Jogar novamente <span aria-hidden="true">↻</span></button></div>`;
    $('#result-heading').focus({preventScroll:true});animateCounter($('[data-count]',$('#quiz-content')));
  }
  $('#quiz-content').addEventListener('click',event=>{
    const answerButton=event.target.closest('[data-answer]');if(answerButton)answer(Number(answerButton.dataset.answer));
    if(event.target.closest('.quiz-next')&&answered){questionIndex++;if(questionIndex<D.quiz.length)renderQuestion(true);else renderResult();}
    if(event.target.closest('#quiz-restart')){questionIndex=0;score=0;renderQuestion(true);}
  });
  renderQuestion();

  $('#sources-list').innerHTML=D.sources.map(source=>`<li>${extLink(source.url,source.label)}</li>`).join('')+`<li>Campanhas por edição: ${D.editions.map(edition=>extLink(edition.source,edition.year)).join(' · ')}.</li><li>${escape(D.methodology)}</li>`;
  $('#image-credits').innerHTML=D.images.map(image=>`<li><strong>${escape(image.id)}</strong> — ${escape(image.caption)} ${escape(image.author)}. ${extLink(image.licenseUrl,image.license)}. ${extLink(image.source,'Fonte original')}. ${escape(image.changes)}</li>`).join('');

  // Um único requestAnimationFrame por quadro de rolagem; parallax usa transform.
  let scrollPending=false;
  const heroMedia=$('.hero-image'),header=$('.site-header'),progress=$('.scroll-progress'),divider=$('.parallax-divider'),dividerMedia=$('.divider-image');
  function updateScroll(){
    const y=window.scrollY,total=document.documentElement.scrollHeight-innerHeight;
    header.classList.toggle('scrolled',y>50);
    progress.style.transform=`scaleX(${total>0?y/total:0})`;
    if(!motion.matches && y<innerHeight*1.4)heroMedia.style.transform=`translate3d(0,${Math.min(y*.16,150)}px,0)`;
    if(!motion.matches){const bounds=divider.getBoundingClientRect();if(bounds.top<innerHeight&&bounds.bottom>0)dividerMedia.style.transform=`translate3d(0,${(innerHeight/2-bounds.top-bounds.height/2)*.12}px,0)`;}
    scrollPending=false;
  }
  addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
  addEventListener('resize',updateScroll,{passive:true});
  motion.addEventListener('change',()=>{document.documentElement.classList.toggle('js-motion',!motion.matches);if(motion.matches){heroMedia.style.transform='none';dividerMedia.style.transform='none';}updateScroll();});
  updateScroll();

  function animateCounter(element){
    const target=Number(element.dataset.count),pad=Number(element.dataset.pad)||0;
    if(motion.matches){element.textContent=String(target).padStart(pad,'0');return;}
    const start=performance.now();
    function tick(now){const ratio=motion.matches?1:Math.min((now-start)/1200,1),value=Math.round(target*(1-Math.pow(1-ratio,3)));element.textContent=String(value).padStart(pad,'0');if(ratio<1)requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    if(!motion.matches)document.documentElement.classList.add('js-motion');
    const entrance=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');if(entry.target.classList.contains('illuminated-stars'))entry.target.classList.add('lit');if(entry.target.dataset.count)animateCounter(entry.target);entrance.unobserve(entry.target);}}),{threshold:.12});
    $$('.reveal,.illuminated-stars,.stat [data-count]').forEach(element=>entrance.observe(element));
    const activeSection=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('#main-nav a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-20% 0px -60% 0px',threshold:0});
    $$('main section[id]').forEach(section=>activeSection.observe(section));
  }else{$$('.reveal,.illuminated-stars').forEach(element=>element.classList.add('in-view','lit'));}
})();
