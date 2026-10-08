/* A single expanded role, semantic row buttons, shared motion timing. */
(() => {
 const rows=[...document.querySelectorAll('[data-position-row]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motions=new WeakMap();
 function setExpanded(row,expanded){
  const panel=document.getElementById(row.getAttribute('aria-controls'));
  motions.get(panel)?.cancel();
  row.setAttribute('aria-expanded',String(expanded));
  panel.inert=!expanded;
  row.querySelector('.position-icon').textContent=expanded?'×':'↗';
  panel.style.gridTemplateRows=expanded?'1fr':'0fr';
  if(!reduced.matches){
   const content=panel.firstElementChild;
   const animation=content.animate(expanded?[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}]:[{opacity:1},{opacity:0}],{duration:expanded?550:350,easing:'cubic-bezier(.16,1,.3,1)'});
   motions.set(panel,animation);
  }
 }
 rows.forEach(row=>row.addEventListener('click',()=>{
  const expand=row.getAttribute('aria-expanded')!=='true';
  rows.forEach(other=>{if(other!==row&&other.getAttribute('aria-expanded')==='true')setExpanded(other,false)});
  setExpanded(row,expand);
 }));
})();
