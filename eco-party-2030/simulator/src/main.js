import {maps,materials,bins,upgrades,tools,ods,odsSummary,sizes,upgradeGrowth,prestige} from './data.js';
import {W,H,rng,ellipse,makeWorld,scenery,station,debris,player} from './art.js';
import {load,save,fresh,used,tankSize,addCredits,priceFor,multiplier,required,eligible,reborn,boughtPrice} from './state.js';
import {findSpawn,suctionStats,pull,capture} from './suction.js';
import {entrance,depot,zoneAt} from './terrain.js';
import {zones,spawnLimits,zonePercent,mapPercent,recoveryStage,addTreatment} from './restoration.js';
import {activate,chime,ambient} from './audio.js';

const $=id=>document.getElementById(id);
const canvas=$('world'), c=canvas.getContext('2d'), modal=$('modal');
let state=load(), playing=false, panel='', world, items=[], activeBins=[], energy=100, last=0, time=0, uiTime=0;
let width=0,height=0,ratio=1,zoom=1,originX=0,originY=0,air=false,cooldown=0,notice=0,spawnClock=0,playClock=0,blockedNotice=0;
const p={x:410,y:270,angle:0,walk:false}, camera={x:610,y:290};
const keys=new Set(), aim={x:0,y:0,current:false}, stick={x:0,y:0};
let pointerAir=false,touchAir=false;
let zoneClocks=[], cleanSummary=0;
const particles=Array.from({length:150},()=>({life:0}));
let particleIndex=0;
const tx=(va,es)=>state.lang?es:va;
const L=pair=>pair[state.lang];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const tool=()=>tools[state.equipped];
const room=()=>tankSize(state)-used(state);
const capacity=()=>100+20*state.levels[3];
const kinds=()=>['paper','bottle','can','leaf',maps[state.region].item];
const progressTotal=()=>state.counts.reduce((sum,n)=>sum+n,0);
const levelTotal=()=>state.levels.reduce((sum,n)=>sum+n,0);
const missionName=()=>L(maps[state.region].mission);
const playLabel=()=>state.started?tx('Continuar','Continuar'):tx('Jugar','Jugar');
const buttons={
  shop:()=>tx('Millores','Mejoras'),map:()=>tx('Mapa','Mapa'),missions:()=>tx('Missions','Misiones'),
  ods:()=>tx('Enciclopèdia ODS','Enciclopedia ODS'),settings:()=>tx('Ajustos','Ajustes'),
  rebirth:()=>tx('Renàixer','Renacer'),stats:()=>tx('Estadístiques','Estadísticas'),
  maintenance:()=>tx('Manteniment','Mantenimiento'),
  vacuum:()=>tx('Aspiradores','Aspiradoras'),
  credits:()=>tx('Crèdits','Créditos'),help:()=>tx('Controls','Controles'),pause:()=>tx('Pausa','Pausa')
};
const achievements=[
  [()=>progressTotal()>=1,5,['Primer reciclatge','Primer reciclaje']],
  [()=>state.types[0]>=3&&state.types[1]>=3&&state.types[2]>=3,18,['Tres materials separats · ODS 12','Tres materiales separados · ODS 12']],
  [()=>levelTotal()>=1,10,['Primera millora','Primera mejora']],
  [()=>state.counts[0]>=maps[0].goal,15,['Parc recuperat','Parque recuperado']],
  [()=>state.unlocked===3,25,['Exploració sostenible','Exploración sostenible']],
  [()=>progressTotal()>=100,40,['100 materials classificats','100 materiales clasificados']],
  [()=>state.owned[4]===1,85,['Tecnologia solar · ODS 7','Tecnología solar · ODS 7']],
  [()=>state.stats.deliveries>=15,45,['15 entregues','15 entregas']],
  [()=>state.stats.suctioned>=500,150,['500 residus aspirats','500 residuos aspirados']]
];
let random=rng(1);
function spawn(zone,view){
  const types=kinds().filter(kind=>!(state.region===2&&zone>=2&&kind==='leaf'));
  const kind=types[Math.floor(random()*types.length)];
  const item=findSpawn(state.region,world.obstacles,items,random,kind,p,zone,view);
  if(!item)return false;
  items.push(item);
  return true;
}
function region(index){
  state.region=index;
  world=makeWorld(maps[index],index);
  activeBins=bins;
  random=rng(maps[index].seed);
  items=state.fields[index]??[];
  const initialize=state.fields[index]===null;
  state.fields[index]=items;
  Object.assign(p,{...entrance,angle:0,walk:false});
  if(initialize)zones.forEach((_,z)=>{
    for(let n=0;n<spawnLimits(state,index,z).cap;n++)spawn(z);
  });
  cleanSummary=mapPercent(state,index);
  zoneClocks=zones.map(()=>0);
  Object.assign(camera,{x:610,y:280});
  particles.forEach(particle=>particle.life=0);
  aim.current=false;energy=capacity();cooldown=0;spawnClock=0;
}
function regenerate(dt){
  for(let z=0;z<zones.length;z++)zoneClocks[z]+=dt;
  spawnClock+=dt;
  if(spawnClock<.4)return;
  spawnClock=0;
  const counts=zones.map(()=>0);
  for(const item of items)counts[item.zone]++;
  const view={left:originX,right:originX+width/zoom,top:originY,bottom:originY+height/zoom};
  zones.forEach((_,z)=>{
    const {cap,interval}=spawnLimits(state,state.region,z);
    if(counts[z]<cap&&zoneClocks[z]>=interval&&spawn(z,view))zoneClocks[z]=0;
  });
}
function toast(message){
  $('toast').textContent=message;clearTimeout(notice);
  notice=setTimeout(()=>$('toast').textContent='',2900);
}
function spark(x,y,color,count,angle=null){
  if(!state.fx)return;
  for(let n=0;n<count;n++){
    const particle=particles[particleIndex++%particles.length], a=angle===null?Math.random()*Math.PI*2:angle+(Math.random()-.5)*1.05;
    const speed=25+Math.random()*160;
    Object.assign(particle,{x,y,color,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.22+Math.random()*.48});
  }
}
const missionBonus=i=>[135,410,900,2200][i];
function deliver(b){
  const bin=bins.indexOf(b);
  let size=0,count=0,amount=0,bonus=0;
  const recovered=[];
  for(const kind of Object.keys(state.tank)){
    const n=state.tank[kind];
    if(materials[kind].bin!==bin||!n)continue;
    count+=n;size+=sizes[kind]*n;
    const pending=state.pending.reduce((sum,stock)=>sum+stock[kind],0);
    amount+=(pending+(n-pending)*1.25)*priceFor(state,kind);
    const result=addTreatment(state,kind);
    bonus+=result.bonus;recovered.push(...result.recovered);
    state.tank[kind]=0;
  }
  if(!count){
    toast(L(b.name)+' · '+tx('El dipòsit no conté materials compatibles','El depósito no contiene materiales compatibles'));
    return;
  }
  const wasEligible=eligible(state);
  cleanSummary=mapPercent(state,state.region);
  const previous=state.counts[state.region], previousTotal=progressTotal();
  const value=Math.max(1,Math.round(amount));
  state.counts[state.region]+=count;state.types[bin]+=count;
  state.stats.recycled+=count;state.stats.deliveries++;
  state.pi+=Math.floor((previousTotal+count)/12)-Math.floor(previousTotal/12);
  addCredits(state,value);
  const map=maps[state.region];
  spark(b.x,b.y,b.color,16);
  toast('+'+value+' EC · '+count+' · −'+size+' '+tx('espai','espacio'));
  if(previous<map.goal&&state.counts[state.region]>=map.goal){
    state.education[state.region]=1;state.stats.maps++;state.pi+=2;
    addCredits(state,Math.round(missionBonus(state.region)*multiplier(state)));
    state.unlocked=Math.max(state.unlocked,Math.min(3,state.region+1));
    spark(b.x,b.y,'#fff5a7',32);chime(state,'win');
    toast(state.region===3?tx('Última missió completada','Última misión completada'):tx('Missió completada! Nou mapa disponible (M)','¡Misión completada! Nuevo mapa disponible (M)'));
  }else chime(state,'collect');
  if(recovered.length){
    const reward=Math.round(bonus*multiplier(state));
    addCredits(state,reward);
    spark(b.x,b.y,'#c7f474',42);chime(state,'win');
    const label=cleanSummary===100?tx('Regió recuperada','Región recuperada'):recovered.map(z=>L(zones[z])).join(', ');
    toast(label+' ✓ · +'+(value+reward)+' EC'+(previous<map.goal&&state.counts[state.region]>=map.goal&&state.region<3?' · M':''));
  }
  checkAchievements();save(state);hud();
  if(!wasEligible&&eligible(state))toast(tx('Ja pots renàixer!','¡Ya puedes renacer!'));
}
function checkAchievements(){
  achievements.forEach(([condition,value],i)=>{
    if(!state.ach[i]&&condition()){state.ach[i]=1;addCredits(state,Math.round(value*multiplier(state)));}
  });
}
function avoid(o,r,dt){
  for(const obstacle of world.obstacles){
    const dx=o.x-obstacle.x,dy=o.y-obstacle.y,limit=r+obstacle.r;
    if(Math.abs(dx)>=limit||Math.abs(dy)>=limit)continue;
    const d=Math.hypot(dx,dy)||.0001;
    if(d<limit){
      const nx=dx/d||(!dy?1:0),ny=dy/d;
      o.x=obstacle.x+nx*limit;o.y=obstacle.y+ny*limit;
      if(dt){const dot=o.vx*nx+o.vy*ny;if(dot<0){o.vx-=dot*nx*1.3;o.vy-=dot*ny*1.3}}
    }
  }
  o.x=clamp(o.x,r,W-r);o.y=clamp(o.y,state.region===1?150+r:r,H-r);
}
function simulation(dt){
  let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+stick.x;
  let y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+stick.y;
  const len=Math.hypot(x,y);
  if(len>1){x/=len;y/=len}
  p.walk=len>.08;
  const speed=(195+state.levels[5]*18)*(1+state.permanent[2]*prestige[2][2]);
  p.x+=x*speed*dt;p.y+=y*speed*dt;avoid(p,10,0);
  if(aim.current)p.angle=Math.atan2(aim.y/zoom+originY-p.y,aim.x/zoom+originX-p.x);
  else if(p.walk)p.angle=Math.atan2(y,x);
  const wants=pointerAir||touchAir||keys.has(' ');
  if(!wants)cooldown=0;
  let remaining=room();
  blockedNotice=Math.max(0,blockedNotice-dt);
  air=wants&&cooldown===0&&energy>0&&remaining>0;
  if(wants&&!remaining&&!blockedNotice){
    toast(tx('Dipòsit ple. Ves a una estació de reciclatge','Depósito lleno. Ve a una estación de reciclaje'));
    blockedNotice=2.8;
  }
  if(air){
    energy=Math.max(0,energy-(19*tool()[6]/(1+.16*state.levels[2]))*dt);
    if(!energy){cooldown=1;toast(tx('Bateria buida · solta el botó per a recarregar','Batería vacía · suelta el botón para recargar'))}
    if(state.fx&&Math.random()<dt*(23+Math.min(22,tool()[4]*3))){
      const a=p.angle+(Math.random()-.5)*tool()[8]*1.8;
      const d=30+Math.random()*suctionStats(state).reach*.74;
      const particle=particles[particleIndex++%particles.length];
      const x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;
      const life=.15+d*.0025;
      Object.assign(particle,{x,y,color:tool()[7],vx:(p.x+Math.cos(p.angle)*17-x)/life,vy:(p.y+Math.sin(p.angle)*17-y)/life,life});
    }
  }else energy=Math.min(capacity(),energy+(18+state.levels[4]*5)*dt);
  const stats=suctionStats(state);
  p.cx=Math.cos(p.angle);p.cy=Math.sin(p.angle);
  const drag=Math.exp(-5*dt);
  let changed=false;
  for(let i=items.length-1;i>=0;i--){
    const o=items[i];
    if(air&&sizes[o.kind]<=remaining&&Math.abs(o.x-p.x)<stats.reach&&Math.abs(o.y-p.y)<stats.reach&&pull(o,p,stats,dt)){
      if(capture(state,o.kind,remaining)){
        state.pending[o.zone][o.kind]++;
        remaining-=sizes[o.kind];items.splice(i,1);changed=true;
        spark(p.x+p.cx*17,p.y+p.cy*17,tool()[7],3);
        continue;
      }
    }
    if(Math.abs(o.vx)+Math.abs(o.vy)<.12)continue;
    o.x+=o.vx*dt;o.y+=o.vy*dt;o.angle+=(o.vx-o.vy)*dt*.024;
    o.vx*=drag;o.vy*=drag;
    avoid(o,7,dt);
  }
  if(changed){
    chime(state,'rustle');save(state);
  }
  regenerate(dt);
  playClock+=dt;
  if(playClock>=1){state.stats.seconds++;playClock-=1;if(state.stats.seconds%10===0)save(state);}
}

