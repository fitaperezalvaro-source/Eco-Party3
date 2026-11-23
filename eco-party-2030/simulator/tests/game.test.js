import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bins,maps,tools,sizes} from '../src/data.js';
import {load,key,previousKey,legacyKey,tankSize,used,emptyTank,fresh,eligible,multiplier,required,priceFor} from '../src/state.js';
import {pull,suctionStats,findSpawn} from '../src/suction.js';
import {rng} from '../src/art.js';
import {depot,entrance,onRoad,zoneAt} from '../src/terrain.js';
import {spawnLimits,density,goals,mapPercent,recoveryStage,zonePercent} from '../src/restoration.js';
import {readFile} from 'node:fs/promises';

test('Partida V3: aspiración, depósito, entrega, tienda, mapas y renacimiento',async()=>{
  const database=new Map(), elements=new Map(), events=new Map();
  const ctx=new Proxy({},{
    get(_,prop){
      if(prop==='measureText')return s=>({width:s.length*6});
      if(prop==='createLinearGradient')return ()=>({addColorStop(){}});
      return ()=>{};
    }
  });
  function element(id){
    if(!elements.has(id))elements.set(id,{
      open:false,dataset:{},animate(){},firstElementChild:{style:{}},addEventListener(){},focus(){},
      showModal(){this.open=true},close(){this.open=false},getContext:()=>ctx,
      getBoundingClientRect:()=>({width:1100,height:650,left:0,top:0}),
      querySelectorAll:()=>[]
    });
    return elements.get(id);
  }
  Object.assign(globalThis,{
    localStorage:{getItem:k=>database.get(k),setItem:(k,v)=>database.set(k,v),removeItem:k=>database.delete(k)},
    document:{getElementById:element,createElement:()=>element('offscreen'),documentElement:{},addEventListener:(k,v)=>events.set(k,v)},
    window:{addEventListener:(k,v)=>events.set(k,v)}, ResizeObserver:class{observe(){}},devicePixelRatio:1,
    requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){}
  });
  let source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
  source=source.replaceAll(/from '(\.\/[^']+)'/g,(_,path)=>"from '"+new URL(path,new URL('../src/',import.meta.url)).href+"'");
  source+='\nexport {state,p,items,aim,keys,start,simulation,render,region,activeBins,world};';
  const game=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const action=name=>events.get('click')({target:{closest:()=>({dataset:{action:name}})}});
  const tick=(n)=>{for(let i=0;i<n;i++)game.simulation(1/60)};
  action('play');
  game.render(1/60);
  assert.equal(game.state.started,true);
  game.keys.add('w');tick(5);game.keys.clear();assert.ok(game.p.y<270);
  assert.ok(game.items.length>45);
  assert.equal(mapPercent(game.state,0),0);
  for(const item of game.items){
    assert.ok(bins.every(b=>Math.hypot(item.x-b.x,item.y-b.y)>=140));
    assert.ok(game.world.obstacles.every(p=>Math.hypot(item.x-p.x,item.y-p.y)>=p.r+22));
  }
  assert.ok(game.items.filter(item=>bins.every(b=>Math.hypot(item.x-b.x,item.y-b.y)>=250)).length>=game.items.length*.85);

  const state=game.state;
  Object.assign(game.p,{x:397,y:270,angle:0});
  const target={kind:'paper',zone:0,x:470,y:270,vx:0,vy:0,angle:0};
  const behind={kind:'paper',zone:0,x:355,y:270,vx:0,vy:0,angle:0};
  game.items.push(target,behind);
  game.keys.add(' ');tick(8);
  assert.ok(target.x<470&&game.items.includes(target));
  assert.equal(behind.x,355);
  tick(90);game.keys.clear();
  assert.equal(state.tank.paper,1);
  assert.equal(state.ec,0);
  assert.equal(state.pending[0].paper,1);
  assert.equal(mapPercent(state,0),0);
  assert.equal(load().pending[0].paper,1);
  assert.equal(state.stats.suctioned,1);
  assert.ok(!game.items.includes(target));
  game.items.splice(0,game.items.length);
  tick(220);assert.ok(game.items.length>0&&game.items.length<density[0]);
  state.tank.paper=24;
  const large={kind:'carton',zone:0,x:419,y:270,vx:0,vy:0,angle:0};
  game.items.push(large);
  game.keys.add(' ');tick(8);game.keys.clear();
  assert.ok(game.items.includes(large));
  assert.equal(used(state),24);
  state.tank.paper=25;
  const extra={kind:'paper',zone:0,x:418,y:270,vx:0,vy:0,angle:0};
  game.items.push(extra);
  game.keys.add(' ');tick(8);game.keys.clear();
  assert.ok(game.items.includes(extra));
  assert.equal(used(state),tankSize(state));
  game.p.x=750;
  action('deliver');assert.equal(state.ec,0);
  game.p.x=500;
  const expected=Math.round((1+24*1.25)*priceFor(state,'paper'))+5;
  action('deliver');
  assert.equal(state.tank.paper,0);assert.equal(state.ec,expected);
  assert.equal(state.clean[0][0],1);
  assert.equal(zonePercent(state,0,0),5);
  assert.equal(state.stats.deliveries,1);assert.equal(state.ach[0],1);
  action('deliver');assert.equal(state.ec,expected);
  action('upgrade-0');assert.equal(state.levels[0],1);
  assert.equal(suctionStats(state).power,1.16);
  element('modal').close();
  action('travel-1');assert.equal(state.region,0);

  for(let index=0;index<4;index++){
    if(index)action('travel-'+index);
    assert.equal(state.region,index);
    game.render(1/60);
    for(const obstacle of game.world.obstacles){
      assert.equal(onRoad(obstacle.x,obstacle.y,obstacle.r+30),false);
      assert.ok([...bins,depot,entrance].every(b=>Math.hypot(b.x-obstacle.x,b.y-obstacle.y)>100));
    }
    for(const item of game.items)assert.equal(zoneAt(item.x,item.y),item.zone);
    game.p.x=500;game.p.y=270;
    game.items.splice(0,game.items.length);
    for(let z=0;z<4;z++){
      while(state.clean[index][z]<goals[index][z]){
        const n=Math.min(tankSize(state),goals[index][z]-state.clean[index][z]);
        state.tank.paper=n;
        state.pending[z].paper=n;
        action('deliver');
      }
    }
    assert.equal(mapPercent(state,index),100);
    tick(720);
    assert.equal(game.items.length,0);
    const cleanRevenue=state.ec;
    action('deliver');assert.equal(state.ec,cleanRevenue);
    while(state.counts[index]<maps[index].goal){
      state.tank.paper=Math.min(tankSize(state),maps[index].goal-state.counts[index]);
      action('deliver');
    }
    assert.equal(state.unlocked,Math.min(3,index+1));
    assert.equal(state.education[index],1);
  }
  assert.equal(state.stats.maps,4);
  game.p.x=depot.x;game.p.y=depot.y;
  const preCampaign=state.ec;
  action('deliver');
  assert.match(element('content').innerHTML,/campaign-0/);
  action('campaign-0');assert.ok(state.tank.paper>0);
  game.p.x=500;game.p.y=270;action('deliver');
  assert.ok(state.ec>preCampaign);assert.equal(mapPercent(state,3),100);
  assert.equal(game.items.length,0);
  assert.equal(eligible(state),false);
  state.ec=tools.slice(1).reduce((sum,t)=>sum+t[2],0);
  action('tool-2');assert.equal(state.owned[2],0);
  for(let i=1;i<tools.length;i++){
    const before=state.ec;
    action('tool-'+i);
    assert.equal(state.ec,before-tools[i][2]+(i===4?85:0));
    assert.equal(state.equipped,i);
  }
  action('tool-7');assert.equal(state.ec,85);
  state.tank.paper=26;
  action('tool-0');assert.equal(state.equipped,7);
  state.tank=emptyTank();
  action('tool-0');assert.equal(state.equipped,0);
  state.stats.runEarned=required(state);
  state.stats.earned=required(state);
  const carriedHistory=state.stats.earned;
  action('rebirthConfirm');assert.equal(state.rebirth,0);
  action('rebirthPrompt');assert.equal(state.rebirth,0);
  action('rebirthConfirm');assert.equal(state.rebirth,1);
  assert.equal(multiplier(state),1.15);assert.equal(state.gems,4);
  assert.equal(state.ec,0);assert.equal(state.equipped,0);assert.deepEqual(state.owned,[1,0,0,0,0,0,0,0]);
  assert.equal(state.stats.earned,carriedHistory);assert.equal(state.stats.runEarned,0);
  assert.deepEqual(state.clean,goals);
  assert.deepEqual(state.education,[1,1,1,1]);assert.equal(state.ach[0],1);
  action('permanent-1');assert.equal(state.gems,2);assert.equal(tankSize(state),27);
  assert.deepEqual(load(),state);
  database.set(key,JSON.stringify({...state,ec:-1,equipped:19,tank:{paper:100,can:100},gems:-30}));
  const recovered=load();
  assert.equal(recovered.ec,0);assert.equal(recovered.gems,0);assert.equal(recovered.equipped,0);
  assert.equal(used(recovered),tankSize(recovered));
  database.delete(key);
  database.set(previousKey,JSON.stringify({version:2,started:true,ec:100,counts:[37],tank:{bottle:2}}));
  const previous=load();assert.equal(previous.clean[0].reduce((a,b)=>a+b,0),37);assert.equal(previous.tank.bottle,2);
  database.delete(previousKey);
  database.set(legacyKey,JSON.stringify({started:true,ec:100,unlocked:1,region:1,counts:[16,2],owned:[1,1,1],equipped:2,lang:1}));
  const migrated=load();assert.equal(migrated.version,3);assert.equal(migrated.ec,100);assert.equal(migrated.region,1);
  assert.equal(migrated.counts[0],maps[0].goal);assert.equal(migrated.equipped,0);
  action('reset');action('confirm');
  assert.equal(game.state.started,false);assert.equal(game.state.ec,0);assert.ok(database.has(legacyKey));
});

