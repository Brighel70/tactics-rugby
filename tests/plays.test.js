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

test('X2 11 runs straight before reception and 9 is right and behind',()=>{
  const play=PLAYS.X2,reception=play.passes.at(-1).end;
  for(const t of [4.65,5.15,5.5,reception,6.3]) assert.equal(position(play.tracks[11],t).x,379);
  const atReceive=stateAt(play,reception);
  assert.ok(atReceive.players[9].x>atReceive.players[11].x);
  assert.ok(atReceive.players[9].y>atReceive.players[11].y);
  assert.ok(position(play.tracks[11],6.3).y<atReceive.players[11].y);
});
