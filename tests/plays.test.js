import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYS,PLAYER_IDS} from '../src/plays.js';
import {stateAt,validatePlay,position} from '../src/engine.js';

test('all plays have valid, complete and deterministic timelines',()=>{
  for(const play of Object.values(PLAYS)){
    assert.deepEqual(validatePlay(play),[]);
    for(const t of [0,1.8,3.7,5.6,play.duration]){
      assert.deepEqual(stateAt(play,t),stateAt(play,t));
      for(const id of PLAYER_IDS){const p=stateAt(play,t).players[id];assert.ok(p.x>=18&&p.x<=682&&p.y>=22&&p.y<=825);}
    }
  }
});

test('passes and possession follow the specified X1 and X2 sequences',()=>{
  assert.deepEqual(PLAYS.X1.passes.map(p=>p.to),[9,10,13,15,14]);
  assert.deepEqual(PLAYS.X2.passes.map(p=>p.to),[9,10,13,11]);
  for(const play of Object.values(PLAYS)) for(const pass of play.passes){
    assert.equal(stateAt(play,(pass.start+pass.end)/2).owner,'volo');
    assert.equal(stateAt(play,pass.end).owner,pass.to);
  }
});

test('X1 11 supports 15 and 9 forms a horizontal rear defensive line',()=>{
  const end=stateAt(PLAYS.X1,12.6);
  assert.ok(Math.abs(end.players[11].x-end.players[15].x)<5);
  assert.ok(end.players[11].y>end.players[15].y);
  assert.ok(end.players[9].x<=205,'il 9 arriva a circa quattro metri dalla laterale sinistra');
  assert.ok(end.players[9].y>=425&&end.players[9].y<=445,'il 9 resta sulla linea difensiva arretrata');
  assert.ok(Math.abs(end.players[9].y-stateAt(PLAYS.X1,2.02).players[9].y)<10,'il 9 corre orizzontalmente dopo il passaggio');
});

test('X1 14 is already close behind 15 when 15 receives the ball',()=>{
  const atReceive=stateAt(PLAYS.X1,7.15).players;
  assert.ok(atReceive[14].y>atReceive[15].y,'il 14 resta poco dietro al 15');
  assert.ok(atReceive[14].y-atReceive[15].y>=25&&atReceive[14].y-atReceive[15].y<=40,'il 14 è avanzato vicino alla linea del 15');
  const finalPass=stateAt(PLAYS.X1,9.55).players;
  assert.ok(finalPass[14].y<334,'il 14 sale prima di ricevere dal 15');
  assert.ok(finalPass[14].y>finalPass[15].y,'il passaggio 15 → 14 resta all’indietro');
  assert.ok(finalPass[14].y-finalPass[15].y>=20&&finalPass[14].y-finalPass[15].y<=40,'il 14 riceve poco dietro al 15');
});

test('X1 backs continue straight toward the goal after their previous stopping points',()=>{
  const play=PLAYS.X1;
  assert.equal(play.duration,15);
  for(const [id,start] of [[10,6],[12,6.5],[13,8],[15,10],[11,10.5],[14,12.6]]){
    const first=position(play.tracks[id],start),middle=position(play.tracks[id],(start+play.duration)/2),last=position(play.tracks[id],play.duration);
    assert.equal(middle.x,first.x,`il ${id} sale senza cambiare corsia`);
    assert.equal(last.x,first.x,`il ${id} termina nella stessa corsia`);
    assert.ok(first.y>middle.y&&middle.y>last.y,`il ${id} continua ad avanzare fino alla fine`);
  }
  const end=stateAt(play,play.duration).players;
  assert.ok(end[11].y-end[15].y>42,'l’11 resta dietro al 15 in sostegno');
  assert.deepEqual(end[9],position(play.tracks[9],12.6),'il 9 resta in copertura');
  for(let t=10.5;t<=play.duration;t+=.1) for(let i=0;i<PLAYER_IDS.length;i++) for(let j=i+1;j<PLAYER_IDS.length;j++){
    const first=position(play.tracks[PLAYER_IDS[i]],t),second=position(play.tracks[PLAYER_IDS[j]],t);
    assert.ok(Math.hypot(first.x-second.x,first.y-second.y)>42,`i giocatori ${PLAYER_IDS[i]} e ${PLAYER_IDS[j]} si sovrappongono a ${t.toFixed(2)} s`);
  }
});

