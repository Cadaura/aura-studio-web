(() => {
 'use strict';
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 if(document.body.dataset.mode!=='admin'){
  all('#home .card.muted').forEach(e=>e.remove());
  $('#home .cards').style.gridTemplateColumns='minmax(260px, 1fr)';
  $('#home .card.live .tag').textContent='AKTİV MODUL';
  $('#home .card.live p').textContent='Çox aşırımlı rigel açılışı və AutoCAD-də yerləşdirmə.';
  $('#home .heroText p').innerHTML='Rigel açılışını hazırlayın.<br>AutoCAD-də yerləşdirmə nöqtəsini seçin.';
  all('[data-destination="standards"],[data-nav="standards"],[data-go="standards"]').forEach(e=>e.remove());
  for(const id of ['profileBtn','profileBtn2']){const e=$('#'+id);if(e)e.remove()}
  $('#standards')?.remove();$('#activeProfile')?.remove();
  const profile=$('#home .profile');if(profile){profile.closest('.box').innerHTML='<h3>İşinizə hazır.</h3><p>Aura Rigel · aşırımları və oxları daxil edin, nəticəni AutoCAD-də yerləşdirin.</p><p>Şirkətinizin paketini Aura administratoru təyin edir.</p>'}
  const steps=all('#home .step');if(steps[0])steps[0].innerHTML='<span>01 /</span><b>Modulu açın</b>Aura Studio-da Rigel studiyasına keçin.';if(steps[1])steps[1].innerHTML='<span>02 /</span><b>Verilənləri daxil edin</b>Aşırımları, oxları və rigel ölçülərini yazın.';
  $('#home .foot span:last-child').textContent='Rigel açılışı · AutoCAD bağlantısı · mühəndis yoxlaması tələb olunur.';
  // The original concept's layer editor is removed; drawing-engine layers remain necessary.
  all('#account .pageCard').filter(e=>/Komanda üzvləri|İlk beta üçün hazırlıq/.test(e.querySelector('h2')?.textContent||'')).forEach(e=>e.remove());
  if(typeof teamRender==='function')teamRender=function(){};
  const security=all('#account .pageCard').find(e=>e.querySelector('h2')?.textContent==='Hesabın təhlükəsizliyi');
  if(security)security.innerHTML='<h2>İki mərhələli təsdiq</h2><p>Paroldan əlavə telefonunuzdakı təsdiq tətbiqindən 6 rəqəmli kod tələb edir. E-poçt kodu deyil.</p><p id="mfaStatus">Vəziyyəti yoxlamaq üçün açın.</p><button class="btn light" id="mfaManage">Təhlükəsizliyi idarə et</button>';
  const workspace=all('#account .pageCard').find(e=>e.querySelector('h2')?.textContent==='İş məkanınız');if(workspace)workspace.innerHTML='<h2>İş məkanınız</h2><p id="accountPlan"></p><p>Şirkət, e-poçt və paket dəyişikliklərini Aura administratoru edir. Ad və soyadınızı özünüz yeniləyə bilərsiniz.</p><button class="btn light" id="workspacePlans">Paketlərə bax ↗</button>';$('#workspacePlans').onclick=()=>navigate('billing');
  const intro=$('#account .pageheading p');if(intro)intro.textContent='Şəxsi məlumatlarınız və hesab təhlükəsizliyi.';
  $('#account .pageheading h1').textContent='Hesabınız.';$('#account .pageheading .eyebrow').textContent='AURA / HESABIM';names.account='Hesabım';
  const form=$('#accountForm');form?.closest('.pageCard').querySelectorAll('p').forEach(e=>{if(e.id!=='accountSaved')e.textContent='Ad və soyad serverdə saxlanır. Digər məlumatları Aura administratoru idarə edir.'});
  form.querySelectorAll('label').forEach(label=>{if(label.firstChild?.nodeType===Node.TEXT_NODE)label.firstChild.textContent=label.firstChild.textContent.replace(' · demo','');if(label.querySelector('select'))label.hidden=true});$('#accountSaved').textContent='Ad və soyadı dəyişib yadda saxlayın.';
  const previousNavigate=navigate;navigate=function(page){previousNavigate(page);if(['account','billing','license','updates','support','terms'].includes(page))all('.side [data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav==='settings'))};
  const system=all('#settings .pageCard').find(e=>e.querySelector('h2')?.textContent==='Sistem və inteqrasiya');
  const windowMode=document.createElement('div');
  windowMode.className='settingRow';
  windowMode.innerHTML='<div><strong>Açılışda tam ekran</strong><small>Növbəti açılışda Studio pəncərəsini böyüdür.</small></div><label class="switch"><input type="checkbox" data-native-setting="maximizeOnLaunch" aria-label="Açılışda tam ekran"><span></span></label>';
  const keys=['startup','autoCad','autoUpdates'];
  const help=['Windows hesabınıza daxil olanda Aura Studio açılır.','Aura açıldıqda artıq açıq olan AutoCAD ilə bağlantını yoxlayır. Çəkmək üçün Hazırla düyməsini basın.','Aktiv olduqda yeni buraxılış açılışda quraşdırılır. Əl ilə yeniləmək üçün ilk bildirişdən 24 saat vaxt verilir.'];
  system.querySelectorAll('.settingRow').forEach((row,i)=>{const input=row.querySelector('input');input.disabled=false;input.dataset.nativeSetting=keys[i];input.setAttribute('aria-label',row.querySelector('strong').textContent);row.querySelector('small').textContent=help[i]});
  system.querySelectorAll('.settingRow strong')[2].textContent='Açılışda avtomatik yenilə';
  system.append(windowMode);
  const windowOptions=document.createElement('div');
  windowOptions.innerHTML='<div class="settingRow"><div><strong>X düyməsinin davranışı</strong></div><select class="settingSelect" data-window-choice="closeToTray" aria-label="X düyməsinin davranışı"><option value="false">Tam bağla</option><option value="true">Saatın yanına yığ</option></select></div><div class="settingRow"><div><strong>Pəncərə ölçüsünü yadda saxla</strong><small>Son ölçü və mövqe növbəti açılışda bərpa olunur.</small></div><label class="switch"><input type="checkbox" data-native-setting="rememberWindow" aria-label="Pəncərə ölçüsünü yadda saxla"><span></span></label></div><div class="settingRow"><div><strong>İnterfeys ölçüsü</strong></div><select class="settingSelect" data-window-choice="interfaceScale" aria-label="İnterfeys ölçüsü"><option value="100">100%</option><option value="115">115%</option><option value="130">130%</option></select></div>';
  system.append(...windowOptions.children);
  keys.push('maximizeOnLaunch','rememberWindow');
  const closeMode=system.querySelector('[data-window-choice="closeToTray"]');
  const scale=system.querySelector('[data-window-choice="interfaceScale"]');
  const cadRow=document.createElement('div');
  cadRow.className='settingRow';
  cadRow.innerHTML='<div><strong>AutoCAD versiyası</strong><small>Bağlantı və Hazırla əmri üçün istifadə olunacaq AutoCAD-i seçin. Avtomatik seçim Windows-da qeydiyyatda olan standart AutoCAD-i istifadə edir.</small></div><select class="settingSelect" aria-label="AutoCAD versiyası"><option value="auto">Avtomatik</option></select>';
  const cadVersion=cadRow.querySelector('select');
  for(const year of [2021,2022,2023,2024,2025,2026])cadVersion.add(new Option('AutoCAD '+year,year));
  system.append(cadRow);
  const controls=system.querySelectorAll('input,select');
  const status=document.createElement('p');status.id='nativeSettingsStatus';status.setAttribute('role','status');system.append(status);
  let settings=null,saving=false;
  function applySettings(value){settings=value;for(const key of keys)$('[data-native-setting="'+key+'"]').checked=!!value[key];closeMode.value=String(!!value.closeToTray);scale.value=String(value.interfaceScale||100);cadVersion.value=value.cadVersion||"auto";status.textContent=value.cad_status;status.hidden=!value.cad_status}
  async function loadSettings(){try{applySettings(await auraRequest('settings.get'))}catch(e){status.textContent=e.message}}
  controls.forEach(input=>input.onchange=async()=>{if(saving)return;saving=true;controls.forEach(e=>e.disabled=true);try{const value=Object.fromEntries(keys.map(key=>[key,$('[data-native-setting="'+key+'"]').checked]));value.closeToTray=closeMode.value==='true';value.interfaceScale=Number(scale.value);value.cadVersion=cadVersion.value;applySettings(await auraRequest('settings.save',value));toast('Sistem ayarları saxlandı.')}catch(e){if(settings)applySettings(settings);status.textContent=e.message}finally{saving=false;controls.forEach(e=>e.disabled=false)}});
  const privacy=all('#settings .pageCard').find(e=>e.querySelector('h2')?.textContent==='Məlumatlar və məxfilik');privacy.querySelector('p').textContent='Hesab, cihaz və tətbiq fəaliyyət qeydləri serverdə saxlanır. Rigel ölçüləri və görünüş ayarları bu kompüterdə qalır. DWG faylları göndərilmir. Şriftlər tətbiqə daxildir.';
  $('#settings .pageheading p').textContent='Görünüş, iş axını və sistem bağlantılarını tənzimləyin.';
  const search=document.createElement('div');
  search.className='settingRow settingsSearchRow';
  search.innerHTML='<div><label for="settingsSearch"><strong>Ayarlarda axtar</strong></label><small>Ayarın adına və ya açıqlamasına görə axtarın.</small><small role="status" hidden>Axtarışa uyğun ayar tapılmadı.</small></div><input class="settingSelect" type="search" id="settingsSearch" placeholder="Məsələn, tam ekran">';
  const services=all('#settings .pageCard').find(card=>card.querySelector('h2')?.textContent.trim()==='Hesab və xidmətlər');
  (services||system).append(search);
  const normalized=value=>value.toLocaleLowerCase('az').normalize('NFD').replace(/\p{M}/gu,'').replace(/ı/g,'i').replace(/ə/g,'e');
  search.querySelector('input').oninput=event=>{
   const words=normalized(event.target.value.trim()).split(/\s+/).filter(Boolean);
   const matches=node=>words.every(word=>normalized(node.textContent).includes(word));
   let found=false;
   for(const card of all('#settings .pageCard')){
    const rows=[...card.querySelectorAll('.settingRow')].filter(row=>row!==search);
    const heading=card.querySelector('h2');
    const categoryMatch=Boolean(heading&&matches(heading));
    for(const row of rows)row.hidden=Boolean(words.length&&!categoryMatch&&!matches(row));
    const contentMatch=rows.length?rows.some(row=>!row.hidden):[...card.children].some(child=>child!==search&&matches(child));
    const cardMatches=!words.length||categoryMatch||contentMatch;
    card.hidden=!cardMatches&&!card.contains(search);
    found||=cardMatches;
   }
   search.querySelector('[role="status"]').hidden=found||!words.length;
  };
  privacy.querySelector('.settingsNote').textContent='Sıfırlama yalnız görünüş və iş axını üçündür. Windows və AutoCAD seçimləri yuxarıdakı açarlardan dəyişir.';
  window.addEventListener('aura-auth',e=>{if(e.detail.authenticated&&!settings)loadSettings()});
  const terms = $('#terms');
  terms.innerHTML = `<button class="btn light desktop-back" id="termsBack">← Ayarlar</button>
   <div class="pageheading"><h1>İstifadə şərtləri</h1><p>Release 1.0.6 · 20 noyabr 2026</p></div>
   <div class="pageCard" id="currentTerms">
    <section class="legalSection"><h2>1. İstifadə hüququ</h2>
     <p><b>1.1.</b> Aura Studio, AutoCAD mühitində rigel çertyojlarının hazırlanması üçün proqram təminatıdır. İstifadə hüququ təyin edilmiş paket, hesab və iş yeri sayı ilə məhdudlaşır.</p>
     <p><b>1.2.</b> AutoCAD üçün ayrıca etibarlı lisenziya tələb olunur. İstifadəçi yaratdığı çertyojları redaktə və paylaşa bilər. Aura mühərrikinin mənbə koduna mülkiyyət hüququ lisenziya ilə ötürülmür.</p>
    </section>
    <section class="legalSection"><h2>2. Paketlər və sınaq</h2>
     <p><b>2.1.</b> Basic paketi rigel açılışını əhatə edir. Pro paketində kəsik və hesabat şirkətə və ya işçiyə təyin olunan Rigel mühərrikinə uyğun hazırlanır.</p>
     <p><b>2.2.</b> Aylıq limit Solo Basic üçün 100, Solo Pro üçün 150, Studio Basic üçün hər istifadəçiyə 150, Studio Pro üçün hər istifadəçiyə 200 generasiyadır. Hesab dövrü Bakı vaxtı ilə təqvim ayına əsaslanır. Enterprise Pro limitləri fərdi razılaşdırılır.</p>
     <p><b>2.3.</b> Sınaq aktivləşdirildiyi andan 72 saat davam edir və 15 generasiya ilə məhdudlaşır. Sınaq çertyojlarında Aura layları və sınaq imzası tətbiq olunur.</p>
     <p><b>2.4.</b> Limitli paketlərdə və xüsusi mühərrikdən istifadə zamanı sistem generasiya icazəsini onlayn yoxlayır. Uğursuz və ləğv olunmuş generasiyaların rezervi nəticə serverə çatanda azad edilir.</p>
    </section>
    <section class="legalSection"><h2>3. Hesab və məxfilik</h2>
     <p><b>3.1.</b> Hesab fərdi istifadə üçündür. İstifadəçi giriş məlumatlarını qoruyur və istəyə görə təsdiq tətbiqi ilə iki mərhələli təsdiqi aktivləşdirir.</p>
     <p><b>3.2.</b> Aura hesab, paket, cihaz, giriş və generasiya vəziyyəti haqqında məlumatı xidmətin idarə edilməsi üçün saxlayır. Çertyoj və rigel ölçüləri kompüterdə işlənir. Dəstək müraciətləri hesabla əlaqələndirilir.</p>
    </section>
    <section class="legalSection"><h2>4. Çertyojun yoxlanması</h2>
     <p><b>4.1.</b> Daxil edilən ölçülər, çertyoj və hesabat layihədə tətbiq edilməzdən əvvəl ixtisaslı mühəndis tərəfindən yoxlanmalıdır.</p>
     <p><b>4.2.</b> Konstruktiv hesablamanın və layihənin normativ tələblərə uyğunluğunun qiymətləndirilməsi layihə mütəxəssisinin işidir.</p>
    </section>
    <section class="legalSection"><h2>5. Yeniləmələr və xidmət fasiləsi</h2>
     <p><b>5.1.</b> Yeni buraxılış ilk dəfə göstərildikdən sonra yeniləmə üçün 24 saat verilir. Müddət bitdikdə Studio ilə işləmək üçün yeniləmə tələb olunur.</p>
     <p><b>5.2.</b> Aura xidmətində təsdiqlənmiş nasazlıq istifadəyə mane olduqda, Aura itirilmiş müddəti təsirlənmiş hesabın sınaq və ya abunə müddətinə əlavə edir.</p>
     <p><b>5.3.</b> Dəstək müraciətləri tətbiqdən göndərilə bilər. Rəsmi əlaqə ünvanı AuraaDigital@proton.me-dir.</p>
    </section>
    <section class="legalSection"><h2>6. Ödəniş və qüvvədə olma</h2>
     <p><b>6.1.</b> Paket, ödəniş üsulu və xidmət müddəti Aura ilə birbaşa razılaşdırılır. Cari istifadə şərtləri Release 1.0.6 üçün təqdim olunur.</p>
    </section>
   </div>`;
  $('#termsBack').onclick = () => navigate('settings');
 }
 // MFA works in Studio and Admin; secrets stay only in the short-lived setup dialog.
 const modal=document.createElement('div');modal.className='auth-dialog';modal.hidden=true;document.body.append(modal);
 function close(){modal.hidden=true;modal.replaceChildren()}
 function codeForm(title,description,submit,cancel=close){
  modal.innerHTML='<div class="auth-dialog-box"><h2></h2><p></p><form><label for="mfaCode">Təsdiq tətbiqindəki kod</label><input id="mfaCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><div class="auth-error" role="alert"></div><div class="sectionFoot"><button class="btn lime" type="submit">Təsdiqlə</button><button class="btn light" type="button">Geri</button></div></form></div>';
  modal.querySelector('h2').textContent=title;modal.querySelector('p').textContent=description;modal.hidden=false;
  const form=modal.querySelector('form');form.querySelector('[type="button"]').onclick=cancel;
  form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;try{await submit($('#mfaCode').value)}catch(error){form.querySelector('.auth-error').textContent=error.message;$('#mfaCode').value=''}finally{button.disabled=false}};
  $('#mfaCode').focus();return form;
 }
 let challengeOpen=false;
 window.addEventListener('aura-auth',e=>{if(e.detail.mfa_required&&!challengeOpen){challengeOpen=true;codeForm('Girişi təsdiqləyin.','Telefonunuzdakı təsdiq tətbiqini açın.',async code=>{window.auraApplyAuth(await auraRequest('mfa.verify',{code}));challengeOpen=false;close()},async()=>{await auraRequest('auth.logout');challengeOpen=false;close()})}else if(e.detail.authenticated&&challengeOpen){challengeOpen=false;close()}});
 async function manageMfa(){try{
  const status=await auraRequest('mfa.status');if($('#mfaStatus'))$('#mfaStatus').textContent=status.enabled?'İki mərhələli təsdiq aktivdir.':'İki mərhələli təsdiq söndürülüb.';
  modal.innerHTML='<div class="auth-dialog-box"><h2>İki mərhələli təsdiq</h2><p></p><div class="sectionFoot"><button class="btn lime" id="mfaProceed"></button><button class="btn light" id="mfaClose">Bağla</button></div></div>';modal.hidden=false;modal.querySelector('p').textContent=status.enabled?'Söndürmək üçün təsdiq tətbiqinizdən cari kod tələb olunur.':'Google Authenticator, Microsoft Authenticator və ya digər uyğun tətbiqlə kod yaradın. QR kodu skan edib kodu təsdiqləməyincə aktivləşməyəcək.';$('#mfaClose').onclick=close;$('#mfaProceed').textContent=status.enabled?'Təsdiqi söndür':'Quraşdırmağa başla';
  $('#mfaProceed').onclick=async()=>{const proceed=$('#mfaProceed');proceed.disabled=true;try{
   if(status.enabled){codeForm('Təsdiqi söndürün.','Hesabınız bundan sonra yalnız parolla qorunacaq.',async code=>{window.auraApplyAuth(await auraRequest('mfa.disable',{factor_id:status.factor_id,code}));close();if($('#mfaStatus'))$('#mfaStatus').textContent='İki mərhələli təsdiq söndürüldü.'});return}
   const factor=await auraRequest('mfa.enroll');const form=codeForm('QR kodu skan edin.','Kodu təhlükəsiz saxlayın. Təsdiq tətbiqinizə çıxışı itirsəniz Aura administratoruna müraciət edin.',async code=>{window.auraApplyAuth(await auraRequest('mfa.verify',{factor_id:factor.factor_id,code}));close();if($('#mfaStatus'))$('#mfaStatus').textContent='İki mərhələli təsdiq aktivdir.'},async()=>{try{await auraRequest('mfa.cancel',{factor_id:factor.factor_id})}finally{close()}});
   const img=document.createElement('img');img.alt='Təsdiq tətbiqi üçün QR kod';img.width=220;img.height=220;const raw=factor.qr_code.replace(/^data:image\/svg\+xml[^,]*,/,'');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(raw.startsWith('%3C')?decodeURIComponent(raw):raw);const secret=document.createElement('p');secret.textContent='Əllə daxil etmə açarı: '+factor.secret;secret.style.overflowWrap='anywhere';const apple=document.createElement('details'), appleTitle=document.createElement('summary'), appleSteps=document.createElement('p');
   appleTitle.textContent='iPhone / Apple Parollar';
   appleSteps.textContent='Kamera ilə QR kodu oxudun və Parollar tətbiqində Aura hesabını seçin. Kod görünmürsə, həmin hesabda Redaktə et → Təsdiq kodunu qur seçin və yuxarıdakı açarı daxil edin. Sonra 6 rəqəmli kodu bu pəncərəyə yazın.';
   apple.open=true;
   apple.append(appleTitle,appleSteps);form.before(img,secret,apple);
  }catch(e){window.toast?window.toast(e.message):alert(e.message)}finally{proceed.disabled=false}};
 }catch(e){if(window.toast)toast(e.message);else alert(e.message)}}
 $('#mfaManage')?.addEventListener('click',manageMfa);
 if(document.body.dataset.mode==='admin'){const b=document.createElement('button');b.className='btn light';b.textContent='İki mərhələli təsdiq';b.onclick=manageMfa;$('#adminPassword').after(b)}
})();
