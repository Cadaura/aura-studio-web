(() => {
 'use strict';
 const menu=document.querySelector('#menuToggle'),side=document.querySelector('.side');
 menu.onclick=()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));};
 side.addEventListener('click',event=>{if(event.target.closest('[data-admin-page]')){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');window.scrollTo({top:0});}});
 document.querySelector('#authEmail').value='bextiyar@proton.me';
 document.querySelector('.auth-note').textContent='Yalnız Aura sahibi üçün. Masaüstü Aura Admin hesabınızın mövcud parolu ilə daxil olun. İdarəetmə internet bağlantısı tələb edir.';
 document.querySelector('.auth-brand h1').textContent='İdarəetmə hər yerdə sizinlə.';
 const observer=new MutationObserver(()=>{
  document.querySelectorAll('.admin-table').forEach(table=>{
   const headings=[...table.querySelectorAll('thead th')].map(el=>el.textContent);
   table.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>{if(cell.colSpan===1)cell.dataset.label=headings[i]||'';}));
  });
 });observer.observe(document.querySelector('#adminBody'),{childList:true,subtree:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}});
})();
