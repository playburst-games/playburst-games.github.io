/* Shared online leaderboard (Supabase REST). Fill in SB_URL and SB_KEY to switch it on. */
(function(){
const SB_URL='https://egsxosjjosuikxfkjqdr.supabase.co';
const SB_KEY='sb_publishable_UVPd0F_MBHtqAAwcqxF-_Q_HhBtM48Y';
const GAMES={
  'echo-wars':{title:'Echo Wars',label:'Score',sub:'Highest score',order:'score.desc',extra:r=>r.wave?'wave '+r.wave:'',fmt:(s,w)=>'Score: <b>'+s+'</b>'},
  'just-exit':{title:'Just Exit',label:'Levels',sub:'Most levels passed · fewest deaths',order:'score.desc,wave.asc',extra:r=>(r.wave||0)+' deaths',fmt:(s,w)=>'Levels passed: <b>'+s+'</b> · Deaths: <b>'+(w||0)+'</b>'}
};
const on=!!(SB_URL&&SB_KEY);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let uid=ls.get('lb-uid','');if(!uid){uid=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36));ls.set('lb-uid',uid)}
const H={apikey:SB_KEY,'Content-Type':'application/json'};if(!SB_KEY.startsWith('sb_'))H.Authorization='Bearer '+SB_KEY;
async function fetchTop(game){
  const g=GAMES[game];
  const r=await fetch(SB_URL+'/rest/v1/scores?game=eq.'+game+'&select=uid,name,score,wave&order='+g.order+',created_at.asc&limit=300',{headers:H});
  if(!r.ok)throw new Error('load '+r.status);
  const rows=await r.json(),seen=new Set(),out=[];
  for(const x of rows){if(seen.has(x.uid))continue;seen.add(x.uid);out.push(x);if(out.length>=50)break}
  return out}
async function post(game,name,score,wave){
  const r=await fetch(SB_URL+'/rest/v1/scores',{method:'POST',headers:Object.assign({Prefer:'return=minimal'},H),body:JSON.stringify({game,uid,name,score:Math.round(score),wave:wave||null})});
  if(!r.ok){let m='';try{m=(await r.json()).message||''}catch(e){}throw new Error(m||('save '+r.status))}}
