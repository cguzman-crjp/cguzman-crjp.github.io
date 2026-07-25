
(function(){
const byId=id=>document.getElementById(id);
const normalize=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');

function setupMCQ(){
 document.querySelectorAll('[data-mcq]').forEach(box=>{
  const answer=box.dataset.answer;
  box.querySelector('[data-check]')?.addEventListener('click',()=>{
    const selected=box.querySelector('input:checked');const fb=box.querySelector('.feedback');
    if(!selected){fb.textContent='Choose an answer first.';fb.className='feedback incorrect';return;}
    const ok=selected.value===answer;fb.textContent=ok?'Correct! よくできました。':`Not yet. Hint: ${box.dataset.hint||'look at the word form and context.'}`;fb.className='feedback '+(ok?'correct':'incorrect');
    if(ok&&box.dataset.complete)WQ.markComplete(box.dataset.complete,Number(box.dataset.points||5));
  });
 });
}
function setupTyping(){
 document.querySelectorAll('[data-typing]').forEach(box=>{
  const accepted=(box.dataset.answers||'').split('|').map(normalize);const input=box.querySelector('input');const fb=box.querySelector('.feedback');
  box.querySelector('[data-check]')?.addEventListener('click',()=>{
   const ok=accepted.includes(normalize(input.value));fb.textContent=ok?'Correct spelling!':'Try again. Check every letter and the word class.';fb.className='feedback '+(ok?'correct':'incorrect');
   if(ok&&box.dataset.complete)WQ.markComplete(box.dataset.complete,Number(box.dataset.points||5));
  });
 });
}
function setupFlashcards(){
 document.querySelectorAll('[data-flashcards]').forEach(box=>{
  let cards=JSON.parse(box.dataset.flashcards);let i=0;
  const card=box.querySelector('.flashcard'),front=box.querySelector('[data-front]'),back=box.querySelector('[data-back]'),meta=box.querySelector('[data-meta]');
  const render=()=>{card.classList.remove('flipped');front.textContent=cards[i].front;back.innerHTML=cards[i].back;meta.textContent=`${i+1} / ${cards.length}`;};
  card.addEventListener('click',()=>card.classList.toggle('flipped'));
  box.querySelector('[data-next]').addEventListener('click',()=>{i=(i+1)%cards.length;render()});
  box.querySelector('[data-prev]').addEventListener('click',()=>{i=(i-1+cards.length)%cards.length;render()});
  box.querySelector('[data-shuffle]').addEventListener('click',()=>{cards=cards.sort(()=>Math.random()-.5);i=0;render()});render();
 });
}
function setupMatching(){
 document.querySelectorAll('[data-match]').forEach(game=>{
  let first=null,matches=0;const items=[...game.querySelectorAll('.match-item')];
  items.sort(()=>Math.random()-.5).forEach(x=>game.querySelector('.match-grid').appendChild(x));
  items.forEach(item=>item.addEventListener('click',()=>{
   if(item.classList.contains('matched'))return;
   if(!first){first=item;item.classList.add('selected');return;}
   if(first===item){item.classList.remove('selected');first=null;return;}
   if(first.dataset.pair===item.dataset.pair){first.classList.remove('selected');first.classList.add('matched');item.classList.add('matched');matches++;first=null;
     if(matches===items.length/2){game.querySelector('.feedback').textContent='All pairs matched!';game.querySelector('.feedback').className='feedback correct';if(game.dataset.complete)WQ.markComplete(game.dataset.complete,10);}
   } else {item.classList.add('selected');setTimeout(()=>{first?.classList.remove('selected');item.classList.remove('selected');first=null},500);}
  }));
 });
}
function setupWordBuilder(){
 document.querySelectorAll('[data-builder]').forEach(box=>{
   const base=box.querySelector('[data-base]');const suffix=box.querySelector('[data-suffix]');const output=box.querySelector('[data-output]');const fb=box.querySelector('.feedback');
   const valid=JSON.parse(box.dataset.valid);
   box.querySelector('[data-build]').addEventListener('click',()=>{
     const key=base.value+'+'+suffix.value;const result=valid[key];
     if(result){output.textContent=result.word;fb.textContent=result.note;fb.className='feedback correct';}
     else{output.textContent='—';fb.textContent='That combination is not used in this activity. Try another.';fb.className='feedback incorrect';}
   });
 });
}
function setupQuiz(){
 document.querySelectorAll('[data-random-quiz]').forEach(app=>{
  const bank=JSON.parse(app.dataset.bank);let current=[],index=0,score=0,answered=false;
  const q=app.querySelector('[data-q]'),opts=app.querySelector('[data-opts]'),fb=app.querySelector('.feedback'),status=app.querySelector('[data-status]');
  const start=()=>{current=[...bank].sort(()=>Math.random()-.5).slice(0,10);index=0;score=0;answered=false;render();};
  const render=()=>{answered=false;fb.textContent='';fb.className='feedback';status.textContent=`Question ${index+1} of ${current.length} • Score ${score}`;q.textContent=current[index].q;opts.innerHTML='';current[index].options.forEach((o,j)=>{const b=document.createElement('button');b.className='match-item';b.textContent=o;b.addEventListener('click',()=>choose(j,b));opts.appendChild(b)});};
  const choose=(j,b)=>{if(answered)return;answered=true;const ok=j===current[index].a;if(ok){score++;b.classList.add('matched');fb.textContent=current[index].explain||'Correct!';fb.className='feedback correct';}else{b.classList.add('selected');opts.children[current[index].a].classList.add('matched');fb.textContent='Not quite. '+(current[index].explain||'Review the explanation.');fb.className='feedback incorrect';}status.textContent=`Question ${index+1} of ${current.length} • Score ${score}`;};
  app.querySelector('[data-next-q]').addEventListener('click',()=>{if(!answered){fb.textContent='Answer this question first.';fb.className='feedback incorrect';return;}if(index<current.length-1){index++;render()}else{q.textContent=`Final score: ${score}/${current.length}`;opts.innerHTML='';fb.textContent=score>=8?'Excellent vocabulary control!':score>=6?'Good work—review the missed areas and try again.':'Use the learning pages, then retake the quest.';fb.className='feedback '+(score>=6?'correct':'incorrect');if(score>=8)WQ.markComplete(app.dataset.complete||'final-quiz',25);}});start();
 });
}
function setupPlanner(){
 document.querySelectorAll('[data-planner]').forEach(app=>{
   const word=app.querySelector('[data-word]'),list=app.querySelector('[data-plan-list]');
   app.querySelector('[data-add-word]').addEventListener('click',()=>{
     const w=word.value.trim();if(!w)return;const today=new Date();const gaps=[0,1,3,7,21];
     const div=document.createElement('div');div.className='card';div.innerHTML=`<strong>${w}</strong><div class="checklist mt-1">${gaps.map((g,i)=>{const d=new Date(today);d.setDate(today.getDate()+g);return `<label><input type="checkbox"> Review ${i+1}: ${d.toLocaleDateString()} (${i===0?'today':`+${g} days`})</label>`}).join('')}</div>`;list.prepend(div);word.value='';WQ.toast('Review plan added.');
   });
 });
}
function setupQuickChecks(){
 document.querySelectorAll('[data-answer-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const el=document.querySelector(btn.dataset.answerToggle);el.classList.toggle('hidden');btn.textContent=el.classList.contains('hidden')?'Show answer':'Hide answer';}));
}
document.addEventListener('DOMContentLoaded',()=>{setupMCQ();setupTyping();setupFlashcards();setupMatching();setupWordBuilder();setupQuiz();setupPlanner();setupQuickChecks();});
})();
