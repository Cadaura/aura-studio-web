(() => {
 'use strict';
 const menu=document.querySelector('#menuToggle'),side=document.querySelector('.side');
 const mobile=matchMedia('(max-width:850px)');
 const syncMenu=()=>{const open=document.body.classList.contains('menu-open');side.inert=mobile.matches&&!open;menu.setAttribute('aria-expanded',String(open));};
 menu.onclick=()=>{document.body.classList.toggle('menu-open');syncMenu();};
 mobile.addEventListener('change',syncMenu);syncMenu();
 side.addEventListener('click',event=>{if(event.target.closest('[data-admin-page]')){document.body.classList.remove('menu-open');syncMenu();window.scrollTo({top:0});}});
 document.querySelector('#authEmail').value='bextiyar@proton.me';
 document.querySelector('.auth-note').textContent='Yalnız Aura sahibi üçün. Masaüstü Aura Admin hesabınızın mövcud parolu ilə daxil olun. İdarəetmə internet bağlantısı tələb edir.';
 document.querySelector('.auth-brand h1').textContent='İdarəetmə hər yerdə sizinlə.';
 const observer=new MutationObserver(()=>{
  document.querySelectorAll('.admin-table').forEach(table=>{
   const headings=[...table.querySelectorAll('thead th')].map(el=>el.textContent);
   table.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>{if(cell.colSpan===1)cell.dataset.label=headings[i]||'';}));
  });
 });observer.observe(document.querySelector('#adminBody'),{childList:true,subtree:true});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){document.body.classList.remove('menu-open');syncMenu();}
  if(event.key!=='Tab')return;
  const dialog=[...document.querySelectorAll('.auth-dialog:not([hidden])')].at(-1);
  if(!dialog)return;
  const focusable=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);if(!first)return;
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
})();
