(() => {
 'use strict';
 const $=selector=>document.querySelector(selector);
 const el=(tag,label,cls)=>{
  const node=document.createElement(tag);
  if(label!==undefined)node.textContent=label;
  if(cls)node.className=cls;
  return node;
 };
 const date=value=>value?new Date(value).toLocaleString('az-AZ'):'—';
 function button(label,handler){
  const node=el('button',label,'btn light');
  node.type='button';
  node.onclick=handler;
  return node;
 }
 window.auraSupportThread=function(host,id,admin=false){
  const title=el('h2','Dəstək söhbəti');
  const log=el('div',undefined,'aura-thread-log');
  log.setAttribute('aria-label','Söhbət mesajları');
  const form=el('form');
  const message=el('textarea');
  message.required=true;
  message.maxLength=3000;
  message.rows=3;
  message.setAttribute('aria-label','Cavab');
  const send=el('button','Cavabı göndər','btn lime');
  const status=el('p');
  status.setAttribute('role','status');
  form.append(message,send,status);
  host.replaceChildren(title,log,form);
  let signature='', loading=false, sending=false;
  const active=()=>form.isConnected&&!host.closest('[hidden]')&&!document.body.classList.contains('auth-locked');
  async function refresh(){
   if(loading||!active())return;
   loading=true;
   try{
    const {request,replies}=await auraRequest(admin?'admin.supportThread':'support.thread',{request_id:id});
    if(!active())return;
    title.textContent=request.subject;
    const next=[request.id,...replies.map(reply=>reply.id)].join('/');
    if(next===signature)return;
    const stick=!signature||log.scrollHeight-log.scrollTop-log.clientHeight<60;
    signature=next;
    const notes=[{...request,from_admin:false},...replies];
    log.replaceChildren(...notes.map(note=>{
     const item=el('article',undefined,note.from_admin?'aura-thread-admin':'');
     item.append(el('small',(note.from_admin?'Aura dəstək':'Müştəri')+' · '+date(note.created_at)),el('p',note.message));
     return item;
    }));
    if(stick)log.scrollTop=log.scrollHeight;
   }catch(error){if(active())status.textContent=error.message}
   finally{loading=false}
  }
  form.onsubmit=async event=>{
   event.preventDefault();
   if(sending)return;
   const body=message.value.trim();
   if(!body)return;
   sending=true;
   send.disabled=true;
   status.textContent='';
   try{
    await auraRequest(admin?'admin.supportReply':'support.reply',{request_id:id,message:body});
    if(message.value.trim()===body)message.value='';
    await refresh();
   }catch(error){status.textContent=error.message}
   finally{sending=false;send.disabled=false}
  };
  const timer=setInterval(()=>{
   if(!host.isConnected||!form.isConnected){clearInterval(timer);return}
   if(!document.hidden)refresh();
  },10000);
  refresh();
 };
 if(document.body.dataset.mode==='admin')return;

 const support=$('#support');
 const historyCard=el('div',undefined,'pageCard aura-communication-card');
 const history=el('div',undefined,'aura-conversation-list');
 const historyStatus=el('p');
 const thread=el('div',undefined,'pageCard aura-communication-card');
 thread.hidden=true;
 let offset=0, historyBusy=false;
 const older=button('Əvvəlki söhbətləri göstər',()=>loadHistory(false));
 older.hidden=true;
 const openThread=id=>{
  thread.hidden=false;
  auraSupportThread(thread,id);
  thread.scrollIntoView?.({block:'nearest'});
 };
 async function loadHistory(reset=true){
  if(historyBusy||!window.auraAuthState?.online)return;
  const profileId=window.auraAuthState.profile?.id;
  if(reset){offset=0;history.replaceChildren()}
  historyBusy=true;
  try{
   const result=await auraRequest('support.history',{offset});
   if(profileId!==window.auraAuthState?.profile?.id)return;
   for(const row of result.requests){
    history.append(button(row.subject+' · '+date(row.created_at),()=>openThread(row.id)));
   }
   offset+=result.requests.length;
   older.hidden=!result.more;
   historyStatus.textContent=offset?'':'Hələ dəstək söhbətiniz yoxdur.';
  }catch(error){historyStatus.textContent=error.message}
  finally{historyBusy=false}
 }
 historyCard.append(el('h2','Söhbətlər'),button('Yenilə',()=>loadHistory()),history,older,historyStatus);
 support.append(historyCard,thread);
 const originalSubmit=$('#supportRequest').onsubmit;
 $('#supportRequest').onsubmit=async event=>{await originalSubmit(event);await loadHistory()};
 const supportObserver=new MutationObserver(()=>{if(!support.hidden)loadHistory()});
 supportObserver.observe(support,{attributes:true,attributeFilter:['hidden']});

 const badge=$('.topbar .badge');
 const bell=button('',()=>{
  notificationBox.hidden=false;
  if(!window.auraAuthState?.online)notificationStatus.textContent='Bildirişləri yeniləmək üçün internetə qoşulun.';
  else loadNotifications();
  close.focus();
 });
 bell.className='btn light aura-notification-bell';
 bell.setAttribute('aria-label','Bildirişlər');
 const glyph=document.createElementNS('http://www.w3.org/2000/svg','svg');
 glyph.setAttribute('viewBox','0 0 24 24');
 glyph.setAttribute('aria-hidden','true');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');
 path.setAttribute('d','M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4');
 glyph.append(path);
 const unread=el('span','', 'aura-unread');
 unread.hidden=true;
 bell.append(glyph,unread);
 badge.before(bell);
 const promo=button('',()=>navigate('billing'));
 promo.className='aura-package-promo';
 promo.setAttribute('aria-label','Studio Pro və Studio Plus paketlərinə bax');
 promo.title='Studio Pro və Studio Plus paketlərinə bax';
 const promoVideo=el('video');
 promoVideo.src='media/studio-packages.mp4';
 promoVideo.muted=true;
 promoVideo.loop=true;
 promoVideo.playsInline=true;
 promoVideo.draggable=false;
 promoVideo.preload='auto';
 promoVideo.setAttribute('aria-hidden','true');
 promo.append(promoVideo);
 bell.before(promo);
 const dashboard=$('#home');
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const updatePromo=()=>{
  promo.hidden=dashboard.hidden;
  if(promo.hidden||document.hidden||reducedMotion.matches)promoVideo.pause();
  else promoVideo.play().catch(()=>{});
 };
 new MutationObserver(updatePromo).observe(dashboard,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',updatePromo);
 reducedMotion.addEventListener('change',updatePromo);
 updatePromo();
 const notificationBox=el('div',undefined,'auth-dialog');
 notificationBox.hidden=true;
 const notificationPanel=el('div',undefined,'auth-dialog-box');
 notificationPanel.setAttribute('role','dialog');
 notificationPanel.setAttribute('aria-modal','true');
 notificationPanel.setAttribute('aria-label','Bildirişlər');
 const notificationList=el('div',undefined,'aura-notification-list');
 const notificationStatus=el('p');
 const close=button('Bağla',()=>{notificationBox.hidden=true;bell.focus()});
 notificationPanel.append(el('h2','Bildirişlər'),notificationStatus,notificationList,close);
 notificationBox.append(notificationPanel);
 document.body.append(notificationBox);
 notificationBox.addEventListener('keydown',event=>{if(event.key==='Escape')close.click()});
 let notificationsBusy=false;
 async function loadNotifications(){
  if(notificationsBusy||!window.auraAuthState?.authenticated||!window.auraAuthState?.online)return;
  const profileId=window.auraAuthState.profile?.id;
  notificationsBusy=true;
  try{
   const {notifications}=await auraRequest('notifications.list');
   if(profileId!==window.auraAuthState?.profile?.id)return;
   const count=notifications.filter(item=>!item.read).length;
   unread.textContent=String(count);
   unread.hidden=count===0;
   bell.setAttribute('aria-label',count?'Bildirişlər · '+count+' oxunmamış':'Bildirişlər');
   notificationStatus.textContent=notifications.length?'':'Hələ bildiriş yoxdur.';
   notificationList.replaceChildren(...notifications.map(item=>{
    const card=el('article',undefined,item.read?'':'aura-notification-new');
    card.append(el('strong',item.title),el('small',date(item.created_at)),el('p',item.message));
    if(!item.read||item.support_id)card.append(button(item.support_id?'Söhbəti aç':'Oxundu',async()=>{
     try{
      if(!item.read)await auraRequest('notifications.read',{notification_id:item.id});
      if(item.support_id){notificationBox.hidden=true;navigate('support');openThread(item.support_id)}
      await loadNotifications();
     }catch(error){notificationStatus.textContent=error.message}
    }));
    return card;
   }));
  }catch(error){if(!notificationBox.hidden)notificationStatus.textContent=error.message}
  finally{notificationsBusy=false}
 }

 const deviceNav=button('Cihazlar',()=>{navigate('devices');loadDevices()});
 deviceNav.className='btn light aura-team-link';
 $('.licenseMini').before(deviceNav);
 const devicePage=el('section',undefined,'content view');
 devicePage.id='devices';
 devicePage.hidden=true;
 devicePage.innerHTML='<div class="pageheading"><h1>Cihazlar</h1></div><div class="pageCard"><div class="aura-device-filters"><input type="search" aria-label="Cihaz axtar" placeholder="İstifadəçi, şirkət və ya cihaz adı"><select aria-label="Cihaz vəziyyəti"><option value="">Bütün cihazlar</option><option value="active">Aktiv</option><option value="inactive">Qeyri-aktiv</option></select><select aria-label="Sıralama"><option value="recent">Son əlaqəyə görə</option><option value="name">Cihaz adına görə</option><option value="person">İstifadəçi adına görə</option></select></div><p role="status"></p><div class="tableScroll"><table class="aura-team-table"><thead><tr><th>Cihaz</th><th>İstifadəçi</th><th>Şirkət</th><th>Son əlaqə</th><th>Vəziyyət</th></tr></thead><tbody></tbody></table></div></div>';
 $('.main').append(devicePage);
 names.devices='Cihazlar';
 const [search,state,sort]=devicePage.querySelectorAll('input,select');
 const deviceStatus=devicePage.querySelector('[role=status]');
 devicePage.querySelector('.aura-device-filters').append(button('Yenilə',()=>loadDevices()));
 let devices=[], devicesBusy=false;
 const az=value=>String(value||'').toLocaleLowerCase('az');
 function drawDevices(){
  const text=az(search.value.trim());
  const rows=devices.filter(d=>(!state.value||d.active===(state.value==='active'))&&[d.label,d.name,d.company].some(value=>az(value).includes(text)));
  if(sort.value==='name')rows.sort((a,b)=>a.label.localeCompare(b.label,'az'));
  if(sort.value==='person')rows.sort((a,b)=>a.name.localeCompare(b.name,'az'));
  const tbody=devicePage.querySelector('tbody');
  tbody.replaceChildren();
  for(const d of rows){
   const row=tbody.insertRow();
   for(const value of [d.label,d.name,d.company,date(d.last_seen),d.active?'Aktiv':'Qeyri-aktiv'])row.insertCell().textContent=value;
  }
  deviceStatus.textContent=rows.length?'':'Cihaz tapılmadı.';
 }
 async function loadDevices(){
  if(devicesBusy)return;
  const profileId=window.auraAuthState?.profile?.id;
  devicesBusy=true;
  deviceStatus.textContent='Yüklənir…';
  try{
   const result=await auraRequest('studio.devices');
   if(profileId===window.auraAuthState?.profile?.id){devices=result.devices;drawDevices()}
  }catch(error){deviceStatus.textContent=error.message}
  finally{devicesBusy=false}
 }
 search.oninput=state.onchange=sort.onchange=drawDevices;
 let lastAccount, lastOnline=false;
 window.addEventListener('aura-auth',({detail})=>{
  const id=detail.authenticated?detail.profile?.id:null;
  if(lastAccount!==id){
   devices=[];devicePage.querySelector('tbody').replaceChildren();
   offset=0;older.hidden=true;history.replaceChildren();thread.hidden=true;thread.replaceChildren();
   notificationBox.hidden=true;unread.hidden=true;notificationList.replaceChildren();
   lastOnline=false;
  }
  lastAccount=id;
  if(detail.online&&!lastOnline)loadNotifications();
  lastOnline=Boolean(detail.online&&id);
 });
 setInterval(()=>{if(!document.hidden)loadNotifications()},20000);
 if(window.auraAuthState?.online)loadNotifications();
})();
