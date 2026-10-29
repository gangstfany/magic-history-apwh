const KEY='magic-history:apwh:favorites:v1';
export function favoriteItem(value){
 if(!value||!['study-point','event','chain'].includes(value.kind))return null;
 const out={};
 for(const [key,max] of [['id',140],['title',180],['subtitle',240],['unit',32]]){
  if(typeof value[key]!=='string'||value[key].length>max||/[<>\u0000-\u001f]/.test(value[key]))return null;
  out[key]=value[key];
 }
 if(!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,139}$/.test(out.id)||!out.title)return null;
 return {...out,kind:value.kind};
}
export function createFavoriteStore(storage){
 const read=key=>{try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}};
 const write=(key,value)=>{try{storage?.setItem(key,JSON.stringify(value));}catch{}};
 const imported=new Set();
 const valid=items=>(Array.isArray(items)?items:[]).slice(0,2000).map(favoriteItem).filter(Boolean);
 let items=valid(read(KEY));
 return {
  items:()=>items.slice(),
  sync:next=>{items=valid(next);write(KEY,items);},
  toggle:item=>{const active=items.some(x=>x.id===item.id&&x.kind===item.kind);items=items.filter(x=>x.id!==item.id||x.kind!==item.kind);if(!active)items.push(item);write(KEY,items);return active?'remove':'add';},
  importOnce:origin=>{const key=KEY+':imported:'+origin;if(imported.has(origin)||read(key))return [];imported.add(origin);write(key,true);return items.slice();},
 };
}
export function installFavorites({publish}){
 let storage;try{storage=localStorage;}catch{}
 const store=createFavoriteStore(storage);
 const frame=document.getElementById('worldMapFrame'), panel=document.getElementById('home-events');
 const api=()=>frame?.contentWindow?.__mapFilter;
 const registry=()=>new Map((api()?.getFavoriteItems?.()||[]).map(raw=>{const item=favoriteItem(raw);return item?[item.kind+'|'+item.id,item]:[null,null];}));
 function paint(){
  if(!panel||!api())return;
  const records=registry(), targets=[];
  panel.querySelectorAll('[data-study-event]').forEach(toggle=>targets.push([toggle.closest('article'),records.get('study-point|'+toggle.dataset.studyEvent)]));
  const learning=api().getLearningState?.();
  if(learning?.view==='chain'&&learning.chainId&&learning.chainStep>=0){
   targets.push([panel.querySelector('.rt-top'),records.get('chain|'+learning.chainId+':step:'+learning.chainStep)]);
  }else if(learning?.view==='map'&&learning.mapMode==='events'&&!panel.querySelector('[data-study-event]')){
   const key=api().getTimelineState?.().selectedEventKey;
   targets.push([panel.querySelector('.event-card:not(.is-result)'),records.get('event|'+key)]);
  }
  for(const [target,item] of targets){
   if(!target||!item)continue;
   let button=target.querySelector(':scope > .apwh-favorite');
   if(!button){button=document.createElement('button');button.type='button';button.className='apwh-favorite';target.append(button);}
   const selected=store.items().some(x=>x.id===item.id&&x.kind===item.kind);
   button.dataset.favoriteId=item.id;button.dataset.favoriteKind=item.kind;
   const label=selected?'★ 已收藏':'☆ 收藏';
   if(button.textContent!==label)button.textContent=label;
   if(button.getAttribute('aria-pressed')!==String(selected))button.setAttribute('aria-pressed',String(selected));
   button.setAttribute('aria-label',(selected?'取消收藏 ':'收藏 ')+item.title);
  }
 }
 panel?.addEventListener('click',event=>{
  const button=event.target.closest('.apwh-favorite');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  const item=registry().get(button.dataset.favoriteKind+'|'+button.dataset.favoriteId);if(!item)return;
  publish(store.toggle(item),item);paint();
 },true);
 let scheduled=false;
 const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;paint();});};
 if(panel)new MutationObserver(schedule).observe(panel,{subtree:true,childList:true});
 frame?.addEventListener('load',schedule);
 const style=document.createElement('style');style.textContent='.apwh-favorite{border:1px solid #c7bda9;background:#fffdf6;color:#725420;border-radius:7px;min-height:44px;min-width:44px;padding:7px 11px;cursor:pointer;font:inherit;font-size:12px;margin:5px 8px}.apwh-favorite[aria-pressed="true"]{background:#fff1bd}.apwh-favorite:focus-visible{outline:3px solid #597f8b;outline-offset:2px}';document.head.append(style);
 schedule();
 return {
  getItems:()=>store.items(), importOnce:origin=>store.importOnce(origin),
  onSync:items=>{store.sync(items);schedule();},
  onOpen:async item=>{
   if(!api())await new Promise(resolve=>{const timer=setTimeout(resolve,5000);frame?.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});});
   if(!registry().has(item?.kind+'|'+item?.id))return false;
   const ok=!!api()?.openFavorite(item);
   if(ok){window.dispatchEvent(new Event('apwh-favorite-refresh'));paint();
    const target=item.kind==='study-point'?panel?.querySelector(`[data-study-event="${CSS.escape(item.id)}"]`):panel?.querySelector('.rt-stop.now,.event-card,.apwh-favorite');
    if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:'auto'});}
   }
   return ok;
  }
 };
}
