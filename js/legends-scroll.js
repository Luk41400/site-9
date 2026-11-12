/* Lendas: sticky + rolagem vertical nativa. Não há listeners de wheel/touch.
 * Este módulo usa o agendador único de app.js; ResizeObserver apenas invalida medidas.
 * Ajustes principais: fator de inércia 0.10 e breakpoint de 768 × 680 px.
 */
'use strict';
window.createLegendsScroll = ({section, motion, requestFrame}) => {
  const sticky=section.querySelector('.lendas-sticky');
  const content=section.querySelector('.lendas-content');
  const viewport=section.querySelector('.legends-viewport');
  const track=section.querySelector('.legends-track');
  const cards=[...track.querySelectorAll('.legend-card')];
  const previous=section.querySelector('[data-dir="-1"]');
  const next=section.querySelector('[data-dir="1"]');
  const progressBar=section.querySelector('.legends-progress span');
  const hint=section.querySelector('#legends-hint');
  const count=section.querySelector('#legends-count');
  const instructions=section.querySelector('#legends-instructions');
  const desktop=matchMedia('(min-width: 768px) and (min-height: 680px)');
  const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
  const smoothstep=(min,max,value)=>{const p=clamp((value-min)/(max-min));return p*p*(3-2*p);};
  let pinned=false,dirty=true,distance=0,width=0,displayed=0,real=0,lastTime=0,active=-1;
  let metrics=[],entered=false;

  function invalidate(){dirty=true;requestFrame();}
  function measure(){
    dirty=false;
    const oldPinned=pinned,oldDistance=distance;
    const before=section.getBoundingClientRect();
    const inside=oldPinned?before.top<=1&&before.bottom>=innerHeight-1:before.top<=1&&before.bottom>0;
    const oldProgress=oldPinned?(oldDistance?clamp(-before.top/oldDistance):0):(oldDistance?track.scrollLeft/oldDistance:0);
    pinned=desktop.matches&&!motion.matches&&CSS.supports('position','sticky');
    section.classList.toggle('is-pinned',pinned);
    width=viewport.clientWidth;
    distance=Math.max(0,track.scrollWidth-width);
    if(!distance){pinned=false;section.classList.remove('is-pinned');}
    // A seção só permanece presa durante o percurso horizontal exato.
    section.style.height=pinned?`${innerHeight+distance}px`:'';
    if(pinned){track.scrollLeft=0;viewport.scrollLeft=0;}
    else track.style.transform='none';
    metrics=cards.map(card=>({left:card.offsetLeft,width:card.offsetWidth,center:card.offsetLeft+card.offsetWidth/2}));
    if(inside&&(oldPinned!==pinned||Math.abs(oldDistance-distance)>1)){
      const start=section.getBoundingClientRect().top+window.scrollY;
      // Preservar a posição relativa quando a janela ou a preferência de movimento muda.
      window.scrollTo({top:pinned?start+oldProgress*distance:start,behavior:'instant'});
      if(!pinned)track.scrollLeft=oldProgress*distance;
      displayed=oldProgress;
    }
    instructions.textContent=pinned
      ?'Role a página para conhecer as lendas. Nos cards, use as setas esquerda e direita, Home ou End. Tab percorre os jogadores e segue para a próxima seção.'
      :'Deslize a faixa horizontalmente ou use os botões. Nos cards, use as setas esquerda e direita, Home ou End. Tab percorre os jogadores.';
    section.classList.add('legends-ready');
  }

  function setButtonState(button,disabled){
    if(button.disabled!==disabled)button.disabled=disabled;
  }
  function update(now){
    if(dirty)measure();
    const bounds=section.getBoundingClientRect();
    real=distance?(pinned?clamp(-bounds.top/distance):clamp(track.scrollLeft/distance)):0;
    const dt=lastTime?Math.min(now-lastTime,64):16.67;
    lastTime=now;
    if(pinned){
      // Normalizar a inércia para monitores de 60/120 Hz. Nas bordas, convergir ao ponto exato.
      const alpha=1-Math.pow(1-.10,dt/16.67);
      displayed+=(real-displayed)*alpha;
      const edge=Math.max(1-smoothstep(0,.08,real),smoothstep(.92,1,real));
      displayed+=(real-displayed)*edge;
      if(Math.abs(real-displayed)<.00002)displayed=real;
      track.style.transform=`translate3d(${-displayed*distance}px,0,0)`;
    }else displayed=real;

    const x=displayed*distance;
    const visible=bounds.top<innerHeight&&bounds.bottom>0;
    if(visible){
      const distances=metrics.map(card=>Math.abs(card.center-x-width/2));
      const weights=distances.map(value=>Math.pow(clamp(1-value/(width*.68)),2));
      const max=Math.max(...weights,.001);
      const nearest=distances.indexOf(Math.min(...distances));
      cards.forEach((card,index)=>{
        const focus=motion.matches?1:clamp(weights[index]/max);
        const relative=clamp((metrics[index].center-x-width/2)/(width/2),-1,1);
        card.style.setProperty('--card-scale',(motion.matches?1:.94+.06*focus).toFixed(4));
        card.style.setProperty('--card-opacity',(motion.matches?1:.6+.4*focus).toFixed(4));
        card.style.setProperty('--color-opacity',focus.toFixed(4));
        // A foto percorre -8% a +8%, em sentido contrário à passagem do card.
        card.style.setProperty('--photo-x',motion.matches?'0%':`${(-relative*8).toFixed(3)}%`);
        card.style.setProperty('--shine-opacity',(focus*.48).toFixed(4));
        card.classList.toggle('is-current',index===nearest);
      });
      active=nearest;
      const label=`${String(Math.round(real*(cards.length-1))+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      if(count.textContent!==label)count.textContent=label;
    }
    progressBar.style.transform=`scaleX(${real})`;
    setButtonState(previous,!distance||real<.0005);
    setButtonState(next,!distance||real>.9995);
    const finished=real>.995;
    const text=finished?'CONTINUE ROLANDO':pinned?'ROLE PARA CONHECER MAIS LENDAS':'DESLIZE PARA CONHECER MAIS LENDAS';
    if(hint.textContent!==text)hint.textContent=text;
    const exit=pinned?smoothstep(.96,1,real):0;
    content.style.setProperty('--exit-opacity',1-exit*.15);
    content.style.setProperty('--exit-y',`${-exit*8}px`);
    sticky.style.setProperty('--tone-opacity',real*.17);
    // Sem loop ocioso: somente a inércia pendente solicita outro quadro.
    return pinned&&Math.abs(real-displayed)>.00002;
  }

  function targetFor(index){return clamp(metrics[index].center-width/2,0,distance);}
  function goToCard(index,{focus=false,instant=false}={}){
    if(dirty)measure();
    index=clamp(index,0,cards.length-1);
    const target=targetFor(index),behavior=instant||motion.matches?'instant':'smooth';
    if(pinned){
      const start=section.getBoundingClientRect().top+window.scrollY;
      window.scrollTo({top:start+target,behavior});
      if(instant)displayed=distance?target/distance:0;
    }else track.scrollTo({left:target,behavior});
    if(focus)cards[index].focus({preventScroll:true});
    requestFrame();
  }

  function step(direction){
    if(dirty)measure();
    const x=(pinned?real:distance?track.scrollLeft/distance:0)*distance;
    // Apenas alvos além da posição atual: as extremidades não produzem cliques vazios.
    const targets=metrics.map((card,index)=>({index,target:targetFor(index)}));
    const destination=direction>0?targets.find(item=>item.target>x+1):targets.reverse().find(item=>item.target<x-1);
    if(destination)goToCard(destination.index);
  }
  previous.addEventListener('click',()=>step(-1));
  next.addEventListener('click',()=>step(1));
  track.addEventListener('scroll',requestFrame,{passive:true});
  track.addEventListener('keydown',event=>{
    const card=event.target.closest('.legend-card');
    let index=card?cards.indexOf(card):Math.max(active,0);
    if(event.key==='ArrowRight'||event.key==='ArrowLeft')index+=event.key==='ArrowRight'?1:-1;
    else if(event.key==='Home')index=0;
    else if(event.key==='End')index=cards.length-1;
    else return; // Page Down, Espaço e Tab continuam com seu comportamento nativo.
    event.preventDefault();
    goToCard(index,{focus:true,instant:true});
  });
  track.addEventListener('focusin',event=>{
    const card=event.target.closest('.legend-card');
    if(!card||!pinned)return;
    const index=cards.indexOf(card),item=metrics[index];
    // O foco em um descendente fora da faixa pode rolar o viewport oculto; zerar só esse offset.
    viewport.scrollLeft=0;track.scrollLeft=0;
    const local=item.left-displayed*distance;
    const bounds=section.getBoundingClientRect();
    if(local<-.5||local+item.width>width+.5||bounds.top>0||bounds.bottom<innerHeight)goToCard(index,{instant:true});
  });

  if('ResizeObserver' in window){
    const resize=new ResizeObserver(invalidate);
    resize.observe(viewport);resize.observe(track);resize.observe(section.querySelector('.legend-heading'));
  }
  // Todas as fotos têm dimensões declaradas; load cobre também futuras substituições de imagens.
  track.querySelectorAll('img').forEach(image=>image.addEventListener('load',invalidate,{once:true}));
  document.fonts?.ready.then(invalidate);
  desktop.addEventListener('change',invalidate);
  function enter(){if(!entered){entered=true;section.classList.add('legends-entered');}}
  if('IntersectionObserver' in window){
    const entrance=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){enter();entrance.disconnect();}},{threshold:.12});
    entrance.observe(sticky);
  }else enter();
  invalidate();
  return {update,invalidate};
};
