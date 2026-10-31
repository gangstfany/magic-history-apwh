(async()=>{
 'use strict';
 const base=new URL('.',document.currentScript.src),version='u2-compact-chain-v3';
 const [catalogue,chains]=await Promise.all(['catalogue.json','chains.json'].map(file=>fetch(new URL(file+'?v='+version,base),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(file);return r.json();})));
 const model=window.U2_VISUAL_MODEL,frame=document.getElementById('worldMapFrame'),panel=document.getElementById('home-events');
 if(!model||!frame||!panel)return;
 const byId=new Map(chains.map(c=>[c.id,c]));
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('reader.css?v='+version,base);document.head.append(css);
 const dialog=document.createElement('dialog');dialog.className='u2-image-dialog';dialog.setAttribute('aria-label','事件图像大图');document.body.append(dialog);
 let returnFocus=null,closedKey='',mapObserver=null,mapDoc=null,pending=false;
 const {esc}=model,disclosure=model.createDisclosure();let keepAt=null;
 function closeDialog(){dialog.close();returnFocus?.focus?.({preventScroll:true});}
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-close-image]'))closeDialog();});
 dialog.addEventListener('cancel',()=>{requestAnimationFrame(()=>returnFocus?.focus?.({preventScroll:true}));});
 function showImage(im,invoker){
  returnFocus=invoker;dialog.innerHTML=`<header><h2>${esc(im.title)} · ${esc(im.date)}</h2><button type="button" data-close-image>关闭 ×</button></header><img src="${new URL(im.file,base)}" alt="${esc(im.title)}"><p>${esc(im.caption)}</p><p>${esc(im.limit)}</p><p>${esc(im.credit)} · <a target="_blank" rel="noopener" href="${esc(im.source)}">馆藏与图像来源 ↗</a> · <a target="_blank" rel="noopener" href="${esc(im.licenseUrl)}">${esc(im.license)}</a></p>`;dialog.showModal();
 }
 function active(){const api=frame.contentWindow?.__mapFilter,s=api?.getLearningState?.();return api?.getState?.().period==='u2'&&s?.view==='chain'&&s.workspacePanel==='chain'&&byId.has(s.chainId)?{api,state:s,chain:byId.get(s.chainId)}:null;}
 function enhanceMap(current){
  const doc=frame.contentDocument;if(!doc)return;
  if(doc!==mapDoc){mapDoc=doc;mapObserver?.disconnect();const style=doc.createElement('style');style.textContent=`.u2-event-image-popup>footer{display:none}.u2-event-image-popup>header{position:relative;padding-right:44px}.u2-event-image-popup>header>h3{font-size:13px}.u2-image-toggle{position:absolute;right:7px;top:8px;border:0;background:transparent;color:#726b5d;min-width:30px;min-height:30px;font:18px/1 inherit;cursor:pointer}.u2-event-image-popup .world-causal-dock-body{padding:0;display:block;background:#fffdf7}.u2-image-open{position:relative;border:0;padding:0;background:#efe7d6;display:block;width:100%;cursor:pointer}.u2-image-open img{display:block;width:100%;height:185px;object-fit:contain}.u2-image-open span{position:absolute;right:8px;bottom:8px;padding:4px 7px;background:#fffdf7ed;color:#426d97;font-size:10px;border-radius:5px}.u2-image-caption{font-size:11px;line-height:1.6;margin:0;padding:10px 12px;color:#726b5d}.u2-image-caption strong{font-size:12px;line-height:1.5;color:#25231f}.u2-image-caption details{margin-top:7px;font-size:10px}.u2-image-caption summary{cursor:pointer}.u2-image-caption a{color:#426d97}.u2-image-closed{height:auto!important;max-height:90px!important}.u2-image-closed .world-causal-dock-body{display:none}`;doc.head.append(style);
   function selectFromMap(event){if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;const node=event.target.closest('[data-causal-step]'),c=active();if(node&&c){disclosure.open(c.chain.id,Number(node.dataset.causalStep));schedule();}}
   doc.addEventListener('click',selectFromMap,true);doc.addEventListener('keydown',selectFromMap,true);
   const notes=doc.querySelector('.world-practice-notes');if(notes){mapObserver=new MutationObserver(schedule);mapObserver.observe(notes,{childList:true,subtree:true});}
  }
  if(!current)return;
  const {chain,state}=current,key=chain.id+':'+state.chainStep,note=doc.querySelector('.world-causal-dock-popup');
  if(!note||Number(note.dataset.step)!==state.chainStep)return;
  if(note.dataset.u2ImageKey===key)return;
  const im=model.imageFor(catalogue,chain.id,state.chainStep);if(!im)return;
  note.dataset.u2ImageKey=key;note.classList.add('u2-event-image-popup');
  const body=note.querySelector('.world-causal-dock-body');body.removeAttribute('tabindex');body.setAttribute('aria-label','事件图像与图注');
  body.innerHTML=`<button type="button" class="u2-image-open" aria-label="放大${esc(im.title)}"><img src="${new URL(im.file,base)}" alt="${esc(im.title)}；${esc(im.date)}" width="1000" height="700"><span>查看大图 ↗</span></button><div class="u2-image-caption"><strong>${esc(im.title)}</strong><br>${esc(im.date)}<details><summary>图注与来源</summary><p>${esc(im.purpose)}</p><p>${esc(im.limit)}</p><p>${esc(im.credit)} · <a href="${esc(im.source)}" target="_blank" rel="noopener">原图来源</a> · <a href="${esc(im.licenseUrl)}" target="_blank" rel="noopener">${esc(im.license)}</a></p></details></div>`;
  body.querySelector('.u2-image-open').addEventListener('click',e=>showImage(im,e.currentTarget));
  const close=doc.createElement('button');close.type='button';close.className='u2-image-toggle';close.textContent='×';close.setAttribute('aria-label','收起事件图像');
  function updateClosed(){const hidden=closedKey===key;note.classList.toggle('u2-image-closed',hidden);close.textContent=hidden?'＋':'×';close.setAttribute('aria-label',hidden?'展开事件图像':'收起事件图像');close.setAttribute('aria-expanded',String(!hidden));}
  close.addEventListener('click',()=>{closedKey=closedKey===key?'':key;updateClosed();});note.querySelector('header').append(close);updateClosed();
 }
 function sync(){
  pending=false;const current=active();panel.classList.toggle('u2-visual-reading',!!current);enhanceMap(current);
  if(!current){disclosure.sync(null,null);keepAt=null;if(dialog.open)closeDialog();return;}
  const {chain,state}=current,opened=disclosure.sync(chain.id,state.chainStep),list=panel.querySelector('.rt-stops-chain');if(!list)return;
  const renderKey=chain.id+':'+state.chainStep+':'+opened;if(list.dataset.u2Render===renderKey)return;
  list.dataset.u2Render=renderKey;
  // Native route buttons remain the source of selection, keyboard and favorite behavior.
  if(list.dataset.u2Chain!==chain.id){
   list.dataset.u2Chain=chain.id;list.classList.add('u2-compact-chain');
   for(const button of list.querySelectorAll('[data-route-step]')){
    const i=Number(button.dataset.routeStep),connector=model.connectorFor(chain.id,i);if(!connector)continue;
    const row=document.createElement('div');row.className='u2-chain-connector';
    row.innerHTML=connector.target!==undefined?`<button type="button" data-u2-jump="${connector.target}"><span aria-hidden="true">${esc(connector.symbol)}</span> ${esc(connector.label)}</button>`:`<span class="u2-rail-symbol" aria-hidden="true">${esc(connector.symbol)}</span><small>${esc(connector.label)}</small>`;
    button.after(row);
   }
  }
  const related=list.querySelector('.causal-related-routes');
  list.querySelectorAll('.u2-step-reading').forEach(node=>node.remove());
  let detail=null;
  for(const button of list.querySelectorAll('[data-route-step]')){
   const i=Number(button.dataset.routeStep),expanded=opened===chain.id+':'+i;
   button.setAttribute('aria-expanded',String(expanded));if(expanded)button.setAttribute('aria-controls','u2-detail-'+i);else button.removeAttribute('aria-controls');
   if(expanded){button.insertAdjacentHTML('afterend',model.readingHTML(chain,i));detail=button.nextElementSibling;}
  }
  if(related){if(detail){const more=document.createElement('details');more.className='u2-related-disclosure';more.innerHTML='<summary>相关商路与交流</summary>';more.append(related);detail.append(more);}else list.append(related);}
  const hint=panel.querySelector('.causal-click-hint');if(hint)hint.textContent='点击一环展开内容；再次点击收起。左侧地图与事件图像同步切换。';
  const selected=list.querySelector('.rt-stop.now');
  if(keepAt!==null&&selected){panel.scrollTop+=selected.getBoundingClientRect().top-panel.getBoundingClientRect().top-keepAt;keepAt=null;}
  else if(state.chainStep===0)panel.scrollTop=0;
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(sync);}}
 panel.addEventListener('click',event=>{
  const current=active();if(!current)return;
  const step=event.target.closest('[data-route-step]'),jump=event.target.closest('[data-u2-jump]'),action=event.target.closest('[data-route-action]');
  if(step){
   event.stopImmediatePropagation();const i=Number(step.dataset.routeStep);keepAt=step.getBoundingClientRect().top-panel.getBoundingClientRect().top;
   disclosure.toggle(current.chain.id,i);if(i!==current.state.chainStep)current.api.routeStep(i);schedule();
  }else if(jump){event.stopImmediatePropagation();const i=Number(jump.dataset.u2Jump);disclosure.open(current.chain.id,i);current.api.routeStep(i);schedule();}
  else if(action&&['prev','next'].includes(action.dataset.routeAction)&&!action.disabled){
   const i=current.state.chainStep+(action.dataset.routeAction==='next'?1:-1);disclosure.open(current.chain.id,i);schedule();
  }
 },true);
 new MutationObserver(schedule).observe(panel,{childList:true,subtree:true});frame.addEventListener('load',()=>{mapDoc=null;schedule();});document.getElementById('hostPeriod').addEventListener('change',schedule);schedule();
})();
