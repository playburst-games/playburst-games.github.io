/* Feedback box. Visitors can only SEND feedback; it is read in the Supabase dashboard (table "feedback"). */
(function(){
const SB_URL='https://egsxosjjosuikxfkjqdr.supabase.co',SB_KEY='sb_publishable_UVPd0F_MBHtqAAwcqxF-_Q_HhBtM48Y';
const TEST=/\/test\//.test(location.pathname);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let uid=ls.get('lb-uid','');if(!uid){uid=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36));ls.set('lb-uid',uid)}
const css=`.fbx{position:fixed;inset:0;z-index:2100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:inherit;touch-action:auto}
.fbx .fbp{background:#fffdf5;color:#1b1b1b;border:3px solid #1b1b1b;border-radius:16px;box-shadow:6px 6px 0 #1b1b1b;width:min(420px,100%);padding:18px;display:flex;flex-direction:column;gap:10px}
.fbx h3{margin:0;font-size:22px;text-align:center}.fbx .sub{text-align:center;font-size:14px;opacity:.7;margin-top:-6px}
.fbx .rt{display:flex;gap:8px;justify-content:center}.fbx .rt button{font-size:28px;width:52px;height:52px;border:2.5px solid #1b1b1b;border-radius:12px;background:#fff;cursor:pointer}.fbx .rt button.on{background:#ffe066;transform:scale(1.08)}
.fbx textarea,.fbx input{width:100%;box-sizing:border-box;font:inherit;font-size:16px;border:2.5px solid #1b1b1b;border-radius:10px;padding:10px;background:#fff;color:#1b1b1b;user-select:text;-webkit-user-select:text}
.fbx textarea{height:110px;resize:none}.fbx .row{display:flex;gap:8px}.fbx .row button{flex:1;font:inherit;font-weight:700;font-size:17px;padding:11px;border:3px solid #1b1b1b;border-radius:12px;background:#fff;cursor:pointer;color:#1b1b1b}
.fbx .row .pri{background:#ffc94d}.fbx .msg{font-size:14px;color:#c0392b;text-align:center;min-height:18px}`;
let st=null;
function open(game){if(!st){st=document.createElement('style');st.textContent=css;document.head.appendChild(st)}
 const d=document.createElement('div');d.className='fbx';let rating=0;
 d.innerHTML=`<div class="fbp"><h3>💬 Feedback</h3><div class="sub">Ideas, bugs, anything — we read every message</div><div class="rt">${['😍','🙂','😐','🙁'].map((e,i)=>`<button data-r="${4-i}">${e}</button>`).join('')}</div><textarea maxlength="1000" placeholder="Your message…"></textarea><input maxlength="80" placeholder="Name or email (optional, if you want a reply)"><div class="msg"></div><div class="row"><button class="pri" data-a="ok">Send</button><button data-a="x">Close</button></div></div>`;
 document.body.appendChild(d);const stop=e=>e.stopPropagation();['pointerdown','touchstart','keydown','mousedown'].forEach(t=>d.addEventListener(t,stop));
 const close=()=>d.remove();d.querySelector('[data-a=x]').onclick=close;d.onclick=e=>{if(e.target===d)close()};
 d.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{rating=+b.dataset.r;d.querySelectorAll('[data-r]').forEach(x=>x.classList.toggle('on',x===b))});
 const ta=d.querySelector('textarea'),inp=d.querySelector('input'),msg=d.querySelector('.msg'),ok=d.querySelector('[data-a=ok]');setTimeout(()=>ta.focus(),50);
 ok.onclick=async()=>{const text=ta.value.trim();if(text.length<2&&!rating){msg.textContent='Please write a message or pick a face.';return}
  if(TEST){msg.style.color='#1f8f42';msg.textContent='Test area: not sent.';return}
  ok.disabled=true;ok.textContent='Sending…';msg.textContent='';
  try{const r=await fetch(SB_URL+'/rest/v1/feedback',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({game:game||'site',rating:rating||null,message:text.slice(0,1000),contact:inp.value.trim().slice(0,80)||null,uid,page:location.pathname.slice(0,100)})});
   if(!r.ok){let m='';try{m=(await r.json()).message||''}catch(e){}throw new Error(m||r.status)}
   d.querySelector('.fbp').innerHTML='<h3>🙏 Thank you!</h3><div class="sub" style="margin:0">Your feedback was sent.</div><div class="row"><button class="pri">OK</button></div>';d.querySelector('.row button').onclick=close}
  catch(e){ok.disabled=false;ok.textContent='Try again';msg.textContent=/slow down/.test(String(e.message))?'Too many messages. Wait a minute.':'Could not send. Check your internet.'}}}
window.FB={open};
})();
