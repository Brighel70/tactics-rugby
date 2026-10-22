import {PLAYS} from './plays.js';
import {stateAt,validatePlay,clamp,phaseIndex} from './engine.js';
import {createField,renderField} from './field.js';

const $=id=>document.getElementById(id);
const catalog=Object.values(PLAYS);
for(const play of catalog){
  const errors=validatePlay(play);
  if(errors.length) throw new Error(`${play.id}: ${errors.join('; ')}`);
}
let play=PLAYS.X1,time=0,playing=false,speed=1,lastFrame=null,field;
const settings={routes:true,roles:true,highlight:true};

function clock(seconds){return `00:${String(Math.floor(seconds)).padStart(2,'0')}`;}
function setPlaying(value){playing=value;lastFrame=null;$('play').innerHTML=value?'Ⅱ <span>Pausa</span>':'▶ <span>Riproduci</span>';$('play').setAttribute('aria-pressed',String(value));}
function render(){
  const state=stateAt(play,time);
  renderField(field,state,settings);
  const phase=play.phases[state.phase];
  $('phase-count').textContent=`FASE ${String(state.phase+1).padStart(2,'0')} / ${String(play.phases.length).padStart(2,'0')}`;
  $('phase-title').textContent=phase.title;
  $('phase-description').textContent=phase.description;
  $('possession').textContent=`PALLONE / ${state.owner==='mischia'?'MISCHIA':state.owner==='volo'?'IN VOLO':`N. ${state.owner}`}`;
  $('time-label').textContent=`${clock(time)} / ${clock(Math.ceil(play.duration))}`;
  $('seek').value=String(Math.round(time*100));
  document.querySelectorAll('.phase-button').forEach((button,index)=>{
    const active=index===state.phase;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'step':'false');
  });
}
function seek(timeValue){time=clamp(timeValue,0,play.duration);render();}
function renderPhases(){
  $('phase-list').replaceChildren(...play.phases.map((phase,index)=>{
    const button=document.createElement('button');button.type='button';button.className='phase-button';
    const number=document.createElement('span');number.className='phase-number';number.textContent=String(index+1).padStart(2,'0');
    const label=document.createElement('span');label.textContent=phase.title;
    button.append(number,label);button.addEventListener('click',()=>{setPlaying(false);seek(phase.start);});return button;
  }));
  $('phase-total').textContent=`${play.phases.length} FASI`;
}
function selectPlay(id){
  setPlaying(false);play=PLAYS[id];time=0;
  field=createField($('pitch'),play);
  $('field-title').textContent=`${play.id} / ${play.name}`;
  $('defense-legend').hidden=!play.defense;
  $('play-code').textContent=play.id;
  $('playbook-index').textContent=`${String(catalog.findIndex(item=>item.id===id)+1).padStart(2,'0')} / ${String(catalog.length).padStart(2,'0')}`;
  $('seek').max=String(Math.round(play.duration*100));
  document.querySelectorAll('.play-choice').forEach(button=>{const active=button.dataset.id===id;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  renderPhases();render();
}

$('play-total').textContent=`${String(catalog.length).padStart(2,'0')} GIOCATE`;
for(const item of catalog){
  const button=document.createElement('button');button.type='button';button.className='play-choice';button.dataset.id=item.id;
  const code=document.createElement('span');code.className='play-code';code.textContent=item.id;
  const copy=document.createElement('span');copy.className='play-copy';
  const title=document.createElement('strong');title.textContent=item.name;
  const description=document.createElement('small');description.textContent=item.description;
  copy.append(title,description);button.append(code,copy);
  button.addEventListener('click',()=>selectPlay(item.id));$('play-list').append(button);
}
$('play').addEventListener('click',()=>{if(time>=play.duration)seek(0);setPlaying(!playing);});
$('restart').addEventListener('click',()=>{setPlaying(false);seek(0);});
$('previous').addEventListener('click',()=>{setPlaying(false);const current=phaseIndex(play,time);const target=Math.abs(time-play.phases[current].start)<.12?Math.max(0,current-1):current;seek(play.phases[target].start);});
$('next').addEventListener('click',()=>{setPlaying(false);seek(play.phases[Math.min(play.phases.length-1,phaseIndex(play,time)+1)].start);});
$('seek').addEventListener('input',event=>{setPlaying(false);seek(Number(event.target.value)/100);});
$('speed').addEventListener('change',event=>{speed=Number(event.target.value);});
for(const [id,key] of [['show-routes','routes'],['show-roles','roles'],['highlight-ball','highlight']]) $(id).addEventListener('change',event=>{settings[key]=event.target.checked;render();});
function frame(stamp){
  if(playing){if(lastFrame!==null){seek(time+Math.min((stamp-lastFrame)/1000,.1)*speed);if(time>=play.duration)setPlaying(false);}lastFrame=stamp;}
  requestAnimationFrame(frame);
}
selectPlay('X1');requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('Service Worker non disponibile:',error));
