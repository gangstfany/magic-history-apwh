(async()=>{
 'use strict';
 const previewVersion='20261031-u1-release';
 const runtimeBase=new URL('assets/apwh-u1-comparison/',document.baseURI).href;
 const card=document.querySelector('.map-card'),split=document.querySelector('.map-events-split'),map=document.getElementById('worldMapFrame');
 const host=document.createElement('section');host.id='u1ComparisonPreview';host.dataset.previewVersion=previewVersion;host.hidden=true;host.setAttribute('aria-label','Unit 1 地区比较');split.before(host);
 const style=document.createElement('style');style.textContent='.map-card.u1-preview-active>.map-events-split{display:none!important}#u1ComparisonPreview[hidden]{display:none!important}#u1ComparisonPreview{background:#fffdf7}.map-card.u1-preview-active #hostStudyDirectory,.map-card.u1-preview-active .mth-field-search,.map-card.u1-preview-active #hostThemeToggle,.map-card.u1-preview-active #hostThemePanel{display:none!important}';document.head.append(style);
 const root=host.attachShadow({mode:'open'});window.__u1PreviewRoot=root;
 const html=await fetch(runtimeBase+'embedded.html?v='+previewVersion,{cache:'no-store'}).then(r=>r.text());
 root.innerHTML='<link rel="stylesheet" href="'+runtimeBase+'embedded.css?v='+previewVersion+'">'+html;
 // Resolve local image URLs within the real course workspace.
 for(const node of root.querySelectorAll('[href^="assets/"]'))node.setAttribute('href',runtimeBase+node.getAttribute('href'));
 async function load(file){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=runtimeBase+file+'?v='+previewVersion;s.onload=resolve;s.onerror=reject;document.body.append(s);});}
 for(const f of ['data.js','records.js','relations.js','images.js','navigation.js','map-camera.js','compact-reader.js','embedded.js'])await load(f);
 // Dynamically rendered images use the original relative path; rewrite only image resources.
 function imagePaths(){for(const img of root.querySelectorAll('img[src^="assets/"]'))img.setAttribute('src',runtimeBase+img.getAttribute('src'));}
 new MutationObserver(imagePaths).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});imagePaths();
 function sync(){
  const api=map.contentWindow?.__mapFilter;if(!api)return;
  const show=api.getState().period==='u1'&&api.getLearningState().view==='chain'&&api.getLearningState().workspacePanel==='chain';
  const nativeHeight=parseFloat(map.contentDocument?.querySelector('.map-zone')?.style.height)||500;host.style.setProperty('--u1-workspace-height',nativeHeight+'px');host.hidden=!show;card.classList.toggle('u1-preview-active',show);
  const tab=document.querySelector('[data-learning-view="chain"]');if(tab){const name='因果链';tab.setAttribute('aria-label',name);if(tab.textContent!==name)tab.textContent=name;}const caption=document.getElementById('homeMapCaption');if(caption)caption.hidden=show;
 }
 new MutationObserver(sync).observe(document.getElementById('home-events'),{subtree:true,childList:true});
 new MutationObserver(sync).observe(document.getElementById('mapHdrMenu'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
 document.getElementById('hostPeriod').addEventListener('change',sync);
 map.addEventListener('load',sync);sync();
})();
