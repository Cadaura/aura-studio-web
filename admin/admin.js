(() => {
 'use strict';const $=s=>document.querySelector(s);let data=null,page='overview',busy=false,last=0;
 const titles={rigels:'Rigellər',overview:'İş məkanınız, bir baxışda.',users:'Aktiv hesablar',suspended:'Dayandırılmış hesablar',devices:'Aktiv iş yerləri.',events:'Bütün fəaliyyət hadisələri.',releases:'Yenilikləri çatdırın.',support:'Dəstək müraciətləri'};
 let accountQuery='', accountExpiry={};
 const date=v=>v?new Date(v).toLocaleString('az-AZ'):'—';
 const status=message=>$('#adminMessage').textContent=message;
 function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(cls)el.className=cls;return el}
 function action(label,handler){const b=node('button',label);b.type='button';b.onclick=handler;return b}
 function table(headers,rows){const wrap=node('div',undefined,'admin-table-wrap'),t=node('table',undefined,'admin-table');const tr=node('tr');headers.forEach(h=>tr.append(node('th',h)));const thead=node('thead');thead.append(tr);t.append(thead);const body=node('tbody');for(const row of rows){const tr=node('tr');for(const value of row){const td=node('td');if(value instanceof Node)td.append(value);else td.textContent=String(value??'—');tr.append(td)}body.append(tr)}if(!rows.length){const tr=node('tr'),td=node('td','Hələ məlumat yoxdur.');td.colSpan=headers.length;tr.append(td);body.append(tr)}t.append(body);wrap.append(t);return wrap}
 function userName(id){return data.users.find(u=>u.id===id)?.display_name||'—'}
 function companyName(id){return data.companies.find(c=>c.id===id)?.name||'—'}
 function license(company){return data.licenses.find(l=>l.company_id===company)}
 async function refresh(force=false){if(busy||(!force&&Date.now()-last<300000))return;busy=true;try{data=await auraRequest('admin.overview');last=Date.now();render();status('Server məlumatları yeniləndi · '+new Date().toLocaleTimeString('az-AZ'))}catch(e){status(e.message)}finally{busy=false}}
 async function mutate(name,payload){try{await auraRequest(name,payload);await refresh(true)}catch(e){status(e.message)}}
 function render(){if(!data)return;$('#adminTitle').textContent=titles[page];$('#adminCrumb').textContent=titles[page];const host=$('#adminBody');host.replaceChildren();document.querySelectorAll('[data-admin-page]').forEach(b=>b.classList.toggle('active',b.dataset.adminPage===page));
  if(page==='overview'){
   const unexpired=expiry=>!expiry||Date.parse(expiry)>Date.now();
   const companies=new Set(data.companies.filter(company=>{
    const plan=license(company.id);
    return company.enabled&&plan?.enabled&&unexpired(plan.expires_at);
   }).map(company=>company.id));
   const stats=new Map((data.account_stats||[]).map(row=>[row.user_id,row]));
   const memberships=new Map(data.memberships.map(row=>[row.user_id,row]));
   const users=new Set(data.users.filter(user=>{
    const membership=memberships.get(user.id);
    return user.enabled&&(membership?membership.enabled&&companies.has(membership.company_id)&&unexpired(stats.get(user.id)?.expires_at):user.is_owner);
   }).map(user=>user.id));
   const activeDevices=data.devices.filter(device=>!device.revoked&&companies.has(device.company_id)&&users.has(device.user_id)).length;
   const metrics=node('div',undefined,'admin-metrics');
   for(const [label,value] of [
    ['Aktiv şirkət',companies.size],['Qeyri-aktiv şirkət',data.companies.length-companies.size],
    ['Aktiv hesab',users.size],['Qeyri-aktiv hesab',data.users.length-users.size],
    ['Aktiv cihaz',activeDevices],['Bütün hadisələr',data.event_count??data.events.length]
   ]){
    const card=node('div',undefined,'admin-metric');
    card.append(node('small',label),node('strong',value));
    metrics.append(card);
   }
   host.append(metrics);
   if(data.usage){const u=data.usage;host.append(node('h2','Server istifadəsi'),node('p','Bu ay Aura API sorğuları: '+Number(u.month_calls).toLocaleString('az-AZ')+' / '+Number(u.function_budget).toLocaleString('az-AZ')+' · bu gün: '+u.today_calls),node('p','Verilənlər bazası: '+(u.database_bytes/1048576).toFixed(1)+' / '+(u.database_budget_bytes/1048576)+' MB'),node('p','Ölçmə başlanğıcı: '+date(u.measured_since)+'. Sorğu sayğacı yalnız Aura API çağırışlarını əhatə edir; Supabase-in rəsmi hesablaşma göstəricisi deyil. Pulsuz plan limitləri dəyişə bilər.'))}const filterBox=node('div',undefined,'sectionFoot');
   const nameFilter=node('input',undefined,'admin-filter');
   nameFilter.placeholder='Şirkət adı';
   nameFilter.setAttribute('aria-label','Şirkət adına görə axtar');
   const choose=(label,values)=>{
    const field=node('select');
    field.setAttribute('aria-label',label);
    field.add(new Option(label,''));
    for(const value of values)field.add(new Option(value,value));
    return field;
   };
   const packages=choose('Bütün paketlər',[...new Set(data.licenses.map(plan=>[plan.plan,plan.tier].filter(Boolean).join(' ')))].sort());
   const seats=choose('Bütün cihaz limitləri',[...new Set(data.licenses.map(plan=>plan.seats))].sort((a,b)=>a-b));
   const states=choose('Bütün vəziyyətlər',['Aktiv','Qeyri-aktiv']);
   filterBox.append(nameFilter,packages,seats,states);
   const filtered=node('div');
   host.append(filterBox,filtered);
   function drawCompanies(){
    const query=nameFilter.value.trim().toLocaleLowerCase('az');
    const rows=data.companies.map(company=>{
     const plan=license(company.id);
     return [company.name,[plan?.plan,plan?.tier].filter(Boolean).join(' '),plan?.seats,companies.has(company.id)?'Aktiv':'Qeyri-aktiv'];
    }).filter(([name,plan,limit,state])=>name.toLocaleLowerCase('az').includes(query)
      &&(!packages.value||packages.value===plan)&&(!seats.value||Number(seats.value)===limit)&&(!states.value||states.value===state));
    filtered.replaceChildren(table(['Şirkət','Paket','Cihaz limiti','Vəziyyət'],rows));
   }
   filterBox.addEventListener('input',drawCompanies);
   drawCompanies();
   host.append(node('p','Girişlər, səhifə keçidləri, rigel əmrləri və çəkmə nəticələri “Bütün hadisələr”dədir. Açıq tətbiq müddəti aktiv mühəndislik iş saatı kimi hesablanmır.'));
  }
  if(page==='rigels')renderRigels(host);
  if(page==='users'){
   const teams=activeTeams();
   host.append(node('h2','Aktiv komandalar'),table(['Komanda','Paket','Üzvlər','Əməliyyat'],teams.map(company=>{
    const pack=license(company.id);
    return [company.name,[pack.plan,pack.tier].filter(Boolean).join(' '),
     teamMembers(company.id).map(user=>user.display_name).join(', ')||'—',action('İdarə et',()=>manageTeam(company))];
   })),node('h2','Aktiv hesablar'));
  }
  if(page==='users'||page==='suspended'){
   const search=node('input',undefined,'admin-filter');
   search.placeholder='Ad, e-poçt və ya şirkət';
   search.setAttribute('aria-label','Hesab axtar');
   const content=node('div');
   search.value=accountQuery;
   const expiry=node('select',undefined,'admin-filter');
   expiry.setAttribute('aria-label','Müddət filtri');
   for(const [value,label] of [['all','Bütün müddətlər'],['week','7 günə bitir'],['month','30 günə bitir'],['unlimited','Müddətsiz'],['expired','Vaxtı bitib']])expiry.add(new Option(label,value));
   expiry.value=accountExpiry[page]||'all';
   const toolbar=node('div',undefined,'admin-list-tools');
   const count=node('small');
   count.setAttribute('role','status');
   toolbar.append(search,expiry,count);
   host.append(toolbar,content);
   const stats=new Map((data.account_stats||[]).map(row=>[row.user_id,row]));
   function drawAccounts(){
    accountQuery=search.value;
    accountExpiry[page]=expiry.value;
    const query=accountQuery.trim().toLocaleLowerCase('az');
    const rows=[];
    for(const user of data.users){
     const membership=data.memberships.find(item=>item.user_id===user.id);
     const company=membership?.company_id;
     const packageInfo=license(company);
     const usage=stats.get(user.id);
     const stopped=!user.enabled||membership?.enabled===false||packageInfo?.enabled===false||data.companies.find(item=>item.id===company)?.enabled===false;
     const expired=usage?.expires_at&&Date.parse(usage.expires_at)<=Date.now();
     if(Boolean(stopped||expired)!==(page==='suspended'))continue;
     const left=usage?.expires_at?Date.parse(usage.expires_at)-Date.now():null;
     if(expiry.value==='expired'&&!(left!==null&&left<=0))continue;
     if(expiry.value==='unlimited'&&(!company||left!==null))continue;
     if(['week','month'].includes(expiry.value)&&!(left>0&&left<=86400000*(expiry.value==='week'?7:30)))continue;
     if(![user.display_name,user.email,companyName(company)].join(' ').toLocaleLowerCase('az').includes(query))continue;
     const who=node('div',user.display_name);
     who.append(node('small',user.email));
     const plan=node('div',companyName(company));
     if(packageInfo)plan.append(node('small',[packageInfo.plan,packageInfo.tier].filter(Boolean).join(' ')));
     const remaining=node('div',company?auraUsage.remaining(usage?.expires_at):'—');
     if(usage?.expires_at)remaining.append(node('small',date(usage.expires_at)));
     const controls=action('İdarə et',()=>manageAccount(user,membership,usage,controls));
     controls.className='admin-manage-button';
     rows.push([who,plan,remaining,auraUsage.generations(usage),stopped?'Dayandırılıb':expired?'Vaxt bitib':'Aktiv',controls]);
    }
    count.textContent=rows.length+' hesab';
    content.replaceChildren(table(['Hesab','Şirkət / paket','Qalan vaxt','Generasiyalar','Vəziyyət','Əməliyyat'],rows));
   }
   search.oninput=expiry.onchange=drawAccounts;
   drawAccounts();
  }
  if(page==='devices')host.append(table(['Cihaz','İstifadəçi / şirkət','Son əlaqə','IP','Vəziyyət','Əməliyyat'],data.devices.map(d=>[d.label,userName(d.user_id)+' / '+companyName(d.company_id),date(d.last_seen),d.last_ip||'—',d.revoked?'Dayandırılıb':'Aktiv',d.revoked?'—':action('Cihazı dayandır',()=>confirmAction('Cihazı dayandır',d.label+' · '+userName(d.user_id),'Bu cihazın Studio-ya girişi bağlanacaq.',()=>auraRequest('admin.deviceRevoke',{device_id:d.id})))])));
  if(page==='events'){
   const filter=node('input',undefined,'admin-filter');filter.placeholder='İstifadəçi, hadisə və ya IP axtar';filter.setAttribute('aria-label','Hadisələri axtar');const tableHost=node('div');host.append(filter,tableHost);const draw=()=>{const q=filter.value.toLocaleLowerCase();const events=data.events.filter(e=>JSON.stringify([e.kind,userName(e.user_id),companyName(e.company_id),e.ip,e.details]).toLocaleLowerCase().includes(q));tableHost.replaceChildren(table(['Hadisə vaxtı','Serverə çatma vaxtı','İstifadəçi / şirkət','Hadisə','IP / məlumat'],events.map(e=>[date(e.occurred_at),date(e.received_at),userName(e.user_id)+' / '+companyName(e.company_id),e.kind,(e.ip||'—')+' · '+JSON.stringify(e.details)])))};filter.oninput=draw;draw();const more=action('Əvvəlki hadisələri göstər',async()=>{const last=data.events.at(-1);if(!last)return;more.disabled=true;try{const result=await auraRequest('admin.events',{before_time:last.received_at,before_id:last.id});const ids=new Set(data.events.map(e=>e.id));data.events.push(...result.events.filter(e=>!ids.has(e.id)));draw();if(result.events.length<500){more.hidden=true;status('Saxlanmış bütün hadisələr yükləndi.')}}catch(e){status(e.message)}finally{more.disabled=false}});more.className='btn light';more.hidden=data.events.length<500;host.append(more,node('p','Hadisələr 500-lük səhifələrlə açılır. Əvvəlki hadisələri düymə ilə yükləyə bilərsiniz. Axtarış açılan qeydlər üzərində işləyir. İnternetsiz hadisənin başvermə və serverə çatma vaxtları ayrıdır.'));
  }
  if(page==='support'){
   auraRequest('admin.support').then(result=>{
    if(page!=='support'||!host.isConnected)return;
    host.replaceChildren(table(['Tarix','E-poçt','Mövzu','Söhbət'],result.requests.map(request=>[
     date(request.created_at),request.email,request.subject,action('Söhbəti aç',()=>openSupportThread(request))
    ])));
   }).catch(error=>status(error.message));
  }
  if(page==='releases'){
   const addRelease=action('Yeni buraxılış yayımla',()=>publishRelease());
   addRelease.className='btn lime';
   host.append(addRelease,node('p','Yeni versiya üçün imzalanmış MSI faylını HTTPS ünvanına yükləyin və SHA-256 dəyərini daxil edin. “Düzəlt” mövcud buraxılışın qeydlərini və quraşdırıcısını açır.'));
   host.append(table(['Versiya','Qeydlər','Quraşdırıcı','Tarix','Əməliyyat'],data.releases.map(r=>[
    r.version,r.notes,r.download_url||'—',date(r.created_at),action('Düzəlt',()=>publishRelease(r))
   ])));
  }
 }
 function confirmAction(title,target,description,handler){
  openDialog(title,[],'Təsdiqlə',handler);
  $('#adminDialog h2').after(node('p',target),node('p',description));
  [...$('#adminDialog form').querySelectorAll('button')].at(-1).focus();
 }
 function closeAdminDialog(returnFocus){
  const dialog=$('#adminDialog');
  dialog.hidden=true;
  dialog.replaceChildren();
  returnFocus?.focus();
 }
 function manageAccount(user,membership,usage,trigger){
  const company=membership?.company_id;
  const plan=license(company);
  const dialog=$('#adminDialog');
  const box=node('div',undefined,'auth-dialog-box admin-dialog-box admin-manage');
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.setAttribute('aria-labelledby','manage-account-title');
  const title=node('h2','Hesabı idarə et');
  title.id='manage-account-title';
  const account=node('p',user.display_name+' · '+user.email,'admin-manage-account');
  const details=node('dl',undefined,'admin-manage-details');
  const bundles=(data.bundles||[]).filter(bundle=>bundle.company_id===company);
  const rigel=bundles.find(bundle=>bundle.user_id===user.id)||bundles.find(bundle=>!bundle.user_id);
  const rigelName=plan?.tier==='trial'?'Aura sınaq Rigeli':rigel
   ? rigel.label+(rigel.user_id?' · Fərdi':' · Şirkət')
   : membership?.requires_rigel_assignment||['pro','plus'].includes(plan?.tier)?'Təyin edilməyib':plan?'Standart Aura Rigel':'—';
  for(const [label,value] of [
   ['Şirkət',companyName(company)],
   ['Paket',plan?[plan.plan,plan.tier].filter(Boolean).join(' '):'—'],
   ['Qalan vaxt',company?auraUsage.remaining(usage?.expires_at):'—'],
   ['Generasiyalar',auraUsage.generations(usage)],
   ['Rigel',rigelName]
  ])details.append(node('dt',label),node('dd',value));
  const choices=node('div',undefined,'admin-manage-options');
  const add=(label,handler)=>{
   const button=action(label,handler);
   button.className='btn light';
   choices.append(button);
  };
  const changeStatus=async (endpoint,payload)=>{
   const buttons=box.querySelectorAll('button');
   buttons.forEach(button=>button.disabled=true);
   error.textContent='';
   try{
    await auraRequest(endpoint,payload);
    closeAdminDialog();
    await refresh(true);
   }catch(failure){
    error.textContent=failure.message;
    buttons.forEach(button=>button.disabled=false);
   }
  };
  if(plan){
   if(!user.is_owner&&plan.tier!=='trial')add('Vaxtı dəyiş',()=>editTime(user,usage));
   add('Şirkət adını dəyiş',()=>openDialog('Şirkət adını dəyiş',[
    {name:'name',label:'Şirkət adı',value:companyName(company)}
   ],'Yadda saxla',payload=>auraRequest('admin.companyName',{company_id:company,name:payload.name})));
   add('Paket və iş yerləri',()=>editLicense(company));
   if(plan.plan!=='solo'){
    add('İşçi əlavə et',()=>createUser(company));
    if(membership.enabled&&user.enabled&&!user.is_owner){
     add(membership.can_manage_team?'Rəhbər səlahiyyətini sil':'Komanda rəhbəri et',()=>changeStatus('admin.teamManager',{user_id:user.id,enabled:!membership.can_manage_team}));
    }
   }
  }
  if(!user.is_owner)add('Giriş e-poçtunu dəyiş',()=>openDialog('Giriş e-poçtunu dəyiş',[
   {name:'email',label:'Yeni giriş e-poçtu',type:'email',max:254,value:user.email}
  ],'Yadda saxla',payload=>auraRequest('admin.userEmail',{user_id:user.id,email:payload.email})));
  if(user.enabled&&!user.is_owner&&membership){
   const teams=data.companies.filter(target=>{
    const pack=license(target.id);
    return target.id!==company&&target.enabled&&pack?.enabled&&['studio','enterprise'].includes(pack.plan)
     &&(!pack.expires_at||Date.parse(pack.expires_at)>Date.now());
   });
   if(teams.length)add('Komandaya köçür',()=>{
    openDialog('Komandaya köçür · '+user.display_name,[
     {name:'company_id',label:'Yeni komanda',options:teams.map(target=>({
      id:target.id,label:target.name+' · '+[license(target.id).plan,license(target.id).tier].filter(Boolean).join(' ')
     }))}
    ],'Köçür',payload=>auraRequest('admin.moveMember',{user_id:user.id,company_id:payload.company_id}));
    $('#adminDialog h2').after(node('p','Giriş məlumatları saxlanılır. Rigel təyinatı, müddət və generasiya limiti yeni komandaya uyğun tətbiq edilir.'));
   });
  }
  add('Bildiriş göndər',()=>openDialog('Bildiriş göndər · '+user.display_name,[
   {name:'title',label:'Başlıq',max:120},{name:'message',label:'Məzmun',multiline:true,max:3000}
  ],'Göndər',async payload=>{
   await auraRequest('admin.notify',{user_id:user.id,...payload});
   status('Bildiriş göndərildi.');
  }));
  if(!user.is_owner)add(user.enabled?'Hesabı dayandır':'Hesabı aktiv et',()=>confirmAction(user.enabled?'Hesabı dayandır':'Hesabı aktiv et',user.display_name+' · '+user.email,user.enabled?'Hesabın Studio-ya girişi dayandırılacaq.':'Hesab yenidən giriş üçün aktivləşdiriləcək.',()=>auraRequest('admin.userStatus',{user_id:user.id,enabled:!user.enabled})));
  const error=node('p','', 'auth-error');
  error.setAttribute('role','alert');
  const footer=node('div',undefined,'sectionFoot');
  const close=action('Ləğv et',()=>closeAdminDialog(trigger));
  close.className='btn light';
  footer.append(close);
  box.append(title,account,details,choices,error,footer);
  dialog.replaceChildren(box);
  dialog.hidden=false;
  (choices.querySelector('button')||close).focus();
 }
 $('#adminDialog').addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('#adminDialog').querySelector('button:disabled'))closeAdminDialog();
 });
 function openDialog(title,fields,submitLabel,handler){const dialog=$('#adminDialog');dialog.innerHTML='<div class="auth-dialog-box admin-dialog-box"><h2></h2><form></form></div>';dialog.querySelector('h2').textContent=title;const form=dialog.querySelector('form');for(const field of fields){const label=node('label',field.label);label.htmlFor='admin-'+field.name;const input=field.options?node('select'):node(field.multiline?'textarea':'input');input.name=field.name;input.id=label.htmlFor;if(field.options)for(const value of field.options){const option=node('option',value);option.value=typeof value==='object'?value.id:value;if(typeof value==='object')option.textContent=value.label;input.append(option)}else{if(!field.multiline)input.type=field.type||'text';if(field.min!==undefined)input.min=field.min;if(field.maxValue!==undefined)input.max=field.maxValue;input.required=field.required!==false;input.readOnly=field.readOnly===true;input.maxLength=field.max||120}if(field.value!==undefined)input.value=field.value;form.append(label,input);
   if(field.lispFile){
    const file=node('input');
    file.type='file';
    file.accept='.lsp';
    file.setAttribute('aria-label','LISP faylı seç');
    file.onchange=async()=>{
     const selected=file.files[0];
     if(!selected)return;
     if(selected.size>100000){status('LISP faylı 100 KB-dan böyükdür.');file.value='';return;}
     try{input.value=await selected.text();}catch{status('LISP faylı oxunmadı.');}
    };
    form.append(file);
   }
  }const planInput=form.elements.namedItem('plan'),tierInput=form.elements.namedItem('tier');
  if(planInput&&tierInput){
   const updateTiers=()=>{
    for(const option of tierInput.options){
     const allowed=option.value==='legacy'||option.value==='pro'
      ||(option.value==='basic'&&planInput.value!=='enterprise')
      ||(option.value==='plus'&&planInput.value==='studio')
      ||(option.value==='trial'&&planInput.value==='solo');
     option.disabled=!allowed;
     option.hidden=!allowed;
    }
    if(tierInput.selectedOptions[0]?.disabled)tierInput.value=planInput.value==='enterprise'?'pro':'basic';
   };
   planInput.addEventListener('change',updateTiers);
   updateTiers();
  }
  const err=node('div','', 'auth-error');err.setAttribute('role','alert');const buttons=node('div',undefined,'sectionFoot'),save=node('button',submitLabel,'btn lime');save.type='submit';const cancel=action('Ləğv et',()=>closeAdminDialog());cancel.className='btn light';buttons.append(save,cancel);form.append(err,buttons);form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{await handler(Object.fromEntries(new FormData(form)),dialog);if(dialog.querySelector('form')===form){dialog.hidden=true;dialog.replaceChildren()}await refresh(true)}catch(e){err.textContent=e.message}finally{save.disabled=false}};dialog.hidden=false}
 function createUser(company_id){
  if(typeof company_id!=='string')company_id=null;
  const fields=[{name:'name',label:'Ad və soyad'},{name:'email',label:'E-poçt',type:'email',max:254}];
  if(company_id)fields.push({name:'team_access',label:'Komandaya giriş',options:[{id:'now',label:'Dərhal aktiv et'},{id:'pending',label:'Komanda rəhbəri aktiv etsin'}]});
  else fields.push({name:'company',label:'Şirkət'},{name:'plan',label:'Paket',options:['solo','studio','enterprise']},{name:'tier',label:'Paket növü',options:['basic','pro','plus','trial']});
  openDialog(company_id?'Şirkətə işçi əlavə et':'Yeni müştəri hesabı',fields,'Hesabı yarat',async(payload,dialog)=>{const result=await auraRequest('admin.createUser',{...payload,company_id,team_pending:payload.team_access==='pending'});dialog.replaceChildren();const box=node('div',undefined,'auth-dialog-box');box.append(node('h2','Hesab yaradıldı.'),node('p',result.email),node('p','Müvəqqəti parol yalnız indi göstərilir. İstifadəçiyə çatdırın; ilk girişdə dəyişmə təklifi görəcək.'),node('code',result.temporary_password,'admin-secret'));const close=action('Bağla',()=>{dialog.hidden=true;dialog.replaceChildren()});close.className='btn lime';box.append(close);dialog.append(box)})}
 function editTime(user,usage){
  openDialog('Vaxtı dəyiş · '+user.display_name,[
   {name:'direction',label:'Əməliyyat',options:[
    {id:'add',label:'Vaxt əlavə et'},
    ...(usage?.expires_at?[{id:'remove',label:'Vaxt azalt'}]:[]),
    {id:'set',label:'Qalan vaxtı günlə təyin et'},{id:'unlimited',label:'Müddətsiz et'}
   ]},
   {name:'days',label:'Gün sayı',type:'number',value:1,min:1,maxValue:3650}
  ],'Yadda saxla',payload=>{
   const days=Number(payload.days);
   if(payload.direction==='unlimited'||payload.direction==='set'){
    const expires_at=payload.direction==='unlimited'?null:new Date(Date.now()+days*86400000).toISOString();
    return auraRequest('admin.setAccountTime',{user_id:user.id,expires_at});
   }
   return auraRequest('admin.accountTime',{user_id:user.id,days:days*(payload.direction==='remove'?-1:1)});
  });
  const form=$('#adminDialog form');
  const direction=form.elements.direction;
  const days=form.elements.days;
  const adjust=()=>{
   days.disabled=direction.value==='unlimited';
   form.querySelector('label[for="admin-days"]').hidden=days.hidden=days.disabled;
  };
  direction.addEventListener('change',adjust);
  adjust();
  if(license(data.memberships.find(m=>m.user_id===user.id)?.company_id)?.expires_at){
   form.before(node('p','Şirkətin bitmə tarixi hesab üçün də qüvvədə qalır.'));
  }
 }
 function editLicense(id){const l=license(id);openDialog('Paket və giriş',[{name:'plan',label:'Paket',options:['solo','studio','enterprise'],value:l.plan},{name:'tier',label:'Paket növü',options:[...(l.tier?[]:['legacy']),'basic','pro','plus','trial'],value:l.tier||'legacy'},{name:'seats',label:'İş yerləri',type:'number',value:l.seats},{name:'enabled',label:'Vəziyyət',options:['Aktiv','Dayandırılıb'],value:l.enabled?'Aktiv':'Dayandırılıb'}],'Yadda saxla',async p=>auraRequest('admin.license',{company_id:id,plan:p.plan,tier:p.tier,seats:Number(p.seats),enabled:p.enabled==='Aktiv'}))}
 function activeTeams(){
  return data.companies.filter(company=>{
   const pack=license(company.id);
   return company.enabled&&pack?.enabled&&['studio','enterprise'].includes(pack.plan)
    &&(!pack.expires_at||Date.parse(pack.expires_at)>Date.now());
  });
 }
 function teamMembers(company){
  return data.memberships.filter(member=>member.company_id===company&&member.enabled)
   .map(member=>data.users.find(user=>user.id===member.user_id)).filter(Boolean);
 }
 function manageTeam(company){
  const dialog=$('#adminDialog');
  const box=node('div',undefined,'auth-dialog-box admin-dialog-box');
  box.setAttribute('role','dialog');
  box.setAttribute('aria-label',company.name);
  const members=teamMembers(company.id);
  box.append(node('h2',company.name),node('p',members.length+' üzv'),
   action('Paket və iş yerləri',()=>editLicense(company.id)),
   action('İşçi əlavə et',()=>createUser(company.id)),
   table(['Üzv','E-poçt','Vəziyyət','Əməliyyat'],members.map(user=>[
    user.display_name,user.email,user.enabled?'Aktiv':'Dayandırılıb',
    action('İdarə et',()=>manageAccount(user,data.memberships.find(member=>member.user_id===user.id),
     (data.account_stats||[]).find(row=>row.user_id===user.id)))
   ])),
   action('Bağla',()=>closeAdminDialog()));
  dialog.replaceChildren(box);dialog.hidden=false;box.querySelector('button').focus();
 }
 function renderRigels(host){
  const libraryKey='aura-rigel-library-v1';
  let library=[];
  try{
   const stored=window.auraRigelLibrary||[];
   if(!Array.isArray(stored))throw Error('Invalid library');
   library=stored;
  }catch{host.append(node('p','Rigel kitabxanası oxunmadı. Saxlanmış məlumatı qorumaq üçün əlavə etmə dayandırılıb.'));return}
  const validItem=item=>typeof item?.label==='string'&&item.label.trim()&&item.label.length<=120
   &&typeof item.source==='string'&&/\(defun\s+c:aura[\s(]/i.test(item.source)&&new TextEncoder().encode(item.source).length<=100000;
  const keyOf=item=>item.label.trim().toLocaleLowerCase('az');
  const save=action('Rigel versiyası əlavə et',()=>openDialog('Rigel versiyası əlavə et',[
   {name:'label',label:'Ad və versiya',max:120},
   {name:'source',label:'Aura üçün uyğunlaşdırılmış LISP kodu',multiline:true,max:100000,lispFile:true}
  ],'Yadda saxla',async payload=>{
   const label=payload.label.trim(),source=payload.source.trim();
   if(!label||! /\(defun\s+c:aura[\s(]/i.test(source)||new TextEncoder().encode(source).length>100000)throw Error('Aura giriş əmri olan uyğunlaşdırılmış LISP seçin.');
   if(library.some(item=>item.label.toLocaleLowerCase('az')===label.toLocaleLowerCase('az')))throw Error('Bu ad və versiya artıq saxlanılıb.');
   await auraRequest('admin.saveRigelLibrary',{label,source});window.auraRigelLibrary=(await auraRequest('admin.rigelLibrary')).items;
   render();
  }));
  save.className='btn lime';
  const tools=node('div',undefined,'admin-list-tools');
  const search=node('input',undefined,'admin-filter');
  search.type='search';search.placeholder='Rigel adı və ya versiya';search.setAttribute('aria-label','Rigel axtar');
  const backup=action('Ehtiyat nüsxəsini saxla',async()=>{
   try{const result=await auraRequest('admin.exportRigelLibrary',{items:library});if(result.saved)status('Ehtiyat faylı endirildi: '+result.name)}
   catch(error){status(error.message)}
  });
  const picker=node('input');
  picker.type='file';picker.accept='.json,application/json';picker.hidden=true;
  picker.onchange=async()=>{
   const file=picker.files[0];
   if(!file)return;
   try{
    if(file.size>5000000)throw Error('Ehtiyat faylı 5 MB-dan böyükdür.');
    const payload=JSON.parse(await file.text());
    if(payload?.format!=='aura-rigel-library-v1'||!Array.isArray(payload.items)||!payload.items.every(validItem))throw Error('Aura Rigel ehtiyat faylını seçin.');
    const merged=new Map(library.map(item=>[keyOf(item),item]));
    const before=merged.size;
    for(const item of payload.items){const key=keyOf(item);if(!merged.has(key))merged.set(key,{label:item.label.trim(),source:item.source});}
    for(const item of merged.values())await auraRequest('admin.saveRigelLibrary',{label:item.label,source:item.source});window.auraRigelLibrary=(await auraRequest('admin.rigelLibrary')).items;
    render();status((merged.size-before)+' versiya əlavə olundu.');
   }catch(error){status(error.message)}
   finally{picker.value=''}
  };
  const restore=action('Ehtiyatdan əlavə et',()=>picker.click());
  backup.className=restore.className='btn light';
  tools.append(save,backup,restore,picker,search);
  const list=node('div');
  host.append(tools,list);
  const assign=(item,individual)=>{
   const companies=data.companies.filter(company=>company.enabled&&license(company.id)?.enabled&&license(company.id)?.tier!=='trial');
   const targets=individual?companies.flatMap(company=>teamMembers(company.id).filter(user=>user.enabled).map(user=>({
    id:user.id,label:company.name+' · '+user.display_name,company:company.id
   }))):companies.map(company=>({id:company.id,label:company.name,company:company.id}));
   if(!targets.length){status('Uyğun təyinat tapılmadı.');return}
   openDialog(item.label,[{name:'target',label:individual?'İstifadəçi':'Şirkət / komanda',options:targets}],'Təyin et',async payload=>{
    const target=targets.find(entry=>entry.id===payload.target);
    const destination={company_id:target.company,user_id:individual?target.id:null};
    await auraRequest(item.builtIn||'admin.rigel',item.builtIn?destination:{...destination,label:item.label,source:item.source});
   });
   $('#adminDialog h2').after(node('p',individual?'Bu hesab üçün fərdi Rigel təyinatı yenilənəcək.':'Şirkət Rigeli yenilənəcək. Üzvlərin fərdi təyinatları üstün qalır.'));
  };
  const draw=()=>{
   const query=search.value.trim().toLocaleLowerCase('az');
   list.replaceChildren(table(['Rigel versiyası','Təyinat'],[
    {label:'Standart Aura Rigel',builtIn:'admin.standardRigel'},
    {label:'Aura Rigel Full 1.0.1',builtIn:'admin.fullRigel'},...library.filter(item=>item.label!=='Aura Rigel Full 1.0.1')
   ].filter(item=>keyOf(item).includes(query)).map(item=>{
   const actions=node('div');
   actions.append(action('Komandaya ver',()=>assign(item,false)),action('Hesaba ver',()=>assign(item,true)));
   return [item.label,actions];
   })));
  };
  search.oninput=draw;draw();
 }
 function openSupportThread(request){
  const dialog=$('#adminDialog');
  const box=node('div',undefined,'auth-dialog-box admin-dialog-box aura-communication-card');
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.setAttribute('aria-label','Dəstək söhbəti');
  const thread=node('div');
  const close=action('Bağla',()=>closeAdminDialog());
  close.className='btn light';
  box.append(node('p',request.email),thread,close);
  dialog.replaceChildren(box);
  dialog.hidden=false;
  auraSupportThread(thread,request.id,true);
  close.focus();
 }
 function publishRelease(release){
  const editing=Boolean(release?.id);
  openDialog(editing?'Buraxılışı düzəlt':'Yeni buraxılış',[
   {name:'version',label:'Versiya',max:40,value:release?.version,readOnly:editing},
   {name:'notes',label:'Nə dəyişib?',multiline:true,max:3000,value:release?.notes},
   {name:'download_url',label:'İmzalanmış MSI · birbaşa HTTPS keçidi',max:2000,value:release?.download_url||'',required:!editing||Boolean(release?.installer_sha256)},
   {name:'installer_sha256',label:'Quraşdırıcının SHA-256 dəyəri',max:64,value:release?.installer_sha256||'',required:!editing||Boolean(release?.installer_sha256)}
  ],editing?'Yadda saxla':'Yayımla',payload=>auraRequest('admin.release',{...payload,release_id:release?.id}));
 }
 const supportButton = document.querySelector('[data-admin-page="releases"]').cloneNode(true);
 supportButton.dataset.adminPage='support';supportButton.textContent='Dəstək';
 document.querySelector('[data-admin-page="releases"]').after(supportButton);
 document.querySelectorAll('[data-admin-page]').forEach(b=>b.onclick=()=>{page=b.dataset.adminPage;render();auraRequest('event.record',{kind:'page_opened',details:{page:'admin/'+page}}).catch(()=>{})});$('#adminRefresh').onclick=()=>refresh(true);$('#adminNewUser').onclick=createUser;$('#adminPassword').onclick=()=>window.auraChangePassword();$('#adminLogout').onclick=async()=>{try{window.auraApplyAuth(await auraRequest('auth.logout'));data=null;closeAdminDialog();$('#adminBody').replaceChildren()}catch(e){status(e.message)}};
 window.addEventListener('aura-auth',e=>{if(e.detail.authenticated&&e.detail.online)refresh();else if(!e.detail.authenticated){data=null;closeAdminDialog();$('#adminBody').replaceChildren()}});
 setInterval(()=>{if(!document.hidden&&window.auraAuthState?.authenticated&&window.auraAuthState?.online)refresh()},300000);
})();
