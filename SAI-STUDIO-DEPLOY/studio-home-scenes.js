/* Lightweight HOME observation studies: conceptual, never live measurements. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),mobile=matchMedia('(max-width:700px)');
 const modes={observe:['OBSERVE / POINTS','거리, 시선과 움직임을 있는 그대로 관찰합니다.'],detect:['A-FIELD / DETECTED','사람 사이의 미세한 어색함을 흐름으로 감지합니다.'],analyze:['ANALYZE / CONNECTIONS','행동 신호와 공간의 맥락을 연결합니다.'],intervene:['INTERVENE / ALIGNED','공간의 변화를 설계하고 다시 검증합니다.']};
 let decodeTimer=0;
 function decode(element,value){clearInterval(decodeTimer);if(reduced.matches){element.textContent=value;return}const started=performance.now();decodeTimer=setInterval(()=>{const progress=Math.min(1,(performance.now()-started)/380);element.textContent=[...value].map((char,i)=>char===' '||i<value.length*progress?char:'·').join('');if(progress===1)clearInterval(decodeTimer)},40)}
 document.querySelectorAll('[data-home-field]').forEach(canvas=>{
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let width=1,height=1,visible=false,frame=0,lastFrame=0,mode=canvas.dataset.homeField,mouse={x:.7,y:.5},target={x:.7,y:.5},strength=0,lastMove=0;
 const stage=canvas.parentElement;
 function draw(now){ctx.clearRect(0,0,width,height);const t=now*.00012,ambient=mode==='ambient',n=mobile.matches?12:22;
 ctx.lineWidth=.65;ctx.strokeStyle='rgba(178,212,158,.17)';ctx.fillStyle='rgba(178,212,158,.42)';
 if(mode==='observe'||mode==='analyze'){
  const points=Array.from({length:8},(_,i)=>({x:width*(.17+(i%4)*.22+Math.sin(t+i)*.012),y:height*(.28+Math.floor(i/4)*.21+Math.cos(t+i)*.014)}));
  if(mode==='analyze'){ctx.beginPath();points.forEach((p,i)=>{if(i){ctx.moveTo(points[i-1].x,points[i-1].y);ctx.lineTo(p.x,p.y)}});ctx.stroke();ctx.font='10px Helvetica, Arial';ctx.fillStyle='rgba(178,212,158,.42)';ctx.fillText('DISTANCE / RELATIONAL SIGNAL',width*.17,height*.61)}
  points.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,1.7,0,Math.PI*2);ctx.fill();if(mode==='observe'){const size=11;ctx.beginPath();ctx.moveTo(p.x-size,p.y);ctx.lineTo(p.x-6,p.y);ctx.moveTo(p.x+6,p.y);ctx.lineTo(p.x+size,p.y);ctx.stroke()}});
 }else{
  for(let i=0;i<n;i++){
   ctx.beginPath();for(let j=0;j<=36;j++){
    const x=width*j/36,base=height*(ambient?.28:.28)+i*height*(ambient?.019:.011),envelope=Math.sin(Math.PI*j/36);
    const dx=x/width-mouse.x,dy=base/height-mouse.y,local=Math.exp(-(dx*dx*18+dy*dy*12));
    const wave=Math.sin(j*.24+t+i*.17)*height*(mode==='intervene'?.008:.027)*envelope;
    const distortion=ambient?local*strength*Math.sin(i*.19+t)*height*.035:0;
    const concentration=mode==='detect'?Math.sin(j/36*Math.PI)*Math.sin(i*.15+t)*height*.018:0;
    const y=base+wave+distortion+concentration;j?ctx.lineTo(x,y):ctx.moveTo(x,y);
   }
   ctx.strokeStyle=`rgba(178,212,158,${ambient?.07+(i%4)*.022:mode==='detect'?.12+(i%4)*.03:.07+(i%4)*.015})`;ctx.stroke();
  }
  const count=mobile.matches?16:28;for(let i=0;i<count;i++){const x=((i*.137+t*.023)%1)*width,y=height*(.31+Math.sin(i*1.7+t)*.14);ctx.beginPath();ctx.arc(x,y,.7,0,Math.PI*2);ctx.fillStyle='rgba(178,212,158,.28)';ctx.fill()}
  if(mode==='detect'){ctx.strokeStyle='rgba(178,212,158,.3)';ctx.beginPath();ctx.ellipse(width*.52,height*.37,width*.17,height*.13,0,0,Math.PI*2);ctx.stroke()}
 }
 }
 function tick(now){frame=0;if(!visible||document.hidden||reduced.matches)return;if(now-lastFrame>(mobile.matches?32:14)){mouse.x+=(target.x-mouse.x)*.06;mouse.y+=(target.y-mouse.y)*.06;if(now-lastMove>120)strength*=.94;draw(now);lastFrame=now}frame=requestAnimationFrame(tick)}
 function start(){if(reduced.matches){draw(0);return}if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
 function pause(){cancelAnimationFrame(frame);frame=0}
 new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio,mobile.matches?1:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(0)}).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;canvas.dataset.visible=String(visible);visible?start():pause()},{threshold:.01}).observe(canvas);
 document.addEventListener('visibilitychange',()=>document.hidden?pause():start());reduced.addEventListener('change',()=>{pause();start()});
 if(mode==='ambient'){stage.addEventListener('pointermove',e=>{if(!fine.matches||mobile.matches||reduced.matches)return;const r=stage.getBoundingClientRect();target={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};strength=1;lastMove=performance.now();canvas.dataset.reacting='true'});stage.addEventListener('pointerleave',()=>{lastMove=0;canvas.dataset.reacting='false'})}
 else{
  const buttons=[...document.querySelectorAll('[data-home-mode]')];function activate(button){mode=button.dataset.homeMode;canvas.dataset.homeField=mode;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));decode(document.querySelector('[data-home-mode-label]'),modes[mode][0]);document.querySelector('[data-home-mode-note]').textContent=modes[mode][1];if(reduced.matches)draw(0)}
  buttons.forEach(button=>{button.addEventListener('pointerenter',()=>{if(fine.matches&&!mobile.matches)activate(button)});button.addEventListener('focus',()=>activate(button));button.addEventListener('click',()=>activate(button))});
 }
 });
})();
