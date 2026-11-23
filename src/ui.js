import {profiles,route,tiles} from './data.js';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function avatar(id,color,expression='smile',motion='idle'){
 const [name,base,hair,hat]=profiles[id]??profiles[0];
 const fill=/^#[\da-f]{6}$/i.test(color??'')?color:base;
 const mouth=expression==='wow'?'<ellipse cx="48" cy="50" rx="4" ry="5" fill="#57332a"/>':expression==='calm'?'<path d="M43 49h10" stroke="#57332a" stroke-width="2.5" stroke-linecap="round"/>':'<path d="M42 47q6 8 12 0" fill="#9e5145"/>';
 return `<svg class="avatar ${motion}" viewBox="0 0 96 107" role="img" aria-label="${name}"><ellipse cx="48" cy="100" rx="26" ry="5" fill="#102b2840"/><g class="figure">
 <path class="leg" d="M37 78v15m22-15v15" fill="none" stroke="#233d38" stroke-width="9" stroke-linecap="round"/><path d="M32 95h9m14 0h9" stroke="#eaf1dd" stroke-width="7" stroke-linecap="round"/>
 <path d="M30 66 23 79m43-13 7 13" stroke="#e3a46f" stroke-width="8" stroke-linecap="round"/>
 <path d="M31 62q17-12 34 0l2 20q-19 9-38 0Z" fill="${fill}" stroke="#244b3b" stroke-width="2"/>
 <circle cx="48" cy="37" r="26" fill="#efb983" stroke="#65483a" stroke-width="2"/><path d="M22 35q-2-26 26-30 30 1 27 33L64 25Q45 33 32 22Z" fill="${hair}"/>
 <ellipse cx="39" cy="40" rx="2.8" ry="3.5" fill="#223233"/><ellipse cx="57" cy="40" rx="2.8" ry="3.5" fill="#223233"/>${mouth}
 ${hat==='leaf'?'<path d="M49 10q4-13 15-9-3 10-15 9" fill="#75de80"/>':hat==='wave'?'<path d="M60 14q8-10 15-3-7 10-15 3" fill="#a2e3ff"/>':hat==='cap'?'<path d="M24 24q1-21 25-21 20 2 22 17-28-3-47 4" fill="#f3a5bb"/>':'<path d="M45 6l4-6 4 6 8 1-6 6 1 7-7-4-7 4 1-7-6-6z" fill="#ffdb67"/>'}
 <path d="M45 70q6-7 11-2-2 7-9 10z" fill="#fff8d8"/></g></svg>`;
}
export function board(players,active,moving=false){
 return `<div class="island"><svg class="island-map" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
 <defs><pattern id="waves" width="72" height="51" patternUnits="userSpaceOnUse"><path d="M0 22q18-10 36 0t36 0" fill="none" stroke="#c5ffff" opacity=".23" stroke-width="2"/></pattern><linearGradient id="ocean" x2="1" y2="1"><stop stop-color="#6ac5d8"/><stop offset="1" stop-color="#247587"/></linearGradient></defs>
 <path fill="url(#ocean)" d="M0 0h1000v500H0z"/><path fill="url(#waves)" d="M0 0h1000v500H0z"/>
 <path d="M39 337Q71 215 204 178T367 119Q505 41 635 69T891 155Q978 216 932 318T737 425Q599 416 464 456T173 448Q60 425 39 337Z" fill="#234e61" opacity=".35" transform="translate(0 13)"/>
 <path d="M39 337Q71 215 204 178T367 119Q505 41 635 69T891 155Q978 216 932 318T737 425Q599 416 464 456T173 448Q60 425 39 337Z" fill="#f8d78e" stroke="#bce9cf" stroke-width="12"/>
 <path d="M66 331Q98 229 211 192T375 136Q518 60 634 90T879 168Q955 226 909 310T733 405Q580 397 460 433T185 427Q89 403 66 331Z" fill="#7fba72"/>
 <path d="M445 124q8 84 80 119t49 151" fill="none" stroke="#b4dba2" stroke-width="49"/><path d="M445 124q8 84 80 119t49 151" fill="none" stroke="#7ad2d8" stroke-width="27"/>
 <path d="M${route.map(([x,y])=>`${x*10},${y*5}`).join(' L')}Z" fill="none" stroke="#53674e" opacity=".48" stroke-width="20" stroke-linejoin="round"/><path d="M${route.map(([x,y])=>`${x*10},${y*5}`).join(' L')}Z" fill="none" stroke="#ffe2a1" stroke-width="13" stroke-linejoin="round"/>
 ${[[160,315],[313,139],[340,153],[372,164],[598,201],[644,207],[350,286],[389,293],[802,180],[839,188],[684,381],[721,378],[215,327]].map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse cy="9" rx="15" ry="5" fill="#476e53" opacity=".35"/><path d="M0-12v20" stroke="#8f6741" stroke-width="5"/><path d="M-14 3 0-25 14 3Z" fill="#346b54"/><path d="M-10-4 0-28 10-4Z" fill="#59a463"/></g>`).join('')}
 <g transform="translate(736 263)"><path d="M-30-13h56v40h-56z" fill="#f8edc3"/><path d="M-37-13l24-26 46 26z" fill="#385e70"/><path d="M-22-17l14-17 30 17z" fill="#7ad6ec"/><path d="M-10 7h15v20h-15z" fill="#90aa80"/></g>
 <g transform="translate(269 285)" fill="none" stroke="#dcbe76" stroke-width="6"><path d="M-33 10l52-19m-50 31 52-19m-45 31 52-19"/></g>
 <g transform="translate(591 161)" stroke="#effbee" stroke-width="4" stroke-linecap="round"><path d="M0 29V0m0 0v-22m0 22 18 10m-18-10-17 11"/></g>
 </svg>
 ${route.map(([x,y],i)=>{const t=tiles[i%tiles.length];return `<span class="tile" style="--x:${x}%;--y:${y}%;--tile:${t.color}" title="${i+1}">${t.icon}</span>`;}).join('')}
 ${players.map((p,id)=>`<div class="pawn ${id===active?'active':''}" id="pawn-${id}" style="--x:${route[p.position][0]}%;--y:${route[p.position][1]}%;--offset:${(id-(players.length-1)/2)*13}px">${avatar(p.profile,p.color,p.expression,moving&&id===active?'walk':'idle')}<b>${id+1}</b></div>`).join('')}
 </div>`;
}
