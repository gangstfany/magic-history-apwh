const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {caseHTML,comparisonHTML,comparisonPopupHTML}=require('./compact-reader.js');
const context={window:{}};for(const name of ['navigation','records'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,name+'.js'),'utf8'),context);
const nav=context.window.U1_NAVIGATION,records=context.window.U1_PREVIEW_RECORDS;
test('all six themes retain two comparison cases and their complete learning evidence',()=>{
 assert.equal(nav.themes.length,6);
 for(const group of Object.values(nav.groups)){
  assert.equal(group.cases.length,2);
  for(const [i,key] of group.cases.entries()){
   const c=nav.cases[key],p=nav.places[c.place],r=records[c.record];
   const closed=caseHTML(c,p,r,i,{expanded:false,selected:true});assert.doesNotMatch(closed,/class="event-content"/);assert.match(closed,/aria-expanded="false"/);
   const opened=caseHTML(c,p,r,i,{expanded:true,selected:true});assert.match(opened,/class="event-content"/);assert.doesNotMatch(opened,/<summary>|data-evidence/);
   for(const text of r.evidence)assert.ok(opened.includes(text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
  }
  const entry=comparisonHTML(group,true);assert.doesNotMatch(entry,/class="event-content|相似点 ·|不同点 ·/);assert.match(entry,/aria-controls="u1-comparison-popup"/);
  const compare=comparisonPopupHTML(group);assert.ok(compare.includes(group.similarity.replaceAll('&','&amp;')));assert.match(compare,/横向比较/);assert.doesNotMatch(compare,/下一环|→/);
 }
});
