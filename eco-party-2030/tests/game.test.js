import test from 'node:test';
import assert from 'node:assert/strict';
import {games,route,tiles} from '../src/data.js';
import {award,land,makeMatch,moveStep,nextTurn,rank,readSave,roll,selectGame,stars} from '../src/model.js';
import {bot,input,makeArcade,tick} from '../src/arcade.js';

function seeded(seed){
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
}
test('dado, camino circular, recompensas, ronda y desempate',()=>{
 const s=makeMatch([{},{}],2,'board');
 assert.equal(roll(()=>0),1);
 assert.equal(roll(()=>.999),6);
 for(let i=0;i<route.length;i++)moveStep(s.players[0]);
 assert.equal(s.players[0].position,0);
 assert.equal(land(s).id,tiles[0].id);
 award(s,[40,0]);assert.equal(s.players[0].points,22);
 assert.equal(stars(25),1);assert.equal(rank(s.players)[0].id,0);
 for(let i=0;i<3;i++)assert.equal(nextTurn(s),'ready');
 assert.equal(nextTurn(s),'final');
 const seen=Array.from({length:8},()=>selectGame(s,()=>0));
 assert.equal(new Set(seen).size,8);
});
test('guardado recuperable y validación de preferencias',()=>{
 assert.equal(readSave({getItem:()=>'{invalid'}).lang,0);
 const save=readSave({getItem:()=>JSON.stringify({version:1,lang:2,difficulty:2,sound:true})});
 assert.equal(save.lang,2);assert.equal(save.difficulty,2);assert.equal(save.sound,true);
});
for(const g of games)test('bots '+g.id+' completan acciones en las tres dificultades',()=>{
 for(let d=0;d<3;d++){
  const m=makeArcade(g.id,seeded(700+d));
  let next=0;
  while(m.time<g.seconds){
   if(m.time>=next){bot(m,d);next+=([.77,.52,.36][d]);}
   tick(m,1/60);
  }
  assert(m.score>0,g.id+'/'+d);
 }
});
test('aspiración original, depósito, y puntos solo en contenedor compatible',()=>{
 const m=makeArcade('vac',seeded(101)), item=m.litter[0];
 input(m,'hold',item.id);
 for(let i=0;i<150;i++)tick(m,1/60);
 assert.deepEqual(m.tank,[0]);
 input(m,'bin',1);assert.equal(m.score,0);assert.equal(m.tank.length,1);
 input(m,'bin',0);assert.equal(m.score,10);assert.equal(m.tank.length,0);
 input(m,'bin',0);assert.equal(m.score,10);
});
