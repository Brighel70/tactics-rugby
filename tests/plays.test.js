import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYS,PLAYER_IDS} from '../src/plays.js';
import {stateAt,validatePlay,position} from '../src/engine.js';

test('both plays have valid, complete and deterministic timelines',()=>{
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

test('X1 11 supports 15 and 9 reaches rear cover',()=>{
  const end=stateAt(PLAYS.X1,12.6);
  assert.ok(Math.abs(end.players[11].x-end.players[15].x)<5);
  assert.ok(end.players[11].y>end.players[15].y);
  assert.ok(Math.abs(end.players[9].x-PLAYS.X1.tracks[15].keys[0].x)<5);
  assert.ok(end.players[9].y<PLAYS.X1.tracks[15].keys[0].y);
});

test('X2 support arrives with the carrier: 9 right and behind, 13 left, 12 right of 9',()=>{
  const play=PLAYS.X2,reception=play.passes.at(-1).end;
  for(const t of [4.65,5.15,5.5,reception,6.3]) assert.equal(position(play.tracks[11],t).x,379);
  const atReceive=stateAt(play,reception);
  const rightOffset=atReceive.players[9].x-atReceive.players[11].x;
  assert.ok(rightOffset>=18&&rightOffset<=27,'il 9 deve essere 2–3 m a destra dell’11');
  const depthOffset=atReceive.players[9].y-atReceive.players[11].y;
  assert.ok(depthOffset>=18&&depthOffset<=32,'il 9 deve essere poco dietro all’11 alla ricezione');
  assert.ok(atReceive.players[12].x>atReceive.players[9].x,'il 12 deve trovarsi alla destra del 9');
  for(const t of [2.02,2.5,3.4,4.15,4.65,5.5,reception]){
    const nine=position(play.tracks[9],t);
    assert.ok(nine.x<568&&nine.y>360,'il 9 esce dalla sinistra della mischia');
    if(t>2.02) assert.ok(nine.x<position(play.tracks[9],t-.1).x,'il 9 continua la diagonale senza aspettare l’11');
  }
  for(let t=2;t<=6.2;t+=.05){
    const nine=position(play.tracks[9],t),twelve=position(play.tracks[12],t);
    assert.ok(Math.hypot(nine.x-twelve.x,nine.y-twelve.y)>42,`il 9 si sovrappone al 12 a ${t.toFixed(2)} s`);
  }
  for(const t of [6.85,7.5,8.4,9.65,12.6]){
    const nine=position(play.tracks[9],t),eleven=position(play.tracks[11],t),twelve=position(play.tracks[12],t);
    assert.ok(nine.x>eleven.x&&nine.y>eleven.y,'il 9 segue l’11 da destra e dietro');
    assert.ok(twelve.x>nine.x,'il 12 resta alla destra del 9');
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
