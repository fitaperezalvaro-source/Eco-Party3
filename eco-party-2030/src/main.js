import {profiles,goals,games,tiles,route,material,items} from './data.js';
import {rank,stars,roll,makeMatch,land,moveStep,selectGame,award,nextTurn,readSave} from './model.js';
import {makeArcade,input,tick,bot} from './arcade.js';
import {esc,avatar,board} from './ui.js';
import {activate,ambient,chime} from '../simulator/src/audio.js';
const app=document.querySelector('#app'),top=document.querySelector('#top');
let save=readSave(window.localStorage), scene='home', match=null, game=null, previewMode='board', selectedGame='vac';
let lastMiniState='', epoch=0, frame=0, mini=null, running=false, previous=0, drawAt=0, nextBot=0, gpad=false, focusCode='';
const T=(va,es,en)=>[va,es,en][save.lang], L=values=>values[save.lang];
const write=()=>{try{localStorage.setItem('eco-party-2030-v1',JSON.stringify(save));}catch{}};
const audio=()=>({sound:save.sound,music:save.sound,volume:.45});
const sound=key=>chime(audio(),key);
const button=(text,attrs,kind='primary')=>`<button class="${kind}" ${attrs}>${text}</button>`;
const nav=(label,to,kind)=>button(label,`data-nav="${to}"`,kind);
const name=p=>esc(p.name);
const gameBy=id=>games.find(g=>g.id===id);
const badges=ids=>ids.map(id=>`<span class="badge">ODS ${id}</span>`).join('');
const label=(p,i)=>p.bot?T('Bot','Bot','Bot')+' '+(i+1):T('Jugador','Jugador','Player')+' '+(i+1);
const defaultPlayer=(p,i)=>{
 const n=Number(p?.profile);
 const profile=Number.isInteger(n)&&profiles[n]?n:i;
 return {profile,name:typeof p?.name==='string'&&p.name.trim()?p.name.trim().slice(0,20):profiles[profile][0],
 color:/^#[\da-f]{6}$/i.test(p?.color??'')?p.color:profiles[profile][1],expression:['smile','calm','wow'].includes(p?.expression)?p.expression:'smile'};
};
const playersNow=()=>match.players;
function go(to){
 epoch++;cancelAnimationFrame(frame);running=false;mini=null;focusCode='';scene=to;render();
 window.scrollTo(0,0);
 const h=app.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}
}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function home(){
 return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i>${T('JOC DE FESTA · 1–4 PERSONES','JUEGO DE FIESTA · 1–4 PERSONAS','PARTY GAME · 1–4 PEOPLE')}</p><h1>ECO PARTY <em>2030</em></h1>
 <p>${T('Tira els daus, guanya estrelles i ajuda a recuperar l’illa.','Tira los dados, gana estrellas y ayuda a recuperar la isla.','Roll the dice, earn stars and help restore the island.')}</p>
 <div class="actions">${nav(T('Juga ara →','Jugar ahora →','Play now →'),'setup')}${nav(T('Minijocs','Minijuegos','Minigames'),'arcade','ghost')}</div></div>
 <div class="hero-art"><div class="cloud cloud-a"></div><div class="cloud cloud-b"></div><div class="hero-crew">${[0,1,2,3].map(i=>avatar(i,null,'smile','walk')).join('')}</div></div></section>
 <div class="mode-grid">
 ${[['✿',T('Personatges','Personajes','Characters'),'characters',T('Tria i personalitza els teus guardians','Elige y personaliza tus guardianes','Choose and customise your guardians')],
 ['◎',T('Enciclopèdia ODS','Enciclopedia ODS','SDG encyclopaedia'),'ods',T('Descobrix els 17 objectius','Descubre los 17 objetivos','Explore all 17 goals')],
 ['⚙',T('Ajustos','Ajustes','Settings'),'settings',T('Idioma, so i animacions','Idioma, sonido y animaciones','Language, sound and animations')],
 ['◇',T('Crèdits','Créditos','Credits'),'credits','Eco Party 2030']].map(([icon,title,to,desc])=>`<button class="panel mode" data-nav="${to}"><span class="mode-icon">${icon}</span><span><b>${title}</b><small>${desc}</small></span><i>↗</i></button>`).join('')}</div>`;
}
const heading=(tag,title,sub='')=>`<div class="heading"><p class="eyebrow">${tag}</p><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>`;
function setup(){
 return heading(T('PARTIDA LOCAL','PARTIDA LOCAL','LOCAL GAME'),T('Prepara la partida','Prepara la partida','Set up the match'),T('Les places que no ocupen persones les juguen bots.','Las plazas que no ocupen personas las juegan bots.','Unfilled seats are played by bots.'))+
 `<form id="setup" class="panel settings"><label>${T('Mode','Modo','Mode')}<select name="mode">
 <option value="board"${previewMode==='board'?' selected':''}>Eco Party</option>
 <option value="free"${previewMode==='free'?' selected':''}>${T('Minijoc lliure','Minijuego libre','Free minigame')}</option>
 <option value="coop"${previewMode==='coop'?' selected':''}>${T('Desafiament Eco','Desafío Eco','Eco Challenge')}</option></select></label>
 <label>${T('Participants totals','Participantes totales','Total players')}<select name="total">${[2,3,4].map(n=>`<option value="${n}" ${n===4?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>${T('Persones','Personas','Human players')}<select name="humans">${[1,2,3,4].map(n=>`<option>${n}</option>`).join('')}</select></label>
 <label>${T('Rondes del tauler','Rondas del tablero','Board rounds')}<select name="rounds">${[2,4,6].map((n,i)=>`<option value="${n}">${[T('Ràpida','Rápida','Quick'),T('Normal','Normal','Standard'),T('Llarga','Larga','Long')][i]} · ${n}</option>`).join('')}</select></label>
 <label>${T('Dificultat dels bots','Dificultad de los bots','Bot difficulty')}<select name="difficulty">${difficulties().map((d,i)=>`<option value="${i}" ${i===save.difficulty?'selected':''}>${d}</option>`).join('')}</select></label>
 ${button(T('Comença →','Empezar →','Start →'),'type="submit"')}</form>`;
}
const difficulties=()=>[T('Fàcil','Fácil','Easy'),T('Normal','Normal','Normal'),T('Difícil','Difícil','Hard')];
function characters(){
 return heading(T('VESTIDOR','VESTUARIO','WARDROBE'),T('Els teus guardians','Tus guardianes','Your guardians'),T('Personalitza cadascuna de les quatre places.','Personaliza cada una de las cuatro plazas.','Customise each of the four seats.'))+
 `<form id="characters"><div class="cards">${Array.from({length:4},(_,i)=>{
 const p=defaultPlayer(save.profiles[i],i);
 return `<div class="panel profile" data-profile="${i}">${avatar(p.profile,p.color,p.expression)}<h2>${label(p,i)}</h2>
 <label>${T('Nom','Nombre','Name')}<input name="name${i}" value="${esc(p.name)}" maxlength="20"></label>
 <label>${T('Personatge','Personaje','Character')}<select name="profile${i}">${profiles.map(([n],j)=>`<option value="${j}" ${j===p.profile?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>${T('Roba','Ropa','Clothes')}<input type="color" name="color${i}" value="${p.color}"></label>
 <label>${T('Expressió','Expresión','Expression')}<select name="expression${i}">${['smile','calm','wow'].map((v,j)=>`<option value="${v}" ${p.expression===v?'selected':''}>${[T('Somriure','Sonrisa','Smile'),T('Calma','Calma','Calm'),T('Sorpresa','Sorpresa','Surprise')][j]}</option>`).join('')}</select></label></div>`;
 }).join('')}</div><div class="actions">${button(T('Guarda els canvis','Guardar los cambios','Save changes'),'type="submit"')}</div></form>`;
}
function settings(){
 return heading('ECO PARTY 2030',T('Ajustos','Ajustes','Settings'))+
 `<div class="panel settings"><label>${T('Idioma','Idioma','Language')}<select id="lang">${['Valencià','Castellano','English'].map((l,i)=>`<option value="${i}" ${i===save.lang?'selected':''}>${l}</option>`).join('')}</select></label>
 <label>${T('Música i efectes','Música y efectos','Music and effects')}<input type="checkbox" id="sound" ${save.sound?'checked':''}></label>
 <label>${T('Animacions','Animaciones','Animations')}<input type="checkbox" id="fx" ${save.fx?'checked':''}></label>
 <p>${T('Ratolí o tacte. Amb teclat, usa Tab i Retorn. En els minijocs, usa les tecles 1–9. Amb comandament, A activa el control enfocat i la creueta desplaça el focus.','Ratón o tacto. Usa Tab y Enter. En minijuegos, usa las teclas 1–9. Con mando, A activa el control enfocado y la cruceta mueve el foco.','Use mouse, touch or Tab and Enter. In minigames use keys 1–9. On gamepad, A activates the focused control and the D-pad moves focus.')}</p></div>`;
}
function ods(){
 return heading('AGENDA 2030',T('Els 17 ODS','Los 17 ODS','The 17 SDGs'),T('Els minijocs treballen els objectius marcats.','Los minijuegos trabajan los objetivos marcados.','Minigames address the goals marked below.'))+
 `<div class="cards goal-grid">${goals.map((g,i)=>`<article class="panel goal"><b>${i+1}</b><h2>${L(g)}</h2><p>${games.filter(g=>g.goals.includes(i+1)).map(g=>L(g.name)).join(' · ')||'—'}</p></article>`).join('')}</div>
 <p><a href="https://www.un.org/sustainabledevelopment/" target="_blank" rel="noopener">${T('Més informació · Nacions Unides','Más información · Naciones Unidas','Learn more · United Nations')}</a></p>`;
}
function credits(){
 return heading('ECO PARTY 2030',T('Crèdits','Créditos','Credits'))+`<div class="panel settings"><p>${T('Projecte educatiu sobre l’Agenda 2030. Disseny, codi i materials elaborats amb ajuda de ChatGPT i Codex.','Proyecto educativo sobre la Agenda 2030. Diseño, código y materiales elaborados con ayuda de ChatGPT y Codex.','An educational Agenda 2030 project. Design, code and materials developed with ChatGPT and Codex.')}</p>
 <p>${T('Partides acabades','Partidas terminadas','Matches finished')}: ${save.history.matches} · ${T('Rècord','Récord','Best')}: ${save.history.record} · ${T('Minijocs jugats','Minijuegos jugados','Minigames played')}: ${save.history.seen.length} / 8</p>
 <a class="ghost" href="simulator/index.html">${T('Obri el simulador original','Abrir el simulador original','Open original simulator')} ↗</a></div>`;
}
function arcade(){
 return heading(T('SALÓ DE JOCS','SALÓN DE JUEGOS','ARCADE'),T('Tria un minijoc','Elige un minijuego','Choose a minigame'))+
 `<div class="cards">${games.map(g=>`<button class="panel arcade-card" data-game="${g.id}" style="--game:${g.color}"><b class="game-icon">${g.icon}</b><h2>${L(g.name)}</h2><p>${L(g.desc)}</p>${badges(g.goals)}</button>`).join('')}</div>`;
}
const playerCard=(p,i,active=false)=>`<div class="player ${active?'current':''}">${avatar(p.profile,p.color,p.expression)}<div><b>${i+1} · ${name(p)}</b><small>${p.bot?'BOT':T('Humà','Humano','Human')} · ${p.points} EP · ★ ${stars(p.points)}</small></div></div>`;
function table(){
 const p=playersNow()[match.turn];
 const event=match.event;
 return `<div class="board-head"><div><p class="eyebrow">ECO PARTY · ${T('RONDA','RONDA','ROUND')} ${match.round}/${match.rounds}</p><h1>${T('Illa dels guardians','Isla de los guardianes','Guardians’ Island')}</h1></div><div class="restoration"><b>${T('Recuperació','Recuperación','Restoration')} · ${Math.min(100,match.restore)}%</b><progress value="${Math.min(100,match.restore)}" max="100"></progress></div></div>
 <div class="board-grid"><div>${board(playersNow(),match.turn,match.phase==='moving')}<div class="legend">${tiles.map(t=>`<span style="--tile:${t.color}">${t.icon} ${L(t.name)}</span>`).join('')}</div></div>
 <aside class="panel turn"><p class="eyebrow">${T('TORN ACTIU','TURNO ACTIVO','ACTIVE TURN')}</p><h2>${name(p)}</h2>
 <div class="dice ${match.phase==='rolling'?'rolling':''}">${['⚄','⚀','⚁','⚂','⚃','⚄','⚅'][match.die]}</div>
 <p role="status">${event??(p.bot?T('El bot prepara la tirada.','El bot prepara la tirada.','The bot is about to roll.'):T('Llança el dau per avançar.','Lanza el dado para avanzar.','Roll the die to move.'))}</p>
 ${match.phase==='ready'&&!p.bot?button(T('Llança el dau','Lanzar dado','Roll die'),'data-roll'):''}
 ${match.phase==='landed'&&!p.bot?button(match.hasGame?T('Juga el minijoc →','Jugar minijuego →','Play minigame →'):T('Torn següent →','Siguiente turno →','Next turn →'),'data-arrive'):''}</aside></div>
 <div class="players">${playersNow().map((p,i)=>playerCard(p,i,i===match.turn)).join('')}</div>`;
}
function miniIntro(){
 const g=gameBy(game.id), p=playersNow()[game.player];
 return heading(`<span class="game-icon" style="--game:${g.color}">${g.icon}</span> ${badges(g.goals)}`,L(g.name),L(g.desc))+
 `<div class="panel intro">${avatar(p.profile,p.color,p.expression,'jump')}<div><h2>${name(p)}</h2><p>${T('Torn','Turno','Turn')} ${game.player+1} / ${playersNow().length} · ${g.seconds} s</p>${p.bot?T('El bot està preparat.','El bot está preparado.','The bot is ready.'):button(T('Comença →','Empezar →','Start →'),'data-start-mini')}</div></div>`;
}
const piece=(txt,type,i,cls='')=>button(txt,`data-type="${type}" data-id="${i}"`,`piece ${cls}`);
const hues=['#78cbf5','#ffce63','#9be296','#e5aa80'];
const arrows=['┌','┐','┘','└'];
function minigame(){
 const g=gameBy(game.id), m=mini, p=playersNow()[game.player];
 let output='';
 const binButtons=type=>`<div class="controls four">${material.map((v,i)=>piece(`<i style="--h:${hues[i]}"></i>${L(v)}`,type,i)).join('')}</div>`;
 if(m.id==='vac'){
  output=`<div class="vac-field" aria-label="EcoVac"><svg viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true"><path d="M0 190q110-88 219-33t211-17 190 43v147H0z" fill="#80b669"/><path d="M0 60q120 50 210 4t220 10 190-8v23q-120 50-210 2T0 91z" fill="#f3d9a1"/></svg>
  ${m.litter.map(o=>`<button class="litter ${m.held===o.id?'sucked':''}" data-type="hold" data-id="${o.id}" aria-label="${L(material[o.type])}" style="--x:${o.x/6.2}%;--y:${o.y/3.3}%;--h:${hues[o.type]}"><span>${['▤','▱','◈','◉'][o.type]}</span></button>`).join('')}
  <div class="nozzle">${m.held!==null?'<span></span>':''}◉</div></div>
  <div class="tank">${T('Dipòsit','Depósito','Tank')} ${m.tank.length}/4 ${m.tank.map(i=>`<i title="${L(material[i])}" style="--h:${hues[i]}"></i>`).join('')}</div>${binButtons('bin')}`;
 }else if(m.id==='sort')output=`<div class="conveyor"><div class="parcel" style="--h:${hues[m.target]}"><span>▤</span>${L(items[m.item])}</div></div>${binButtons('choice')}`;
 else if(m.id==='water')output=`<div class="controls three pipes">${m.angles.map((a,i)=>piece(`<small>${T('Model','Modelo','Model')} ${arrows[m.goals[i]]}</small><b>${arrows[a]}</b>`,'rotate',i,m.goals[i]===a?'lit':'')).join('')}</div>${piece(T('Comprova la connexió','Comprobar conexión','Check connection'),'check',0)}`;
 else if(m.id==='bike')output=`<div class="lanes">${[0,1,2].map(i=>piece(`<b>${i===m.lane?'●':'○'}</b><span>${i===m.safe?'♣':i===m.bonus?'✦':'▰'}</span>`,'choice',i,i===m.lane?'lit':'')).join('')}</div><progress max="2.2" value="${m.time%2.2}"></progress>`;
 else if(m.id==='solar')output=`<div class="controls three solar">${[0,1,2].map(i=>piece(`<span>${i===m.target?'☀':'·'}</span><b>▦</b>`,'choice',i,m.angle===i?'lit':'')).join('')}</div>`;
 else if(m.id==='forest')output=`<div class="controls three forest">${m.choices.map((v,i)=>piece(`<b>${{empty:'◇',native:'♣',rock:'▰',planted:'✿'}[v]}</b><span>${{empty:T('Terra','Tierra','Soil'),native:T('Autòctona','Autóctona','Native'),rock:T('Roca','Roca','Rock'),planted:T('Plantat','Plantado','Planted')}[v]}</span>`,'choice',i)).join('')}</div>`;
 else if(m.id==='delivery'){
  const supplies=[T('Menjar','Comida','Food'),T('Aigua','Agua','Water'),T('Mantes','Mantas','Blankets')];
  const centres=[T('Menjador','Comedor','Dining centre'),T('Refugi','Refugio','Shelter'),T('Centre de dia','Centro de día','Day centre')];
  output=`<div class="parcel">${T('Lot','Lote','Supply')}: ${supplies[m.target]}</div><div class="controls three">${centres.map((n,i)=>piece(`<b>${n}</b><small>${supplies[i]}</small>`,'choice',i)).join('')}</div>`;
 }else{
  const utilities=[T('Parc','Parque','Park'),T('Carril bici','Carril bici','Cycle lane'),T('Bus elèctric','Bus eléctrico','Electric bus'),T('Biblioteca','Biblioteca','Library')];
  output=`<div class="parcel">${T('Pressupost','Presupuesto','Budget')}: ${m.target} · ${T('Triat','Elegido','Selected')}: ${m.selected.reduce((a,i)=>a+m.choices[i],0)}</div><div class="controls four">${m.choices.map((v,i)=>piece(`<b>${utilities[i]}</b><small>${v} EP</small>`,'choice',i,m.selected.includes(i)?'lit':'')).join('')}</div>${piece(T('Construïx','Construir','Build'),'check',0)}`;
 }
 return `<div class="mini-header"><div><p class="eyebrow">${badges(g.goals)}</p><h1>${L(g.name)}</h1></div><div class="timer">${Math.max(0,Math.ceil(g.seconds-m.time))} s</div></div>
 <div class="panel stage ${m.flash>0?'flash':''}"><div class="hud"><b>${name(p)}${p.bot?' · BOT':''}</b><strong>${Math.floor(m.score)} ${T('punts','puntos','points')}</strong></div><p>${L(g.desc)}</p>
 <div ${p.bot?'inert':''}>${output}</div></div>`;
}
function miniResults(){
 const g=gameBy(game.id);
 return heading('ECO PARTY · '+badges(g.goals),T('Resultats del minijoc','Resultados del minijuego','Minigame results'),L(g.name))+
 `<div class="panel standings">${game.scores.map((n,i)=>`<div>${playerCard(playersNow()[i],i)}<b>${n}</b></div>`).join('')}</div><div class="actions">${button(T('Continua →','Continuar →','Continue →'),'data-after-mini')}</div>`;
}
function final(){
 const order=rank(playersNow()), winner=order[0];
 const tied=order.filter(p=>p.points===winner.points);
 const won=match.mode==='coop'?match.restore>=36:tied.length===1;
 const title=match.mode==='coop'?(won?T('Illa recuperada!','¡Isla recuperada!','Island restored!'):T('L’illa encara necessita ajuda','La isla aún necesita ayuda','The island still needs help')):
 tied.length>1?T('Empat al primer lloc','Empate en el primer puesto','Tie for first place'):name(winner)+' '+T('guanya!','¡gana!','wins!');
 return heading(T('FI DE PARTIDA','FIN DE PARTIDA','MATCH COMPLETE'),title,`${T('Recuperació de l’illa','Recuperación de la isla','Island restoration')}: ${Math.min(100,match.restore)}%${match.mode==='coop'?' / '+T('objectiu','objetivo','goal')+' 36%':''}`)+
 `<div class="podium">${order.map((p,i)=>`<article class="panel"><p class="eyebrow">#${i+1}</p>${avatar(p.profile,p.color,i===0?'smile':p.expression,i===0?'celebrate':'idle')}<h2>${name(p)}</h2><p>★ ${stars(p.points)} · ${p.points} EP</p><p>${p.wins} ${T('victòries','victorias','wins')}</p></article>`).join('')}</div>
 <div class="actions">${nav(T('Nova partida','Nueva partida','New match'),'setup')}${nav(T('Menú principal','Menú principal','Main menu'),'home','ghost')}</div>`;
}
const pages={home,setup,characters,settings,ods,credits,arcade,table,miniIntro,minigame,miniResults,final};
function render(){
 document.documentElement.lang=['ca-valencia','es','en'][save.lang];
 document.documentElement.classList.toggle('no-fx',!save.fx);
 top.innerHTML=scene==='home'?button(save.sound?'♫':'♪','data-sound aria-label="'+T('So','Sonido','Sound')+'" aria-pressed="'+save.sound+'"','ghost'):
 nav(T('← Menú','← Menú','← Menu'),'home','ghost');
 app.innerHTML=pages[scene]();
}
function launch(form){
 const data=new FormData(form), total=Number(data.get('total')), humans=Number(data.get('humans'));
 save.difficulty=Number(data.get('difficulty'));write();
 previewMode=data.get('mode');
 const roster=Array.from({length:total},(_,i)=>({...defaultPlayer(save.profiles[i],i),bot:i>=humans}));
 match=makeMatch(roster,Number(data.get('rounds')),previewMode);
 if(previewMode==='free')beginGame(selectedGame);
 else if(previewMode==='coop')beginGame(games[0].id);
 else startTurn();
}
function startTurn(){
 match.die=0;match.event=null;go('table');
 const token=epoch;
 if(playersNow()[match.turn].bot)setTimeout(()=>{if(token===epoch)throwDice();},650);
}
async function throwDice(){
 if(scene!=='table'||match.phase!=='ready')return;
 match.phase='rolling';sound('map');render();
 const token=epoch, end=roll(Math.random);
 for(let i=0;i<5;i++){
  await delay(save.fx?75:0);if(token!==epoch)return;
  match.die=i===4?end:roll(Math.random);const die=app.querySelector('.dice');die.textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][match.die];
 }
 match.phase='moving';
 const p=playersNow()[match.turn], pawn=app.querySelector('#pawn-'+match.turn);
 pawn.querySelector('svg').classList.add('walk');
 for(let i=0;i<end;i++){
  moveStep(p);
  pawn.style.setProperty('--x',route[p.position][0]+'%');pawn.style.setProperty('--y',route[p.position][1]+'%');
  await delay(save.fx?195:12);if(token!==epoch)return;
 }
 const before=p.points, restore=match.restore;
 const tile=land(match);
 match.event=`${tile.icon} ${L(tile.name)} · +${p.points-before} EP · +${match.restore-restore}%`;
 match.hasGame=!match.roundGame&&(tile.game===true||match.turn===playersNow().length-1);
 match.phase='landed';render();sound('collect');
 if(p.bot)setTimeout(()=>{if(token===epoch&&scene==='table')arrive();},560);
}
function arrive(){
 if(scene!=='table'||match.phase!=='landed')return;
 match.phase='event';
 if(match.hasGame){match.roundGame=true;beginGame(selectGame(match));}
 else onward();
}
function onward(){
 const n=match.round;
 if(nextTurn(match)==='final'){endMatch();return;}
 if(match.round!==n)match.roundGame=false;
 startTurn();
}
function beginGame(id){
 game={id,player:0,scores:[],seed:Math.floor(Math.random()*2**32)};
 intro();
}
function intro(){
 go('miniIntro');
 const token=epoch;
 if(playersNow()[game.player].bot)setTimeout(()=>{if(token===epoch)startMini();},600);
}
function seeded(seed){
 let x=seed;
 return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/2**32;};
}
function startMini(){
 if(scene!=='miniIntro')return;
 epoch++;scene='minigame';mini=makeArcade(game.id,seeded(game.seed));
 running=true;lastMiniState='';previous=performance.now();drawAt=0;nextBot=0;
 render();frame=requestAnimationFrame(loop);
}
function refreshMini(){
 const m=mini;
 const signature=JSON.stringify([m.id,m.round,m.litter.map(o=>o.id),m.tank,m.held,m.item,m.target,m.angles,m.lane,m.angle,m.choices,m.selected,m.flash>0]);
 if(signature===lastMiniState){
  const g=gameBy(game.id), stage=app.querySelector('.stage');
  app.querySelector('.timer').textContent=Math.max(0,Math.ceil(g.seconds-m.time))+' s';
  stage.querySelector('.hud strong').textContent=Math.floor(m.score)+' '+T('punts','puntos','points');
  if(m.id==='bike')stage.querySelector('progress').value=m.time%2.2;
  for(const item of m.litter){
   const el=stage.querySelector(`[data-type="hold"][data-id="${item.id}"]`);
   if(el){el.style.setProperty('--x',item.x/6.2+'%');el.style.setProperty('--y',item.y/3.3+'%');}
  }
  return;
 }
 lastMiniState=signature;
 const focused=app.querySelector(':focus');
 if(focused?.dataset.type)focusCode=focused.dataset.type+':'+focused.dataset.id;
 app.innerHTML=minigame();
 if(focusCode){
  const [t,id]=focusCode.split(':');
  app.querySelector(`[data-type="${t}"][data-id="${id}"]`)?.focus({preventScroll:true});
 }
}
function loop(now){
 if(!running||scene!=='minigame')return;
 const p=playersNow()[game.player], dt=Math.min(.10,(now-previous)/1000);
 previous=now;
 tick(mini,dt);
 if(p.bot&&mini.time>=nextBot){
  bot(mini,save.difficulty);
  nextBot=mini.time+[.77,.52,.36][save.difficulty];
 }
 if(mini.time>=gameBy(game.id).seconds){finishMini();return;}
 if(now>=drawAt){refreshMini();drawAt=now+(game.id==='vac'?65:170);}
 frame=requestAnimationFrame(loop);
}
function finishMini(){
 if(!running)return;
 running=false;cancelAnimationFrame(frame);
 game.scores.push(Math.floor(mini.score));
 game.player++;
 if(game.player<playersNow().length){intro();return;}
 award(match,game.scores);
 if(!save.history.seen.includes(game.id)){save.history.seen.push(game.id);write();}
 go('miniResults');
}
function afterMini(){
 if(scene!=='miniResults')return;
 if(match.mode==='free'){endMatch();return;}
 if(match.mode==='coop'){
  match.gameIndex++;
  if(match.gameIndex>=4){endMatch();return;}
  beginGame(games[match.gameIndex].id);return;
 }
 onward();
}
function endMatch(){
 save.history.matches++;save.history.record=Math.max(save.history.record,...playersNow().map(p=>p.points));write();sound('win');go('final');
}
document.addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.id==='setup')launch(e.target);
 if(e.target.id==='characters'){
  const d=new FormData(e.target);
  save.profiles=Array.from({length:4},(_,i)=>defaultPlayer({name:d.get('name'+i),profile:d.get('profile'+i),color:d.get('color'+i),expression:d.get('expression'+i)},i));
  write();go('home');
 }
});
function updateProfile(control){
 const card=control.closest('[data-profile]');
 if(!card)return;
 const i=Number(card.dataset.profile),get=field=>card.querySelector(`[name="${field}${i}"]`).value;
 card.querySelector('.avatar').outerHTML=avatar(Number(get('profile')),get('color'),get('expression'));
}
document.addEventListener('input',e=>{if(e.target.closest('[data-profile]'))updateProfile(e.target);});
document.addEventListener('change',e=>{
 const target=e.target;
 if(target.id==='lang'){save.lang=Number(target.value);write();go('settings');}
 if(target.id==='sound'){save.sound=target.checked;write();if(save.sound)activate();}
 if(target.id==='fx'){save.fx=target.checked;write();document.documentElement.classList.toggle('no-fx',!save.fx);}
 if(target.name==='total'&&target.form?.id==='setup'){
  const humans=target.form.elements.humans;
  [...humans.options].forEach(o=>{o.disabled=+o.value>+target.value;});
  if(+humans.value>+target.value)humans.value=target.value;
 }
});
function handlePiece(b){
 if(!running||playersNow()[game.player].bot)return;
 const {type,id}=b.dataset;
 focusCode=type+':'+id;
 input(mini,type,Number(id));
 if(type!=='hold')refreshMini();
}
document.addEventListener('pointerdown',e=>{
 const b=e.target.closest('[data-type="hold"]');
 if(b&&running&&!playersNow()[game.player].bot){handlePiece(b);e.preventDefault();}
});
for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>{if(running&&mini.id==='vac')input(mini,'release',0);});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');
 if(!b||b.disabled)return;
 if(save.sound)activate();
 const d=b.dataset;
 if(d.nav){if(d.nav==='setup')previewMode='board';go(d.nav);return;}
 if(d.sound!==undefined){save.sound=!save.sound;write();if(save.sound)activate();render();return;}
 if(d.game){selectedGame=d.game;previewMode='free';go('setup');return;}
 if(d.roll!==undefined&&!playersNow()[match.turn].bot)throwDice();
 if(d.arrive!==undefined&&!playersNow()[match.turn].bot)arrive();
 if(d.startMini!==undefined&&!playersNow()[game.player].bot)startMini();
 if(d.afterMini!==undefined)afterMini();
 if(d.type&&(d.type!=='hold'||e.detail===0))handlePiece(b);
});
document.addEventListener('keydown',e=>{
 if(scene!=='minigame'||!/^[1-9]$/.test(e.key)||playersNow()[game.player].bot)return;
 const b=app.querySelectorAll('[data-type]')[+e.key-1];
 if(b){e.preventDefault();handlePiece(b);}
});
setInterval(()=>{
 ambient(audio(),running&&mini?.id==='vac'&&mini.held!==null);
 const pad=navigator.getGamepads?.()?.find(Boolean);
 const pressed=pad&&[0,12,13,14,15].find(i=>pad.buttons[i]?.pressed);
 if(pressed!==false&&pressed!=null&&!gpad){
  const controls=[...document.querySelectorAll('button:not([disabled]),a,select,input')].filter(el=>!el.closest('[inert]'));
  if(pressed===0){if(controls.includes(document.activeElement))document.activeElement.click();else controls[0]?.focus();}
  else {const step=pressed===12||pressed===14?-1:1;controls[(controls.indexOf(document.activeElement)+step+controls.length)%controls.length]?.focus();}
 }
 gpad=pressed!==false&&pressed!=null;
},100);
render();
