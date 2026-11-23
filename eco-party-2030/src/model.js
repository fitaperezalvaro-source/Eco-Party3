import {games,route,tiles} from './data.js';
export const stars = points => Math.floor(points/25);
export const rank = players => [...players].sort((a,b)=>stars(b.points)-stars(a.points)||b.points-a.points||a.id-b.id);
export const roll = random => 1+Math.floor(random()*6);
export const makeMatch = (players,rounds,mode) => ({players:players.map((p,id)=>({...p,id,position:0,points:0,wins:0})),rounds,mode,round:1,turn:0,restore:0,phase:'ready',die:0,gameIndex:0,played:[],results:[]});
export function land(state,random=Math.random){
 const p=state.players[state.turn];
 const tile=tiles[p.position%tiles.length];
 p.points+=tile.points+(tile.id==='purple'?Math.floor(random()*6):0);
 state.restore+=tile.restore;
 if(tile.id==='team')state.players.filter(q=>q!==p).forEach(q=>q.points+=2);
 return tile;
}
export function moveStep(player){player.position=(player.position+1)%route.length;}
export function selectGame(state,random=Math.random){
 const unused=games.filter(g=>!state.played.includes(g.id));
 if(!unused.length)state.played=[];
 const list=unused.length?unused:games;
 const id=list[Math.floor(random()*list.length)].id;
 state.played.push(id);
 return id;
}
export function award(state,results){
 const best=Math.max(...results);
 results.forEach((value,i)=>{
  state.players[i].points+=Math.min(20,Math.floor(value/5));
  if(value>0&&value===best){state.players[i].points+=8;state.players[i].wins++;}
 });
 state.restore+=Math.floor(results.reduce((sum,n)=>sum+n,0)/(state.players.length*9));
}
export function nextTurn(state){
 state.turn++;
 if(state.turn===state.players.length){state.turn=0;state.round++;}
 state.phase=state.round>state.rounds?'final':'ready';
 return state.phase;
}
export function readSave(storage){
 const fallback={version:1,lang:0,sound:false,fx:true,difficulty:1,profiles:[],history:{matches:0,record:0,seen:[]}};
 try{
  const v=JSON.parse(storage.getItem('eco-party-2030-v1'));
  if(v?.version!==1)return fallback;
  return {...fallback,lang:[0,1,2].includes(v.lang)?v.lang:0,sound:v.sound===true,fx:v.fx!==false,
   difficulty:[0,1,2].includes(v.difficulty)?v.difficulty:1,
   profiles:Array.isArray(v.profiles)?v.profiles.slice(0,4):[],
   history:v.history&&Number.isFinite(v.history.matches)&&Array.isArray(v.history.seen)?v.history:fallback.history};
 }catch{return fallback;}
}
