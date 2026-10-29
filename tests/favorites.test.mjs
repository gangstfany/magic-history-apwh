import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {favoriteItem,createFavoriteStore} from '../favorites.mjs';
import {hostOrigin,isMessage,message} from '../module-protocol.mjs';
const example={id:'apwh-u1-test',kind:'study-point',title:'Test',subtitle:'1200',unit:'u1'};
test('metadata is bounded plain text and strips unrelated payload',()=>{
 assert.deepEqual(favoriteItem({...example,href:'javascript:x',html:'<b>x</b>'}),example);
 for(const bad of [{id:'x'.repeat(141)},{title:'<img>'},{kind:'unit'},{unit:9}])assert.equal(favoriteItem({...example,...bad}),null);
});
test('fallback persists, canonical removal wins, and import is once per host',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 let store=createFavoriteStore(storage);assert.equal(store.toggle(example),'add');
 store=createFavoriteStore(storage);assert.deepEqual(store.importOnce('https://host.test'),[example]);
 store.sync([]);assert.deepEqual(createFavoriteStore(storage).importOnce('https://host.test'),[]);
 assert.equal(store.toggle(example),'add');assert.equal(store.toggle(example),'remove');
 const denied=createFavoriteStore({getItem(){throw Error();},setItem(){throw Error();}});assert.equal(denied.toggle(example),'add');assert.equal(denied.items().length,1);
});
test('bridge accepts favorite commands only from authorized parent origin/module/version',async()=>{
 const source=fs.readFileSync(new URL('../module-bridge.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 const parent={},listeners={},sent=[],syncs=[],opened=[];
 parent.postMessage=(data,origin)=>sent.push({data,origin});
 const workspace={getBoundingClientRect:()=>({height:500})},pick={dataset:{},querySelector:()=>null};
 const context={hostOrigin,isMessage,message,URLSearchParams,location:{search:'?hostOrigin=https://host.test'},parent,
  window:{parent},document:{body:{classList:{add(){}}},querySelector:()=>workspace,getElementById:id=>id==='todayPick'?pick:{addEventListener(){}}},
  installFavorites:()=>({importOnce:()=>[],onSync:items=>syncs.push(items),onOpen:async item=>{opened.push(item);return true;}}),
  addEventListener:(name,fn)=>listeners[name]=fn,ResizeObserver:class{observe(){}},MutationObserver:class{observe(){}},setTimeout,clearTimeout};
 vm.runInNewContext(source,context);
 const deliver=(type,extra={},event={})=>listeners.message({source:parent,origin:'https://host.test',data:message('apwh',type,extra),...event});
 deliver('open-favorite',{item:example});assert.equal(opened.length,0);
 for(const event of [{source:{}},{origin:'https://evil.test'},{data:{...message('apwh','init'),version:2}},{data:message('art','init')}])deliver('init',{favorites:[example]},event);
 assert.equal(syncs.length,0);deliver('init',{favorites:[example]});assert.equal(syncs.length,1);
 deliver('favorites-sync',{items:[]});assert.equal(syncs.length,2);
 deliver('open-favorite',{item:example});await Promise.resolve();assert.equal(opened.length,1);
 assert.ok(sent.some(x=>x.data.type==='favorite-opened'&&x.data.ok));assert.ok(sent.every(x=>x.origin==='https://host.test'));
});
test('canonical study and chain identities resolve without rendering and invalid IDs do nothing',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../src/apwh/content-corrected.json',import.meta.url)));
 const chains=JSON.parse(fs.readFileSync(new URL('../src/apwh/causal-chains.json',import.meta.url)));
 const calls=[],state={};const event={key:'world-event-24-9',unit:'u2',titleEn:'Canonical event',yr:'1450',anchors:[{num:'24',region:'test'}]};const context={window:{},CHAINS:chains,timelineEvents:[event],timelineEventByKey:new Map([[event.key,event]]),locationStudyState:state,
  showLearningView:x=>calls.push(['view',x]),showMapMode:x=>calls.push(['mode',x]),reset:x=>calls.push(['reset',x]),setPeriod:x=>calls.push(['period',x]),pinRegion:()=> 'test',
  openEventInMap:(...x)=>{calls.push(['event',...x]);context.selectedTimelineKey=x[2];},openLocationStudy:()=>true,toggleLocationStudy:id=>{state.expandedStudyId=id;},
  enterRouteMode:id=>{context.routeMode={route:{id},i:0};},goToStop:i=>{context.routeMode.i=i;}};
 for(const unit of data)context.window['APWH_U'+unit.unit+'_LOCATION_STUDY']={unitId:'u'+unit.unit,records:unit.records,getById:id=>unit.records.find(r=>r.id===id)};
 const api=vm.runInNewContext('({'+fs.readFileSync(new URL('../src/apwh/favorites-api.js',import.meta.url),'utf8')+'})',context);
 const items=api.getFavoriteItems();assert.ok(items.every(favoriteItem));assert.equal(items.filter(x=>x.kind==='chain').length,225);assert.equal(new Set(items.map(x=>x.kind+'|'+x.id)).size,items.length);
 assert.equal(api.openFavorite({...example,id:'missing'}),false);assert.equal(calls.length,0);
 const record=data[0].records[2];assert.equal(api.openFavorite({kind:'study-point',id:record.id}),true);assert.equal(state.expandedStudyId,record.id);
 assert.ok(calls.some(x=>x[0]==='event'&&x[3]===record.mainEventKey));
 assert.equal(api.openFavorite({kind:'event',id:event.key}),true);assert.equal(context.selectedTimelineKey,event.key);
 assert.equal(api.openFavorite({kind:'chain',id:chains[2].id+':step:2'}),true);assert.equal(context.routeMode.i,2);
 assert.equal(api.openFavorite({kind:'chain',id:chains[2].id+':step:9999'}),false);
});

test('unchanged canonical mirror retains stars and expanded bookends across repeated course syncs',()=>{
 const source=fs.readFileSync(new URL('../src/workspace/index.template.html',import.meta.url),'utf8');
 const start=source.indexOf('  function mirrorHomeEventsMarkup('),end=source.indexOf("  addEventListener('apwh-favorite-refresh'",start);
 let writes=0,markup='',stars=[];
 const homeEvents={get innerHTML(){return markup;},set innerHTML(next){markup=next;writes++;stars=[];}};
 const mirror=vm.runInNewContext(source.slice(start,end)+';mirrorHomeEventsMarkup',{homeEvents});
 assert.equal(mirror('<article>first point</article>'),true);
 const star={id:'star'},bookend={open:true};stars.push(star,bookend);
 for(let i=0;i<10;i++)assert.equal(mirror('<article>first point</article>'),false);
 assert.equal(writes,1);assert.equal(stars[0],star);assert.equal(stars[1].open,true);
 assert.equal(mirror('<article>second point expanded</article>'),true);assert.equal(writes,2);
 mirror.previous=null;assert.equal(mirror('<article>second point expanded</article>'),true);assert.equal(writes,3);
 assert.match(source,/if \(!markupChanged && !studyRestore\) return null/);
 assert.match(source,/if \(markupChanged\) renderHomeStudyBookends\(\)/);
 const favorites=fs.readFileSync(new URL('../favorites.mjs',import.meta.url),'utf8');assert.match(favorites,/min-height:44px;min-width:44px/);
});

test('published outer page versions the nested map and bridge for favorites release',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html, /id="worldMapFrame"[^>]*src="world-map\.html\?v=20261029-favorites"/);
 assert.match(html, /type="module" src="module-bridge\.mjs\?v=20261029-favorites"/);
});
