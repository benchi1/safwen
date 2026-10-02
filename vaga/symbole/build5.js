const fs=require('fs');const S=6;const ink='#000',paper='#fff';
/* Couronne d'olivier : lobes arrondis + feuilles en bordure, orientées vers l'extérieur et légèrement tombantes */
const LOBES=[[0,-4,22],[-21,5,16],[21,5,16],[-11,-17,15],[12,-17,14],[0,9,16],[-30,12,9],[30,12,9]];
const inside=(x,y)=>LOBES.some(([cx,cy,r])=>(x-cx)**2+(y-cy)**2<=r*r);
function crownEdgeLeaves(){let out='';
  for(let a=0;a<360;a+=13){const t=a*Math.PI/180;let r=5;while(inside(Math.cos(t)*r,Math.sin(t)*r)&&r<60)r+=.5;
    const x=Math.cos(t)*(r-3),y=Math.sin(t)*(r-3);const sy=Math.sin(t)>0.6;if(sy&&Math.abs(Math.cos(t))<0.5)continue; // pas de feuilles sous le tronc
    const ang=a+(Math.cos(t)>0?14:-14);
    out+=`<path d="M0 0C3.6 -2.4 8.4 -2.4 12 0C8.4 2.4 3.6 2.4 0 0Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)})"/>`;}
  return out;}
const EDGE=crownEdgeLeaves();
const SLITS=[[-22,0,-14],[-6,-8,-8],[10,-9,10],[22,1,16],[-14,10,-10],[6,6,6],[-2,-20,-4],[-26,14,-20],[26,14,20]];
const TRUNK='M-7 40C-3 33 -2 28 -5 22C-7 18 -6 14 -3 10H3C5 14 5 18 6 22C8 28 5 33 9 40Z M-3 14C-8 11 -13 9 -17 9L-16 6C-11 6 -6 8 -1 11Z M3 13C7 9 12 7 16 6L17 9C12 10 8 12 5 15Z';
function oliveTree(cx,cy,s,col,bgc,halo){
  const lobes=LOBES.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const body=c=>`<g fill="${c}">${lobes}${EDGE}<path d="${TRUNK}"/></g>`;
  const h=halo?`<g stroke="${bgc}" stroke-width="${halo}" stroke-linejoin="round">${body(bgc)}</g>`:'';
  const slits=SLITS.map(([x,y,a])=>`<path d="M0 0C3.6 -2 8.4 -2 12 0C8.4 2 3.6 2 0 0Z" transform="translate(${x-6} ${y}) rotate(${a} 6 0)"/>`).join('');
  const olives=`<ellipse cx="-17" cy="18" rx="2.6" ry="3.4"/><ellipse cx="14" cy="19" rx="2.6" ry="3.4"/><ellipse cx="-2" cy="22" rx="2.6" ry="3.4"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s*1.16} ${s*.94})">${h}${body(col)}<g fill="${bgc}">${slits}<circle cx="-8" cy="2" r="2.6"/><circle cx="16" cy="-4" r="2.6"/><circle cx="-18" cy="10" r="2.6"/></g><path d="M1 26c-1 5 0 9 2 12" stroke="${bgc}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
}
function viaduct(x,w,deck,ground,col){const n=5,span=w/n,r=span/2,top=deck+5;let a='';
  for(let i=0;i<n;i++){const ax=x+i*span;a+=`M${ax} ${ground}V${top+r}A${r} ${r} 0 0 1 ${ax+span} ${top+r}V${ground}`;}
  return `<rect x="${x-6}" y="${deck-7}" width="${w+12}" height="7" fill="${col}"/><rect x="${x-10}" y="${deck-13}" width="${w+20}" height="3" fill="${col}"/>
  <path d="${a}" fill="none" stroke="${col}" stroke-width="${S}"/>`;}
function scene(col,bgc,o){o=Object.assign({},o);const L=o.x0??41,R=o.x1??215;
  return `<circle cx="128" cy="92" r="54" fill="none" stroke="${col}" stroke-width="${S}"/>
  ${oliveTree(128,100,1.0,col,bgc,5)}
  <path d="M${L} 146Q128 128 ${R} 146" fill="none" stroke="${col}" stroke-width="${S-1.5}"/>
  <rect x="${L}" y="141" width="${R-L}" height="${o.mask?0:0}" fill="${bgc}"/>
  ${viaduct(53,150,156,230,col)}
  <path d="M${L} 156C47 156 50 166 53 174M${R} 156C209 156 206 166 203 174" fill="none" stroke="${col}" stroke-width="${S}"/>
  <path d="M${L} 230H${R}" stroke="${col}" stroke-width="${S}"/>`;}
const A=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
 <path d="M38 238V112A90 90 0 0 1 218 112V238" fill="none" stroke="${ink}" stroke-width="${S}"/>
 <path d="M26 238H230" stroke="${ink}" stroke-width="${S}"/>${scene(ink,paper)}</svg>`;
const B=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><clipPath id="cb"><circle cx="128" cy="128" r="112"/></clipPath></defs>
 <circle cx="128" cy="128" r="124" fill="${ink}"/><circle cx="128" cy="128" r="116" fill="none" stroke="${paper}" stroke-width="2.5"/>
 <g clip-path="url(#cb)" transform="translate(0 -2)">${scene(paper,ink,{x0:0,x1:256})}</g></svg>`;
const horse=`M50 240V134C50 130 46 124 42 118A88 88 0 1 1 214 118C210 124 206 130 206 134V240Z`;
const C=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><clipPath id="cc"><path d="${horse}"/></clipPath></defs>
 <path d="${horse}" fill="${ink}"/><g clip-path="url(#cc)">${scene(paper,ink,{x0:20,x1:236})}</g>
 <path d="M30 246H226" stroke="${ink}" stroke-width="${S}"/></svg>`;
fs.writeFileSync('a-cartouche-v5.svg',A);fs.writeFileSync('b-piece-v5.svg',B);fs.writeFileSync('c-arc-v5.svg',C);
