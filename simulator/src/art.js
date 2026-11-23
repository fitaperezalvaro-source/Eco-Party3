import {W,H,entrance,depot,drawPaths,onRoad,zoneAt} from './terrain.js';
import {bins} from './data.js';
export function rng(seed) {
  return () => {
    seed = (Math.imul(1664525,seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function ellipse(c,x,y,rx,ry,color) {
  c.fillStyle=color; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fill();
}
function box(c,x,y,w,h,color,r=4) {
  c.fillStyle=color; c.beginPath(); c.roundRect(x,y,w,h,r); c.fill();
}
export function tree(c,x,y,s,i,stage=0) {
  c.save(); c.translate(x,y); c.scale(s,s);
  ellipse(c,12,8,32,15,'#18332945');
  box(c,-5,-34,10,39,'#705042');
  if(i===1){
    c.rotate(.15);
    for(let a=0;a<6;a++){
      c.save(); c.translate(0,-34);c.rotate(a*Math.PI/3);
      ellipse(c,15,1,21,6,a%2?'#469151':'#286945');c.restore();
    }
    ellipse(c,0,-34,4,4,'#ffd685');
  } else {
    const colors=stage>=2?['#236849','#42a35f',stage===3?'#91c875':'#78b86d']:
      i===2?['#184b43','#28634a','#3b7858']:['#28674a','#3b8755','#69a65c'];
    ellipse(c,0,-28,32,24,colors[0]);
    ellipse(c,-14,-39,20,22,colors[1]);ellipse(c,13,-42,22,21,colors[1]);
    ellipse(c,-2,-53,23,17,colors[2]);
    ellipse(c,-9,-57,9,4,'#d6efa02c');
  }
  c.restore();
}
export {W,H};
export function makeWorld(map,i){
  const layer=document.createElement('canvas'); layer.width=W; layer.height=H;
  const c=layer.getContext('2d'), random=rng(map.seed);
  c.fillStyle=map.ground;c.fillRect(0,0,W,H);
  if(i===1){
    c.fillStyle='#239e9a';c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,118);c.bezierCurveTo(1010,70,420,174,0,105);c.fill();
    c.strokeStyle='#8ce2c5';c.lineWidth=13;c.stroke();
  }
  drawPaths(c,'#273e3238',118);drawPaths(c,map.path,108);
  for(let j=0;j<5200;j++){
    const x=random()*W,y=random()*H;
    ellipse(c,x,y,1+random()*3,1, j%2?'#faffc826':'#193d3620');
  }
  const props=[], fixtures=[];
  const access=[entrance,depot,...bins];
  function place(x,y,margin,existing){
    const permitted=(px,py)=>px>44&&px<W-44&&py>(i===1?180:85)&&py<H-37&&
      !onRoad(px,py,margin)&&access.every(a=>Math.hypot(px-a.x,py-a.y)>90+margin)&&
      existing.every(a=>Math.hypot(px-a.x,py-a.y)>margin*.5+a.r+7);
    if(permitted(x,y))return {x,y};
    for(const d of [30,65,100,145]){
      for(let j=0;j<8;j++){
        const a=j*Math.PI/4,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;
        if(permitted(px,py))return {x:px,y:py};
      }
    }
    return null;
  }
  for(const [px,py] of [[310,175],[900,388],[1385,365],[493,702]]){
    const r=i===0&&px===900?34:i===1?8:22;
    const location=place(px,py,r+32,fixtures);
    if(!location)continue;
    const {x,y}=location;
    fixtures.push({x,y,r});
    ellipse(c,x+10,y+4,32,12,'#203a2d42');
    if(i===0&&px===900){
      ellipse(c,x,y,41,28,'#7b9785');ellipse(c,x,y-4,35,23,'#e8e8bd');
      ellipse(c,x,y-5,29,18,'#55aeb1');ellipse(c,x,y-12,13,8,'#8de0d9');
    }else if(i===1){
      ellipse(c,x,y-28,24,18,'#fc786d');ellipse(c,x+5,y-27,12,17,'#ffe0a0');box(c,x-1,y-26,3,26,'#775d43');
    }else{
      box(c,x-23,y-8,46,9,'#654637');box(c,x-23,y-16,46,10,'#b2794d');
      box(c,x-18,y,4,7,'#423a32');box(c,x+15,y,4,7,'#423a32');
    }
  }
  for(let j=0;j<100;j++){
    const x=45+random()*1500,y=120+random()*800;
    const scale=.65+random()*.6;
    const cluster=j%4!==0;
    const spot=place(x,y,cluster?Math.ceil(38+63*scale):34,fixtures.concat(props));
    if(!spot)continue;
    if(cluster)props.push({...spot,zone:zoneAt(spot.x,spot.y),r:13*scale,scale,city:i===3&&j%3!==0});
    else for(let k=0;k<8;k++){
      const dx=spot.x+(random()-.5)*39,dy=spot.y+(random()-.5)*28;
      ellipse(c,dx,dy,4,2,'#487653');
      ellipse(c,dx-2,dy-3,2.6,2.4,['#fff0b0','#f4a6ab','#e9d7ff'][k%3]);
    }
  }
  return {layer,props,obstacles:props.concat(fixtures)};
}
export function scenery(c,p,i,stage=0) {
  if(!p.city){tree(c,p.x,p.y,p.scale,i,stage);return;}
  c.save();c.translate(p.x,p.y);c.scale(p.scale,p.scale);
  ellipse(c,15,6,36,18,'#26394452');
  box(c,-28,-51,56,58,'#607f83',7);box(c,-28,-65,56,29,'#d3e4c9',7);
  box(c,-20,-60,40,19,'#2e5477');
  for(let x=-15;x<=15;x+=10)box(c,x,-59,2,17,'#75c8d4');
  for(let x=-17;x<=17;x+=13)box(c,x,-25,8,12,'#d1f2e2');
  box(c,23,-32,8,34,stage>=2?'#6caa65':'#477e59');c.restore();
}
export function station(c,b,label,current) {
  ellipse(c,b.x+6,b.y+5,38,20,'#173b2b48');
  c.beginPath();c.ellipse(b.x,b.y,39,31,0,0,Math.PI*2);c.setLineDash([4,5]);
  c.strokeStyle=b.color;c.lineWidth=2;c.stroke();c.setLineDash([]);
  box(c,b.x-23,b.y-21,46,29,'#203b35',7);
  box(c,b.x-25,b.y-26,50,13,b.color,5);
  box(c,b.x-12,b.y-23,24,4,'#203b35',2);
  c.font='bold 15px system-ui';c.textAlign='center';c.fillStyle='#fff';c.fillText(b.mark,b.x,b.y+3);
  c.font='bold 11px system-ui';const w=c.measureText(label).width+12;
  box(c,b.x-w/2,b.y-47,w,16,current?'#17382b':'#284333');
  c.fillStyle='#fff';c.fillText(label,b.x,b.y-35);
}
export function debris(c,o) {
  c.save(); c.translate(o.x,o.y); c.rotate(o.angle);
  ellipse(c,2,3,9,5,'#263b2a60');
  switch(o.kind){
    case 'paper':box(c,-8,-5,16,11,'#f9f4df',2);box(c,-5,-3,9,1,'#78a2bc',0);box(c,-5,0,6,1,'#78a2bc',0);break;
    case 'carton':box(c,-8,-6,16,12,'#ac6c40',2);box(c,-7,-6,14,8,'#e5b57e',2);box(c,-2,-6,4,12,'#f3cf8e',0);break;
    case 'bottle':box(c,-8,-5,13,10,'#8dddef',3);box(c,-4,-5,5,10,'#e6fbff',1);box(c,4,-3,5,6,'#426ca8',2);break;
    case 'can':box(c,-7,-5,13,10,'#ed7953',2);box(c,-8,-5,3,10,'#f1e7c6',2);box(c,5,-5,3,10,'#ece9ce',2);break;
    case 'leaf':ellipse(c,0,0,9,4,'#bc6628');ellipse(c,-2,-1,6,2,'#e3a146');box(c,-9,0,16,1,'#804c29',0);break;
    case 'twig':box(c,-10,-2,20,4,'#7c462e');c.rotate(.6);box(c,-1,-4,7,3,'#b87b47');break;
    case 'glass':box(c,-7,-6,12,12,'#2a9a73',3);box(c,-5,-5,4,10,'#72e7ac',2);box(c,3,-3,7,6,'#a3dfb9',2);break;
    case 'chip':box(c,-8,-6,16,12,'#8763a2');box(c,-4,-4,8,8,'#e2c7fa');for(let j=-6;j<=6;j+=4){box(c,j,-8,2,3,'#ffe1a1');box(c,j,5,2,3,'#ffe1a1');}break;
  }
  c.restore();
}
export function player(c,p,tool,t,air,index=0) {
  ellipse(c,p.x+3,p.y+7,16,10,'#193a2c70');
  c.save();c.translate(p.x,p.y);c.rotate(p.angle);
  const step=p.walk?Math.sin(t*14)*4:0;
  box(c,-11+step,-11,11,7,'#243d4e');box(c,-11-step,4,11,7,'#243d4e');
  ellipse(c,-3,0,13,12,'#286067');
  const pack=10+Math.floor(index/2), hose=15+index;
  box(c,-pack-5,-7-index*.5,pack,15+index,tool,index%2?7:3);
  box(c,-pack-2,-4,4,9,index===4?'#426a8d':'#314c46',2);
  if(index===2)box(c,-pack-4,-5,2,8,'#f6ffe1');
  if(index===3)box(c,hose-2,11,9,4,tool,2);
  if(index===4)for(let j=0;j<3;j++)box(c,-pack-4+j*3,-8,2,7,'#69a8cf');
  if(index===5){box(c,-pack-6,-9,4,19,'#394f3f');box(c,hose,0,5,16,'#4d5f55');}
  if(index===6)ellipse(c,-pack,0,4,4,air?'#e7dfff':'#8470ad');
  if(index===7){box(c,-pack-8,-8,4,18,'#c1ffe9');box(c,hose+7,2,4,14,'#d9fff3',3);}
  if(index>=3)ellipse(c,-pack-1,4,2.5,2.5,air?'#f5ffbd':'#314c46');
  box(c,-4,5,hose+12,6,'#334749',4);
  box(c,hose,3,9,10+index*.35,tool,index>=6?4:2);
  if(air)box(c,hose+6,4,3,8+index*.35,'#eaffd4',1);
  ellipse(c,3,-1,10,9,'#dba376');ellipse(c,0,-3,11,9,'#f4ce73');
  box(c,3,-10,10,5,'#fbe293',2);
  c.restore();
}
