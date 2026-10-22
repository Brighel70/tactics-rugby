import {PLAYER_IDS} from './plays.js';

export const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const lerp = (a,b,u) => a+(b-a)*u;

/** Deterministic linear interpolation, independent from frame rate and playback direction. */
export function position(track,time){
  const keys=track.keys;
  if(time<=keys[0].t) return {x:keys[0].x,y:keys[0].y};
  for(let i=1;i<keys.length;i++) if(time<=keys[i].t){
    const a=keys[i-1],b=keys[i],u=(time-a.t)/(b.t-a.t);
    return {x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)};
  }
  const last=keys.at(-1);return {x:last.x,y:last.y};
}

export function phaseIndex(play,time){
  let index=0;
  for(let i=1;i<play.phases.length;i++) if(time>=play.phases[i].start) index=i;
  return index;
}

export function stateAt(play,requestedTime){
  const time=clamp(requestedTime,0,play.duration);
  const players=Object.fromEntries(PLAYER_IDS.map(id=>[id,position(play.tracks[id],time)]));
  const scrumBall={x:569,y:360};
  let owner='mischia',ball=scrumBall,flight=null;
  for(const pass of play.passes){
    if(time<pass.start) break;
    if(time<pass.end){
      const from=pass.from===null?scrumBall:position(play.tracks[pass.from],pass.start);
      const to=position(play.tracks[pass.to],pass.end);
      const u=(time-pass.start)/(pass.end-pass.start);
      flight={...pass,from,to,u};
      ball={x:lerp(from.x,to.x,u),y:lerp(from.y,to.y,u)+12*Math.sin(Math.PI*u)};
      owner='volo';break;
    }
    owner=pass.to;
  }
  if(typeof owner==='number'){
    const p=players[owner];ball={x:p.x+12,y:p.y+7};
  }
  return {time,players,ball,owner,flight,phase:phaseIndex(play,time)};
}

export function validatePlay(play){
  const errors=[];
  for(const id of PLAYER_IDS){
    const keys=play.tracks[id]?.keys;
    if(!keys?.length) {errors.push(`Manca il giocatore ${id}`);continue;}
    for(let i=1;i<keys.length;i++) if(keys[i].t<=keys[i-1].t) errors.push(`Keyframe non crescente: ${id}`);
  }
  for(let i=0;i<play.passes.length;i++){
    const pass=play.passes[i];
    if(pass.end<=pass.start) errors.push('Passaggio con durata non valida');
    if(i&&pass.start<play.passes[i-1].end) errors.push('Passaggi sovrapposti');
    if(pass.from!==null){
      const from=position(play.tracks[pass.from],pass.start);
      const to=position(play.tracks[pass.to],pass.end);
      if(to.y<from.y-0.01) errors.push(`Passaggio in avanti ${pass.from} → ${pass.to}`);
    }
  }
  return errors;
}