function resize(){
  const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
  ratio=Math.min(2,devicePixelRatio||1);
  canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
}
new ResizeObserver(resize).observe(canvas);
function render(dt){
  zoom=clamp(width/1000,.77,1.22)*state.zoom;
  const targetX=playing?p.x:740+Math.sin(time*.15)*55,targetY=playing?p.y:335;
  camera.x+=(targetX-camera.x)*Math.min(1,dt*5);camera.y+=(targetY-camera.y)*Math.min(1,dt*5);
  const viewW=width/zoom,viewH=height/zoom;
  originX=viewW>W?(W-viewW)/2:clamp(camera.x-viewW/2,0,W-viewW);
  originY=viewH>H?(H-viewH)/2:clamp(camera.y-viewH/2,0,H-viewH);
  c.setTransform(ratio,0,0,ratio,0,0);
  c.fillStyle=maps[state.region].ground;c.fillRect(0,0,width,height);
  c.scale(zoom,zoom);c.translate(-originX,-originY);c.drawImage(world.layer,0,0);
  const visible=(x,y)=>x>originX-75&&x<originX+viewW+75&&y>originY-65&&y<originY+viewH+106;
  if(state.region===1&&state.fx){
    c.strokeStyle='#e0fff48a';c.lineWidth=2;
    for(let x=0;x<W;x+=120){
      const y=90+Math.sin(x/260+time*1.6)*13;
      if(!visible(x,y))continue;
      c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+30,y-10,x+73,y);c.stroke();
    }
  }
  renderRecovery(c,visible);
  activeBins.filter(b=>visible(b.x,b.y)).forEach(b=>station(c,b,L(b.name),playing));
  items.filter(o=>visible(o.x,o.y)).forEach(o=>debris(c,o));
  if(air){
    c.save();c.translate(p.x,p.y);c.rotate(p.angle);
    const {reach:r,cone}=suctionStats(state);
    const gradient=c.createLinearGradient(0,0,r,0);
    gradient.addColorStop(0,'#fbffed48');gradient.addColorStop(1,'#fbffed00');
    c.beginPath();c.moveTo(10,0);c.arc(0,0,r,-cone,cone);c.closePath();c.fillStyle=gradient;c.fill();c.restore();
  }
  const sorted=world.props.filter(o=>visible(o.x,o.y));
  sorted.push(playing?p:{...p,x:1050+Math.sin(time*.32)*80,y:340,angle:time*.32,walk:true,preview:true});
  sorted.sort((a,b)=>a.y-b.y);
  for(const o of sorted){
    if(o===p||o.preview)player(c,o,tool()[7],time,air,state.equipped);
    else scenery(c,o,state.region,recoveryStage(zonePercent(state,state.region,o.zone)));
  }
  for(const v of particles){
    if(v.life<=0)continue;
    v.life-=dt;v.x+=v.vx*dt;v.y+=v.vy*dt;
    c.globalAlpha=clamp(v.life,0,1);
    ellipse(c,v.x,v.y,3,1.7,v.color);
  }
  c.globalAlpha=1;
}
const recoverySites=[[230,238],[1070,714],[180,560],[1420,535]];
function renderRecovery(c,visible){
  for(let z=0;z<zones.length;z++){
    const [x,y]=recoverySites[z];
    if(!visible(x,y))continue;
    const stage=recoveryStage(zonePercent(state,state.region,z));
    ellipse(c,x,y,54,25,['#55493740','#7b77392e','#669d552d','#a8e07539'][stage]);
    for(let n=0;n<3+stage*3;n++){
      const dx=(n*23%95)-47,dy=(n*11%37)-19;
      ellipse(c,x+dx,y+dy,5,2,stage?'#548251':'#77734c');
      if(stage>=2)ellipse(c,x+dx,y+dy-3,3,3,stage===3?'#fff2a0':'#bada88');
    }
    if(stage===3&&state.fx)ellipse(c,x+Math.sin(time*1.8)*26,y-16,2,2,'#fff2b1c0');
  }
  if(visible(depot.x,depot.y)){
    const marker={...depot,mark:'↻',color:'#adf6d1'};
    station(c,marker,buttons.maintenance(),true);
  }
}
const btn=(label,action,primary=false,disabled=false)=>`<button data-action="${action}" ${primary?'class="primary"':''} ${disabled?'disabled':''}>${label}</button>`;
const card=(title,description,action='')=>`<article class="card"><h3>${title}</h3><p>${description}</p>${action}</article>`;
const grid=cards=>`<div class="cards">${cards.join('')}</div>`;
const help=()=>tx('WASD o fletxes · Apunta amb el ratolí · Mantín clic o espai per a aspirar · E recicla · M mapa · U millores · V aspiradores · Esc pausa. En mòbil, mou-te amb el joystick, toca el terreny per a apuntar i mantín el botó de la dreta.',
'WASD o flechas · Apunta con el ratón · Mantén clic o espacio para aspirar · E recicla · M mapa · U mejoras · V aspiradoras · Esc pausa. En móvil, muévete con el joystick, toca el terreno para apuntar y mantén el botón de la derecha.');
function layout(){
  document.documentElement.lang=state.lang?'es':'ca-valencia';
  $('home').hidden=playing;$('shade').hidden=playing;$('nav').hidden=!playing;$('touch').hidden=!playing;
  $('home').innerHTML=`<h1>ECO BLOWER<span>2030 <small>V3</small></span></h1><p>${tx('Aspira residus dispersos, recull-los al dipòsit i recicla’ls per recuperar quatre ecosistemes.','Aspira residuos dispersos, guárdalos en el depósito y recíclalos para recuperar cuatro ecosistemas de forma permanente.')}</p><div class="buttons">${btn(playLabel(),'play',true)}${['ods','settings','credits'].map(id=>btn(buttons[id](),id)).join('')}</div>`;
  $('nav').innerHTML=['map','shop','vacuum','missions','rebirth','stats','ods','pause'].map(id=>btn(buttons[id](),id)).join('');
  $('footer').textContent=playing?help():tx('Un videojoc sobre els Objectius de Desenvolupament Sostenible','Un videojuego sobre los Objetivos de Desarrollo Sostenible');
  $('hud').hidden=!playing;hud();
}
function hud(){
  if(!playing)return;
  if(!$('wallet')){
    $('hud').innerHTML=`<div class="hud-card" id="mission"><strong id="area"></strong><br><span id="goal"></span><progress id="goalBar" aria-label="Missió / Misión"></progress><span id="cleanLocal"></span><progress id="cleanBar" max="100" aria-label="Neteja / Limpieza"></progress></div><div class="hud-card"><b id="wallet"></b><br><span id="device"></span><progress id="power" aria-label="Energia / Energía"></progress><span id="tankLabel"></span><progress id="tankBar" aria-label="Dipòsit / Depósito"></progress></div><div id="nearStation" class="hud-card" hidden></div>`;
  }
  $('area').textContent=L(maps[state.region].name);
  $('goal').textContent=missionName()+' · '+Math.min(state.counts[state.region],maps[state.region].goal)+'/'+maps[state.region].goal;
  $('goalBar').max=maps[state.region].goal;$('goalBar').value=state.counts[state.region];
  $('wallet').textContent=state.ec.toLocaleString()+' EC · '+state.pi+' PI · '+state.gems+' EG · ↻ '+state.rebirth;
  $('device').textContent='EcoVac '+L(tool())+' · '+Math.ceil(energy)+'/'+capacity();
  $('power').max=capacity();$('power').value=energy;
  const max=tankSize(state),fill=used(state),fraction=fill/max;
  $('tankLabel').textContent=tx('Dipòsit','Depósito')+' '+fill+'/'+max;
  $('tankBar').max=max;$('tankBar').value=fill;
  $('tankBar').dataset.fill=fraction>=1?'full':fraction>=.85?'near':fraction>=.5?'high':'low';
  const local=zoneAt(p.x,p.y);
  $('cleanLocal').textContent=tx('Neteja','Limpieza')+' '+cleanSummary+'% · '+L(zones[local])+' '+zonePercent(state,state.region,local)+'%';
  $('cleanBar').value=cleanSummary;
  const b=nearby();
  $('nearStation').hidden=!b;
  if(b){
    const label=b===depot?buttons.maintenance()+' · E':L(b.name)+' · E / '+tx('Reciclar','Reciclar');
    if($('nearStation').textContent!==label)$('nearStation').innerHTML='<button data-action="deliver">'+label+'</button>';
  }
}
function price(i){return Math.round(upgrades[i][4]*upgradeGrowth**state.levels[i])}
function shop(){
  return grid(upgrades.map((u,i)=>{
    const level=state.levels[i],cost=price(i);
    return card('↑ '+L(u),u[2+state.lang]+' · '+tx('Nivell','Nivel')+' '+level+'/6',btn(level===6?tx('Nivell màxim','Nivel máximo'):cost+' EC','upgrade-'+i,true,level===6||state.ec<cost));
  }))+ '<h3>'+tx('Contingut del dipòsit','Contenido del depósito')+'</h3>'+
    grid(bins.map((b,i)=>card(L(b.name),Object.keys(state.tank).filter(k=>materials[k].bin===i)
      .reduce((n,k)=>n+state.tank[k],0)+' '+tx('peces','piezas'))));
}
function vacuum(){
  const next=tools.find((_,i)=>!state.owned[i]);
  const overview='<p>'+tx('Equipada','Equipada')+' · EcoVac '+L(tool())+' · '+
    (next?tx('Següent','Siguiente')+' EcoVac '+L(next)+' · '+next[2].toLocaleString()+' EC':tx('Catàleg complet','Catálogo completo'))+'</p>';
  return overview+grid(tools.map((t,i)=>{
    const locked=i>0&&!state.owned[i-1];
    const small=used(state)>tankSize({...state,equipped:i});
    const desc=tx('Força','Fuerza')+' ×'+t[4]+' · '+t[3]+' '+tx('de dipòsit','de depósito')+
      ' · '+(124+t[5])+' '+tx('d’abast','de alcance')+' · '+Math.round(t[8]*360/Math.PI)+'° · '+tx('Consum','Consumo')+' ×'+t[6];
    const label=state.equipped===i?tx('Equipada','Equipada'):locked?tx('Compra el model anterior','Compra el modelo anterior'):
      small?tx('Buida espai abans','Libera espacio antes'):state.owned[i]?tx('Equipar','Equipar'):t[2].toLocaleString()+' EC';
    return card('<span class="tag" style="background:'+t[7]+'">●</span>EcoVac '+L(t),desc,
      btn(label,'tool-'+i,true,locked||small||state.equipped===i||!state.owned[i]&&state.ec<t[2]));
  }));
}
function rebirthPanel(){
  const goals=state.counts.slice(0,3).filter((n,i)=>n>=maps[i].goal).length;
  return (used(state)?'<p>'+tx('Buida el dipòsit abans de renàixer.','Vacía el depósito antes de renacer.')+'</p>':'')+'<p>'+tx('Renaixements','Renacimientos')+' '+state.rebirth+' · '+state.gems+' EG · ×'+multiplier(state).toFixed(2)+' → ×'+(multiplier(state)+.15).toFixed(2)+'</p>'+
    '<p>'+state.stats.runEarned.toLocaleString()+' / '+required(state).toLocaleString()+' EC '+tx('guanyats este cicle','ganados este ciclo')+
    ' · EcoVac Solar '+(state.owned[4]?'✓':'◇')+' · '+tx('Missions del parc, platja i bosc','Misiones del parque, playa y bosque')+' '+goals+'/3</p>'+
    btn(tx('Renàixer…','Renacer…'),'rebirthPrompt',true,!eligible(state))+
    '<h3>'+tx('Millores permanents','Mejoras permanentes')+'</h3>'+grid(prestige.map((v,i)=>{
      const n=state.permanent[i],price=boughtPrice(n);
      return card(L(v),Math.round(v[2]*100)+'% '+tx('per nivell','por nivel')+' · '+n+'/5',btn(price+' EG','permanent-'+i,true,n>=5||state.gems<price));
    }));
}
const campaignKinds=()=>['paper','bottle','leaf',maps[state.region].item]
  .filter((kind,i,all)=>all.findIndex(k=>materials[k].bin===materials[kind].bin)===i);
