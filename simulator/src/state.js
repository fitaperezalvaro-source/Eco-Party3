import {tools,sizes,materials,regionRate,prestige,maps} from './data.js';

import {createEnvironment,emptyPending,restoreField,goals} from './restoration.js';

export const key='ecoblower2030-v3', previousKey='ecoblower2030-v2', legacyKey='ecoblower2030-v1';
const limit=Number.MAX_SAFE_INTEGER;
const integer=(value,max=limit)=>Number.isSafeInteger(value)?Math.min(max,Math.max(0,value)):0;
const series=(value,length,max)=>Array.from({length},(_,i)=>integer(Array.isArray(value)?value[i]:0,max));
const flags=list=>list.map(n=>Number(n>0));
const statsNames=['seconds','suctioned','recycled','earned','runEarned','deliveries','maps','vacuums'];
export const emptyTank=()=>Object.fromEntries(Object.keys(sizes).map(k=>[k,0]));
export const multiplier=s=>1+s.rebirth*.15;
export const tankSize=s=>Math.floor(tools[s.equipped][3]*(1+s.levels[6]*.15+s.permanent[1]*prestige[1][2]));
export const used=s=>Object.entries(s.tank).reduce((sum,[k,n])=>sum+sizes[k]*n,0);
export const boughtPrice=(index)=>2+index*2;
export const required=s=>Math.min(limit,Math.round(42000*1.8**s.rebirth));
export const eligible=s=>used(s)===0&&s.rebirth<50&&s.owned[4]===1&&s.stats.runEarned>=required(s)&&s.counts.slice(0,3).every((n,i)=>n>=maps[i].goal);
export function addCredits(s,n){
  s.ec=Math.min(limit,s.ec+n);
  s.stats.earned=Math.min(limit,s.stats.earned+n);
  s.stats.runEarned=Math.min(limit,s.stats.runEarned+n);
}
export function priceFor(s,kind){
  return (materials[kind].value+2)*regionRate[s.region]*(1+s.levels[7]*.03+s.permanent[3]*prestige[3][2])*multiplier(s);
}
export function resetCycle(s){
  Object.assign(s,{ec:0,pi:0,unlocked:0,region:0,counts:[0,0,0,0],levels:Array(8).fill(0),
    types:Array(5).fill(0),owned:[1,0,0,0,0,0,0,0],equipped:0,tank:emptyTank(),pending:emptyPending()});
  s.stats.runEarned=0;
}
export function reborn(s){
  if(!eligible(s))return false;
  s.rebirth++;s.gems+=4;
  resetCycle(s);
  return true;
}
function read(name){
  try{const value=JSON.parse(localStorage.getItem(name));return value&&typeof value==='object'&&!Array.isArray(value)?value:null}catch{return null}
}
export function load(){
  const candidate=read(key), v3=candidate?.version===3?candidate:null;
  const previous=v3?null:read(previousKey);
  const old=v3||previous?null:read(legacyKey);
  const s=v3||previous||old||{};
  const count=series(s.counts,4,1e7);
  // Old mission thresholds are translated to equivalent V2 progress.
  if(old)count.forEach((n,i)=>{const goals=[16,22,28,34];count[i]=Math.floor(n*maps[i].goal/goals[i]);});
  const unlocked=integer(s.unlocked,3);
  const owned=series(s.owned,8,1);
  owned[0]=1;
  const highest=owned.lastIndexOf(1);
  if(old)owned.fill(0,1); // V1 blower prices did not match the suction catalogue.
  else if(highest>0)owned.fill(1,0,highest);
  const equipped=integer(s.equipped,7);
  const stats=Object.fromEntries(statsNames.map(k=>[k,integer(s.stats?.[k])]));
  stats.vacuums=Math.max(1,stats.vacuums);
  const types=series(s.types,5,1e7);
  if(old){
    stats.recycled=types.reduce((a,b)=>a+b,0);stats.suctioned=stats.recycled;
    stats.earned=integer(s.ec);stats.runEarned=stats.earned;
    stats.maps=count.filter((n,i)=>n>=maps[i].goal).length;stats.vacuums=1;
  }
  const state={version:3,started:s.started===true,ec:integer(s.ec),pi:integer(s.pi),unlocked,
    region:integer(s.region,unlocked),counts:count,levels:series(s.levels,8,6),
    types,ach:series(s.ach,9,1),education:flags(series(s.education,4,1)).map((n,i)=>n||Number(count[i]>=maps[i].goal)),
    owned,equipped:owned[equipped]?equipped:0,tank:emptyTank(),pending:emptyPending(),
    clean:createEnvironment(count.map((n,i)=>s.education?.[i]===1?maps[i].goal:n),v3?.clean),
    fields:maps.map((_,i)=>restoreField(v3?.fields?.[i])),pending:emptyPending(),
    rebirth:integer(s.rebirth,50),gems:integer(s.gems,10000),permanent:series(s.permanent,4,5),stats,
    lang:s.lang===1?1:0,sound:s.sound!==false,music:s.music===true,fx:s.fx!==false,zoom:[.85,1,1.15].includes(s.zoom)?s.zoom:1,
    volume:Number.isFinite(s.volume)?Math.min(1,Math.max(0,s.volume)):.35};
  let room=tankSize(state);
  for(const kind of Object.keys(sizes)){
    state.tank[kind]=integer(s.tank?.[kind],Math.floor(room/sizes[kind]));
    room-=state.tank[kind]*sizes[kind];
  }
  const available={...state.tank};
  state.pending.forEach((stock,z)=>{
    let remaining=goals[state.region][z]-state.clean[state.region][z];
    for(const kind of Object.keys(stock)){
      stock[kind]=integer(s.pending?.[z]?.[kind],Math.min(available[kind],remaining));
      available[kind]-=stock[kind];remaining-=stock[kind];
    }
  });
  state.fields=state.fields.map((items,r)=>items?.filter(o=>state.clean[r][o.zone]<goals[r][o.zone])??null);
  return state;
}
export function save(state){
  try{localStorage.setItem(key,JSON.stringify(state));return true}catch{return false}
}
export function fresh(){
  const state={version:3,started:false,ach:Array(9).fill(0),education:Array(4).fill(0),clean:createEnvironment(),fields:maps.map(()=>null),
    lang:0,sound:true,music:false,fx:true,zoom:1,volume:.35,rebirth:0,gems:0,permanent:Array(4).fill(0),
    stats:Object.fromEntries(statsNames.map(k=>[k,k==='vacuums'?1:0]))};
  resetCycle(state);
  return state;
}