test('X2 11 takes the 13 pass a little further back, still running toward the goal',()=>{
  const play=PLAYS.X2,atReceive=stateAt(play,play.passes.at(-1).end).players;
  assert.ok(position(play.tracks[11],4.35).x>400,'l’11 resta ancora in avvicinamento prima dell’ultimo tratto');
  assert.ok(position(play.tracks[11],5.5).x>=380&&position(play.tracks[11],5.5).x<390,'l’11 completa l’arco e si raddrizza prima del passaggio');
  assert.ok(position(play.tracks[11],1.5).x<568&&position(play.tracks[11],1.5).y<591,'l’11 parte in diagonale appena il 9 riceve');
  assert.ok(position(play.tracks[11],2.02).x<568,'l’11 continua la diagonale durante il passaggio del 9');
  assert.ok(position(play.tracks[11],5.98).x===380,'l’11 completa il taglio in tempo per ricevere');
  assert.ok(atReceive[11].y>atReceive[13].y,'l’11 riceve poco dietro al 13, senza essere troppo avanti');
  assert.ok(position(play.tracks[11],5.5).y-position(play.tracks[11],5.98).y>25,'l’11 arriva più tardi al punto di ricezione');
  for(const t of [5.2,5.4,5.6,5.8,5.98,6.1]){
    const before=position(play.tracks[11],t-.05),after=position(play.tracks[11],t+.05);
    assert.ok(Math.hypot(after.x-before.x,after.y-before.y)/.1>45,`l’11 continua a correre durante la ricezione a ${t} s`);
  }
});

test('X2 9 turns upfield once behind 12 while 12 runs right of 11',()=>{
  const play=PLAYS.X2,reception=play.passes.at(-1).end;
  assert.ok(position(play.tracks[11],reception).x===380);
  assert.equal(position(play.tracks[11],6.3).x,380);
  assert.deepEqual(position(play.tracks[9],2.02),{x:568,y:435},'il 9 parte dopo aver passato');
  for(const t of [2.5,3.4,4.15,4.65,5.5,reception]){
    const nine=position(play.tracks[9],t);
    assert.ok(nine.x<568&&nine.y>435,'il 9 corre in obliquo verso sinistra e resta dietro i compagni');
  }
  const nineTurn=position(play.tracks[9],5.5),twelveAtTurn=position(play.tracks[12],5.5);
  assert.ok(Math.abs(nineTurn.x-twelveAtTurn.x)<20&&nineTurn.y-twelveAtTurn.y>42,'il 9 è sotto il 12 quando raddrizza');
  for(const t of [6.3,6.85,7.5,8.4,9.65,12.6]){
    const nine=position(play.tracks[9],t);
    assert.equal(nine.x,nineTurn.x,'il 9 prosegue diritto dopo essersi portato sotto il 12');
    assert.ok(nine.y<nineTurn.y,'il 9 sale verso la meta');
  }
  const beforeReceive=stateAt(play,5.15).players,atReceive=stateAt(play,reception).players;
  assert.ok(beforeReceive[11].y>beforeReceive[12].y,'prima della ricezione l’11 è dietro al 12');
  assert.ok(atReceive[12].x>atReceive[11].x&&atReceive[12].y<atReceive[11].y,'il 12 resta alla destra dell’11 e prosegue verso la meta');
  for(const t of [5.5,5.98,6.3,6.85,7.5,8.4]){
    const {players}=stateAt(play,t);
    assert.ok(players[12].x>players[11].x,'il 12 corre alla destra dell’11');
    assert.ok(players[12].y<players[11].y+30,'il 12 continua a salire con l’11');
  }
  for(let t=2;t<=6.2;t+=.05){
    const nine=position(play.tracks[9],t),twelve=position(play.tracks[12],t);
    assert.ok(Math.hypot(nine.x-twelve.x,nine.y-twelve.y)>42,`il 9 si sovrappone al 12 a ${t.toFixed(2)} s`);
  }
  for(const t of [6.85,7.5,8.4,9.65,12.6]){
    const nine=position(play.tracks[9],t),eleven=position(play.tracks[11],t),twelve=position(play.tracks[12],t);
    assert.ok(nine.y>eleven.y,'il 9 rimane dietro la linea offensiva in copertura');
    assert.ok(twelve.x>eleven.x,'il 12 resta alla destra dell’11');
  }
  for(const t of [7.5,8.4,9.65,12.6]){
    const eleven=position(play.tracks[11],t),twelve=position(play.tracks[12],t);
    assert.ok(twelve.y>=eleven.y&&twelve.y-eleven.y<15,'il 12 sostiene l’11 dalla sua destra e poco dietro');
  }
  assert.equal(position(play.tracks[13],reception).x,238,'il 13 inizia a convergere dopo il passaggio');
  for(const t of [8.4,9.65,12.6]){
    const thirteen=position(play.tracks[13],t),eleven=position(play.tracks[11],t);
    assert.ok(thirteen.x<eleven.x&&thirteen.y>eleven.y,'il 13 sostiene l’11 da sinistra e dietro');
  }
  for(let t=6;t<=9.65;t+=.05) for(let i=0;i<PLAYER_IDS.length;i++) for(let j=i+1;j<PLAYER_IDS.length;j++){
    const a=PLAYER_IDS[i],b=PLAYER_IDS[j];
    if(a===9&&b===11) continue;
    const first=position(play.tracks[a],t),second=position(play.tracks[b],t);
    assert.ok(Math.hypot(first.x-second.x,first.y-second.y)>42,`i giocatori ${a} e ${b} si sovrappongono a ${t.toFixed(2)} s`);
  }
});

