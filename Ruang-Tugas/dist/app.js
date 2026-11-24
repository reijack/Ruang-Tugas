'use strict';
/* Ruang Tugas — browser-only app. Tasks and image Blobs live in IndexedDB. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const paths={copy:'M9 9h12v12H9z M15 9V3H3v12h6',moon:'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10',sun:'M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',book:'M3 4h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v16h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3z M12 5v16 M6 8h3 M6 11h3 M15 8h3 M15 11h3',grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',checklist:'M9 5h11 M9 12h11 M9 19h11 M3 5l1 1 2-2 M3 12l1 1 2-2 M3 19l1 1 2-2',calendar:'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 M7 2v4 M17 2v4 M3 10h18 M7 14h2 M14 14h2 M7 17h2',layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5','check-circle':'M21 11v1a9 9 0 1 1-5.3-8.2 M9 11l3 3L22 4',settings:'m9 3-1 3-3 1-2 4 2 2v3l4 3 3-1 3 1 4-3v-3l2-2-2-4-3-1-1-3z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M20 2v4 M18 4h4',plus:'M12 5v14 M5 12h14',minus:'M5 12h14',x:'m6 6 12 12 M6 18 18 6',upload:'M12 16V3 M7 8l5-5 5 5 M4 15v5h16v-5',camera:'M8 5l2-3h4l2 3h5v15H3V5z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',search:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',more:'M5 12h.01 M12 12h.01 M19 12h.01',clock:'M12 8v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',image:'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M8 7h.01',list:'M8 5h13 M8 12h13 M8 19h13 M3 5h.01 M3 12h.01 M3 19h.01',bulb:'M9 18v3h6v-3 M8 15a7 7 0 1 1 8 0l-1 3H9z',menu:'M4 6h16 M4 12h16 M4 18h16',rotate:'M3 10a9 9 0 1 1 1 8 M3 4v6h6',alert:'m12 3 10 18H2z M12 9v5 M12 17h.01',download:'M12 3v13 M7 11l5 5 5-5 M3 16v5h18v-5',trash:'M3 6h18 M8 6V3h8v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',edit:'m15 4 5 5 M4 15 16 3l5 5L9 20l-6 1z',chevronLeft:'m15 5-7 7 7 7',chevronRight:'m9 5 7 7-7 7',flag:'M5 21V3 M5 3c5-3 9 3 14 0v10c-5 3-9-3-14 0',folder:'M3 6h7l2 3h9v12H3z',math:'M5 6h5 M7.5 3.5v5 M14 6h5 M5 14l5 5 M5 19l5-5 M14 15h5 M14 18h5',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',flask:'M9 3h6 M10 3v7L4 20h16l-6-10V3 M8 14h8',code:'m8 5-6 7 6 7 M16 5l6 7-6 7 M14 3l-4 18',leaf:'M20 3C3 2 2 13 8 18s14-2 12-15 M5 21l12-14',check:'m5 12 4 4L19 6'};
function icon(n,cls=''){return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}"><path d="${paths[n]||paths.book}"/></svg>`}function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon))}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID();
function dateISO(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
const today=()=>dateISO(), dateFrom=s=>new Date(`${s}T12:00:00`), dayOffset=(n,base=new Date())=>{let d=new Date(base);d.setDate(d.getDate()+n);return dateISO(d)}, formatDate=(s,options={day:'numeric',month:'short'})=>dateFrom(s).toLocaleDateString('id-ID',options);
const DEFAULT_SUBJECTS=[{name:'Matematika',color:'purple',icon:'math'},{name:'Bahasa Indonesia',color:'blue',icon:'book'},{name:'Bahasa Inggris',color:'pink',icon:'globe'},{name:'Fisika',color:'orange',icon:'flask'},{name:'Biologi',color:'green',icon:'leaf'},{name:'Informatika',color:'teal',icon:'code'},{name:'Sejarah',color:'yellow',icon:'clock'},{name:'Lainnya',color:'slate',icon:'folder'}];
const statuses={belum:'Belum',proses:'Dikerjakan',selesai:'Selesai'};
let reminderPrefs={enabled:false,days:1,time:'07:00'},reminderBusy=false,reminderTimer,lastReminderDay='',subjectSaving=false;
let db,tasks=[],photos=new Map(),subjects=DEFAULT_SUBJECTS.map(x=>({...x})),profile={name:'',theme:'light'},page='beranda',tab='aktif',query='',subjectFilter='',sort='date',view='grid',calendarDate=new Date(),agendaDate=today(),editing=null,draftPhotos=[],processing=false,uploadGeneration=0,detailId=null,lightPhotos=[],lightIndex=0,zoom=1,rotation=0,urls=new Map(),toastTimer;
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function openDB(){return new Promise((resolve,reject)=>{let r=indexedDB.open('ruang-tugas',1);r.onupgradeneeded=()=>{let d=r.result;d.createObjectStore('tasks',{keyPath:'id'});d.createObjectStore('photos',{keyPath:'id'});d.createObjectStore('meta',{keyPath:'key'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Tutup tab Ruang Tugas lainnya, lalu muat ulang.'))})}
function request(store,method,...args){return new Promise((resolve,reject)=>{const t=db.transaction(store,'readonly'),r=t.objectStore(store)[method](...args);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function write(stores,fn){return new Promise((resolve,reject)=>{const t=db.transaction(stores,'readwrite');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Penyimpanan dibatalkan'));try{fn(t)}catch(e){t.abort();reject(e)}})}
const setMeta=(key,value)=>write(['meta'],t=>t.objectStore('meta').put({key,value}));
async function refreshData(){tasks=await request('tasks','getAll');const all=await request('photos','getAll');urls.forEach(u=>URL.revokeObjectURL(u));urls.clear();photos=new Map(all.map(p=>[p.id,p]));render();queueReminderCheck()}
function photoURL(p){if(!p)return '';if(!urls.has(p.id))urls.set(p.id,URL.createObjectURL(p.blob));return urls.get(p.id)}
const subjectInfo=name=>subjects.find(s=>s.name===name)||DEFAULT_SUBJECTS.at(-1);
function badge(name){const s=subjectInfo(name);return `<span class="subject-badge subject-${s.color}">${icon(s.icon)}${esc(name)}</span>`}
function statusBadge(s){return `<span class="status ${s}"><span class="status-dot"></span>${statuses[s]}</span>`}
function dueLabel(t){if(t.status==='selesai')return {text:formatDate(t.date),cls:''};const d=t.date===today()?'Hari ini':t.date===dayOffset(1)?'Besok':t.date<today()?'Terlewat':formatDate(t.date);return {text:d,cls:t.date<today()?'late':t.date===today()?'today':''}}
function heading(title,subtitle,button=true){return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${button?`<button class="button primary" data-action="add">${icon('plus')}Tambah tugas</button>`:''}</div>`}
function filteredTasks(){let out=tasks.filter(t=>page==='selesai'?t.status==='selesai':tab==='aktif'?t.status!=='selesai':tab==='selesai'?t.status==='selesai':true);if(subjectFilter)out=out.filter(t=>t.subject===subjectFilter);if(query.trim()){const q=query.toLocaleLowerCase('id-ID');out=out.filter(t=>`${t.title} ${t.notes} ${t.subject}`.toLocaleLowerCase('id-ID').includes(q))}return out.sort((a,b)=>sort==='newest'?b.created-a.created:sort==='priority'?(a.priority===b.priority?a.date.localeCompare(b.date):a.priority==='tinggi'?-1:1):a.date.localeCompare(b.date)||a.created-b.created)}
function card(t){const due=dueLabel(t),pics=t.photoIds.map(id=>photos.get(id)).filter(Boolean);return `<article class="task-card" data-open="${t.id}" tabindex="0" role="button" aria-label="Buka tugas ${esc(t.title)}"><div class="card-top">${badge(t.subject)}<button class="more-button" data-edit="${t.id}" aria-label="Edit ${esc(t.title)}">${icon('more')}</button></div><h3>${esc(t.title)}</h3><p class="task-note">${esc(t.notes||'Belum ada catatan tambahan.')}</p>${pics.length?`<div class="card-attachments">${pics.slice(0,3).map(p=>`<img class="attachment-thumb" src="${photoURL(p)}" alt="${esc(p.caption||'Foto catatan')}" loading="lazy">`).join('')}<span class="attachment-count">${icon('image')}${pics.length} foto</span></div>`:'<div class="card-space"></div>'}<div class="card-footer"><span class="due ${due.cls}">${icon(t.priority==='tinggi'?'flag':'calendar')}${due.text}</span>${statusBadge(t.status)}</div></article>`}
function listControls(){return `<div class="tabs-row"><div class="tabs">${(page==='selesai'?[['selesai','Selesai',tasks.filter(t=>t.status==='selesai').length]]:[['aktif','Aktif',tasks.filter(t=>t.status!=='selesai').length],['semua','Semua',tasks.length],['selesai','Selesai',tasks.filter(t=>t.status==='selesai').length]]).map(([id,label,n])=>`<button class="tab ${tab===id?'active':''}" data-tab="${id}">${label}<span class="tab-count">${n}</span></button>`).join('')}</div><div class="view-switch"><button class="${view==='grid'?'active':''}" data-view="grid" aria-label="Tampilan kartu">${icon('grid')}</button><button class="${view==='list'?'active':''}" data-view="list" aria-label="Tampilan daftar">${icon('list')}</button></div></div><div class="week-copy-toolbar"><button class="button secondary" data-week-copy>${icon('copy')}Salin tugas mingguan</button></div><div class="filters"><label class="search-box"><span class="sr-only">Cari tugas</span>${icon('search')}<input id="search" placeholder="Cari tugasmu di sini…" value="${esc(query)}" autocomplete="off"></label><select id="subject-filter" aria-label="Filter mata pelajaran"><option value="">Semua mapel</option>${subjects.map(s=>`<option ${subjectFilter===s.name?'selected':''}>${esc(s.name)}</option>`).join('')}</select><select id="sort-filter" aria-label="Urutkan tugas"><option value="date" ${sort==='date'?'selected':''}>Deadline terdekat</option><option value="newest" ${sort==='newest'?'selected':''}>Terbaru</option><option value="priority" ${sort==='priority'?'selected':''}>Prioritas penting</option></select></div>`}
function listHTML(){const list=filteredTasks();return list.length?list.map(card).join(''):`<div class="empty-state"><span class="empty-icon">${icon(query||subjectFilter?'search':'check-circle')}</span><h3>${query||subjectFilter?'Tugasnya belum ketemu':page==='selesai'||tab==='selesai'?'Belum ada tugas selesai':'Ruang untuk awal yang baru'}</h3><p>${query||subjectFilter?'Coba kata kunci lain atau ubah filter mapelmu.':page==='selesai'||tab==='selesai'?'Tugas yang kamu selesaikan akan terkumpul di sini.':'Catat tugas pertamamu. Sedikit demi sedikit, pasti beres.'}</p>${query||subjectFilter?'<button class="button secondary" data-action="clear-filter">Reset pencarian</button>':'<button class="button primary" data-action="add">Tambah tugas</button>'}</div>`}
function statsHTML(){const active=tasks.filter(t=>t.status!=='selesai'),due=active.filter(t=>t.date===today()),late=active.filter(t=>t.date<today()),done=tasks.filter(t=>t.status==='selesai');return `<div class="stats-grid">${[['Tugas aktif',active.length,'checklist','',`${active.filter(t=>t.date<=dayOffset(7)).length} perlu diperhatikan minggu ini`],['Deadline hari ini',due.length,'clock','orange',late.length?`${late.length} tugas sudah terlewat`:'Selesaikan sebelum hari berganti'],['Sedang dikerjakan',active.filter(t=>t.status==='proses').length,'edit','blue','Pelan-pelan, terus jalan'],['Tugas selesai',done.length,'check-circle','green','Usahamu mulai terlihat ✨']].map(([title,n,i,c,desc])=>`<div class="stat-card"><div class="stat-top"><span>${title}</span><span class="stat-icon ${c}">${icon(i)}</span></div><div class="stat-value">${String(n).padStart(2,'0')}</div><div class="stat-bottom">${desc}</div></div>`).join('')}</div>`}
function sidebarPanels(){const now=new Date(),monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7));const week=Array.from({length:7},(_,i)=>dayOffset(i,monday));const agenda=tasks.filter(t=>t.date===agendaDate&&t.status!=='selesai').sort((a,b)=>a.title.localeCompare(b.title));const weekStart=week[0],weekEnd=week[6],weekTasks=tasks.filter(t=>t.date>=weekStart&&t.date<=weekEnd),done=weekTasks.filter(t=>t.status==='selesai').length,pct=weekTasks.length?Math.round(done/weekTasks.length*100):0;return `<aside class="dashboard-aside"><div class="right-panel"><div class="section-head"><h3>Minggu ini</h3><span class="calendar-month">${now.toLocaleDateString('id-ID',{month:'short',year:'numeric'})}</span></div><div class="mini-week">${['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d=>`<div class="week-day">${d}</div>`).join('')}${week.map(d=>`<button class="week-num ${d===agendaDate?'active':''} ${tasks.some(t=>t.date===d&&t.status!=='selesai')?'has-tasks':''}" data-agenda="${d}" aria-label="Tugas ${formatDate(d)}">${dateFrom(d).getDate()}</button>`).join('')}</div><div class="agenda-label">${agendaDate===today()?'AGENDA HARI INI':`AGENDA ${formatDate(agendaDate).toUpperCase()}`}</div>${agenda.length?agenda.slice(0,4).map(t=>`<div class="agenda-item" data-open="${t.id}" role="button" tabindex="0"><strong>${esc(t.title)}</strong><span>${esc(t.subject)} · ${statuses[t.status]}</span></div>`).join(''):'<p class="progress-caption">Tidak ada deadline. Waktu yang pas untuk mencicil tugas berikutnya.</p>'}</div><div class="right-panel"><div class="progress-head"><h3>Progres minggu ini</h3><span>${icon('sparkles')}</span></div><div class="progress-value">${pct}% <small>sedikit lagi, kamu bisa!</small></div><div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres tugas minggu ini"><div style="width:${pct}%"></div></div><p class="progress-caption">${done} dari ${weekTasks.length} tugas minggu ini sudah selesai.<br>Setiap progres kecil tetap berarti.</p></div><div class="tip-card">${icon('bulb')}<div><strong>Catat sekarang, tenang nanti.</strong><p>Foto papan tulis sebelum pulang, lampirkan ke tugas. Nggak perlu cari-cari lagi di galeri.</p></div></div></aside>`}
function renderHome(){const name=profile.name?esc(profile.name):'teman belajar';return heading(`Halo, ${name}<span class="heading-wave">👋</span>`,'Yuk, rapikan tugas dan kosongkan pikiranmu.')+`<section class="welcome-banner"><div class="welcome-copy"><span class="eyebrow">SATU RUANG UNTUK SEMUA TUGASMU</span><h2>Tugas tertata.<br>Pikiran lebih <span>lega.</span></h2><p>Simpan tugas, foto catatan, dan deadline di sini.<br>Fokus belajar, sisanya kita rapikan.</p></div><img class="banner-art" src="planner.svg" alt="Ilustrasi buku agenda dengan tugas selesai"></section>`+deadlineBanner()+statsHTML()+`<div class="dashboard-layout"><section><div class="section-head"><div><h2>Tugasmu</h2><p class="section-subtitle">Satu per satu, pasti selesai.</p></div><button class="text-link" data-go="tugas">Lihat semua</button></div>${listControls()}<div id="task-list" class="task-grid ${view}">${listHTML()}</div></section>${sidebarPanels()}</div>`}
function renderTasks(){return heading(page==='selesai'?'Yang sudah kamu tuntaskan ✨':'Semua tugas','Temukan tugas, catatan, dan foto dalam satu tempat.')+listControls()+`<div id="task-list" class="task-grid ${view}">${listHTML()}</div>`}
function renderCalendar(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));const days=Math.ceil((((first.getDay()+6)%7)+new Date(y,m+1,0).getDate())/7)*7;return heading('Kalender tugas','Lihat deadline-mu, atur ritme belajarmu.')+`<div class="section-head"><div class="calendar-toolbar"><button class="icon-button" data-month="-1" aria-label="Bulan sebelumnya">${icon('chevronLeft')}</button><h2>${calendarDate.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</h2><button class="icon-button" data-month="1" aria-label="Bulan berikutnya">${icon('chevronRight')}</button></div><button class="button secondary" data-action="calendar-today">Hari ini</button></div><div class="calendar-card"><div class="calendar-weekdays">${['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(d=>`<div>${d}</div>`).join('')}</div><div class="calendar-grid">${Array.from({length:days},(_,i)=>{const d=dayOffset(i,start),dt=dateFrom(d),list=tasks.filter(t=>t.date===d);return `<div class="calendar-cell ${dt.getMonth()!==m?'muted':''} ${d===today()?'today':''}"><button class="day-label" data-add-date="${d}" aria-label="Tambah tugas ${formatDate(d)}">${dt.getDate()}</button>${list.map(t=>`<button class="calendar-task subject-${subjectInfo(t.subject).color}" data-open="${t.id}" title="${esc(t.title)}">${t.status==='selesai'?'✓ ':''}${esc(t.title)}</button>`).join('')}</div>`}).join('')}</div></div><div class="calendar-key">Klik tanggal untuk menambah tugas. Klik tugas untuk melihat catatannya.</div>`}
function renderSubjects(){return heading('Mata pelajaran','Semua tugas dan catatan, dikelompokkan sesuai mapelnya.',false).replace('</div></div>','</div><button class="button primary" data-action="add-subject">'+icon('plus')+'Tambah mapel</button></div>')+`<div class="subject-grid">${subjects.map(s=>{const items=tasks.filter(t=>t.subject===s.name),done=items.filter(t=>t.status==='selesai').length;return `<button class="subject-card" data-subject="${esc(s.name)}"><span class="subject-badge subject-${s.color}">${icon(s.icon)}</span><h3>${esc(s.name)}</h3><p>${items.length} tugas · ${items.length-done} masih aktif</p><div class="progress-track"><div style="width:${items.length?Math.round(done/items.length*100):0}%"></div></div><span class="progress-caption">${done} tugas selesai</span></button>`}).join('')}</div><p class="section-subtitle mt-6">Mapel yang kamu tambahkan langsung tersedia di form tugas dan filter.</p>`}
function renderSettings(){const bytes=[...photos.values()].reduce((n,p)=>n+p.blob.size,0);return heading('Bikin ruangmu nyaman','Atur tampilan dan jaga salinan catatanmu.',false)+`<div class="settings-grid">${reminderSettingsHTML()}<section class="settings-card"><h3>Cadangan tugas & foto</h3><p>Unduh semua tugas beserta foto sebagai JSON. Impor kembali saat pindah browser atau perangkat. Data cadangan akan digabung berdasarkan ID tugas.</p><div class="settings-actions"><button class="button primary" data-action="export">${icon('download')}Ekspor cadangan</button><button class="button secondary" data-action="import">${icon('upload')}Impor JSON</button></div></section><section class="settings-card"><h3>Ruang pribadi di perangkatmu</h3><p>Tugas tersimpan di browser ini melalui IndexedDB. Perangkat lain memiliki data terpisah. Menghapus data browser juga menghapus tugas; simpan cadangan secara berkala.</p><div class="storage-details"><span>Tugas tersimpan</span><strong>${tasks.length}</strong></div><div class="storage-details"><span>Foto tersimpan</span><strong>${photos.size}</strong></div><div class="storage-details"><span>Ukuran foto</span><strong>${sizeLabel(bytes)}</strong></div></section><section class="settings-card"><h3>Tampilan & profil</h3><p>Pilih suasana yang paling nyaman untuk belajar.</p><div class="settings-actions"><select id="theme-select" aria-label="Tema tampilan"><option value="light" ${profile.theme==='light'?'selected':''}>Terang</option><option value="dark" ${profile.theme==='dark'?'selected':''}>Gelap</option></select><button class="button secondary" data-action="profile">${icon('edit')}Ubah profil</button></div></section><section class="settings-card"><h3>Tambah mata pelajaran</h3><p>Buat ruang untuk mapel sekolahmu sendiri.</p><form id="subject-form" class="flex gap-2"><label class="sr-only" for="new-subject">Nama mata pelajaran</label><input id="new-subject" placeholder="Nama mapel" maxlength="40" required><button class="button primary">Tambah</button></form><p class="section-subtitle mt-3">${subjects.length} mata pelajaran tersedia.</p></section></div>`}
function render(){const titles={beranda:'Beranda',tugas:'Semua tugas',kalender:'Kalender',mapel:'Mata pelajaran',selesai:'Tugas selesai',pengaturan:'Pengaturan & cadangan'};$('#breadcrumb-current').textContent=titles[page];$$('[data-page]').forEach(n=>{n.classList.toggle('active',n.dataset.page===page);if(n.dataset.page===page)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current')});$('#nav-count').textContent=tasks.filter(t=>t.status!=='selesai').length;showAvatar($('#profile-btn'),profile.photo,profile.name);$('#main').innerHTML=page==='beranda'?renderHome():page==='kalender'?renderCalendar():page==='mapel'?renderSubjects():page==='pengaturan'?renderSettings():renderTasks();updateReminderUI();}
const pageOrder=['beranda','tugas','kalender','mapel','selesai','pengaturan'];
function setMenuOpen(open){
  $('#sidebar').classList.toggle('open',open);
  $('#menu-toggle').setAttribute('aria-expanded',String(open));
}
function navigate(next,filter=''){
  if(!pageOrder.includes(next))next='beranda';
  const direction=Math.sign(pageOrder.indexOf(next)-pageOrder.indexOf(page));
  page=next;
  tab=next==='selesai'?'selesai':'aktif';
  query='';
  subjectFilter=filter;
  history.replaceState(null,'',`#${page}`);
  setMenuOpen(false);
  render();
  window.scrollTo({top:0,behavior:'instant'});
  if(direction)$('#main').dispatchEvent(new CustomEvent('ruang-tugas:page-entry',{bubbles:true,detail:{direction}}));
}

async function openForm(id=null,chosenDate=null){editing=id;uploadGeneration++;draftPhotos=[];processing=false;$('#task-form').reset();$('#form-error').textContent='';$('#upload-status').textContent='';$('#save-task').disabled=false;$('#save-task').textContent='Simpan tugas';$('#task-subject').innerHTML=subjects.map(s=>`<option>${esc(s.name)}</option>`).join('');const t=tasks.find(t=>t.id===id);$('#form-title').textContent=t?'Edit tugas':'Tambah tugas';$('#task-title').value=t?.title||'';$('#task-subject').value=t?.subject||subjectFilter||subjects[0].name;$('#task-date').value=t?.date||chosenDate||today();$('#task-time').value=t?.time||'';$('#task-status').value=t?.status||'belum';$('#task-priority').value=t?.priority||'normal';$('#task-notes').value=t?.notes||'';draftPhotos=(t?.photoIds||[]).map(id=>({...photos.get(id)})).filter(p=>p.blob);renderDraftPhotos();$('#task-dialog').showModal();setTimeout(()=>$('#task-title').focus(),30)}
function renderDraftPhotos(){$('#photo-previews').innerHTML=draftPhotos.map(p=>`<div class="preview-card"><img src="${photoURL(p)}" alt="Pratinjau foto"><button type="button" class="remove-photo" data-remove-photo="${p.id}" aria-label="Hapus foto">${icon('x')}</button><input value="${esc(p.caption)}" data-caption="${p.id}" maxlength="160" placeholder="Keterangan foto" aria-label="Keterangan foto"><small>${sizeLabel(p.blob.size)}${p.originalSize?' · dari '+sizeLabel(p.originalSize):''}</small></div>`).join('')}
function sizeLabel(n){return n<1024?`${n} B`:n<1048576?`${Math.round(n/1024)} KB`:`${(n/1048576).toFixed(1)} MB`}
async function compressImage(file,maxSide=1600){if(file.size>20*1024*1024)throw new Error('Satu foto maksimal 20 MB.');if(!['image/jpeg','image/png','image/webp','image/svg+xml'].includes(file.type))throw new Error('Gunakan foto JPG, PNG, atau WebP.');const u=URL.createObjectURL(file);try{const image=await new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Foto tidak dapat dibaca. Gunakan JPG, PNG, atau WebP.'));im.src=u});if(image.naturalWidth*image.naturalHeight>60000000)throw new Error('Resolusi foto terlalu besar. Pilih foto yang lebih kecil.');const ratio=Math.min(1,maxSide/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*ratio);canvas.height=Math.round(image.naturalHeight*ratio);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kompresi foto gagal.')),'image/webp',.82))}finally{URL.revokeObjectURL(u)}}
async function addPhotos(files){if(processing){notify('Tunggu proses foto sebelumnya selesai.');return}const selected=[...files];if(!selected.length)return;const gen=uploadGeneration;processing=true;$('#save-task').disabled=true;$('#form-error').textContent='';try{for(let i=0;i<selected.length;i++){if(gen!==uploadGeneration)return;if(draftPhotos.length>=12){notify('Maksimal 12 foto dalam satu tugas.');break}$('#upload-status').textContent=`Merapikan foto ${i+1} dari ${selected.length}…`;const f=selected[i];if(!['image/jpeg','image/png','image/webp'].includes(f.type)){notify(`${f.name}: gunakan JPG, PNG, atau WebP.`);continue}try{const blob=await compressImage(f);if(gen!==uploadGeneration)return;draftPhotos.push({id:uid(),blob,caption:'',originalSize:f.size});renderDraftPhotos()}catch(e){notify(e.message)}}}finally{if(gen===uploadGeneration){processing=false;$('#save-task').disabled=false;$('#upload-status').textContent=draftPhotos.length?`${draftPhotos.length} foto siap · ${sizeLabel(draftPhotos.reduce((n,p)=>n+p.blob.size,0))} setelah kompresi`:'';$('#photo-input').value='';$('#camera-input').value=''}}}
async function saveTask(e){e.preventDefault();if(processing)return;const title=$('#task-title').value.trim(),date=$('#task-date').value;if(!title){$('#form-error').textContent='Isi judul tugas terlebih dahulu.';return}if(!validDate(date)){$('#form-error').textContent='Pilih tanggal yang valid.';return}const old=tasks.find(t=>t.id===editing),id=editing||uid(),t={id,title,subject:$('#task-subject').value,date,time:$('#task-time').value,status:$('#task-status').value,priority:$('#task-priority').value,notes:$('#task-notes').value.trim(),photoIds:draftPhotos.map(p=>p.id),created:old?.created||Date.now(),updated:Date.now(),example:false};$('#save-task').disabled=true;try{await write(['tasks','photos'],tx=>{tx.objectStore('tasks').put(t);draftPhotos.forEach(p=>tx.objectStore('photos').put({...p,taskId:id}));(old?.photoIds||[]).filter(id=>!t.photoIds.includes(id)).forEach(id=>tx.objectStore('photos').delete(id))});$('#task-dialog').close();await refreshData();notify(old?'Perubahan tugas tersimpan.':'Tugas baru sudah masuk ke ruangmu.')}catch(e){$('#form-error').textContent='Tugas belum tersimpan. Ruang penyimpanan mungkin penuh. Ekspor cadangan dan coba lagi.'}finally{$('#save-task').disabled=false}}
function openDetail(id){const t=tasks.find(t=>t.id===id);if(!t)return;detailId=id;const pics=t.photoIds.map(id=>photos.get(id)).filter(Boolean),due=dueLabel(t);$('#detail-content').innerHTML=`<div class="dialog-head"><span class="eyebrow">SEMUA CATATANNYA ADA DI SINI</span><button class="icon-button" data-close="detail-dialog" aria-label="Tutup detail">${icon('x')}</button></div><div class="detail-body">${badge(t.subject)}<h2 class="detail-title">${esc(t.title)}</h2><div class="detail-meta"><span>${icon('calendar')}${formatDate(t.date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${t.time?', pukul '+esc(t.time):''}</span>${statusBadge(t.status)}${t.priority==='tinggi'?`<span>${icon('flag')}Penting</span>`:''}${due.cls?`<span class="due ${due.cls}">${due.text}</span>`:''}</div><div class="detail-notes">${esc(t.notes||'Belum ada catatan tambahan untuk tugas ini.')}</div><h3>Foto soal & catatan <span class="section-subtitle">(${pics.length})</span></h3>${pics.length?`<div class="detail-photos">${pics.map((p,i)=>`<button class="detail-photo" data-photo-index="${i}"><img src="${photoURL(p)}" alt="${esc(p.caption||'Lampiran '+(i+1))}"><span>${esc(p.caption||'Foto '+(i+1))} · Klik untuk perbesar</span></button>`).join('')}</div>`:'<p class="section-subtitle mt-3">Belum ada foto. Tambahkan lewat Edit tugas.</p>'}<p class="copy-feedback" id="copy-feedback" role="status" aria-live="polite" hidden></p></div><div class="detail-footer"><button class="button danger" data-delete="${id}">${icon('trash')}Hapus</button><div class="detail-actions"><button class="button secondary" data-copy-task="${id}" title="Salin judul, catatan, dan deadline">${icon('copy')}Salin tugas</button><button class="button secondary" data-week-copy="${id}">Salin mingguan</button><button class="button secondary" data-detail-edit="${id}">${icon('edit')}Edit tugas</button><button class="button primary" data-complete="${id}">${icon(t.status==='selesai'?'rotate':'check')}${t.status==='selesai'?'Buka kembali':'Tandai selesai'}</button></div></div>`;if(!$('#detail-dialog').open)$('#detail-dialog').showModal()}
function openLightbox(index){const t=tasks.find(t=>t.id===detailId);lightPhotos=t.photoIds.map(id=>photos.get(id)).filter(Boolean);lightIndex=index;updateLightbox();$('#lightbox').showModal()}
function updateLightbox(){const p=lightPhotos[lightIndex];if(!p)return;zoom=1;rotation=0;$('#lightbox-image').src=photoURL(p);$('#lightbox-image').alt=p.caption||'Foto lampiran tugas';$('#lightbox-caption').textContent=p.caption||'Foto lampiran';$('#photo-counter').textContent=`${lightIndex+1} / ${lightPhotos.length}`;$('#prev-photo').disabled=lightIndex===0;$('#next-photo').disabled=lightIndex===lightPhotos.length-1;transformImage()}
function transformImage(){$('#lightbox-image').style.transform=`scale(${zoom}) rotate(${rotation}deg)`}
function confirmAction(title,text,button='Hapus'){return new Promise(resolve=>{const d=$('#confirm-dialog');$('#confirm-title').textContent=title;$('#confirm-text').textContent=text;$('#confirm-ok').textContent=button;const done=v=>{d.close();$('#confirm-ok').onclick=null;$('#confirm-cancel').onclick=null;d.removeEventListener('cancel',cancel);resolve(v)},cancel=e=>{e.preventDefault();done(false)};$('#confirm-ok').onclick=()=>done(true);$('#confirm-cancel').onclick=()=>done(false);d.addEventListener('cancel',cancel);d.showModal()})}
async function deleteTasks(ids){const selected=tasks.filter(t=>ids.includes(t.id));await write(['tasks','photos'],tx=>selected.forEach(t=>{tx.objectStore('tasks').delete(t.id);t.photoIds.forEach(id=>tx.objectStore('photos').delete(id))}));await refreshData()}
async function toggleComplete(id){const old=tasks.find(t=>t.id===id);if(!old)return;const t={...old,status:old.status==='selesai'?'belum':'selesai',updated:Date.now()};await write(['tasks'],tx=>tx.objectStore('tasks').put(t));$('#detail-dialog').close();await refreshData();notify(t.status==='selesai'?'Satu tugas beres. Kerja bagus! ✨':'Tugas dibuka kembali.')}
function blobToData(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Gagal membaca foto'));r.readAsDataURL(blob)})}
async function exportBackup(){notify('Menyiapkan cadangan tugas dan foto…');const data={app:'ruang-tugas',version:1,exportedAt:new Date().toISOString(),subjects,profile,tasks,photos:await Promise.all([...photos.values()].map(async p=>({id:p.id,taskId:p.taskId,caption:p.caption,data:await blobToData(p.blob)})))};const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`ruang-tugas-cadangan-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);notify('Cadangan berhasil diunduh. Simpan di tempat yang mudah dicari.')}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(dateFrom(s).getTime())&&dateISO(dateFrom(s))===s}
function validateBackup(data){if(!data||data.app!=='ruang-tugas'||data.version!==1||!Array.isArray(data.tasks)||!Array.isArray(data.photos)||data.tasks.length>2000||data.photos.length>10000)throw new Error('Ini bukan cadangan Ruang Tugas yang didukung.');const ids=new Set(),photoIds=new Set();for(const t of data.tasks){if(typeof t.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(t.id)||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>140||typeof t.subject!=='string'||!t.subject.trim()||t.subject.length>40||!validDate(t.date)||!Object.hasOwn(statuses,t.status)||typeof t.notes!=='string'||t.notes.length>10000||!Array.isArray(t.photoIds)||t.photoIds.length>12||t.photoIds.some(x=>typeof x!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(x))||!Number.isFinite(t.created))throw new Error('Data tugas dalam cadangan tidak valid.');ids.add(t.id)}let total=0;const cleanPhotos=data.photos.map(p=>{if(typeof p.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(p.id)||photoIds.has(p.id)||!ids.has(p.taskId)||typeof p.data!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(p.data)||p.data.length>5*1024*1024)throw new Error('Data foto dalam cadangan tidak valid.');photoIds.add(p.id);const raw=atob(p.data.split(',')[1]);total+=raw.length;if(total>40*1024*1024)throw new Error('Total foto maksimal 40 MB per impor.');return {id:p.id,taskId:p.taskId,caption:String(p.caption||'').slice(0,160),blob:new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))],{type:p.data.slice(5,p.data.indexOf(';'))})}});const byId=new Map(cleanPhotos.map(p=>[p.id,p]));for(const t of data.tasks)for(const id of t.photoIds)if(!byId.has(id)||byId.get(id).taskId!==t.id)throw new Error('Ada foto yang hilang atau tidak sesuai tugas.');const cleanTasks=data.tasks.map(t=>({id:t.id,title:t.title.trim(),subject:t.subject,date:t.date,time:RuangTaskCopy.validTime(t.time)?t.time:'',status:t.status,notes:t.notes,priority:t.priority==='tinggi'?'tinggi':'normal',photoIds:t.photoIds,created:t.created,updated:Date.now(),example:t.example===true}));const personal=cleanTasks.filter(task=>!task.example);const personalIds=new Set(personal.map(task=>task.id));return {tasks:personal,photos:cleanPhotos.filter(photo=>personalIds.has(photo.taskId))}}
async function importBackup(file){if(!file)return;try{if(file.size>50*1024*1024)throw new Error('Cadangan maksimal 50 MB.');const d=JSON.parse(await file.text()),clean=validateBackup(d);if(!await confirmAction('Impor cadangan?',`${clean.tasks.length} tugas dan ${clean.photos.length} foto akan digabungkan. Tugas dengan ID yang sama akan diperbarui.`,'Impor sekarang'))return;const nextSubjects=[...subjects];for(const t of clean.tasks)if(!nextSubjects.some(s=>s.name===t.subject)){if(nextSubjects.length>=40)throw new Error('Maksimal 40 mata pelajaran.');nextSubjects.push({name:t.subject,color:'slate',icon:'book'})}const updated=new Map(clean.tasks.map(t=>[t.id,t]));for(const p of clean.photos){const existing=photos.get(p.id);if(existing&&existing.taskId!==p.taskId)throw new Error('ID foto bertabrakan dengan tugas lain. Impor dibatalkan.')}await write(['tasks','photos','meta'],tx=>{tasks.filter(t=>updated.has(t.id)).forEach(t=>t.photoIds.forEach(id=>tx.objectStore('photos').delete(id)));clean.tasks.forEach(t=>tx.objectStore('tasks').put(t));clean.photos.forEach(p=>tx.objectStore('photos').put(p));tx.objectStore('meta').put({key:'subjects',value:nextSubjects})});subjects=nextSubjects;await refreshData();notify(`${clean.tasks.length} tugas berhasil diimpor.`)}catch(e){notify(e instanceof SyntaxError?'File JSON tidak dapat dibaca. Pilih cadangan Ruang Tugas.':e.message)}finally{$('#import-input').value=''}}
async function clearLegacyExamples(){
  await write(['tasks','photos','meta'],tx=>{
    const meta=tx.objectStore('meta');
    const migrated=meta.get('examplesRemoved');
    migrated.onsuccess=()=>{
      if(migrated.result)return;
      const examples=new Set();
      const scan=tx.objectStore('tasks').openCursor();
      scan.onsuccess=()=>{
        const task=scan.result;
        if(task){
          if(task.value.example===true){
            examples.add(task.primaryKey);
            task.delete();
          }
          task.continue();
          return;
        }
        if(examples.size){
          const pictures=tx.objectStore('photos').openCursor();
          pictures.onsuccess=()=>{
            const photo=pictures.result;
            if(!photo)return;
            if(examples.has(photo.value.taskId))photo.delete();
            photo.continue();
          };
        }
        meta.put({key:'examplesRemoved',value:true});
        meta.put({key:'initialized',value:true});
      };
    };
  });
}
let draftAvatar;
function showAvatar(element,photo,name){
  if(photo){
    const img=document.createElement('img');
    img.alt='';
    img.src=photo;
    element.replaceChildren(img);
  }else{
    element.textContent=(name||'Pelajar').slice(0,1).toUpperCase();
  }
}
function openProfile(){
  $('#profile-form').reset();
  $('#profile-name').value=profile.name;
  $('#profile-name').required=Boolean(profile.name);
  draftAvatar=profile.photo;
  showAvatar($('#profile-preview'),draftAvatar,profile.name);
  $('#profile-error').textContent='';
  $('#profile-save').disabled=false;
  $('#profile-dialog').showModal();
}
async function chooseAvatar(event){
  const input=event.target,file=input.files[0];
  if(!file)return;
  const save=$('#profile-save'),error=$('#profile-error');
  save.disabled=true;
  error.textContent='';
  try{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Gunakan foto JPG, PNG, atau WebP.');
    const photo=await blobToData(await compressImage(file,320));
    if(file!==input.files[0])return;
    draftAvatar=photo;
    showAvatar($('#profile-preview'),photo,$('#profile-name').value);
  }catch(err){
    if(file===input.files[0])error.textContent=err.message;
  }finally{
    if(file===input.files[0]){
      input.value='';
      save.disabled=false;
    }
  }
}
async function handleClick(e){const b=e.target.closest('button,[data-open]');if(!b)return;try{if(b.dataset.close){$('#'+b.dataset.close).close();return}if(b.dataset.page){navigate(b.dataset.page);return}if(b.dataset.go){navigate(b.dataset.go);return}if(b.dataset.edit){openForm(b.dataset.edit);return}if(b.dataset.detailEdit){$('#detail-dialog').close();openForm(b.dataset.detailEdit);return}if(b.dataset.delete){if(await confirmAction('Hapus tugas ini?','Tugas beserta semua fotonya akan dihapus dari perangkat ini.')){$('#detail-dialog').close();await deleteTasks([b.dataset.delete]);notify('Tugas sudah dihapus.')}return}if(b.hasAttribute('data-week-copy')){openWeekCopy(tasks.find(t=>t.id===b.dataset.weekCopy)?.date||today());return}if(b.dataset.copyTask){await copyTaskText(b.dataset.copyTask,b);return}if(b.dataset.complete){await toggleComplete(b.dataset.complete);return}if(b.dataset.photoIndex!==undefined){openLightbox(Number(b.dataset.photoIndex));return}if(b.dataset.open){if($('#reminders-dialog').open)$('#reminders-dialog').close();openDetail(b.dataset.open);return}if(b.dataset.tab){tab=b.dataset.tab;render();return}if(b.dataset.view){view=b.dataset.view;render();return}if(b.dataset.subject){navigate('tugas',b.dataset.subject);tab='semua';render();return}if(b.dataset.agenda){agendaDate=b.dataset.agenda;render();return}if(b.dataset.month){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+Number(b.dataset.month),1);render();return}if(b.dataset.addDate){openForm(null,b.dataset.addDate);return}if(b.dataset.removePhoto){draftPhotos=draftPhotos.filter(p=>p.id!==b.dataset.removePhoto);renderDraftPhotos();return}const a=b.dataset.action;if(a==='toggle-theme')await setTheme(profile.theme==='dark'?'light':'dark');if(a==='add')openForm();if(a==='add-subject')openSubjectDialog();if(a==='reminders')openReminders();if(a==='reminder-settings'){if($('#reminders-dialog').open)$('#reminders-dialog').close();navigate('pengaturan')}if(a==='enable-reminders')await enableReminders();if(a==='disable-reminders')await disableReminders();if(a==='test-reminder')await testReminder();if(a==='clear-filter'){query='';subjectFilter='';render()}if(a==='calendar-today'){calendarDate=new Date();render()}if(a==='export')await exportBackup();if(a==='import')$('#import-input').click();if(a==='profile')openProfile()}catch(e){console.error(e);notify('Belum berhasil. Coba sekali lagi.')}}
const bookTurnFrames=['book-turn-1.svg','book-turn-2.svg','book-turn-3.svg','book-turn-4.svg'];
let bookTurnTimer;
function turnBookPage(event){
  if(event.pointerType!=='mouse' || event.button!==0 || !event.isPrimary)return;
  if(!window.matchMedia('(any-pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
  if(event.target.closest('input, textarea, [contenteditable], :disabled'))return;
  clearTimeout(bookTurnTimer);
  const style=document.documentElement.style;
  let frame=0;
  function advance(){
    if(frame===bookTurnFrames.length){
      style.removeProperty('--book-cursor');
      return;
    }
    style.setProperty('--book-cursor','url("./'+bookTurnFrames[frame]+'") 2 3');
    frame++;
    bookTurnTimer=setTimeout(advance,[65,90,85,110][frame-1]);
  }
  advance();
}
function bindEvents(){
  if(window.matchMedia('(any-pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
    bookTurnFrames.forEach(src=>{const image=new Image();image.src=src});
  }
  document.addEventListener('pointerdown',turnBookPage,{passive:true,capture:true});
  document.addEventListener('click',handleClick);
  const menuToggle=$('#menu-toggle');
  menuToggle.onclick=()=>setMenuOpen(!$('#sidebar').classList.contains('open'));
  document.addEventListener('click',event=>{
    if($('#sidebar').classList.contains('open')&&!event.target.closest('#sidebar,#menu-toggle'))setMenuOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&$('#sidebar').classList.contains('open')&&!$('dialog[open]')){
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  $('#profile-btn').onclick=openProfile;$('#week-start').oninput=()=>updateWeekCopy(true);$('#week-end').oninput=()=>updateWeekCopy(false);$('#week-form').onsubmit=copyWeek;$('#copy-select-all').onclick=()=>{$('#copy-text').focus();$('#copy-text').select()};document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-open]')&&!e.target.matches('button')){e.preventDefault();openDetail(e.target.dataset.open)}if($('#lightbox').open){if(e.key==='ArrowRight'&&lightIndex<lightPhotos.length-1){lightIndex++;updateLightbox()}if(e.key==='ArrowLeft'&&lightIndex>0){lightIndex--;updateLightbox()}}});document.addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value;$('#task-list').innerHTML=listHTML()}if(e.target.dataset.caption){const p=draftPhotos.find(p=>p.id===e.target.dataset.caption);if(p)p.caption=e.target.value}});document.addEventListener('change',async e=>{try{if(e.target.id==='subject-filter'){subjectFilter=e.target.value;$('#task-list').innerHTML=listHTML()}if(e.target.id==='sort-filter'){sort=e.target.value;$('#task-list').innerHTML=listHTML()}if(e.target.id==='theme-select'){await setTheme(e.target.value)}}catch{notify('Pengaturan belum tersimpan. Coba lagi.')}});$('#task-form').onsubmit=saveTask;$('#choose-photos').onclick=()=>$('#photo-input').click();$('#take-photo').onclick=()=>$('#camera-input').click();$('#photo-input').onchange=e=>addPhotos(e.target.files);$('#camera-input').onchange=e=>addPhotos(e.target.files);const dz=$('#dropzone');['dragenter','dragover'].forEach(type=>dz.addEventListener(type,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(type=>dz.addEventListener(type,e=>{e.preventDefault();dz.classList.remove('drag');if(type==='drop')addPhotos(e.dataTransfer.files)}));$('#zoom-in').onclick=()=>{zoom=Math.min(4,zoom+.25);transformImage()};$('#zoom-out').onclick=()=>{zoom=Math.max(.5,zoom-.25);transformImage()};$('#rotate-image').onclick=()=>{rotation+=90;transformImage()};$('#prev-photo').onclick=()=>{if(lightIndex>0){lightIndex--;updateLightbox()}};$('#next-photo').onclick=()=>{if(lightIndex<lightPhotos.length-1){lightIndex++;updateLightbox()}};$('#import-input').onchange=e=>importBackup(e.target.files[0]);$('#profile-photo').onchange=chooseAvatar;$('#profile-form').onsubmit=async e=>{e.preventDefault();const name=$('#profile-name').value.trim();if($('#profile-save').disabled)return;if(!name&&profile.name){$('#profile-error').textContent='Isi nama panggilanmu.';return}try{const next={...profile,name,photo:draftAvatar};await setMeta('profile',next);profile=next;$('#profile-dialog').close();render();notify('Profil tersimpan.')}catch{$('#profile-error').textContent='Profil belum tersimpan. Coba lagi.'}};document.addEventListener('submit',submitSubject);$('#subject-dialog').addEventListener('close',()=>{$('#subject-error').textContent=''});window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));window.addEventListener('focus',()=>{if(!$$('dialog[open]').length)refreshData().catch(()=>{})});}
async function init(){icons();$('#today-label').innerHTML=icon('calendar')+new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});try{db=await openDB();const [storedProfile,storedSubjects,storedReminders]=await Promise.all([request('meta','get','profile'),request('meta','get','subjects'),request('meta','get','reminderPrefs')]);if(storedReminders)reminderPrefs=RuangReminders.normalize(storedReminders.value);if(storedProfile)profile=storedProfile.value;if(storedSubjects)subjects=storedSubjects.value;applyTheme(profile.theme);await clearLegacyExamples();bindEvents();tasks=await request('tasks','getAll');photos=new Map((await request('photos','getAll')).map(p=>[p.id,p]));navigate(location.hash.slice(1)||'beranda');if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});startReminders();const taskLink=new URLSearchParams(location.search).get('task');if(taskLink&&tasks.some(t=>t.id===taskLink))openDetail(taskLink)}catch(e){console.error(e);$('#main').innerHTML='<div class="error-banner"><h2>Penyimpanan belum bisa dibuka.</h2><p>Izinkan penyimpanan situs di pengaturan browser, lalu muat ulang. Coba gunakan mode browser biasa.</p><button class="button secondary mt-4" onclick="location.reload()">Muat ulang</button></div>'}}
function openSubjectDialog(){
  $('#subject-dialog-form').reset();$('#subject-error').textContent='';
  $('#subject-color').value=['purple','blue','pink','orange','green','teal'][subjects.length%6];
  $('#subject-dialog').showModal();$('#subject-name').focus();
}
function subjectValidation(name,list){
  const clean=String(name).trim().replace(/\s+/g,' ');
  if(!clean)return {error:'Isi nama mata pelajaran terlebih dahulu.'};
  if(clean.length>40)return {error:'Nama mata pelajaran maksimal 40 karakter.'};
  if(list.some(s=>s.name.toLocaleLowerCase('id-ID')===clean.toLocaleLowerCase('id-ID')))return {error:'Mata pelajaran itu sudah tersedia.'};
  if(list.length>=40)return {error:'Maksimal 40 mata pelajaran.'};
  return {name:clean};
}
function persistSubject(name,color){
  return new Promise((resolve,reject)=>{
    let next,failure;const tx=db.transaction('meta','readwrite'),store=tx.objectStore('meta'),read=store.get('subjects');
    read.onsuccess=()=>{const current=read.result?.value||subjects,checked=subjectValidation(name,current);if(checked.error){failure=new Error(checked.error);tx.abort();return;}next=[...current,{name:checked.name,color,icon:'book'}];store.put({key:'subjects',value:next});};
    tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(failure||tx.error||new Error('Mapel belum tersimpan. Coba lagi.'));
  });
}
async function submitSubject(e){
  const modal=e.target.id==='subject-dialog-form';if(!modal&&e.target.id!=='subject-form')return;
  e.preventDefault();if(subjectSaving)return;
  const input=modal?$('#subject-name'):$('#new-subject');
  const result=subjectValidation(input.value,subjects);
  if(result.error){if(modal)$('#subject-error').textContent=result.error;else notify(result.error);input.focus();return;}
  subjectSaving=true;const button=e.target.querySelector('button[type="submit"],button:not([type])');if(button)button.disabled=true;
  try{
    const color=modal?$('#subject-color').value:['purple','blue','pink','orange','green','teal'][subjects.length%6];
    const next=await persistSubject(result.name,color);subjects=next;
    if($('#task-dialog').open){$('#task-subject').innerHTML=subjects.map(s=>`<option>${esc(s.name)}</option>`).join('');$('#task-subject').value=result.name;}
    if(modal)$('#subject-dialog').close();render();notify('Mapel '+result.name+' sudah ditambahkan.');
  }catch(error){if(modal)$('#subject-error').textContent=error.message;else notify(error.message||'Mapel belum tersimpan. Coba lagi.');}
  finally{subjectSaving=false;if(button)button.disabled=false;}
}
function notificationPermission(){return typeof Notification==='undefined'||!window.isSecureContext?'unsupported':Notification.permission;}
function currentReminders(list=tasks){return RuangReminders.upcoming(list,reminderPrefs);}
function deadlineBanner(){
  const reminders=currentReminders();
  return `<div id="deadline-banner">${reminders.length?`<section class="deadline-banner" aria-label="Pengingat deadline"><span class="deadline-symbol">${icon('bell')}</span><div><strong>${reminders.length} tugas perlu kamu perhatikan</strong><p>Deadline sampai ${reminderPrefs.days} hari ke depan dan tugas yang terlewat.</p></div><button class="button secondary" data-action="reminders">Lihat pengingat</button></section>`:''}</div>`;
}
function reminderSettingsHTML(){
  const permission=notificationPermission(),active=reminderPrefs.enabled&&permission==='granted';
  const explanation=permission==='unsupported'?'Notifikasi perangkat belum didukung di browser ini. Pengingat di dalam website tetap tersedia.':permission==='denied'?'Izin notifikasi diblokir. Ubah izin notifikasi situs di pengaturan browser jika ingin mengaktifkannya.':active?'Notifikasi perangkat aktif. Tugas yang belum selesai akan diingatkan sekali per hari.':'Aktifkan notifikasi agar browser bisa mengingatkanmu saat tugas mendekati deadline.';
  return `<section class="settings-card reminder-settings" id="reminder-settings"><div class="reminder-settings-title"><span class="stat-icon">${icon('bell')}</span><h3>Notifikasi deadline</h3><span class="notification-state ${active?'enabled':''}">${active?'Aktif':'Belum aktif'}</span></div><p>${explanation}</p><div class="reminder-preferences"><label>Mulai ingatkan<select id="reminder-days"><option value="1" ${reminderPrefs.days===1?'selected':''}>H-1 · 1 hari sebelumnya</option><option value="2" ${reminderPrefs.days===2?'selected':''}>H-2 · 2 hari sebelumnya</option><option value="3" ${reminderPrefs.days===3?'selected':''}>H-3 · 3 hari sebelumnya</option><option value="7" ${reminderPrefs.days===7?'selected':''}>H-7 · 7 hari sebelumnya</option></select></label><label>Jam pengingat<input type="time" id="reminder-time" value="${reminderPrefs.time}" required></label></div><div class="settings-actions">${active?`<button class="button secondary" data-action="disable-reminders">Nonaktifkan</button><button class="button primary" data-action="test-reminder">${icon('bell')}Coba notifikasi</button>`:`<button class="button primary" data-action="enable-reminders" ${permission==='unsupported'||permission==='denied'?'disabled':''}>${icon('bell')}Aktifkan notifikasi</button>`}</div><p class="reminder-limit">Diperiksa setiap menit saat Ruang Tugas terbuka, mulai jam pilihanmu (waktu perangkat). Pengingat ini tidak berjalan setelah website atau browser ditutup.</p></section>`;
}
function reminderListHTML(){
  const reminders=currentReminders();
  return `<div class="reminders-intro"><p>Tugas aktif dengan deadline sampai H-${reminderPrefs.days}, termasuk yang terlewat.</p><button class="text-link" data-action="reminder-settings">Atur notifikasi</button></div><div class="reminder-list">${reminders.length?reminders.map(({task,daysLeft})=>`<button class="reminder-item ${daysLeft<0?'late':''}" data-open="${esc(task.id)}"><span class="reminder-item-icon">${icon(daysLeft<0?'alert':'calendar')}</span><span class="reminder-item-content"><strong>${esc(task.title)}</strong><span>${esc(task.subject)}</span><em>${RuangReminders.label(daysLeft)} · ${formatDate(task.date)}</em></span>${icon('chevronRight')}</button>`).join(''):`<div class="empty-state"><span class="empty-icon">${icon('check-circle')}</span><h3>Belum ada deadline dekat</h3><p>Tugasmu masih punya waktu. Yuk, cicil pelan-pelan.</p></div>`}</div><p class="reminder-footnote">Tugas selesai otomatis tidak masuk pengingat.</p>`;
}
function openReminders(){updateReminderUI();$('#reminders-dialog').showModal();}
function updateReminderUI(){
  const count=currentReminders().length,badge=$('#reminder-count');if(badge){badge.hidden=!count;badge.textContent=count>99?'99+':count;$('#reminder-bell').setAttribute('aria-label',`Buka pengingat deadline, ${count} tugas`);}
  if($('#reminders-dialog')?.open)$('#reminders-content').innerHTML=reminderListHTML();
  else if($('#reminders-content'))$('#reminders-content').innerHTML=reminderListHTML();
  const banner=$('#deadline-banner');if(banner)banner.outerHTML=deadlineBanner();
}
async function saveReminderPrefs(next){const clean=RuangReminders.normalize(next);await setMeta('reminderPrefs',clean);reminderPrefs=clean;updateReminderUI();}
async function enableReminders(){
  let permission=notificationPermission();
  if(permission==='unsupported'){notify('Browser ini belum mendukung notifikasi perangkat.');return;}
  if(permission==='denied'){notify('Izin notifikasi diblokir. Ubah izin situs di pengaturan browser.');return;}
  // The permission prompt is triggered only by this explicit user click.
  if(permission==='default')permission=await Notification.requestPermission();
  if(permission==='granted'){await saveReminderPrefs({...reminderPrefs,enabled:true});render();notify('Notifikasi deadline aktif.');await checkReminders();}
  else{render();notify('Notifikasi belum diizinkan. Pengingat di website tetap tersedia.');}
}
async function disableReminders(){await saveReminderPrefs({...reminderPrefs,enabled:false});render();notify('Notifikasi perangkat dinonaktifkan.');}
async function showDeviceNotification(task,body,tag){
  if(notificationPermission()!=='granted')throw new Error('Izin notifikasi tidak tersedia.');
  const target=new URL('./',location.href);target.searchParams.set('task',task.id);target.hash='tugas';
  const options={body,tag:'ruang-tugas-'+tag,icon:'icon.svg',badge:'icon.svg',data:{url:target.href,taskId:task.id}};
  if('serviceWorker'in navigator){const registration=await navigator.serviceWorker.getRegistration();if(registration?.active){await registration.showNotification(task.title,options);return;}}
  const notification=new Notification(task.title,options);notification.onclick=()=>{window.focus();if(tasks.some(t=>t.id===task.id)){navigate('tugas');openDetail(task.id);}else notify('Tugas ini sudah tidak tersedia.');notification.close();};
}
async function testReminder(){
  if(!reminderPrefs.enabled||notificationPermission()!=='granted'){notify('Aktifkan dan izinkan notifikasi terlebih dahulu.');return;}
  try{await showDeviceNotification({id:'test',title:'Ruang Tugas · Pengingat siap!'},'Notifikasi deadline sudah siap menemani belajarmu.','test');notify('Notifikasi uji sudah dikirim. Jika belum terlihat, cek pengaturan notifikasi perangkat.');}
  catch{notify('Notifikasi belum bisa ditampilkan. Periksa izin situs dan pengaturan perangkat.');}
}
function claimReminder(id){
  // A read/write transaction serializes claims across tabs on this browser.
  return new Promise((resolve,reject)=>{let claimed=false;const tx=db.transaction('meta','readwrite'),store=tx.objectStore('meta'),request=store.get('reminder:'+id);request.onsuccess=()=>{if(!request.result){claimed=true;store.put({key:'reminder:'+id,value:Date.now()});}};tx.oncomplete=()=>resolve(claimed);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Pengingat dibatalkan'));});
}
function releaseReminder(id){return write(['meta'],tx=>tx.objectStore('meta').delete('reminder:'+id));}
function queueReminderCheck(){checkReminders().catch(error=>console.warn('Pengingat belum dapat diperiksa:',error.message));}
async function checkReminders(){
  if(reminderBusy||!db)return;reminderBusy=true;
  try{
    const [latest,storedPrefs]=await Promise.all([request('tasks','getAll'),request('meta','get','reminderPrefs')]);
    if(storedPrefs)reminderPrefs=RuangReminders.normalize(storedPrefs.value);
    const day=today();if(lastReminderDay!==day){lastReminderDay=day;const all=await request('meta','getAll');const old=all.filter(item=>item.key.startsWith('reminder:')&&typeof item.value==='number'&&item.value<Date.now()-14*86400000);if(old.length)await write(['meta'],tx=>old.forEach(item=>tx.objectStore('meta').delete(item.key)));}
    if(!$$('dialog[open]').length){tasks=latest;updateReminderUI();}
    const result=await RuangReminders.dispatch(latest,reminderPrefs,{permission:notificationPermission(),claim:claimReminder,release:releaseReminder,show:showDeviceNotification});
    if(result.failed&&document.visibilityState==='visible')console.warn('Notifikasi perangkat gagal; pengingat di website tetap tersedia.');
  }finally{reminderBusy=false;}
}
function startReminders(){
  queueReminderCheck();reminderTimer=setInterval(queueReminderCheck,60000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queueReminderCheck();});
  document.addEventListener('change',async event=>{
    if(!['reminder-days','reminder-time'].includes(event.target.id))return;
    const target=event.target,days=Number($('#reminder-days').value),time=$('#reminder-time').value;
    if(!time||!target.checkValidity())return;
    try{await saveReminderPrefs({...reminderPrefs,days,time});notify('Waktu pengingat tersimpan.');queueReminderCheck();}
    catch{notify('Pengaturan pengingat belum tersimpan. Coba lagi.');}
  });
  navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='open-task'){const task=tasks.find(t=>t.id===event.data.taskId);if(task){if($('#reminders-dialog').open)$('#reminders-dialog').close();navigate('tugas');openDetail(task.id);}else notify('Tugas ini sudah tidak tersedia.');}});
}


function applyTheme(mode){
  const theme=mode==='dark'?'dark':'light';
  document.documentElement.dataset.theme=theme;
  document.body.classList.toggle('dark',theme==='dark');
  try{localStorage.setItem('ruang-tugas-theme',theme);}catch{}
  const button=$('#theme-toggle');
  if(button){const label=theme==='dark'?'Aktifkan mode terang':'Aktifkan mode gelap';button.innerHTML=icon(theme==='dark'?'sun':'moon');button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(theme==='dark'));}
  const select=$('#theme-select');if(select)select.value=theme;
}
async function setTheme(mode){
  if(!['light','dark'].includes(mode))return;
  const button=$('#theme-toggle');if(button)button.disabled=true;
  try{const next={...profile,theme:mode};await setMeta('profile',next);profile=next;applyTheme(mode);}
  finally{if(button)button.disabled=false;}
}
function openWeekCopy(start){
  $('#week-start').value=start;
  $('#week-end').value=dayOffset(6,dateFrom(start));
  updateWeekCopy(false);
  $('#week-dialog').showModal();
}
function updateWeekCopy(adjustEnd){
  const start=$('#week-start').value,end=$('#week-end');
  end.min=start;
  end.max=validDate(start)?dayOffset(6,dateFrom(start)):'';
  if(adjustEnd && end.max && (!end.value || end.value<start || end.value>end.max))end.value=end.max;
  const valid=validDate(start)&&validDate(end.value)&&end.value>=start&&end.value<=end.max;
  const selected=valid?RuangTaskCopy.tasksInRange(tasks,start,end.value):[];
  $('#week-count').textContent=valid?(selected.length?selected.length+' tugas akan disalin.':'Tidak ada tugas dalam rentang ini.'):'Pilih rentang tanggal yang valid, maksimal 7 hari.';
  $('#week-copy').disabled=!selected.length;
  return selected;
}
async function copyWeek(event){
  event.preventDefault();
  const selected=updateWeekCopy(false);
  if(!selected.length)return;
  const text=selected.map(RuangTaskCopy.formatTask).join('\n\n');
  $('#week-dialog').close();
  if(await copyText(text))notify(selected.length+' tugas tersalin.');
}
async function copyText(text){
  if(await RuangTaskCopy.writeText(text,navigator.clipboard))return true;
  $('#copy-text').value=text;
  $('#copy-dialog').showModal();
  $('#copy-text').focus();
  $('#copy-text').select();
  return false;
}
async function copyTaskText(id,button){
  const task=tasks.find(item=>item.id===id);
  if(!task){notify('Tugas ini sudah tidak tersedia.');return}
  button.disabled=true;
  try{
    if(await copyText(RuangTaskCopy.formatTask(task))){
      const feedback=$('#copy-feedback');
      feedback.hidden=false;
      feedback.textContent='Judul, catatan, dan deadline tersalin.';
    }
  }finally{button.disabled=false}
}

init();
