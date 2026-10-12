"use strict";
const search = document.getElementById("search");
if (search) {
  const entries = Array.from(document.querySelectorAll("[data-entry]"));
  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const entry of entries) {
      const show = (entry.dataset.search || "").toLocaleLowerCase().includes(query);
      entry.hidden = !show;
      if (show) count++;
    }
    document.getElementById("search-status").textContent = query ? `找到 ${count} 篇文章` : "";
  });
}
const dialog = document.getElementById("lightbox");
if (dialog && typeof dialog.showModal === "function") {
  const items = Array.from(document.querySelectorAll("[data-gallery]"));
  let current = 0;
  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    const image = document.getElementById("lightbox-image");
    image.src = item.dataset.src;
    image.alt = item.dataset.caption;
    document.getElementById("lightbox-caption").textContent = `${item.dataset.caption} · ${current+1} / ${items.length}`;
  }
  items.forEach((item,index) => item.addEventListener("click",() => {show(index);dialog.showModal();}));
  dialog.querySelector(".lightbox-close").addEventListener("click",()=>dialog.close());
  dialog.querySelector(".lightbox-prev").addEventListener("click",()=>show(current-1));
  dialog.querySelector(".lightbox-next").addEventListener("click",()=>show(current+1));
  dialog.addEventListener("keydown",e => {if(e.key==="ArrowLeft"){e.preventDefault();show(current-1);}if(e.key==="ArrowRight"){e.preventDefault();show(current+1);}});
  dialog.addEventListener("click",e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
} else if (dialog) {
  document.querySelectorAll("[data-gallery]").forEach(item=>item.addEventListener("click",()=>window.open(item.dataset.src,"_blank","noopener")));
}
// 苍月草：浅紫白色的发光花瓣，点击后散开飘落。
(() => {
  if(window.__moonPetalsInstalled)return;
  window.__moonPetalsInstalled=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ns='http://www.w3.org/2000/svg';
  let active=0;
  document.addEventListener('click',event=>{
    if(reduced.matches||event.detail===0||active>=240)return;
    const count=Math.min(18,240-active);
    for(let i=0;i<count;i++){
      const flight=document.createElement('span');
      flight.className='moon-petal-flight';flight.setAttribute('aria-hidden','true');
      const size=8+Math.random()*13;
      const angle=Math.PI*2*i/count+Math.random()*.4;
      const distance=35+Math.random()*105;
      const dx=Math.cos(angle)*distance;
      const dy=Math.sin(angle)*distance;
      const duration=1500+Math.random()*800;
      Object.assign(flight.style,{left:event.clientX+'px',top:event.clientY+'px',width:size+'px',height:size*1.7+'px'});
      const vars={'--duration':duration+'ms','--dx':dx+'px','--dy':dy+'px','--end-x':dx+18+Math.random()*35+'px','--end-y':dy+90+Math.random()*60+'px','--start':Math.random()*360+'deg','--middle':Math.random()*180-90+'deg','--spin':Math.random()*360-180+'deg'};
      for(const [key,value] of Object.entries(vars))flight.style.setProperty(key,value);
      const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 40 64');svg.classList.add('moon-petal');
      const path=document.createElementNS(ns,'path');
      // A slightly asymmetric tapered petal, close to the floating shapes in the reference.
      path.setAttribute('d','M20 61 C13 47 2 29 7 15 C10 6 23 2 30 9 C41 20 29 43 20 61Z');
      path.setAttribute('fill',i%3===0?'#e9dbff':'#f4eaff');
      svg.append(path);flight.append(svg);document.body.append(flight);active++;
      setTimeout(()=>{flight.remove();active--;},duration+100);
    }
  });
})();

// 浅紫柔光花瓣持续飘落，离开标签页时暂停。
(() => {
 if(window.__ambientMoonPetalsInstalled)return;
 window.__ambientMoonPetalsInstalled=true;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const ns='http://www.w3.org/2000/svg';
 const layer=document.createElement('div');layer.className='ambient-moon-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const particles=new Set();let nextTimer=null;
 const allowed=()=>!document.hidden&&!reduced.matches;
 function spawn(progress=0){
  if(!allowed()||particles.size>=(window.innerWidth<760?10:16))return;
  const el=document.createElement('span');el.className='ambient-moon-flight';
  const size=8+Math.random()*11;const duration=10000+Math.random()*6000;
  Object.assign(el.style,{left:Math.random()*100+'%',width:size+'px',height:size*1.7+'px',animationDelay:-(duration*progress)+'ms'});
  const vars={'--fall-duration':duration+'ms','--drift':Math.random()*150-75+'px','--sway':Math.random()*70-35+'px','--rotate-start':Math.random()*360+'deg','--rotate-end':Math.random()*360-180+'deg','--petal-opacity':.35+Math.random()*.3};
  for(const [k,v] of Object.entries(vars))el.style.setProperty(k,v);
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 40 64');svg.classList.add('ambient-moon-petal');
  const path=document.createElementNS(ns,'path');path.setAttribute('d','M20 61 C13 47 2 29 7 15 C10 6 23 2 30 9 C41 20 29 43 20 61Z');path.setAttribute('fill',Math.random()<.5?'#e5d5fa':'#f0e5ff');svg.append(path);el.append(svg);layer.append(el);
  const record={el,timer:null};particles.add(record);
  record.timer=setTimeout(()=>{el.remove();particles.delete(record);},duration*(1-progress)+100);
 }
 function tick(){nextTimer=null;if(!allowed())return;spawn();nextTimer=setTimeout(tick,1100+Math.random()*600);}
 function stop(){if(nextTimer!==null){clearTimeout(nextTimer);nextTimer=null;}for(const p of particles){clearTimeout(p.timer);p.el.remove();}particles.clear();}
 function restart(){stop();if(!allowed())return;for(let i=0;i<5;i++)spawn(.1+Math.random()*.7);tick();}
 document.addEventListener('visibilitychange',restart);
 reduced.addEventListener('change',restart);
 window.addEventListener('pagehide',stop);
 window.addEventListener('pageshow',restart);
 restart();
})();