test('X2 line starts on the pass to 9, while the 9 waits before running diagonally into cover',()=>{
  const play=PLAYS.X2;
  for(const t of [0,.7,1.5,1.55]){
    const nine=position(play.tracks[9],t);
    assert.deepEqual(nine,{x:568,y:435},'il 9 resta fermo fino al completamento del passaggio');
  }
  for(const t of [0,.68,.97]) for(const id of [10,11,12,13,14]){
    assert.deepEqual(position(play.tracks[id],t),{x:play.tracks[id].keys[0].x,y:play.tracks[id].keys[0].y},`il ${id} aspetta che il 9 riceva`);
  }
  for(const id of [10,11,12,13,14]) assert.ok(position(play.tracks[id],1.5).y<play.tracks[id].keys[0].y,`il ${id} sale diritto appena il 9 riceve`);
  const ten=play.tracks[10];
  assert.deepEqual(position(ten,2.02),{x:434,y:470},'il 10 ha continuato la salita diritta durante il passaggio');
  assert.ok(position(ten,2.25).x<434,'il 10 avvia l’incrocio poco dopo aver ricevuto');
  const twelve=play.tracks[12];
  assert.equal(position(twelve,2.25).x,343,'il 12 mantiene la corsa diritta subito dopo la ricezione');
  assert.ok(position(twelve,2.9).x>343,'il 12 entra poi nella traiettoria d’incrocio');
  const diagonalStart=position(twelve,2.25),diagonalEnd=position(twelve,5.5);
  for(const t of [2.9,3.4,4.15,4.65,5.15]){
    const point=position(twelve,t),fraction=(t-2.25)/(5.5-2.25);
    assert.ok(Math.hypot(point.x-(diagonalStart.x+(diagonalEnd.x-diagonalStart.x)*fraction),point.y-(diagonalStart.y+(diagonalEnd.y-diagonalStart.y)*fraction))<.01,'il 12 mantiene una diagonale perfettamente retta');
  }
  const scrumDot={x:551,y:298},dx=diagonalEnd.x-diagonalStart.x,dy=diagonalEnd.y-diagonalStart.y;
  const distanceFromLine=Math.abs(dx*(scrumDot.y-diagonalStart.y)-dy*(scrumDot.x-diagonalStart.x))/Math.hypot(dx,dy);
  assert.ok(distanceFromLine<2,'la diagonale del 12 punta al pallino superiore sinistro della mischia');
  assert.ok(position(twelve,5.49).x>position(twelve,5.15).x,'il 12 continua in obliquo fino al passaggio 13 → 11');
  for(const t of [5.5,5.6,5.98,6.3,6.85,7.5,8.4]) assert.equal(position(twelve,t).x,440,'dal passaggio 13 → 11 il 12 corre diritto verso la meta');
  assert.ok(position(twelve,6.85).x-position(play.tracks[11],6.85).x>=60,'il 12 mantiene una corsia a destra dell’11');
  const nineAfterPass=position(play.tracks[9],2.75);
  assert.ok(nineAfterPass.x<568&&nineAfterPass.y>435,'il 9 inizia subito la diagonale dopo il passaggio');
});

