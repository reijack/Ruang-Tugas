/* Shareable plain text: no internal IDs, local Blob URLs, or image bytes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RuangTaskCopy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function clean(value){return String(value??'').replace(/\r\n?/g,'\n').trim();}
  function deadline(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return clean(value)||'Belum ditentukan';
    const date=new Date(value+'T12:00:00');
    return Number.isNaN(date.getTime())?clean(value):date.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  function validTime(value){
    return typeof value==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }
  function formatTask(task){
    const time=validTime(task.time)?', pukul '+task.time:'';
    return [clean(task.title)||'Tugas tanpa judul',
      'Catatan: '+(clean(task.notes)||'Tidak ada catatan.'),
      'Deadline: '+deadline(task.date)+time].join('\n');
  }
  function tasksInRange(tasks,start,end){
    return tasks.filter(task=>task.date>=start && task.date<=end)
      .sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'24:00').localeCompare(b.time||'24:00'));
  }
  async function writeText(text,clipboard){
    if(!clipboard||typeof clipboard.writeText!=='function')return false;
    try{await clipboard.writeText(text);return true;}catch{return false;}
  }
  return {formatTask,tasksInRange,validTime,writeText};
});
