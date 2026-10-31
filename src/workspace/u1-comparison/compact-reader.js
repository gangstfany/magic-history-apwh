(function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function caseHTML(c,p,r,i,{expanded=false,selected=false,linksHTML=''}={}){
  const letter=i?'B':'A';
  return `<article class="reading-event u1-compact-event ${selected?'is-current':''}" id="event-${esc(c.key)}"><button type="button" class="event-heading u1-node" data-case="${esc(c.key)}" aria-label="选择地区${letter}：${esc(c.label)}" aria-expanded="${expanded}" ${expanded?`aria-controls="u1-content-${esc(c.key)}"`:''}><span class="u1-node-letter">${letter}</span><span class="u1-node-main"><strong id="event-title-${esc(c.key)}">${esc(c.label)}</strong><span class="event-meta">${esc(p.en)} · ${esc(r.dateLabel)}</span></span></button>${expanded?`<div class="event-content" id="u1-content-${esc(c.key)}" role="region" aria-label="${letter} 地区具体内容"><p class="event-summary">${esc(c.summary)}</p><ul class="u1-event-evidence">${r.evidence.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><div class="event-links" aria-label="${esc(c.label)}的跨单元联系">${linksHTML}</div></div>`:''}</article>`;
 }
 function comparisonHTML(g,expanded){return `<section class="u1-compact-comparison" aria-label="地区比较与解释"><button type="button" class="u1-node u1-comparison-toggle" data-comparison="true" aria-expanded="${expanded}" ${expanded?'aria-controls="u1-comparison-popup"':''}><span class="u1-node-letter">↔</span><span class="u1-node-main"><strong>比较与解释</strong><span class="event-meta">${esc(g.label)} · 在地图上查看</span></span></button></section>`;}
 function comparisonPopupHTML(g){return `<div class="popup-head"><span>A ↔ B / 比较与解释</span><button type="button" id="closeComparison" aria-label="收起比较浮窗">×</button></div><div class="u1-map-comparison" id="u1-comparison-popup" role="region" aria-labelledby="imageHeading"><h3 id="imageHeading" tabindex="-1">${esc(g.label)}</h3><p class="comparison-question">${esc(g.question)}</p><section><h4>相似点</h4><p>${esc(g.similarity)}</p></section><section><h4>不同点</h4><p>${esc(g.difference)}</p></section><section><h4>比较解释</h4><p>${esc(g.explanation)}</p></section><p class="comparison-footnote">横向比较 · 不表示两地之间存在直接因果</p></div>`;}

 const api={caseHTML,comparisonHTML,comparisonPopupHTML};if(typeof module!=='undefined')module.exports=api;else root.U1_COMPACT_READER=api;
})(typeof window==='undefined'?null:window);
