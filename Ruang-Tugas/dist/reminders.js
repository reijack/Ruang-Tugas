/* Calendar-day deadline reminders. No server or background push subscription. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RuangReminders=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const DEFAULTS={enabled:false,days:1,time:'07:00'};
  function normalize(value={}){
    return {enabled:value?.enabled===true,days:[1,2,3,7].includes(Number(value?.days))?Number(value.days):1,time:/^([01]\d|2[0-3]):[0-5]\d$/.test(value?.time)?value.time:'07:00'};
  }
  function localDate(now){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
  function calendarDay(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;
    const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
    return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?Math.floor(date.getTime()/86400000):NaN;
  }
  function upcoming(tasks,prefs={},now=new Date()){
    const today=calendarDay(localDate(now)),horizon=normalize(prefs).days;
    return tasks.filter(t=>t.status==='belum'||t.status==='proses').map(task=>({task,daysLeft:calendarDay(task.date)-today})).filter(item=>Number.isFinite(item.daysLeft)&&item.daysLeft<=horizon).sort((a,b)=>a.daysLeft-b.daysLeft||String(a.task.title).localeCompare(String(b.task.title),'id-ID'));
  }
  function label(days){return days<0?`Terlewat ${-days} hari`:days===0?'Deadline hari ini':days===1?'Deadline besok':`Deadline ${days} hari lagi`;}
  function key(task,now){return `${task.id}|${task.date}|${localDate(now)}`;}
  async function dispatch(tasks,prefs,env){
    const options=normalize(prefs),now=env.now||new Date(),[hour,minute]=options.time.split(':').map(Number);
    if(!options.enabled||env.permission!=='granted'||now.getHours()*60+now.getMinutes()<hour*60+minute)return {sent:0,failed:0};
    let sent=0,failed=0;
    for(const {task,daysLeft} of upcoming(tasks,options,now)){
      if(task.example)continue;
      const id=key(task,now);if(!await env.claim(id))continue;
      try{await env.show(task,`${label(daysLeft)} · ${task.subject}`,id);sent++;}
      catch(e){failed++;await env.release(id);}
    }
    return {sent,failed};
  }
  return {DEFAULTS,normalize,localDate,calendarDay,upcoming,label,key,dispatch};
});
