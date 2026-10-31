(function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function imageFor(data,id,step){const b=data.bindings[id]?.[step],im=b&&data.images[b.image];return im?{...im,purpose:b.purpose}:null;}
 const graph={
  u2_main:[
   {from:[0,1],to:[2],type:'joint',label:'共同条件',mechanism:'monsoon 的可预期性与船舶、航海经验共同支持跨海载货；沿岸及内地的商品需求使运输转为实际交换。两项条件并行作用，不表示第 1 环造成第 2 环。'},
   {from:[2],to:[3],type:'causal',label:'带来服务需求',mechanism:'货物与商人汇入港口，增加补给、配货与转运需求，支持港口服务发展。'},
   {from:[3],to:[4],type:'example',label:'换用 Malacca 说明',mechanism:'这里换用 Malacca 说明统治者如何把集中的商业活动转为收费与收入。是同一机制的案例接续，不表示 Kilwa 导致 Malacca 兴起。'},
   {from:[4],to:[5],type:'conditional',label:'财政支持',mechanism:'港口收入提供经费；统治者将其中一部分投入海军与防 piracy，收入才转化为保护能力。'},
   {from:[5],to:[6],type:'conditional',label:'降低部分风险',mechanism:'保护有效运作时，有助于减少部分劫掠损失和不确定性；战争与政策仍会影响商人。'},
   {from:[6],to:[7],type:'conditional',label:'支持持续交易',mechanism:'需求与航路仍在时，风险有所降低和服务改善有助于商人继续往来。'},
   {from:[7],to:[2],type:'feedback',label:'下一轮货流',mechanism:'持续往来又把商品带入港口市场，可能扩大交易和收入，回到第 3 环。这是增长反馈，结果并不保证无限持续。'}],
  u2_sub_plague:[
   {from:[0],to:[1],type:'conditional',label:'增加传播机会',mechanism:'人员流动和跨地区接触提供传播机会；是否扩散及死亡规模，还取决于病原、宿主、病媒和生态条件。'},
   {from:[1],to:[2],type:'causal',label:'改变劳动供求',mechanism:'严重人口损失减少部分地区的劳动力供给，改变幸存劳动者的议价条件；法律、土地制度与精英反应影响结果。'}],
  u2_sub_credit:[
   {from:[0],to:[1,2],type:'alternatives',label:'两种支付办法',mechanism:'远程携款的重量、成本与风险，形成减少现钱搬运的需求。flying cash 和 bills of exchange 是不同地区、不同形式的应对办法，不是同一种工具的升级过程。'},
   {from:[1,2],to:[3],type:'parallel',label:'各自便利结算',mechanism:'汇兑与汇票各自能替代部分现钱搬运，便利远程结算；作用都依赖参与者接受及支付方能够兑现，并非必须同时使用两种工具。'}],
  u2_sub_diaspora:[
   {from:[0],to:[1],type:'conditional',label:'反复接触',mechanism:'港口停留延长接触时间；往来反复发生时，部分短期交往能成为持续的人际关系。'},
   {from:[1],to:[2],type:'conditional',label:'部分商人定居',mechanism:'持续关系为定居、通婚与家庭形成提供条件；是否迁居仍受商机、家庭与当地环境影响。'},
   {from:[2],to:[3],type:'conditional',label:'进入日常生活',mechanism:'家庭、商业和宗教联系使跨文化接触进入日常生活，支持语言借用与信仰传播；当地居民也会选择和调整。'}],
  u2_sub_environment:[
   {from:[0],to:[1],type:'conditional',label:'当地采用',mechanism:'新品种传入扩大可选作物；只有被采用并适应本地条件后，较短生长期才可能改变种植安排。'},
   {from:[1],to:[2],type:'conditional',label:'配合水利与劳动',mechanism:'较短生长期在条件适宜时允许灵活复种，配合水利与劳动投入，有助于增加年度粮食产出。'},
   {from:[2],to:[3],type:'conditional',label:'提供粮食支持',mechanism:'更多可用粮食能供养人口和城镇劳动者，是支持条件；市场、政治与基础设施也影响增长。'}],
  u2_sub_mongol:[
   {from:[0],to:[1],type:'causal',label:'产生治理需求',mechanism:'征服扩大领地与人口，产生持续征税、通信和行政的需要；单靠军事威慑不能完成日常治理。'},
   {from:[1],to:[2],type:'conditional',label:'人才支持行政',mechanism:'熟悉文书、财赋和地方情况的人才，使人口管理和资源征取更可操作；任用人才本身不保证合法性。'},
   {from:[2],to:[3],type:'conditional',label:'调配交通资源',mechanism:'可调配资源为驿传、通信和部分商路保护提供物质条件；投入和实际成效取决于统治选择与政局。'}]
 };
 const rails={u2_main:[['＋','共同条件'],['↓','共同支持'],['↓','服务需求'],['↳','换用 Malacca 案例'],['↓','收入支持保护'],['↓','降低部分风险'],['↓','支持持续交易'],['↶','反馈到第 3 环',2]],u2_sub_credit:[['↓','两种应对办法'],['∥','并行工具'],['↓','需能兑现']]};
 function relationsFor(id){return graph[id]||[];}
 function connectorFor(id,i){const row=rails[id]?.[i];if(row)return {symbol:row[0],label:row[1],target:row[2]};const r=relationsFor(id).find(r=>r.from.length===1&&r.from[0]===i);return r?{symbol:'↓',label:r.label}:null;}
 function createDisclosure(){let chain=null,step=null,opened=null;return {sync(id,i){if(id!==chain)opened=null;else if(i!==step&&opened!==null)opened=id+':'+i;chain=id;step=i;return opened;},toggle(id,i){chain=id;step=i;const key=id+':'+i;opened=opened===key?null:key;return opened;},open(id,i){chain=id;step=i;opened=id+':'+i;return opened;}};}
 function readingHTML(chain,i){

  const relation=relationsFor(chain.id).find(r=>r.from.includes(i));
  const numbers=xs=>xs.map(n=>n+1).join(relation?.type==='parallel'?' / ':' ＋ ');
  const edge=relation?`${numbers(relation.from)} ${relation.type==='feedback'?'↶':relation.type==='example'?'↳':'→'} ${numbers(relation.to)}`:'';
  const mechanism=relation?`<section class="u2-causal-explanation" aria-label="${esc(relation.label)}"><h4>${esc(edge)} · ${esc(relation.label)}</h4><p class="u2-edge-target">${relation.to.map(n=>`第 ${n+1} 环 · ${esc(chain.labels[n])}`).join(' / ')}</p><p>${esc(relation.mechanism)}</p></section>`:i<chain.stops.length-1?`<section class="u2-causal-explanation"><h4>${i+1} → ${i+2} · 联系与解释</h4><p>${esc(chain.links[i])}</p></section>`:'';
  return `<div class="u2-step-reading" id="u2-detail-${i}" role="region" aria-label="第 ${i+1} 环具体内容" data-u2-reading="${i}"><h4 class="u2-detail-label">事件与证据</h4><p class="u2-evidence">${esc(chain.evidence[i])}</p>${mechanism}</div>`;
 }
 const api={imageFor,readingHTML,esc,relationsFor,connectorFor,createDisclosure};if(typeof module!=='undefined')module.exports=api;else root.U2_VISUAL_MODEL=api;
})(typeof window==='undefined'?null:window);