test('X2 runners continue through the pass and form separate support lanes',()=>{
  const play=PLAYS.X2;
  for(let t=4.65;t<7.45;t+=.1){
    const before=position(play.tracks[10],t),after=position(play.tracks[10],t+.1);
    assert.ok(after.x<before.x-1.5&&after.y<before.y-1,'il 10 prosegue senza fermarsi dopo il passaggio');
  }
  for(let t=6.05;t<8.35;t+=.1){
    const twelve=position(play.tracks[12],t),twelveNext=position(play.tracks[12],t+.1);
    const thirteen=position(play.tracks[13],t),thirteenNext=position(play.tracks[13],t+.1);
    assert.ok(twelveNext.y<twelve.y&&thirteenNext.y<thirteen.y,'il 12 e il 13 avanzano dopo la ricezione dell’11');
  }
  const s=stateAt(play,8.4).players;
  assert.ok(s[13].x<s[11].x-60&&s[13].y>s[11].y,'il 13 sostiene l’11 dal lato sinistro e arretrato');
});

test('X3 uses a loop behind 12 and releases 14 with support',()=>{
  const play=PLAYS.X3;
  assert.deepEqual(play.passes.map(pass=>pass.to),[9,10,12,10,13,14]);
  for(const id of PLAYER_IDS) assert.deepEqual(position(play.tracks[id],0),position(PLAYS.X1.tracks[id],0),'la formazione iniziale resta coerente');
  const loop=stateAt(play,3.5).players;
  assert.ok(loop[10].y>loop[12].y+42,'il 10 gira dietro al 12, senza attraversarlo');
  const returnPass=play.passes.find(pass=>pass.from===12&&pass.to===10);
  assert.ok(returnPass&&position(play.tracks[10],returnPass.end).x<position(play.tracks[12],returnPass.end).x,'il 10 riemerge all’esterno per ricevere');
  assert.equal(stateAt(play,returnPass.end).owner,10);
  assert.equal(stateAt(play,6).owner,13);
  assert.equal(stateAt(play,7.6).owner,14);
  const finish=stateAt(play,10).players;
  assert.ok(finish[13].y>finish[14].y&&finish[15].y>finish[14].y,'il 13 e il 15 sostengono il 14 da dietro');
  assert.ok(finish[9].y>finish[14].y,'il 9 conserva la copertura arretrata');
  for(let t=0;t<=play.duration;t+=.05) for(let i=0;i<PLAYER_IDS.length;i++) for(let j=i+1;j<PLAYER_IDS.length;j++){
    const a=position(play.tracks[PLAYER_IDS[i]],t),b=position(play.tracks[PLAYER_IDS[j]],t);
    assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>42,`X3: giocatori ${PLAYER_IDS[i]} e ${PLAYER_IDS[j]} troppo vicini a ${t.toFixed(2)} s`);
  }
});

