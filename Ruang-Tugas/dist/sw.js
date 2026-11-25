importScripts('./mascot-scene-data.js');
const CACHE='ruang-tugas-v24';
const MASCOT_FRAMES=Object.entries(RuangMascotScenes).flatMap(([id,set])=>set.frames.map(pose=>'./mascots/scenes/'+id+'-'+pose+'.webp'));
const ASSETS=['./','./index.html','./styles.css','./mascots.css','./mascots.js','./mascot-scene-data.js','./mascot-scene.js',...MASCOT_FRAMES,'./mascots/lila.jpg','./mascots/rimba.jpg','./mascots/ambar.jpg','./tailwind.css','./app.js','./animations.js','./task-copy.js','./theme-init.js','./reminders.js','./planner.svg','./icon.svg','./book-cursor.svg','./book-turn-1.svg','./book-turn-2.svg','./book-turn-3.svg','./book-turn-4.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ruang-tugas-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):new Response('Offline',{status:503})))))});

// Clicking a persistent notification opens or focuses this same-origin app.
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const base=new URL(self.registration.scope),requested=new URL(event.notification.data?.url||base.href,base);
    if(requested.origin!==base.origin)return;
    const taskId=event.notification.data?.taskId;
    if(taskId==='test'){requested.search='';requested.hash='pengaturan';}
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){if(new URL(client.url).origin===base.origin){await client.focus();if(taskId&&taskId!=='test')client.postMessage({type:'open-task',taskId});return;}}
    await self.clients.openWindow(requested.href);
  })());
});
