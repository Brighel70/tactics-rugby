import {PLAYER_IDS,ROLES} from './plays.js';
const NS='http://www.w3.org/2000/svg';
const svg=(tag,attributes={})=>{const node=document.createElementNS(NS,tag);for(const [name,value] of Object.entries(attributes))node.setAttribute(name,String(value));return node;};

export function createField(root,play){
  root.replaceChildren();
  const defs=svg('defs');
  const grass=svg('linearGradient',{id:'grass',x1:0,y1:0,x2:0,y2:1});
  grass.append(svg('stop',{offset:'0%','stop-color':'#226c4e'}),svg('stop',{offset:'100%','stop-color':'#14533c'}));
  defs.append(grass);root.append(defs);
  root.append(svg('rect',{x:3,y:3,width:694,height:844,rx:16,fill:'#0b3025'}));
  root.append(svg('rect',{x:18,y:22,width:664,height:803,rx:6,fill:'url(#grass)'}));
  for(let i=0;i<7;i++) root.append(svg('rect',{x:31,y:33+i*112,width:638,height:112,fill:i%2?'#ffffff':'#071e15',opacity:i%2?.025:.035}));
  const lines=svg('g',{fill:'none',stroke:'#dbf2de','stroke-width':2,opacity:.78});
  lines.append(svg('path',{d:'M31 33 H669 V813 H31 Z'}));
  for(const [y,dash,width] of [[136,'',4],[270,'18 16',2],[415,'',2],[565,'18 16',2],[694,'6 10',2],[770,'6 10',2]]) lines.append(svg('line',{x1:31,y1:y,x2:669,y2:y,'stroke-width':width,...(dash?{'stroke-dasharray':dash}:{})}));
  for(const x of [81,619]) for(const y of [195,343,487,624]) lines.append(svg('line',{x1:x,y1:y,x2:x+(x<350?9:-9),y2:y}));
  root.append(lines);
  for(const [y,text] of [[124,'META'],[255,'22 M'],[399,'METÀ CAMPO'],[550,'22 M'],[684,'10 M'],[761,'5 M']]){
    const label=svg('text',{x:48,y,class:'field-label'});label.textContent=text;root.append(label);
  }
  const arrow=svg('g',{class:'attack-arrow'});
  arrow.append(svg('path',{d:'M645 188 V83 M633 98 L645 82 L657 98',fill:'none',stroke:'#e7f5c6','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'}));
  root.append(arrow);
  const routes=svg('g',{class:'routes'});
  for(const id of PLAYER_IDS){
    const points=play.tracks[id].keys.map(k=>`${k.x},${k.y}`).join(' ');
    routes.append(svg('polyline',{points,class:`route route-${id}`}));
  }
  root.append(routes);
  const scrum=svg('g',{class:'scrum'});
  scrum.append(svg('ellipse',{cx:571,cy:320,rx:63,ry:66,fill:'#082d25','fill-opacity':.62,stroke:'#d5eeb4','stroke-width':2,'stroke-dasharray':'7 7'}));
  for(const [x,y] of [[-20,-22],[0,-22],[20,-22],[-12,0],[12,0],[-20,24],[0,24],[20,24]]) scrum.append(svg('circle',{cx:571+x,cy:320+y,r:9,fill:'#76b9d8',stroke:'#e4f7fa','stroke-width':1.5}));
  const scrumLabel=svg('text',{x:571,y:231,class:'scrum-label'});scrumLabel.textContent='MISCHIA';scrum.append(scrumLabel);root.append(scrum);
  const passTrail=svg('path',{class:'pass-trail'});root.append(passTrail);
  const playerNodes={};
  for(const id of PLAYER_IDS){
    const node=svg('g',{class:'player',id:`player-${id}`});
    node.append(svg('circle',{r:25,class:'owner-ring'}),svg('circle',{r:19,class:'player-disc'}));
    const num=svg('text',{class:'player-number',y:1});num.textContent=id;node.append(num);
    const role=svg('text',{class:'player-role',y:-31});role.textContent=ROLES[id].toUpperCase();node.append(role);
    root.append(node);playerNodes[id]=node;
  }
  const ball=svg('g',{class:'ball'});ball.append(svg('ellipse',{rx:11,ry:7,fill:'#f5dfad',stroke:'#775534','stroke-width':2}),svg('path',{d:'M-5 -4 L5 4 M-2 -5 L8 2',stroke:'#956f42','stroke-width':1.4}));root.append(ball);
  return {root,routes,passTrail,playerNodes,ball};
}

export function renderField(field,state,settings){
  field.routes.style.display=settings.routes?'':'none';
  for(const id of PLAYER_IDS){
    const node=field.playerNodes[id],p=state.players[id];
    node.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    node.classList.toggle('has-ball',settings.highlight&&state.owner===id);
    node.querySelector('.player-role').style.display=settings.roles?'':'none';
  }
  field.ball.setAttribute('transform',`translate(${state.ball.x.toFixed(2)} ${state.ball.y.toFixed(2)})`);
  if(state.flight){
    const {from,to}=state.flight;
    field.passTrail.setAttribute('d',`M${from.x} ${from.y} Q${(from.x+to.x)/2} ${(from.y+to.y)/2+24} ${to.x} ${to.y}`);
    field.passTrail.style.display='';
  }else field.passTrail.style.display='none';
}
