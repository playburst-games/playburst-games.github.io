/* Visitor stats (GoatCounter). Only counts on the live site, never in /test/ or inside Claude. */
(function(){
  var live=/github\.io$/.test(location.hostname)&&!/\/test\//.test(location.pathname);
  window.track=function(name,title){try{if(live&&window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:name,title:title||name,event:true})}catch(e){}};
  if(!live)return;
  var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://playburst.goatcounter.com/count');document.head.appendChild(s);
})();