test('La fuerza cae con la distancia y se amortigua con el peso',()=>{
  const s=fresh(), player={x:0,y:0,cx:1,cy:0}, stats=suctionStats(s);
  const object=(x,y,kind='paper')=>({kind,x,y,vx:0,vy:0});
  const near=object(48,0),far=object(101,0),side=object(40,45),heavy=object(48,0,'glass');
  for(const item of [near,far,side,heavy])pull(item,player,stats,1/60);
  assert.ok(near.vx<far.vx&&far.vx<0);
  assert.ok(Math.abs(near.vx)>Math.abs(heavy.vx));
  assert.equal(side.vx,0);assert.equal(side.vy,0);
  assert.equal(sizes.glass,5);
  assert.ok(findSpawn(1,[],[],rng(2),'bottle',{x:500,y:500}).y>=185);
});

test('Cuotas y frecuencia de reaparición decrecen hasta recuperar por completo',()=>{
  const state=fresh();
  const opening=spawnLimits(state,0,0);
  state.clean[0][0]=Math.floor(goals[0][0]/2);
  const mid=spawnLimits(state,0,0);
  assert.ok(mid.cap<opening.cap&&mid.interval>opening.interval);
  assert.equal(recoveryStage(zonePercent(state,0,0)),1);
  state.clean[0][0]=goals[0][0];
  assert.deepEqual(spawnLimits(state,0,0),{cap:0,interval:Infinity});
  assert.equal(recoveryStage(zonePercent(state,0,0)),3);
});
