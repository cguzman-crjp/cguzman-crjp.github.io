
const WQ = (() => {
  const KEY = 'wordQuestJapan';
  const defaults = {completed:[],points:0,theme:'light',checklists:{},notes:{}};
  const load = () => {try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...defaults}}};
  let state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const toast = (message) => {
    const el = document.querySelector('.toast');
    if(!el) return;
    el.textContent=message; el.classList.add('show');
    clearTimeout(window.__wqToast); window.__wqToast=setTimeout(()=>el.classList.remove('show'),2200);
  };
  const markComplete = (id, points=10) => {
    if(!state.completed.includes(id)){
      state.completed.push(id); state.points += points; save(); renderProgress(); toast(`Quest complete! +${points} points`);
    } else {toast('This quest is already complete.');}
  };
  const renderProgress = () => {
    const total = 12;
    const done = state.completed.length;
    document.querySelectorAll('[data-progress-count]').forEach(el=>el.textContent=done);
    document.querySelectorAll('[data-points]').forEach(el=>el.textContent=state.points);
    document.querySelectorAll('.progress-ring').forEach(el=>{const pct=Math.min(100,Math.round(done/total*100));el.style.setProperty('--p',pct);const s=el.querySelector('span');if(s)s.textContent=pct+'%';});
    document.querySelectorAll('[data-badge]').forEach(el=>{
      const need=Number(el.dataset.need||0); el.classList.toggle('unlocked',state.points>=need);
    });
  };
  const speak = (text, rate=.88) => {
    if(!('speechSynthesis' in window)){toast('Speech playback is not supported in this browser.');return;}
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;speechSynthesis.speak(u);
  };
  const setupNav = () => {
    const btn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav-links');
    btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
    document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!btn.contains(e.target)){nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}});
  };
  const setupTheme = () => {
    document.documentElement.dataset.theme=state.theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
      state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;save();
      toast(state.theme==='dark'?'Dark mode on':'Light mode on');
    }));
  };
  const setupSpeech = () => document.querySelectorAll('[data-speak]').forEach(btn=>btn.addEventListener('click',()=>speak(btn.dataset.speak)));
  const setupComplete = () => document.querySelectorAll('[data-complete]').forEach(btn=>btn.addEventListener('click',()=>markComplete(btn.dataset.complete,Number(btn.dataset.points||10))));
  const setupChecklist = () => {
    document.querySelectorAll('[data-checklist]').forEach(group=>{
      const id=group.dataset.checklist;
      group.querySelectorAll('input[type=checkbox]').forEach((box,i)=>{
        const key=`${id}-${i}`; box.checked=Boolean(state.checklists[key]);
        box.addEventListener('change',()=>{state.checklists[key]=box.checked;save();if([...group.querySelectorAll('input')].every(x=>x.checked))markComplete(id,10);});
      });
    });
  };
  const setupNotes = () => document.querySelectorAll('[data-save-note]').forEach(el=>{
    const key=el.dataset.saveNote;el.value=state.notes[key]||'';el.addEventListener('input',()=>{state.notes[key]=el.value;save();});
  });
  const reset = () => {if(confirm('Reset all Word Quest progress on this browser?')){state={...defaults};save();location.reload();}};
  const init = () => {setupNav();setupTheme();setupSpeech();setupComplete();setupChecklist();setupNotes();renderProgress();document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));};
  return {init,markComplete,toast,speak,getState:()=>state};
})();
document.addEventListener('DOMContentLoaded',WQ.init);
