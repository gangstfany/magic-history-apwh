const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {imageFor,readingHTML}=require('./model.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'catalogue.json')));
const chains=JSON.parse(fs.readFileSync(path.join(__dirname,'../../apwh/causal-chains.json'))).filter(c=>c.units.includes('u2'));
test('all U2 steps have inspected event images and source/representation context',()=>{
 for(const c of chains)for(let i=0;i<c.stops.length;i++){
  const im=imageFor(data,c.id,i);assert.ok(im,`${c.id}:${i}`);assert.ok(fs.existsSync(path.join(__dirname,im.file)));assert.match(im.source,/^https:\/\//);assert.ok(im.date&&im.caption&&im.limit&&im.credit&&im.license);assert.ok(data.bindings[c.id][i].purpose);
 }
 assert.equal(imageFor(data,'u1_main',0),null);assert.equal(imageFor(data,'u2_main',99),null);
});
test('right-side reading retains complete evidence and only the following internal connection',()=>{
 const c={stops:[1,2],labels:['<title>','B'],evidence:['<img onerror=bad()>','Evidence B'],links:['A causes B','handoff'],stepNotes:[[],[]]};
 const html=readingHTML(c,0);assert.ok(html.includes('&lt;img onerror=bad()&gt;'));assert.ok(html.includes('A causes B'));assert.ok(!html.includes('<img onerror'));assert.ok(!readingHTML(c,1).includes('handoff'));
});
const {relationsFor,connectorFor,createDisclosure}=require('./model.js');
test('relationship graph distinguishes joint conditions, parallel tools and feedback from causal sequence',()=>{
 const main=relationsFor('u2_main');assert.ok(main.some(r=>r.type==='joint'&&r.from.join(',')==='0,1'&&r.to.join(',')==='2'));
 assert.ok(!main.some(r=>r.from.length===1&&r.from[0]===0&&r.to.includes(1)));
 assert.ok(main.some(r=>r.type==='feedback'&&r.from[0]===7&&r.to[0]===2));
 const credit=relationsFor('u2_sub_credit');assert.ok(!credit.some(r=>r.from.length===1&&r.from[0]===1&&r.to.includes(2)));
 assert.equal(connectorFor('u2_main',0).symbol,'＋');assert.equal(connectorFor('u2_sub_credit',1).symbol,'∥');
 for(const c of chains)for(const relation of relationsFor(c.id)){for(const index of [...relation.from,...relation.to])assert.ok(index>=0&&index<c.stops.length);assert.ok(relation.type&&relation.mechanism);}
 assert.deepEqual(relationsFor('u3_main'),[]);
});
test('initial overview is collapsed and only one selected detail can be open',()=>{
 const state=createDisclosure();assert.equal(state.sync('u2_main',0),null);
 assert.equal(state.toggle('u2_main',0),'u2_main:0');assert.equal(state.toggle('u2_main',0),null);
 state.toggle('u2_main',1);assert.equal(state.sync('u2_main',2),'u2_main:2');
 assert.equal(state.sync('u2_sub_credit',0),null);assert.equal(state.sync(null,null),null);
});
test('event text remains readable without a separate evidence/source disclosure',()=>{
 for(const c of chains)for(let i=0;i<c.stops.length;i++){
  const html=readingHTML(c,i);assert.ok(html.includes(c.evidence[i].replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));assert.doesNotMatch(html,/<summary>|data-evidence/);
 }
});
