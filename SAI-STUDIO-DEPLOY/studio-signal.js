(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const layer=document.createElement('div');layer.className='signal-layer';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="signal-grain"></div><div class="signal-scan"></div><div class="signal-tracking"></div><div class="signal-frame"></div>';
let timer=0,lastEvent=-10000,lastField=0,anomalies=0,started=performance.now();
const cleanup=new Set(),messages=['SOURCE UNKNOWN','SIGNAL UNSTABLE','RECORD MISMATCH'];
function activeRoot(){return document.querySelector('dialog[open]')||document.body}
function sync(){const root=activeRoot();if(layer.parentElement!==root)root.append(layer);layer.classList.toggle('is-clean',root.matches('.device-immersive')&&!root.querySelector('[data-view=cctv]'));layer.classList.toggle('is-observation',root.matches('.case-dialog')||!!root.querySelector('[data-view=cctv]'));}
function later(fn,ms){const id=setTimeout(()=>{cleanup.delete(id);fn()},ms);cleanup.add(id);return id}
function visible(el){if(!el||!el.getClientRects().length)return false;const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&!el.closest('dialog:not([open])');}
function pulse(target,kind='text'){if(reduced.matches||document.hidden||performance.now()-lastEvent<6000)return false;sync();if(layer.classList.contains('is-clean')&&kind!=='lens')return false;lastEvent=performance.now();
if(kind==='frame'||kind==='lens'){layer.classList.add('is-frame');later(()=>layer.classList.remove('is-frame'),240)}
if(visible(target)){const copy=document.createElement('span');copy.setAttribute('aria-hidden','true');copy.className='signal-artifact-copy'+(kind==='slice'?' is-slice':'');copy.textContent=target.textContent;copy.style.inset='0';target.classList.add('signal-artifact-host');target.append(copy);later(()=>{copy.remove();target.classList.remove('signal-artifact-host')},220)}return true;}
function field(level,target){if(level<.7||performance.now()-lastField<24000)return;lastField=performance.now();if(Math.random()<(level>.88?.35:.16))pulse(target,level>.88?'slice':'text')}
function anomaly(){if(anomalies>=2||performance.now()-started<45000||Math.random()>.18)return;const target=[...activeRoot().querySelectorAll('.observation-meta,.home-coordinate,.home-hero-meta,.device-cctv-top,.home-visual-foot')].find(visible);if(!target)return;anomalies++;const copy=document.createElement('span');copy.className='signal-anomaly';copy.setAttribute('aria-hidden','true');copy.textContent=messages[(anomalies-1)%messages.length];target.classList.add('signal-artifact-host');target.append(copy);later(()=>{copy.remove();target.classList.remove('signal-artifact-host')},200)}
function schedule(){clearTimeout(timer);if(document.hidden||reduced.matches)return;timer=setTimeout(()=>{sync();if(!layer.classList.contains('is-clean')&&performance.now()-lastEvent>6000){lastEvent=performance.now();layer.classList.add('is-tracking');later(()=>layer.classList.remove('is-tracking'),1900);anomaly()}schedule()},19000+Math.random()*10000)}
// Event-driven layer relocation allows decorative noise to follow native top-layer dialogs.
new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','data-view']});
document.addEventListener('visibilitychange',()=>{layer.hidden=document.hidden;if(document.hidden){clearTimeout(timer);for(const id of cleanup)clearTimeout(id);cleanup.clear();layer.classList.remove('is-tracking','is-frame');document.querySelectorAll('.signal-artifact-copy,.signal-anomaly').forEach(el=>el.remove())}else{sync();schedule()}});
reduced.addEventListener('change',()=>{layer.classList.remove('is-tracking','is-frame');schedule()});
document.addEventListener('click',e=>{if(e.target.closest('[data-home-mode=detect]'))later(()=>pulse(document.querySelector('[data-home-mode-label]'),'text'),400)});
window.SAISignal={pulse,field};sync();schedule();
})();