test('X4 sends 12 directly behind 13 to 15, then releases 14 with rear cover',()=>{
  const play=PLAYS.X4;
  assert.deepEqual(play.passes.map(pass=>pass.to),[9,10,12,15,14]);
  assert.ok(Math.abs(play.scrumY-415)<35,'la mischia della X4 si trova vicino alla linea di metà campo');
  for(const id of PLAYER_IDS.filter(id=>id!==13)){
    const here=position(play.tracks[id],0),original=position(PLAYS.X1.tracks[id],0);
    assert.equal(here.x,original.x,'la corsia iniziale resta coerente');
    assert.ok(here.y>original.y,'la X4 parte più vicina alla metà campo');
  }
  assert.equal(position(play.tracks[9],0).y,533,'il 9 attaccante conserva la posizione');
  assert.deepEqual([10,11,12,13,14,15].map(id=>position(play.tracks[id],0).y),[587,668,636,655,725,789],'i trequarti dal 10 al 15 partono un metro più indietro');
  for(let t=0;t<=play.duration;t+=.05){
    const thirteen=position(play.tracks[13],t);
    assert.ok(Math.abs(thirteen.x-260)<1e-9,`il 13 attaccante corre sempre diritto a ${t.toFixed(2)} s`);
  }
  for(const t of [0,1.5,3,4,4.6,6]){
    const twelve=position(play.tracks[12],t),thirteen=position(play.tracks[13],t);
    assert.ok(thirteen.y>=twelve.y&&thirteen.y-twelve.y<=28,`il 13 resta quasi in linea e appena dietro al 12 a ${t} s`);
  }
  assert.ok(position(play.tracks[12],1.5).y>position(PLAYS.X3.tracks[12],1.5).y+10,'il 12 parte senza accelerare troppo');
  assert.ok(position(play.tracks[12],4).y>position(PLAYS.X3.tracks[12],4).y+20,'il 12 resta più arretrato al momento del passaggio');
  const behindBack=play.passes.find(pass=>pass.from===12&&pass.to===15);
  assert.equal(behindBack.arc,28);
  assert.deepEqual(play.passes.slice(2).map(pass=>[pass.start,pass.end]),[[4.6,5],[8,8.6],[11.3,11.8]]);
  assert.equal(stateAt(play,4.55).owner,10,'il 10 tiene il pallone durante il secondo aggiunto');
  assert.equal(stateAt(play,7.95).owner,12,'il 12 tiene il pallone durante il secondo aggiunto');
  assert.ok(position(play.tracks[10],4.55).y<position(play.tracks[10],3.55).y-20,'il 10 continua a salire nel secondo aggiunto');
  assert.ok(position(play.tracks[12],7.95).y<position(play.tracks[12],6.95).y-15,'il 12 continua a salire nel secondo aggiunto');
  const midFlight=stateAt(play,8.3);
  assert.equal(midFlight.owner,'volo');
  assert.ok(midFlight.ball.y>(midFlight.flight.from.y+midFlight.flight.to.y)/2+20,'il pallone passa dietro al 12');
  assert.equal(stateAt(play,8.6).owner,15,'il 15 riceve direttamente dal 12');
  const receive=stateAt(play,8.6).players;
  assert.ok(receive[15].y>receive[13].y+50,'il 15 riceve mentre corre dietro al 13');
  const beforeRelease=stateAt(play,11.3).players;
  assert.ok(beforeRelease[15].x<receive[15].x-35,'il 15 si sposta leggermente a sinistra dopo la ricezione');
  assert.ok(beforeRelease[15].y<receive[15].y-50,'il 15 sale alcuni metri prima di passare al 14');
  assert.ok(Math.abs(beforeRelease[15].y-415)<50,'il passaggio finale inizia vicino alla metà campo');
  const fifteen=play.tracks[15];
  const runnerSpeed=(start,end)=>{
    const from=position(fifteen,start),to=position(fifteen,end);
    return Math.hypot(to.x-from.x,to.y-from.y)/(end-start);
  };
  const approachSpeed=runnerSpeed(0,8.6);
  const firstAcceleration=runnerSpeed(8.6,9.1);
  const secondAcceleration=runnerSpeed(9.1,9.6);
  assert.ok(firstAcceleration>approachSpeed+2,'il 15 accelera appena riceve il pallone');
  assert.ok(secondAcceleration>=firstAcceleration-.1,'il 15 conserva l’accelerazione nel primo secondo');
  for(let t=9.6;t<play.duration-.1;t+=.1){
    assert.ok(runnerSpeed(t,t+.1)>=secondAcceleration-.7,`il 15 non rallenta a ${t.toFixed(1)} s`);
  }
  assert.equal(stateAt(play,11.8).owner,14);
  const lastPass=stateAt(play,11.8).players;
  assert.ok(lastPass[14].x<lastPass[15].x&&lastPass[14].y>lastPass[15].y,'il 14 riceve a sinistra del 15 e dietro la linea del passaggio');
  for(const t of [3,5.5,7.8,10]){
    const players=stateAt(play,t).players;
    assert.ok(players[9].x<568&&players[11].x<568,'9 e 11 si spostano verso sinistra');
    assert.ok(players[9].y<position(play.tracks[9],0).y&&players[11].y<position(play.tracks[11],0).y,'9 e 11 salgono leggermente');
    assert.ok(players[9].y<players[11].y-80,'il 9 resta più avanti dell’11 in copertura');
  }
  const finish=stateAt(play,14).players;
  assert.ok(finish[15].y>finish[14].y&&finish[13].y>finish[14].y,'15 e 13 sostengono il 14 da dietro');
  for(let t=0;t<=play.duration;t+=.05){
    const fourteen=position(play.tracks[14],t),next=position(play.tracks[14],Math.min(t+.05,play.duration));
    assert.ok(next.y<=fourteen.y,`il 14 non torna indietro a ${t.toFixed(2)} s`);
    for(let i=0;i<PLAYER_IDS.length;i++) for(let j=i+1;j<PLAYER_IDS.length;j++){
      const a=position(play.tracks[PLAYER_IDS[i]],t),b=position(play.tracks[PLAYER_IDS[j]],t);
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>42,`X4: giocatori ${PLAYER_IDS[i]} e ${PLAYER_IDS[j]} troppo vicini a ${t.toFixed(2)} s`);
    }
  }
});

