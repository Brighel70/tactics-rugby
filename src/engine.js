import {PLAYER_IDS} from './plays.js';

export const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const lerp = (a,b,u) => a+(b-a)*u;

// A monotone cubic tangent keeps curved runs smooth without overshooting a keyframe.
function tangent(keys,index,axis){
  if(index===0) return (keys[1][axis]-keys[0][axis])/(keys[1].t-keys[0].t);
  if(index===keys.length-1) return (keys[index][axis]-keys[index-1][axis])/(keys[index].t-keys[index-1].t);
  const left=keys[index-1],middle=keys[index],right=keys[index+1];
  const h0=middle.t-left.t,h1=right.t-middle.t;
  const d0=(middle[axis]-left[axis])/h0,d1=(right[axis]-middle[axis])/h1;
  if(d0*d1<=0) return 0;
  const w0=2*h1+h0,w1=h1+2*h0;
  return (w0+w1)/(w0/d0+w1/d1);
}

function smoothCoordinate(keys,index,axis,u){
  const a=keys[index-1],b=keys[index],h=b.t-a.t;
  const u2=u*u,u3=u2*u;
  return (2*u3-3*u2+1)*a[axis]+(u3-2*u2+u)*h*tangent(keys,index-1,axis)
    +(-2*u3+3*u2)*b[axis]+(u3-u2)*h*tangent(keys,index,axis);
}

/** Deterministic interpolation, independent from frame rate and playback direction. */
export function position(track,time){
  const keys=track.keys;
  if(time<=keys[0].t) return {x:keys[0].x,y:keys[0].y};
  for(let i=1;i<keys.length;i++) if(time<=keys[i].t){
    const a=keys[i-1],b=keys[i],u=(time-a.t)/(b.t-a.t);
    if(track.smooth) return {x:smoothCoordinate(keys,i,'x',u),y:smoothCoordinate(keys,i,'y',u)};
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
  const defenders=play.defense?Object.fromEntries(PLAYER_IDS.map(id=>[id,position(play.defense.tracks[id],time)])):null;
  const scrumAdvance=play.defense?position(play.defense.scrumAdvance,time).y:0;
  const [scrumX,scrumY]=play.scrumBall??[569,360];
  const scrumBall={x:scrumX,y:scrumY};
  let owner='mischia',ball=scrumBall,flight=null;
  for(const pass of play.passes){
    if(time<pass.start) break;
    if(time<pass.end){
      const from=pass.from===null?scrumBall:position(play.tracks[pass.from],pass.start);
      const to=position(play.tracks[pass.to],pass.end);
      const u=(time-pass.start)/(pass.end-pass.start);
      flight={...pass,from,to,u};
      ball={x:lerp(from.x,to.x,u),y:lerp(from.y,to.y,u)+(pass.arc??12)*Math.sin(Math.PI*u)};
      owner='volo';break;
    }
    owner=pass.to;
  }
  if(typeof owner==='number'){
    const p=players[owner];ball={x:p.x+12,y:p.y+7};
  }
  return {time,players,defenders,scrumAdvance,ball,owner,flight,phase:phaseIndex(play,time)};
}

export function validatePlay(play){
  const errors=[];
  if(play.defense){
    if(play.defense.scrum?.length!==8) errors.push('La mischia difensiva deve avere otto giocatori');
    for(const id of PLAYER_IDS){
      const keys=play.defense.tracks?.[id]?.keys;
      if(!keys?.length){errors.push(`Manca il difensore ${id}`);continue;}
      for(let i=1;i<keys.length;i++) if(keys[i].t<=keys[i-1].t) errors.push(`Keyframe difensivo non crescente: ${id}`);
      for(const {x,y} of keys) if(x<18||x>682||y<22||y>825) errors.push(`Difensore ${id} fuori dal campo`);
    }
    const scrumKeys=play.defense.scrumAdvance?.keys;
    if(!scrumKeys?.length) errors.push('Manca il movimento della mischia difensiva');
    else for(let i=1;i<scrumKeys.length;i++) if(scrumKeys[i].t<=scrumKeys[i-1].t) errors.push('Keyframe della mischia difensiva non crescente');
    for(const point of play.defense.scrum??[])
      if(!Array.isArray(point)||point.length!==2||point.some(value=>!Number.isFinite(value))||point[0]<18||point[0]>682||point[1]<22||point[1]>825) errors.push('Posizione difensiva fuori dal campo');
  }
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
