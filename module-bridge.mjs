import {hostOrigin,isMessage,message} from './module-protocol.mjs';
const origin=hostOrigin(new URLSearchParams(location.search).get('hostOrigin'));
const embedded=window.parent!==window&&!!origin;
if(embedded){
 document.body.classList.add('is-module-embedded');
 let authorized=false,lastHeight=0,timer;
 const workspace=document.querySelector('.course-workspace');
 const pick=document.getElementById('todayPick');
 const send=(type,payload)=>{if(authorized)parent.postMessage(message('apwh',type,payload),origin);};
 function pickData(){return {dateLabel:pick.querySelector('.tp-eyebrow')?.textContent||'',year:pick.querySelector('.tp-yr')?.textContent||'',city:pick.querySelector('.tp-city')?.textContent||'',category:pick.querySelector('.tp-cat')?.textContent||'',summary:pick.querySelector('.tp-trig')?.textContent||''};}
 function publish(){
  const height=Math.ceil(workspace.getBoundingClientRect().height);
  if(height>0&&height!==lastHeight){lastHeight=height;send('resize',{height});}
  if(pick.dataset.sourceId)send('today-pick',{pick:pickData()});
 }
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(publish,70);};
 addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==origin||!isMessage(event.data,'apwh',['init','open-today']))return;
  if(event.data.type==='init'){authorized=true;lastHeight=0;send('ready',{height:Math.ceil(workspace.getBoundingClientRect().height)});publish();return;}
  if(authorized&&pick.dataset.sourceId)pick.click();
 });
 new ResizeObserver(schedule).observe(workspace);
 new MutationObserver(schedule).observe(pick,{subtree:true,childList:true,attributes:true});
 document.getElementById('worldMapFrame').addEventListener('load',schedule);
 addEventListener('resize',schedule);
}
