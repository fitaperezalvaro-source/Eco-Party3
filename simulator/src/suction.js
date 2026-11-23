import {W,H,zoneAt,onRoad} from './terrain.js';
import {bins,materials,sizes,tools,prestige} from './data.js';
import {tankSize,used} from './state.js';

const zones=[[240,500],[490,780],[800,610],[1050,790],[1380,500],[1380,860],[130,790]];
export function findSpawn(index,props,items,random,kind,player,zone,view){
  for(let i=0;i<200;i++){
    const spot=zones[Math.floor(random()*zones.length)];
    const clustered=zone>=2&&i<80&&random()<.65;
    const x=clustered?spot[0]+(random()-.5)*340:48+random()*(W-96);
    const y=clustered?spot[1]+(random()-.5)*245:62+random()*(H-110);
    if(x<42||x>W-42||y<52||y>H-42||index===1&&y<185)continue;
    if(index===2&&kind==='leaf'&&!onRoad(x,y))continue;
    if(i<90&&view&&x>view.left&&x<view.right&&y>view.top&&y<view.bottom)continue;
    if(bins.some(b=>(x-b.x)**2+(y-b.y)**2<(i<145?250:140)**2))continue;
    if(player&&(x-player.x)**2+(y-player.y)**2<95**2)continue;
    if(props.some(p=>(x-p.x)**2+(y-p.y)**2<(p.r+22)**2))continue;
    if(items.some(o=>(x-o.x)**2+(y-o.y)**2<16**2))continue;
    const actual=zoneAt(x,y);
    if(zone!==undefined&&actual!==zone)continue;
    return {kind,zone:actual,x,y,vx:0,vy:0,angle:random()*Math.PI*2};
  }
  return null;
}
export function suctionStats(s){
  const t=tools[s.equipped];
  return {reach:124+s.levels[1]*14+t[5],cone:t[8],
    power:t[4]*(1+s.levels[0]*.16+s.permanent[0]*prestige[0][2])};
}
export function pull(object,p,stats,dt){
  const dx=object.x-p.x,dy=object.y-p.y,dist=Math.hypot(dx,dy);
  if(dist>=stats.reach||dist>0&&(dx*p.cx+dy*p.cy)/dist<Math.cos(stats.cone))return false;
  if(dist<29)return true;
  const nx=p.x+p.cx*17-object.x,ny=p.y+p.cy*17-object.y;
  const length=Math.hypot(nx,ny)||1;
  const acc=560*stats.power*(.33+.67*(1-dist/stats.reach)**2)*dt/materials[object.kind].mass;
  object.vx+=nx/length*acc;object.vy+=ny/length*acc;
  const max=Math.min(520,205+stats.power*25),speed=Math.hypot(object.vx,object.vy);
  if(speed>max){object.vx*=max/speed;object.vy*=max/speed;}
  return false;
}
export function capture(s,kind,room=tankSize(s)-used(s)){
  if(sizes[kind]>room)return false;
  s.tank[kind]++;s.stats.suctioned++;
  return true;
}
