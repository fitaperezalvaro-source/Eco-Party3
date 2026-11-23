import {maps,sizes} from './data.js';
import {W,H} from './terrain.js';

export const zones=[
  ['Camí central','Camino central'],['Senders i accessos','Senderos y accesos'],
  ['Jardins de ponent','Jardines del oeste'],['Espais de llevant','Espacios del este']
];
export const density=[74,88,90,116];
export const respawn=[1.7,2.15,2.35,1.35];
const shares=[.16,.28,.29,.27];
export const goals=maps.map(map=>shares.map((n,i)=>i===3?
  map.goal-shares.slice(0,3).reduce((sum,v)=>sum+Math.round(v*map.goal),0):Math.round(n*map.goal)));

export function createEnvironment(progress=[],saved=[]){
  return goals.map((target,r)=>{
    const prior=Math.min(maps[r].goal,progress[r]||0);
    const share=target.map(limit=>limit*prior/maps[r].goal);
    const migrated=share.map(Math.floor);
    const remainder=prior-migrated.reduce((a,b)=>a+b,0);
    const order=share.map((n,i)=>({i,fraction:n-migrated[i]})).sort((a,b)=>b.fraction-a.fraction);
    for(let n=0;n<remainder;n++)migrated[order[n].i]++;
    return target.map((limit,z)=>{
      const value=saved?.[r]?.[z];
      return Number.isInteger(value)?Math.min(limit,Math.max(0,value)):migrated[z];
    });
  });
}
export const emptyPending=()=>zones.map(()=>Object.fromEntries(Object.keys(sizes).map(k=>[k,0])));
export const zonePercent=(s,r,z)=>Math.round(100*s.clean[r][z]/goals[r][z]);
export const mapPercent=(s,r)=>Math.round(100*s.clean[r].reduce((a,b)=>a+b,0)/maps[r].goal);
export const recoveryStage=percent=>percent===100?3:percent>=74?2:percent>=34?1:0;
export function addTreatment(s,kind){
  let bonus=0,recovered=[];
  const r=s.region;
  s.pending.forEach((stock,z)=>{
    const n=stock[kind];
    stock[kind]=0;
    const goal=goals[r][z], previous=s.clean[r][z];
    s.clean[r][z]=Math.min(goal,previous+n);
    if(previous<goal&&s.clean[r][z]===goal){
      bonus+=[28,62,115,235][r];
      recovered.push(z);
    }
  });
  return {bonus,recovered};
}
export function spawnLimits(s,r,z){
  const outstanding=goals[r][z]-s.clean[r][z];
  const pending=Object.values(s.pending[z]).reduce((sum,n)=>sum+n,0);
  const available=Math.max(0,outstanding-pending);
  const fraction=outstanding/goals[r][z];
  return {
    cap:Math.min(available,Math.ceil(density[r]*shares[z]*fraction)),
    interval:fraction?respawn[r]*(1.35+3*(1-fraction)):Infinity
  };
}
export function restoreField(value){
  if(!Array.isArray(value))return null;
  const velocity=n=>Number.isFinite(n)?Math.max(-520,Math.min(520,n)):0;
  return value.slice(0,125).filter(o=>o&&Object.hasOwn(sizes,o.kind)&&
    Number.isInteger(o.zone)&&o.zone>=0&&o.zone<zones.length&&
    Number.isFinite(o.x)&&o.x>=7&&o.x<=W-7&&Number.isFinite(o.y)&&o.y>=7&&o.y<=H-7)
    .map(o=>({kind:o.kind,zone:o.zone,x:o.x,y:o.y,vx:velocity(o.vx),vy:velocity(o.vy),angle:Number.isFinite(o.angle)?o.angle:0}));
}
