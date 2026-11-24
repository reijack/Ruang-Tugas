const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const R=require('../dist/reminders.js');
const now=new Date(2026,10,24,8,0),prefs={enabled:true,days:1,time:'07:00'};
const task=(id,date,status='belum',more={})=>({id,title:id,subject:'Matematika',date,status,...more});
const list=[task('late','2026-11-23'),task('today','2026-11-24','proses'),task('tomorrow','2026-11-25'),task('later','2026-11-26'),task('done','2026-11-24','selesai'),task('invalid','2026-02-30'),task('example','2026-11-24','belum',{example:true})];
assert.deepEqual(R.upcoming(list,prefs,now).map(x=>x.task.id),['late','example','today','tomorrow']);
assert.equal(R.upcoming(list,{days:2},now).find(x=>x.task.id==='later').daysLeft,2);
assert.equal(R.upcoming([task('a','2028-03-01')],prefs,new Date(2028,1,29,23,59))[0].daysLeft,1);
assert.equal(R.upcoming([task('dst','2026-03-09')],prefs,new Date(2026,2,8,0,1))[0].daysLeft,1);
assert.equal(R.upcoming([task('next-year','2027-01-01')],prefs,new Date(2026,11,31,23,59))[0].daysLeft,1);
assert.deepEqual(R.normalize({enabled:'true',days:99,time:'25:99'}),{enabled:false,days:1,time:'07:00'});
assert.equal(R.label(0),'Deadline hari ini');assert.equal(R.label(1),'Deadline besok');assert.equal(R.label(-2),'Terlewat 2 hari');
async function run(){
 const claims=new Set(),shown=[];const env={now,permission:'granted',claim:async k=>{if(claims.has(k))return false;claims.add(k);return true},release:async k=>claims.delete(k),show:async(t,body)=>shown.push([t.id,body])};
 assert.equal((await R.dispatch(list,prefs,env)).sent,3);assert.deepEqual(shown.map(x=>x[0]),['late','today','tomorrow']);
 assert.equal((await R.dispatch(list,prefs,env)).sent,0,'No repeated reminder same day');
 env.now=new Date(2026,10,25,8);assert.equal((await R.dispatch([task('today','2026-11-24')],prefs,env)).sent,1,'Remind again next day');
 assert.equal((await R.dispatch(list,{...prefs,enabled:false},env)).sent,0);
 assert.equal((await R.dispatch(list,prefs,{...env,permission:'denied'})).sent,0);
 assert.equal((await R.dispatch(list,prefs,{...env,permission:'default'})).sent,0);
 assert.equal((await R.dispatch(list,prefs,{...env,permission:'unsupported'})).sent,0);
 assert.equal((await R.dispatch(list,prefs,{...env,now:new Date(2026,10,24,6,59)})).sent,0,'Wait until chosen local time');
 let released=false;
 const failed=await R.dispatch([task('fail','2026-11-24')],prefs,{...env,now,claim:async()=>true,show:async()=>{throw Error('OS failure')},release:async()=>{released=true}});
 assert.equal(failed.failed,1);assert(released,'Failed delivery can retry');
 // Subject validation: trim, duplicate case/spacing, empty, length, cap, escaping.
 const context=vm.createContext({console,Blob,atob,crypto:require('node:crypto').webcrypto,Date,URL});
 vm.runInContext(fs.readFileSync('dist/app.js','utf8').replace(/init\(\);\s*$/,''),context);
 const validate=vm.runInContext('subjectValidation',context);
 assert.equal(validate('  Pemrograman   Web  ',[]).name,'Pemrograman Web');
 assert(validate('matematika',[{name:'Matematika'}]).error);assert(validate(' ',[]).error);assert(validate('a'.repeat(41),[]).error);assert(validate('Baru',Array.from({length:40},(_,i)=>({name:String(i)}))).error);
 console.log('PASS: deadline boundaries, local day and time, H-N windows, completed/example exclusions, permissions, deduplication, retries, and subject validation.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
