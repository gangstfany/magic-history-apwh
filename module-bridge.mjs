import {installFavorites} from './favorites.mjs';
import {hostOrigin,isMessage,message} from './module-protocol.mjs';
const origin=hostOrigin(new URLSearchParams(location.search).get('hostOrigin'));
const embedded=window.parent!==window&&!!origin;
let sendFavorite=()=>{};
const favorites=installFavorites({publish:(action,item)=>sendFavorite('favorite-change',{action,item})});
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
 sendFavorite=send;
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(publish,70);};
 addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==origin||!isMessage(event.data,'apwh',['init','open-today','favorites-sync','open-favorite']))return;
  if(event.data.type==='init'){authorized=true;lastHeight=0;const imports=favorites.importOnce(origin);if(imports.length)send('favorites-import',{items:imports});favorites.onSync(event.data.favorites||[]);send('ready',{height:Math.ceil(workspace.getBoundingClientRect().height)});publish();return;}
  if(!authorized)return;
  if(event.data.type==='favorites-sync'){favorites.onSync(event.data.items);return;}
  if(event.data.type==='open-favorite'){const item=event.data.item;favorites.onOpen(item).then(ok=>send('favorite-opened',{ok,id:typeof item?.id==='string'?item.id.slice(0,140):'',kind:['study-point','event','chain'].includes(item?.kind)?item.kind:''}));return;}
  if(pick.dataset.sourceId)pick.click();
 });
 new ResizeObserver(schedule).observe(workspace);
 new MutationObserver(schedule).observe(pick,{subtree:true,childList:true,attributes:true});
 document.getElementById('worldMapFrame').addEventListener('load',schedule);
 addEventListener('resize',schedule);
}