const campaignLoad=kind=>Math.min(8+state.region*5+state.equipped*4,Math.floor(tankSize(state)/sizes[kind]));
function maintenancePanel(){
  return '<p>'+tx('Recull materials donats i porta’ls a l’estació corresponent. Cada entrega de campanya paga un 25 % extra. La neteja de la regió es manté.',
    'Recoge materiales donados y llévalos a la estación correspondiente. Cada entrega de campaña paga un 25 % extra. La limpieza de la región se conserva.')+'</p>'+
    (used(state)?'<p>'+tx('Buida el dipòsit abans de recollir una donació.','Vacía el depósito antes de recoger una donación.')+'</p>':'')+
    grid(campaignKinds().map((kind,i)=>{
      const quantity=campaignLoad(kind), station=bins[materials[kind].bin];
      return card(L(station.name),quantity+' '+tx('peces','piezas')+' · '+Math.round(quantity*priceFor(state,kind)*1.25)+' EC',
        btn(tx('Recull la donació','Recoge la donación'),'campaign-'+i,true,used(state)>0));
    }));
}
function statistics(){
  const a=state.stats;
  const rows=[
    [tx('Temps jugat','Tiempo jugado'),Math.floor(a.seconds/60)+' min '+a.seconds%60+' s'],
    [tx('Residus aspirats','Residuos aspirados'),a.suctioned],[tx('Residus reciclats','Residuos reciclados'),a.recycled],
    ['EC '+tx('històrics','históricos'),a.earned],['EC '+tx('del cicle','del ciclo'),a.runEarned],
    [tx('Entregues','Entregas'),a.deliveries],[tx('Models en este cicle','Modelos en este ciclo'),state.owned.filter(Boolean).length+'/8'],
    [tx('Compres acumulades','Compras acumuladas'),Math.max(0,a.vacuums-1)],
    [tx('Mapes recuperats diferents','Mapas recuperados distintos'),state.education.filter(Boolean).length+'/4'],
    [tx('Restauracions totals','Restauraciones totales'),a.maps],[tx('Renaixements','Renacimientos'),state.rebirth]
  ];
  return grid(rows.map(([name,value])=>card(name,typeof value==='number'?value.toLocaleString():value)));
}

