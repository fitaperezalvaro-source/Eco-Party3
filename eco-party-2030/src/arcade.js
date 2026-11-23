import {pull} from '../simulator/src/suction.js';
import {items} from './data.js';
const firstKind=['paper','bottle','glass','leaf'];
const rand=(n,r)=>Math.floor(r()*n);
const pick=(xs,r)=>xs[rand(xs.length,r)];
export function makeArcade(id,r=Math.random){
 const m={id,time:0,score:0,round:0,random:r,target:0,angle:0,lane:1,choices:[],selected:[],tank:[],litter:[],held:null,flash:0};
 puzzle(m);
 return m;
}
function puzzle(m){
 const r=m.random;
 if(m.id==='vac'){
  m.litter=Array.from({length:16},(_,i)=>({id:i,type:i%4,kind:firstKind[i%4],x:36+r()*548,y:32+r()*245,vx:0,vy:0}));
 }else if(m.id==='sort'){m.item=rand(items.length,r);m.target=m.item%4;}
 else if(m.id==='water'){
  m.goals=Array.from({length:3},()=>rand(4,r));
  m.angles=m.goals.map(v=>(v+1+rand(3,r))%4);
 }else if(m.id==='bike'){m.safe=rand(3,r);m.bonus=(m.safe+1+rand(2,r))%3;m.target=m.safe;}
 else if(m.id==='solar')m.target=rand(3,r);
 else if(m.id==='forest'){
  const positions=[0,1,2,3,4,5,6,7,8];
  m.choices=positions.map(i=>i<4?'empty':i<7?'native':'rock');
  for(let i=8;i>0;i--){const j=rand(i+1,r);[m.choices[i],m.choices[j]]=[m.choices[j],m.choices[i]];}
 }else if(m.id==='delivery'){m.target=rand(3,r);}
 else if(m.id==='city'){
  m.choices=[2+rand(3,r),5+rand(2,r),7+rand(2,r),10];
  m.target=m.choices[0]+m.choices[1+rand(3,r)];
 }
}
export function input(m,type,id,dt=0){
 if(type==='hold'){m.held=id;return;}
 if(type==='release'){m.held=null;return;}
 const gain=n=>{m.score+=n;m.flash=.32;};
 if(m.id==='vac'){
  if(type==='bin'){
   const before=m.tank.length;
   m.tank=m.tank.filter(v=>v!==id);
   if(m.tank.length<before)gain(10*(before-m.tank.length));
  }
 }else if(m.id==='sort'&&type==='choice'){
  if(id===m.target)gain(10);
  puzzle(m);
 }else if(m.id==='water'){
  if(type==='rotate')m.angles[id]=(m.angles[id]+1)%4;
  if(type==='check'&&m.angles.every((a,i)=>a===m.goals[i])){gain(30);puzzle(m);}
 }else if(m.id==='bike'&&type==='choice')m.lane=id;
 else if(m.id==='solar'&&type==='choice')m.angle=id;
 else if(m.id==='forest'&&type==='choice'&&m.choices[id]==='empty'){
  m.choices[id]='planted';gain(10);
  if(!m.choices.includes('empty'))puzzle(m);
 }else if(m.id==='delivery'&&type==='choice'){
  if(id===m.target){gain(12);puzzle(m);}
 }else if(m.id==='city'){
  if(type==='choice')m.selected=m.selected.includes(id)?m.selected.filter(v=>v!==id):[...m.selected,id].slice(-2);
  if(type==='check'&&m.selected.length===2&&m.selected.reduce((a,v)=>a+m.choices[v],0)===m.target){gain(24);m.selected=[];puzzle(m);}
 }
}
export function tick(m,dt){
 m.time+=dt;m.flash=Math.max(0,m.flash-dt);
 if(m.id==='vac'){
  const item=m.litter.find(o=>o.id===m.held);
  if(item&&m.tank.length<4){
   const dx=item.x-310,dy=item.y-314,d=Math.hypot(dx,dy)||1;
   if(pull(item,{x:310,y:314,cx:dx/d,cy:dy/d},{reach:620,cone:1,power:5},dt)){
    m.tank.push(item.type);m.litter=m.litter.filter(o=>o!==item);m.held=null;m.flash=.22;
   }
  }
  for(const item of m.litter){item.x+=item.vx*dt;item.y+=item.vy*dt;item.vx*=Math.exp(-2*dt);item.vy*=Math.exp(-2*dt);}
 }else if(m.id==='bike'){
  const lap=Math.floor(m.time/2.2);
  if(lap>m.round){m.score+=m.lane===m.safe?12:m.lane===m.bonus?6:1;m.round=lap;puzzle(m);}
 }else if(m.id==='solar'){
  if(m.angle===m.target)m.score+=dt*7;
  const phase=Math.floor(m.time/2.6);
  if(phase>m.round){m.round=phase;puzzle(m);}
 }
}
export function bot(m,difficulty){
 const r=m.random;
 const error=r()<[.28,.13,.055][difficulty];
 const choice=(value,total)=>input(m,'choice',error?rand(total,r):value);
 if(m.id==='vac'){
  if(m.tank.length&&(m.tank.length>=3||!m.litter.length||m.time>19)){input(m,'bin',error?rand(4,r):m.tank[0]);return;}
  if(m.held===null&&m.litter.length){
   const viable=[...m.litter].sort((a,b)=>Math.hypot(a.x-310,a.y-314)-Math.hypot(b.x-310,b.y-314));
   input(m,'hold',(error?pick(viable,r):viable[0]).id);
  }
 }else if(m.id==='sort')choice(m.target,4);
 else if(m.id==='water'){
  const i=m.angles.findIndex((a,k)=>a!==m.goals[k]);
  if(i<0)input(m,'check',0);else input(m,'rotate',error?rand(3,r):i);
 }else if(m.id==='bike'||m.id==='solar'||m.id==='delivery')choice(m.target,3);
 else if(m.id==='forest')choice(m.choices.indexOf('empty'),9);
 else if(m.id==='city'){
  const j=m.choices.findIndex((v,i)=>i>0&&v+m.choices[0]===m.target);
  if(m.selected.includes(0)&&m.selected.includes(j))input(m,'check',0);
  else choice(!m.selected.includes(0)?0:j,4);
 }
}