const BAD1=/(fuck|fuk|shit|bitch|cunt|pussy|whore|slut|asshole|nigg|madarchod|bhenchod|behenchod|chutiya|chutia|bhosd)/,BAD2=/\b(dick|cock|sex|porn|rape|fag|penis|vagina|bastard|mc|bc|gandu|lund|lauda|loda|randi|harami|kamina)\b/;
const badName=n=>BAD1.test(n.toLowerCase().replace(/[^a-z0-9]/g,''))||BAD2.test(n.toLowerCase());
// ---------- UI
const css=`.lbx{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:inherit}
.lbx .lbp{background:#fffdf5;color:#1b1b1b;border:3px solid #1b1b1b;border-radius:16px;box-shadow:6px 6px 0 #1b1b1b;width:min(420px,100%);max-height:86vh;display:flex;flex-direction:column;padding:18px}
.lbx h3{margin:0 0 4px;font-size:24px;text-align:center}.lbx .sub{text-align:center;font-size:14px;opacity:.7;margin-bottom:10px}
.lbx ol{list-style:none;margin:0;padding:0;overflow:auto;flex:1;min-height:80px}
.lbx li{display:flex;gap:10px;align-items:center;padding:7px 8px;border-radius:8px;font-size:16px}.lbx li:nth-child(odd){background:#f1ecdc}
.lbx li.me{background:#ffe066;font-weight:700}.lbx .rk{width:28px;text-align:right;font-weight:700}.lbx .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lbx .sc{font-weight:700}.lbx .ex{font-size:12px;opacity:.6}
.lbx input{width:100%;box-sizing:border-box;font:inherit;font-size:18px;padding:10px 12px;border:3px solid #1b1b1b;border-radius:10px;margin:8px 0}
.lbx .row{display:flex;gap:8px;margin-top:12px}.lbx button{flex:1;font:inherit;font-size:17px;font-weight:700;padding:11px;border:3px solid #1b1b1b;border-radius:10px;background:#fff;color:#1b1b1b;cursor:pointer}
.lbx button.pri{background:#ffc94d}.lbx .msg{text-align:center;padding:20px 0;opacity:.75}`;
function ui(html){if(!document.getElementById('lbcss')){const s=document.createElement('style');s.id='lbcss';s.textContent=css;document.head.appendChild(s)}
  const d=document.createElement('div');d.className='lbx';d.innerHTML='<div class="lbp">'+html+'</div>';d.addEventListener('pointerdown',e=>{if(e.target===d)close()});
  ['pointerdown','touchstart','keydown','keyup'].forEach(t=>d.addEventListener(t,e=>e.stopPropagation()));
  document.body.appendChild(d);function close(){d.remove()}return {d,close}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function show(game,opts){opts=opts||{};const g=GAMES[game];
  const m=ui(`<h3>🏆 ${g.title}</h3><div class="sub">Top players · ${g.sub}</div><ol><div class="msg">${on?'Loading…':'Leaderboard is coming soon!'}</div></ol><div class="row">${opts.submit?'<button class="pri" data-a="sub">Submit my '+(game==='just-exit'?'progress':'score')+'</button>':''}<button data-a="x">Close</button></div>`);
  m.d.querySelector('[data-a=x]').onclick=m.close;
  const sb=m.d.querySelector('[data-a=sub]');if(sb)sb.onclick=()=>{m.close();offer(game,opts.submit.score,opts.submit)};
  if(!on)return;const ol=m.d.querySelector('ol');
  try{const rows=await fetchTop(game);
    ol.innerHTML=rows.length?rows.map((r,i)=>`<li class="${r.uid===uid?'me':''}"><span class="rk">${i+1}</span><span class="nm">${esc(r.name)}</span><span class="ex">${esc(g.extra(r))}</span><span class="sc">${r.score}</span></li>`).join(''):'<div class="msg">No scores yet. Be the first!</div>'}
  catch(e){ol.innerHTML='<div class="msg">Could not load the leaderboard. Check your connection.</div>'}}
function offer(game,score,extra){if(!on)return;const g=GAMES[game];extra=extra||{};
  const m=ui(`<h3>🏆 Leaderboard</h3><div class="sub">${g.fmt(score,extra.wave)}</div><label>Your name<input maxlength="16" placeholder="Name" value="${esc(ls.get('lb-name',''))}"></label><div class="row"><button class="pri" data-a="ok">Submit</button><button data-a="x">Skip</button></div>`);
  const inp=m.d.querySelector('input'),ok=m.d.querySelector('[data-a=ok]');m.d.querySelector('[data-a=x]').onclick=m.close;
  setTimeout(()=>inp.focus(),50);inp.onkeydown=e=>{if(e.key==='Enter')ok.click()};
  const tip=document.createElement('div');tip.className='msg';tip.style.padding='4px 0';tip.style.color='#c0392b';inp.after(tip);
  ok.onclick=async()=>{const name=inp.value.replace(/[^\p{L}\p{N} _.\-!?]/gu,'').trim().replace(/\s+/g,' ').slice(0,16);if(!name){inp.focus();return}
    if(badName(name)){tip.textContent='Please pick a different name.';return}
    ok.disabled=true;ok.textContent='Saving…';tip.textContent='';
    try{await post(game,name,score,extra.wave);ls.set('lb-name',name);m.close();show(game)}
    catch(e){ok.disabled=false;ok.textContent='Try again';const msg=String(e.message||'');
      tip.textContent=/bad name/.test(msg)?'Please pick a different name.':/slow down|busy/.test(msg)?'Too many tries. Wait a minute and try again.':/bad/.test(msg)?'That score could not be saved.':'Could not save. Check your internet.'}}}
function progress(game,score,wave,opts){if(!on)return;opts=opts||{};const name=ls.get('lb-name','');
  if(name){post(game,name,score,wave).catch(()=>{});return}
  if(opts.ask&&ls.get('lb-asked-'+game,'')!=='1'){ls.set('lb-asked-'+game,'1');if(opts.pause)opts.pause();offer(game,score,{wave})}}
window.LB={enabled:on,show,offer,progress};
})();