function settings(){
  const check=(id,label)=>`<label class="setting">${label}<input type="checkbox" data-setting="${id}" ${state[id]?'checked':''}></label>`;
  return `<label class="setting">${tx('Idioma','Idioma')}<select data-setting="lang"><option value="0">Valencià</option><option value="1" ${state.lang?'selected':''}>Castellano</option></select></label>
  ${check('sound',tx('So','Sonido'))}${check('music',tx('Música ambiental','Música ambiental'))}${check('fx',tx('Partícules i ones animades','Partículas y olas animadas'))}
  <label class="setting">${tx('Volum','Volumen')}<input type="range" min="0" max="1" step=".05" value="${state.volume}" data-setting="volume"></label>
  <label class="setting">Zoom <select data-setting="zoom">${[.85,1,1.15].map(n=>`<option value="${n}" ${n===state.zoom?'selected':''}>${n*100}%</option>`).join('')}</select></label>
  <p>${btn(tx('Reiniciar partida…','Reiniciar partida…'),'reset')}</p>`;
}
function show(id,restoreFocus=null){
  if(!modal.open){keys.clear();pointerAir=touchAir=false;stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';}
  panel=id;$('title').textContent=buttons[id]?.()||(id==='rebirthPrompt'?buttons.rebirth():tx('Reiniciar partida','Reiniciar partida'));
  const bodies={
    shop,settings,vacuum,stats:statistics,rebirth:rebirthPanel,maintenance:maintenancePanel,
    rebirthPrompt:()=>`<p>${tx('Tornaràs al parc amb l’EcoVac Bàsica. Reiniciaràs els EC i PI del cicle, les aspiradores, les millores temporals i el progrés dels mapes. Conservaràs les EcoGemmes, les millores permanents, els assoliments, les fites educatives, la neteja de totes les zones, les estadístiques i els ajustos.',
    'Volverás al parque con la EcoVac Básica. Se reiniciarán los EC y PI del ciclo, las aspiradoras, las mejoras temporales y el progreso de los mapas. Conservarás las EcoGemas, las mejoras permanentes, los logros, los hitos educativos, la limpieza de todas las zonas, las estadísticas y los ajustes.')}</p>
    <p>↻ ${state.rebirth} → ${state.rebirth+1} · +4 EG · ×${(multiplier(state)+.15).toFixed(2)}</p>${btn(tx('Confirma el renaixement','Confirma el renacimiento'),'rebirthConfirm',true)} ${btn(tx('Cancel·lar','Cancelar'),'rebirth')}`,
    help:()=>`<p>${help()}</p><p>${tx('Busca residus pels camins i les clarianes. Apunta a un residu per a aspirar-lo. Torna a una estació compatible i prem E. Al bosc, deixa la fullaraca de fora dels camins com a hàbitat. Busca Manteniment al sud de l’estació d’envasos per a fer recollides de donacions.','Busca residuos por los caminos y los claros. Apunta a un residuo para aspirarlo. Vuelve a una estación compatible y pulsa E. En el bosque, respeta la hojarasca que queda fuera de los caminos. Busca Mantenimiento al sur de la estación de envases para recoger donaciones.')}</p>`,
    map:()=>'<p>'+tx('Buida el dipòsit en les estacions abans de viatjar.','Vacía el depósito en las estaciones antes de viajar.')+'</p>'+grid(maps.map((m,i)=>card(L(m.name),L(m.mission)+' · ODS '+m.ids.join(', ')+'<br><strong>'+tx('Neteja','Limpieza')+' '+mapPercent(state,i)+'%</strong>'+
      zones.map((name,z)=>{const percent=zonePercent(state,i,z);return '<br><span class="recovery stage-'+recoveryStage(percent)+'">'+(percent===100?'✓':'●')+'</span> '+L(name)+' '+percent+'%';}).join(''),btn(i>state.unlocked?tx('Bloquejat','Bloqueado'):i===state.region?tx('Regió actual','Región actual'):tx('Viatjar','Viajar'),'travel-'+i,true,i===state.region||i>state.unlocked)))),
    missions:()=>grid(maps.map((m,i)=>card(L(m.mission),Math.min(m.goal,state.counts[i])+'/'+m.goal+' · '+missionBonus(i)+' EC + 2 PI · '+(state.counts[i]>=m.goal?tx('Completada','Completada'):i<=state.unlocked?tx('Disponible','Disponible'):tx('Bloquejada','Bloqueada')))))+
      '<h3>'+tx('Reptes i assoliments','Retos y logros')+'</h3>'+grid(achievements.map(([,value,name],i)=>card((state.ach[i]?'✓ ':'◇ ')+L(name),value+' EC · '+(state.ach[i]?tx('Aconseguit','Conseguido'):tx('Pendent','Pendiente'))))),
    ods:()=>grid(ods.map((o,i)=>{
      const places=maps.filter(m=>m.ids.includes(i+1)).map(LMap=>L(LMap.name));
      return card(`<span class="tag" style="background:${o[2]}">${i+1}</span>${L(o)}`,L(odsSummary[i])+'<br>'+tx('En la vida real','En la vida real')+' · '+o[3+state.lang]+(places.length?'<br>'+tx('En el joc','En el juego')+' · '+places.join(', '):''));
    })),
    pause:()=>`<div class="buttons">${btn(tx('Reprendre','Reanudar'),'resume',true)}${btn(buttons.help(),'help')}${btn(buttons.settings(),'settings')}${btn(tx('Menú principal','Menú principal'),'menu')}</div>`,
    credits:()=>`<p>${tx('Eco Blower 2030 és un projecte educatiu amb il·lustracions i sons originals.','Eco Blower 2030 es un proyecto educativo con ilustraciones y sonidos originales.')}</p><p><a style="color:#c7f474" href="https://sdgs.un.org/goals" target="_blank" rel="noopener">${tx('Objectius de Desenvolupament Sostenible de les Nacions Unides','Objetivos de Desarrollo Sostenible de las Naciones Unidas')}</a></p>`,
    reset:()=>`<p>${tx('Esta acció esborra el progrés de la partida.','Esta acción borra el progreso de la partida.')}</p>${btn(tx('Esborrar progrés','Borrar progreso'),'confirm',true)} ${btn(tx('Cancel·lar','Cancelar'),'settings')}`
  };
  const scroll=$('content').scrollTop;
  $('content').innerHTML=bodies[id]();
  if(!modal.open)modal.showModal();
  if(restoreFocus){
    const controls=[...$('content').querySelectorAll('button,input,select')];
    const target=controls.find(el=>!el.disabled&&(el.dataset.action===restoreFocus||el.dataset.setting===restoreFocus));
    (target||$('close')).focus({preventScroll:true});
    modal.scrollTop=scroll;
  }else modal.scrollTop=0;
}
function start(){
  playing=true;state.started=true;region(state.region);
  if(!save(state))toast(tx('Guardat local no disponible','Guardado local no disponible'));
  else if(!progressTotal())toast(tx('Explora els camins i jardins. Apunta a un residu i mantín clic o espai','Explora los caminos y jardines. Apunta a un residuo y mantén clic o espacio'));
  layout();canvas.focus({preventScroll:true});
}
function nearby(){
  let closest=null,distance=72;
  for(const b of [...activeBins,depot]){
    const d=Math.hypot(p.x-b.x,p.y-b.y);
    if(d<distance){closest=b;distance=d;}
  }
  return closest;
}
function inspect(){
  const closest=nearby();
  if(closest===depot)show('maintenance');
  else if(closest)deliver(closest);
  else toast(tx('Acosta’t a una estació per a reciclar','Acércate a una estación para reciclar'));
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button)return;
  activate();
  const action=button.dataset.action;
  const [prefix,raw]=action.split('-'), i=Number(raw);
  if(action==='maintenance'&&nearby()!==depot)return;
  if(buttons[action]||action==='reset'||action==='rebirthPrompt'&&eligible(state)){show(action);return}
  if(action==='play')start();
  if(prefix==='campaign'&&panel==='maintenance'&&nearby()===depot){
    const kind=campaignKinds()[i];
    if(!kind||used(state))return;
    const count=campaignLoad(kind);
    state.tank[kind]=count;
    save(state);modal.close();hud();
    toast(tx('Porta la donació a','Lleva la donación a')+' '+L(bins[materials[kind].bin].name)+' · '+count);
  }
  if(action==='deliver'&&playing&&!modal.open)inspect();
  if(action==='rebirthConfirm'&&panel==='rebirthPrompt'&&reborn(state)){
    region(0);modal.close();save(state);hud();spark(p.x,p.y,'#e6ffa0',48);
    if(state.fx)$('stage').animate([{opacity:.25},{opacity:1}],430);
    toast(tx('Nou cicle · +4 EcoGemmes','Nuevo ciclo · +4 EcoGemas'));chime(state,'win');
  }
  if(prefix==='permanent'&&prestige[i]&&state.permanent[i]<5){
    const cost=boughtPrice(state.permanent[i]);
    if(state.gems<cost)return;
    state.gems-=cost;state.permanent[i]++;save(state);hud();show('rebirth',action);
  }
  if(action==='resume')modal.close();
  if(action==='menu'){playing=false;modal.close();layout();save(state)}
  if(action==='confirm'){
    const config={lang:state.lang,sound:state.sound,music:state.music,fx:state.fx,volume:state.volume,zoom:state.zoom};
    state=Object.assign(fresh(),config);save(state);playing=false;region(0);modal.close();layout();
  }
  if(prefix==='travel'&&maps[i]&&i<=state.unlocked&&i!==state.region){
    if(used(state)){
      if(modal.open)modal.close();
      toast(tx('Recicla el contingut del dipòsit abans de viatjar','Recicla el contenido del depósito antes de viajar'));
      return;
    }
    region(i);modal.close();save(state);hud();chime(state,'map');toast(L(maps[i].name));
  }
  if(prefix==='upgrade'&&upgrades[i]&&state.levels[i]<6&&state.ec>=price(i)){
    state.ec-=price(i);state.levels[i]++;checkAchievements();save(state);hud();chime(state,'buy');spark(p.x,p.y,'#dbffa3',20);show('shop',action);
  }
  if(prefix==='tool'&&tools[i]){
    const t=tools[i];
    const wasEligible=eligible(state);
    if(used(state)>tankSize({...state,equipped:i}))return;
    if(!state.owned[i]){
      if(!state.owned[i-1]||state.ec<t[2])return;
      state.ec-=t[2];state.owned[i]=1;state.stats.vacuums++;
      toast(tx('Nova aspiradora disponible','Nueva aspiradora disponible')+' · EcoVac '+L(t));
    }
    state.equipped=i;checkAchievements();save(state);hud();chime(state,'buy');show('vacuum',action);
    if(!wasEligible&&eligible(state))toast(tx('Ja pots renàixer!','¡Ya puedes renacer!'));
  }
});
$('content').addEventListener('change',event=>{
  const el=event.target, setting=el.dataset.setting;
  if(!setting)return;
  activate();state[setting]=el.type==='checkbox'?el.checked:Number(el.value);
  save(state);layout();if(setting==='lang')show('settings','lang');
});
$('close').onclick=()=>modal.close();
modal.addEventListener('close',()=>{if(playing)canvas.focus({preventScroll:true})});
window.addEventListener('keydown',event=>{
  if(!playing||modal.open)return;
  const k=event.key.toLowerCase();
  if((k===' '||k==='enter')&&event.target.closest('button,a'))return;
  if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(k))event.preventDefault();
  keys.add(k);
  if(event.repeat)return;
  if(k===' ')activate();
  if(k==='escape')show('pause');
  if(k==='u')show('shop');
  if(k==='v')show('vacuum');
  if(k==='m')show('map');
  if(k==='e')inspect();
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();pointerAir=touchAir=false;stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';});
function aimAt(event){
  const r=canvas.getBoundingClientRect();
  Object.assign(aim,{x:event.clientX-r.left,y:event.clientY-r.top,current:true});
}
canvas.addEventListener('pointermove',e=>{if(playing&&(e.pointerType==='mouse'||canvas.hasPointerCapture(e.pointerId)))aimAt(e)});
canvas.addEventListener('pointerdown',e=>{
  if(!playing||e.button!==0)return;
  aimAt(e);activate();canvas.setPointerCapture(e.pointerId);
  if(e.pointerType==='mouse')pointerAir=true;
});
canvas.addEventListener('lostpointercapture',()=>pointerAir=false);
$('boost').addEventListener('pointerdown',e=>{e.currentTarget.setPointerCapture(e.pointerId);touchAir=true;activate()});
$('boost').addEventListener('lostpointercapture',()=>touchAir=false);
const stickEl=$('stick');
function steer(e){
  const r=stickEl.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const d=Math.max(29,Math.hypot(dx,dy));
  stick.x=dx/d;stick.y=dy/d;
  stickEl.firstElementChild.style.transform=`translate(${stick.x*27}px,${stick.y*27}px)`;
}
stickEl.addEventListener('pointerdown',e=>{stickEl.setPointerCapture(e.pointerId);steer(e);activate()});
stickEl.addEventListener('pointermove',e=>{if(stickEl.hasPointerCapture(e.pointerId))steer(e)});
stickEl.addEventListener('lostpointercapture',()=>{stick.x=stick.y=0;stickEl.firstElementChild.style.transform=''});
function frame(now){
  const dt=clamp((now-last)/1000,0,.033);last=now;time+=dt;
  if(playing&&!modal.open){simulation(dt);if(now-uiTime>110){hud();uiTime=now;}}
  else air=false;
  ambient(state,air);render(dt);
  requestAnimationFrame(frame);
}
window.addEventListener('pagehide',()=>save(state));
region(state.region);layout();resize();requestAnimationFrame(frame);
