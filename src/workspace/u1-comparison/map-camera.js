(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.U1_MAP_CAMERA=factory();})(typeof window==='object'?window:this,function(){
 'use strict';const width=1600,height=800,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function bound(s){return {scale:s.scale,x:clamp(s.x,width*(1-s.scale)-width*.35,width*.35),y:clamp(s.y,height*(1-s.scale)-height*.35,height*.35)};}
 return {reset:()=>({scale:1,x:0,y:0}),pan:(s,dx,dy)=>bound({...s,x:s.x+dx,y:s.y+dy}),zoomAt:(s,scale,p)=>{scale=clamp(scale,1,4);return bound({scale,x:p.x-(p.x-s.x)*scale/s.scale,y:p.y-(p.y-s.y)*scale/s.scale});}};
});
