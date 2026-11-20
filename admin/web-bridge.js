(() => {
 'use strict';
 const endpoint='https://atiyisqbdrtrmpjtwakv.supabase.co/functions/v1/aura-api';
 const key='sb_publishable_JGBfF3dudqe-LDGiLUMgfw_UUAXARcK';
 const storageKey='aura-admin-web-session-v1';
 const listeners=new Set();let session=null,pending=null,profile=null,refreshing=null;
 let device=sessionStorage.getItem('aura-admin-web-device');
 if(!device){device=crypto.randomUUID();sessionStorage.setItem('aura-admin-web-device',device);}
 try{session=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{sessionStorage.removeItem(storageKey);}
 const emit=data=>listeners.forEach(listener=>listener({data}));
 const empty=()=>({authenticated:false,mode:'admin',online:navigator.onLine,pending_events:0});
 function save(tokens){session=tokens;tokens?sessionStorage.setItem(storageKey,JSON.stringify(tokens)):sessionStorage.removeItem(storageKey);}
 function accept(response){
  if(response.session){if(response.mfa_required)pending=response;else save(response.session);}
  if(response.mfa_required)return {...empty(),mfa_required:true};
  if(response.profile){
   if(!response.profile.is_owner){save(null);throw Error('Bu panel yalnız Aura sahibinə açıqdır.');}
   profile=response.profile;pending=null;
  }
  return {...empty(),authenticated:!!profile,profile,license:response.license,package:response.package,release:response.release};
 }
 async function call(action,payload={},noToken=false){
  const tokens=pending?.session||session;
  const headers={'Content-Type':'application/json',apikey:key};
  if(!noToken&&tokens?.access_token)headers.Authorization='Bearer '+tokens.access_token;
  const body={...payload,action,mode:'admin',device_id:device,device_name:'Aura Admin Veb',app_version:'1.0.6'};
  if(action.startsWith('mfa.')||action==='auth.password')body.refresh_token=tokens?.refresh_token;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   const res=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
   const data=await res.json().catch(()=>({error:'Server cavabı oxunmadı.'}));
   if(!res.ok)throw Object.assign(Error(data.error||'Əməliyyat tamamlanmadı.'),{status:res.status});
   return data;
  }catch(error){if(error.name==='AbortError')throw Error('Server cavabı gecikir. Yenidən sınayın.');throw error;}
  finally{clearTimeout(timer);}
 }
 async function refresh(){
  if(!session?.refresh_token)throw Error('Yenidən giriş edin.');
  if(!refreshing)refreshing=call('auth.refresh',{refresh_token:session.refresh_token},true).then(accept).finally(()=>refreshing=null);
  return refreshing;
 }
 async function authorized(action,payload){
  try{return await call(action,payload);}catch(error){
   if(error.status!==401)throw error;
   try{const state=await refresh();if(!state.authenticated){emit({type:'auth.state',state});throw Error('Təsdiq kodunu daxil edin.');}}
   catch(failure){if(failure.status===400||failure.status===401){save(null);profile=null;emit({type:'auth.state',state:empty()});}throw failure;}
   return call(action,payload);
  }
 }
 async function request(action,payload={}){
  if(action==='auth.state')return empty();
  if(action==='auth.login'){profile=null;pending=null;save(null);return accept(await call(action,payload,true));}
  if(action==='auth.logout'){
   try{if(session||pending)await call(action);}catch{/* Local logout must still close the panel when offline. */}
   finally{save(null);pending=null;profile=null;window.auraRigelLibrary=[];}
   return empty();
  }
  if(action==='mfa.verify'){return accept(await call(action,{...payload,factor_id:pending?.factor_id||payload.factor_id}));}
  if(action==='auth.password'||action==='mfa.disable')return accept(await authorized(action,payload));
  if(action==='auth.sync')return accept(await authorized('session.sync',{events:[],check_updates:false}));
  if(action==='event.record'){
   await authorized('session.sync',{events:[{id:crypto.randomUUID(),kind:payload.kind,occurred_at:new Date().toISOString(),details:payload.details||{}}],check_updates:false});return {ok:true};
  }
  if(action==='admin.exportRigelLibrary'){
   const blob=new Blob([JSON.stringify({format:'aura-rigel-library-v1',items:payload.items},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Aura-Rigeller-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   return {saved:true,name:link.download};
  }
  if(action==='admin.standardRigel'||action==='admin.fullRigel')return authorized('admin.builtinRigel',{...payload,builtin:action==='admin.fullRigel'?'full':'standard'});
  const result=await authorized(action,payload);
  if(action==='admin.overview')window.auraRigelLibrary=(await authorized('admin.rigelLibrary',{})).items;
  return result;
 }
 window.chrome=window.chrome||{};
 window.chrome.webview={addEventListener(type,listener){if(type==='message')listeners.add(listener);},postMessage(message){
  if(message.type==='host.ready'){
   Promise.resolve().then(async()=>{
    if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
    let state=empty();try{if(session)state=await refresh();}catch{save(null);}emit({type:'auth.state',state});
   });return;
  }
  if(message.type==='api')request(message.action,message.payload).then(result=>emit({type:'api.result',requestId:message.requestId,ok:true,result})).catch(error=>emit({type:'api.result',requestId:message.requestId,ok:false,error:error.message}));
 }};
 setInterval(async()=>{if(!profile||document.hidden)return;try{emit({type:'auth.state',state:await request('auth.sync')});}catch(error){if([400,401,403].includes(error.status)){save(null);profile=null;emit({type:'auth.state',state:empty()});}}},300000);
})();
