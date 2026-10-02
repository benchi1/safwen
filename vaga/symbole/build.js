/* VAGA · trois pistes de symbole : viaduc de Béja en entier + olivier (canvas 256, noir) */
const fs=require('fs');const S=6; // épaisseur de trait unique
const LEAF='M0 0C7 -2.4 15 -2.4 22 0C15 2.4 7 2.4 0 0Z';
const CROWN=[[0,0,40,16],[-30,8,24,11],[30,8,24,11],[-12,-10,24,11],[14,-11,22,10]];
const SLITS=[[-34,4,-10],[-10,-5,-5],[10,-3,6],[26,4,12],[-22,12,-4],[4,10,3],[-4,-15,-2]];
const TRUNK='M-14 52C-7 43 -2 34 -7 24C-11 17 -19 14 -26 12L-24 7C-15 8.6 -8 12 -3.6 15.6C-2.4 10.8 -3.4 6 -6 2.4H3.6C4.8 7 5.8 12 4.8 16.8C9.6 13 18 9.6 26.4 8.4L27.8 13.4C19 15.8 13 20 10.6 26.4C8.2 33.6 11 43 19 52Z';
function tree(cx,cy,s,ink,paper,halo){
  const crown=CROWN.map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('');
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${halo?`<g fill="${paper}" stroke="${paper}" stroke-width="${halo}" stroke-linejoin="round">${crown}<path d="${TRUNK}"/></g>`:''}
  <g fill="${ink}">${crown}<path d="${TRUNK}"/></g>
  <g fill="${paper}">${SLITS.map(([x,y,a])=>`<path d="${LEAF}" transform="translate(${x-11} ${y}) rotate(${a} 11 0)"/>`).join('')}<ellipse cx="1" cy="37" rx="2.6" ry="7"/></g></g>`;}
/* viaduc au trait : tablier plein + 5 arches contiguës tracées d'un seul trait */
function viaduct(x,w,deck,ground,ink,opt){opt=opt||{};const n=5,span=w/n,r=span/2,crown=deck+opt.gap;let a='';
  for(let i=0;i<n;i++){const ax=x+i*span;a+=`M${ax} ${ground}V${crown+r}A${r} ${r} 0 0 1 ${ax+span} ${crown+r}V${ground}`;}
  return `<rect x="${x-S}" y="${deck-8}" width="${w+2*S}" height="8" fill="${ink}"/><rect x="${x-S-4}" y="${deck-14}" width="${w+2*S+8}" height="3" fill="${ink}"/>
  <path d="${a}" fill="none" stroke="${ink}" stroke-width="${S}" stroke-linejoin="miter"/>`;}
const ink='#000',paper='#fff';
/* A — Cartouche : arche en plein cintre, soleil, olivier, viaduc entier sur ses deux collines */
const A=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
 <path d="M40 236V108A88 88 0 0 1 216 108V236" fill="none" stroke="${ink}" stroke-width="${S}"/>
 <path d="M28 236H228" stroke="${ink}" stroke-width="${S}"/>
 <circle cx="128" cy="96" r="38" fill="none" stroke="${ink}" stroke-width="${S}"/>
 ${tree(128,112,0.95,ink,paper,10)}
 ${viaduct(64,128,158,220,ink,{gap:6})}
 <path d="M43 170C56 170 60 196 74 220M213 170C200 170 196 196 182 220" fill="none" stroke="${ink}" stroke-width="${S}"/>
 <path d="M43 220H213" stroke="${ink}" stroke-width="${S}"/>
</svg>`;
/* B — Pièce : disque plein, viaduc et olivier en réserve */
function viaductCut(x,w,deck,ground){const n=5,span=w/n,r=span/2;let a='';
  for(let i=0;i<n;i++){const ax=x+i*span;a+=`M${ax} ${ground}V${deck+6+r}A${r} ${r} 0 0 1 ${ax+span} ${deck+6+r}V${ground}`;}
  return `<rect x="${x-14}" y="${deck-8}" width="${w+28}" height="8" fill="${paper}"/><path d="${a}" fill="none" stroke="${paper}" stroke-width="${S}"/>`;}
const B=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
 <defs><clipPath id="c"><circle cx="128" cy="128" r="114"/></clipPath></defs>
 <circle cx="128" cy="128" r="120" fill="${ink}"/>
 <g clip-path="url(#c)">
  ${tree(128,106,1.05,paper,ink,0)}
  ${viaductCut(52,152,150,228)}
  <path d="M0 214H256" stroke="${paper}" stroke-width="${S}"/>
 </g>
</svg>`;
/* C — Paysage : vignette horizontale, olivier au premier plan à gauche, viaduc sur la vallée */
const C=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
 <circle cx="186" cy="92" r="30" fill="${ink}"/>
 ${viaduct(56,170,118,206,ink,{gap:5})}
 <path d="M12 206H246" stroke="${ink}" stroke-width="${S}"/>
 <path d="M12 132C34 132 44 170 62 206M246 132C236 132 230 170 220 206" fill="none" stroke="${ink}" stroke-width="${S}"/>
 <path d="M30 222H110M136 222H226M66 238H190" stroke="${ink}" stroke-width="4"/>
 ${tree(72,150,1.2,ink,paper,12)}
</svg>`;
fs.writeFileSync('a-cartouche-v1.svg',A);fs.writeFileSync('b-piece-v1.svg',B);fs.writeFileSync('c-paysage-v1.svg',C);
