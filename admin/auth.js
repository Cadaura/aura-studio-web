(() => {
 'use strict';
 const bridge=window.chrome?.webview;const waiting=new Map();let state={authenticated:false,mode:document.body.dataset.mode||'client'},prompted=false;
 const select=s=>document.querySelector(s);
 window.auraRequest=(action,payload={})=>new Promise((resolve,reject)=>{if(!bridge){reject(Error('Aura Studio qısayolundan açın.'));return}const requestId=crypto.randomUUID();const timer=setTimeout(()=>{waiting.delete(requestId);reject(Error('Server cavabı gecikir. Yenidən sınayın.'))},30000);waiting.set(requestId,{resolve,reject,timer});bridge.postMessage({type:'api',requestId,action,payload})});
 const gate=document.createElement('section');gate.id='authGate';gate.innerHTML='<div class="auth-brand"><div class="auth-logo">aura<span style="font-size:12px;display:block;letter-spacing:5px;margin-top:8px">DIGITAL</span></div><h1>İşinizə açılan bir hesab.</h1><p>Daha az təkrar. Daha çox mühəndislik.</p></div><div class="auth-content"><div class="auth-box"><div class="eyebrow">AURA / '+(state.mode==='admin'?'İDARƏETMƏ':'STUDIO')+'</div><h2>Xoş gəldiniz.</h2><p>İş məkanınıza daxil olun.</p><form id="authLogin"><label for="authEmail">E-poçt</label><input id="authEmail" type="email" autocomplete="username" required maxlength="254"><label for="authPassword">Parol</label><input id="authPassword" type="password" autocomplete="current-password" required maxlength="128"><button class="btn lime" type="submit">Daxil ol ↗</button><div class="auth-error" id="authError" role="alert"></div></form><div class="auth-note">Hesabınızı Aura administratoru yaradır. Giriş məlumatları üçün onunla əlaqə saxlayın.<br>İlk giriş internet tələb edir. Son uğurlu server yoxlamasından sonra maksimum 24 saat internetsiz işləmək mümkündür.</div></div></div>';
 document.body.prepend(gate);
 const badge=document.createElement('div');badge.className='auth-status';badge.textContent='Server bağlantısı yoxlanır…';document.body.append(badge);
 const dialog=document.createElement('div');dialog.className='auth-dialog';dialog.hidden=true;document.body.append(dialog);
 function showPasswordForm(){
  dialog.innerHTML='<div class="auth-dialog-box"><h2>Parolunuzu dəyişin.</h2><p>Yeni parol serverdə yenilənəcək. İnternet bağlantısı tələb olunur.</p><form id="authChange"><label for="authCurrent">Cari parol</label><input id="authCurrent" type="password" autocomplete="current-password" required maxlength="128"><label for="authNew">Yeni parol · ən az 12 simvol</label><input id="authNew" type="password" autocomplete="new-password" required minlength="12" maxlength="128"><label for="authConfirm">Yeni parolun təkrarı</label><input id="authConfirm" type="password" autocomplete="new-password" required minlength="12" maxlength="128"><div class="auth-error" id="authChangeError" role="alert"></div><div class="sectionFoot"><button class="btn lime" type="submit">Parolu dəyiş</button><button class="btn light" type="button" id="authCancelChange">Geri</button></div></form></div>';
  dialog.hidden=false;select('#authCurrent').focus();select('#authCancelChange').onclick=()=>{dialog.hidden=true;dialog.replaceChildren()};
  select('#authChange').onsubmit=async e=>{e.preventDefault();const current=select('#authCurrent').value,password=select('#authNew').value,confirm=select('#authConfirm').value;if(password!==confirm){select('#authChangeError').textContent='Yeni parollar eyni deyil.';return}const button=e.target.querySelector('button');button.disabled=true;try{const next=await auraRequest('auth.password',{current_password:current,new_password:password});e.target.reset();dialog.hidden=true;dialog.replaceChildren();apply(next);window.toast?.('Parol serverdə dəyişdirildi.')}catch(error){select('#authChangeError').textContent=error.message}finally{if(button.isConnected)button.disabled=false}};
 }
 function offerPasswordChange(){
  prompted=true;dialog.innerHTML='<div class="auth-dialog-box"><div class="eyebrow">İLK GİRİŞ</div><h2>Öz parolunuzu təyin edin.</h2><p>Hesabınız üçün verilən müvəqqəti parolu dəyişmək istəyirsiniz?</p><div class="sectionFoot"><button class="btn lime" id="authChangeNow">Parolu dəyiş</button><button class="btn light" id="authChangeLater">Sonra</button></div></div>';dialog.hidden=false;
  select('#authChangeNow').onclick=()=>{if(state.mode!=='admin'&&typeof navigate==='function')navigate('account');showPasswordForm()};select('#authChangeLater').onclick=()=>{dialog.hidden=true;dialog.replaceChildren();auraRequest('event.record',{kind:'password_prompt_dismissed',details:{page:'account'}}).catch(()=>{})};
 }
 function apply(next){
  state=next;window.auraAuthState=state;document.body.classList.toggle('auth-locked',!state.authenticated);
  if(!state.authenticated){badge.textContent=state.mfa_required?'Təsdiq kodu tələb olunur':'Giriş tələb olunur';prompted=false;dialog.hidden=true;dialog.replaceChildren();window.dispatchEvent(new CustomEvent('aura-auth',{detail:state}));return}
  const expires=state.offline_expires_at?new Date(state.offline_expires_at).toLocaleString('az-AZ'):'';
  badge.textContent=state.online?'● Serverə qoşulub · növbədə '+state.pending_events:'İnternetsiz · '+(state.offline_rigel?state.offline_rigel.remaining+' generasiya qalıb · ':'Rigel üçün internet tələb olunur · ')+'icazə sonu: '+expires;
  if(typeof accountData!=='undefined'&&state.profile){const input=select('#accountForm [name="person"]'),draft=input?.dataset.dirty==='true'?input.value:null;accountData={...accountData,person:state.profile.name,email:state.profile.email,company:state.license?.company||'Aura Digital'};applyAccount();if(draft!==null)input.value=draft;if(select('#accountPlan'))select('#accountPlan').textContent=state.license?.tier==='trial'?'3 günlük sınaq':'Aura '+(state.license?.plan||'Admin')+(state.license?.tier?' '+state.license.tier:'');}
  if(state.license){const label=({solo:'Solo',studio:'Studio',enterprise:'Enterprise'})[state.license.plan]||state.license.plan;for(const element of document.querySelectorAll('.licenseMini strong,.licenseHero h2'))element.textContent='Aura '+label;for(const element of document.querySelectorAll('#home .intro .badge'))element.textContent='Aktiv iş məkanı';const mini=select('.licenseMini');if(mini){mini.replaceChildren();const status=document.createElement('div'),plan=document.createElement('strong'),seats=document.createElement('div');status.textContent='● AKTİV LİSENZİYA';plan.textContent='Aura '+label;plan.style.color='#fff';seats.textContent=state.license.seats+' iş yeri · Aura Rigel';mini.append(status,plan,seats);}}
  if(state.license&&select('#bp-subscription')){
   const pane=select('#bp-subscription');pane.replaceChildren();const card=document.createElement('div');card.className='pageCard';const title=document.createElement('h2');title.textContent='Aura '+state.license.plan;const text=document.createElement('p');text.textContent=state.license.company+' · '+state.license.seats+' iş yeri · Server tərəfindən aktivləşdirilib';card.append(title,text);pane.append(card);
   const metrics=document.querySelectorAll('#license .metricRow strong');if(metrics[1])metrics[1].textContent=state.license.seats+' iş yeri';if(metrics[2])metrics[2].textContent='Aktiv lisenziya';
  }
  const versionBadge=select('.topbar .badge');if(versionBadge)versionBadge.textContent='AURA STUDIO · 1.0.6';
  if(state.profile?.must_change_password&&!prompted)offerPasswordChange();
  window.dispatchEvent(new CustomEvent('aura-auth',{detail:state}));
 }
 select('#authLogin').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;select('#authError').textContent='';const email=select('#authEmail').value.trim(),password=select('#authPassword').value;select('#authPassword').value='';try{const next=await auraRequest('auth.login',{email,password});apply(next)}catch(error){select('#authError').textContent=error.message}finally{button.disabled=false}};
 function addAccountActions(){
  const account=select('#account');if(!account)return;
  const card=document.createElement('div');card.className='pageCard';card.innerHTML='<h2>Hesab təhlükəsizliyi</h2><p>Hesabınız Aura administratoru tərəfindən yaradılıb.</p><div class="sectionFoot"><button class="btn lime" id="accountChangePassword">Parolu dəyiş</button><button class="btn light" id="accountLogout">Hesabdan çıx</button></div>';account.querySelector('.pageheading')?.after(card);
  select('#accountChangePassword').onclick=showPasswordForm;select('#accountLogout').onclick=async()=>{try{apply(await auraRequest('auth.logout'))}catch(error){window.toast?.(error.message)}};
  const form=select('#accountForm');if(form){form.querySelectorAll('input').forEach(e=>e.readOnly=e.name!=='person');const person=form.elements.person;person.oninput=()=>person.dataset.dirty='true';form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button[type="submit"]');button.disabled=true;try{const next=await auraRequest('profile.update',{name:person.value.trim()});person.dataset.dirty='false';apply(next);select('#accountSaved').textContent='Ad və soyad serverdə saxlandı.';window.toast?.('Məlumatlar yeniləndi.')}catch(error){select('#accountSaved').textContent=error.message}finally{button.disabled=false}}}
  if(select('#inviteDemo'))select('#inviteDemo').hidden=true;
 }
 addAccountActions();
 document.querySelectorAll('[data-buy]').forEach(b=>{b.onclick=()=>window.toast?.('Paket dəyişmək üçün Aura administratoru ilə əlaqə saxlayın.')});
 if(select('#payDemo'))select('#payDemo').disabled=true;
 document.addEventListener('change',e=>{if(state.authenticated&&e.target.matches('[data-setting],#startPage'))auraRequest('event.record',{kind:'settings_changed',details:{page:'settings'}}).catch(()=>{})});
 document.addEventListener('click',e=>{if(state.authenticated&&e.target.closest('[data-theme-choice],[data-accent]'))auraRequest('event.record',{kind:'settings_changed',details:{page:'settings'}}).catch(()=>{})});
 if(bridge)bridge.addEventListener('message',e=>{const m=e.data;if(m.type==='api.result'){const pending=waiting.get(m.requestId);if(pending){clearTimeout(pending.timer);waiting.delete(m.requestId);m.ok?pending.resolve(m.result):pending.reject(Error(m.error||'Əməliyyat tamamlanmadı.'))}}if(m.type==='auth.state')apply(m.state)});
 if(typeof navigate==='function'){
  const original=navigate;navigate=function(page){original(page);if(state.authenticated)auraRequest('event.record',{kind:'page_opened',details:{page}}).catch(()=>{})};
 }
 window.addEventListener('online',()=>auraRequest('auth.sync').then(apply).catch(()=>{}));
 if(!bridge)select('#authError').textContent='Bu səhifəni Aura Studio qısayolundan açın.';
 window.auraChangePassword=showPasswordForm;window.auraApplyAuth=apply;
 if(bridge&&state.mode==='admin')bridge.postMessage({type:'host.ready'});
})();