test('X4 defensive formation advances in separate lanes',()=>{
  const play=PLAYS.X4,defense=play.defense,start=stateAt(play,0).defenders;
  assert.equal(defense.scrum.length,8);
  assert.deepEqual(Object.keys(defense.tracks).map(Number).sort((a,b)=>a-b),[9,10,11,12,13,14,15]);
  const rows=Object.values(defense.scrum.reduce((counts,[,y])=>{counts[y]=(counts[y]??0)+1;return counts;},{}));
  assert.deepEqual(rows,[3,2,3],'la mischia difensiva resta in formazione 3–2–3');
  assert.equal(defense.scrum[0][1],333,'la mischia difensiva arretra di un metro');
  assert.equal(start[9].y,313,'il 9 difensore mantiene la propria posizione');
  assert.deepEqual([10,11,12,13,14,15].map(id=>start[id].y),[276,195,280,282,278,195],'gli altri difensori arretrano di un metro');
  assert.ok(Math.abs(start[11].y-start[15].y)<=5,'l’11 difensore parte in linea orizzontale con il 15');
  const lastScrumRow=Math.min(...defense.scrum.map(([,y])=>y));
  for(const id of [10,12,13,11,14]) assert.ok(lastScrumRow-start[id].y>=50,`il difensore ${id} resta almeno cinque metri dietro l’ultima fila della propria mischia`);
  assert.ok(start[9].x<551&&start[9].x>start[10].x,'il mediano è a sinistra della mischia, vicino alla linea');
  assert.ok(start[10].x>start[12].x&&start[12].x>start[13].x&&start[13].x>start[11].x,'10, 12, 13 e 11 si aprono progressivamente verso sinistra');
  assert.ok(start[14].x>591,'il 14 è a destra della mischia');
  assert.equal(start[15].x,start[12].x,'il 15 è sulla corsia del proprio 12');
  assert.ok(start[15].y<start[12].y,'il 15 è più arretrato rispetto alla linea difensiva');
  assert.equal(PLAYS.X1.defense,undefined,'lo schieramento difensivo appartiene solo a X4');
  for(const id of PLAYER_IDS){
    const opening=stateAt(play,2.6).defenders[id],pass=stateAt(play,7.3).defenders[id],turn=stateAt(play,11).defenders[id],finish=stateAt(play,play.duration).defenders[id];
    if(id!==14&&id!==13&&id!==12) assert.ok(start[id].y<opening.y&&opening.y<pass.y&&pass.y<turn.y,`il difensore ${id} avanza prima di essere superato`);
    else if(id===13||id===12) assert.ok(start[id].y<opening.y&&opening.y<pass.y&&turn.y<pass.y,'12 e 13 chiudono la linea e poi accompagnano l’attacco verso la meta');
    else assert.ok(start[id].x>opening.x&&opening.x>pass.x&&pass.x>turn.x&&start[id].y>opening.y&&opening.y>pass.y&&pass.y>turn.y,'il 14 si apre in diagonale verso la copertura arretrata');
    assert.ok(finish.y<turn.y,`il difensore ${id} gira per inseguire il pallone`);
    if(id!==11&&id!==12&&id!==13) assert.ok(finish.x<pass.x,`il difensore ${id} converge verso il lato del pallone`);
  }
  for(const t of [7.3,9.3,11,13,16.5]){
    const state=stateAt(play,t);
    for(const id of [12,13]){
      const defender=state.defenders[id],attacker=state.players[id];
      assert.ok(Math.abs(defender.x-attacker.x)<=8,`il ${id} difensore punta la corsia del ${id} attaccante a ${t} s`);
      assert.ok(attacker.y-defender.y>42,`il ${id} difensore mantiene una distanza di marcatura a ${t} s`);
    }
  }
  for(const t of [1.5,2.6,4.6,7.3,9.3,12,16.5]){
    const line=stateAt(play,t).defenders;
    assert.ok(line[14].y<Math.min(...[10,12,13].map(id=>line[id].y)),`il 14 copre dietro la linea dei centri a ${t} s`);
  }
  const channel=stateAt(play,7.3);
  assert.ok(channel.defenders[10].x<channel.players[10].x&&channel.defenders[10].x>channel.players[12].x,'il 10 difensore punta il canale tra 10 e 12');
  assert.ok(Math.abs(channel.defenders[12].x-channel.players[12].x)<=8,'il 12 difensore punta il 12 attaccante');
  assert.ok(Math.abs(channel.defenders[9].x-channel.players[10].x)<Math.abs(start[9].x-stateAt(play,0).players[10].x),'il 9 difensore converge verso il 10 attaccante');
  assert.ok(stateAt(play,2.6).scrumAdvance>0,'la mischia difensiva spinge in avanti');
  for(let t=0;t<=play.duration;t+=.05){
    const state=stateAt(play,t);
    assert.ok(state.defenders[11].x<state.defenders[13].x,`l’11 difensore resta sul lato esterno a ${t.toFixed(2)} s`);
    assert.ok(Math.abs(state.defenders[11].y-state.defenders[15].y)<.01,`l’11 difensore resta in linea orizzontale con il 15 a ${t.toFixed(2)} s`);
    for(let i=0;i<PLAYER_IDS.length;i++) for(let j=i+1;j<PLAYER_IDS.length;j++){
      const a=state.defenders[PLAYER_IDS[i]],b=state.defenders[PLAYER_IDS[j]];
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>42,`i difensori ${PLAYER_IDS[i]} e ${PLAYER_IDS[j]} si sovrappongono a ${t.toFixed(2)} s`);
    }
    for(const id of PLAYER_IDS) for(const other of PLAYER_IDS){
      const a=state.defenders[id],b=state.players[other];
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>36,`difensore ${id} e attaccante ${other} si sovrappongono a ${t.toFixed(2)} s`);
    }
  }
});
