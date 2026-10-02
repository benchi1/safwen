/* VAGA en coufique carré latin : V A / G A, un seul trait (1 u), langage du viaduc (arches, piles, tablier) */
const fs=require('fs');const u=20,W=13*u;
const R=(x,y,w,h)=>`M${x*u} ${y*u}h${w*u}v${h*u}h${-w*u}Z`;
// A : arche en plein cintre + barre. (x,y) coin haut-gauche, 6u × 7u
function A(x,y){x*=u;y*=u;const o=3*u,i=2*u;
  return `M${x} ${y+7*u}V${y+o}A${o} ${o} 0 0 1 ${x+6*u} ${y+o}V${y+7*u}H${x+5*u}V${y+o}A${i} ${i} 0 0 0 ${x+u} ${y+o}V${y+7*u}Z`+R(x/u+1,y/u+4,4,1);}
// V : deux arcs qui se rejoignent en pointe (arche renversée, en ogive)
function Vv(x,y){x*=u;y*=u;const w=6*u,h=7*u,cx=x+w/2,b=y+h;const t=u*1.05;
  // arc externe gauche : du coin haut-gauche à la pointe ; arc interne parallèle
  const Ro=h*1.02,Ri=Ro;return `M${x} ${y}H${x+t}A${Ri} ${Ri} 0 0 0 ${cx} ${b-u*1.6}A${Ri} ${Ri} 0 0 0 ${x+w-t} ${y}H${x+w}A${Ro} ${Ro} 0 0 1 ${cx+u*0.5} ${b}H${cx-u*0.5}A${Ro} ${Ro} 0 0 1 ${x} ${y}Z`;}
// G : carré, barre intérieure
function Gg(x,y){return R(x,y,6,1)+R(x,y,1,7)+R(x,y+6,6,1)+R(x+5,y+3,1,4)+R(x+3,y+3,3,1)+R(x+5,y,1,2);}
function viaduct(y0){const n=5,pier=u,span=(W-(n+1)*pier)/n,r=span/2;
  let d=`M0 ${y0}h${W}v${u}h${-W}Z`;let x=0;for(let i=0;i<=n;i++){d+=`M${x} ${y0+u}h${pier}v${4*u}h${-pier}Z`;x+=pier+span;}
  let s=`M0 ${y0+u}H${W}V${y0+u+r+8}H0Z`;x=pier;for(let i=0;i<n;i++){s+=`M${x} ${y0+u+r+8.01}V${y0+u+r}a${r} ${r} 0 0 1 ${span} 0V${y0+u+r+8.01}Z`;x+=span+pier;}
  d+=`M0 ${y0+5*u}h${W}v${u}h${-W}Z`;return `<path d="${d}"/><path d="${s}" fill-rule="evenodd"/>`;}
/* Cimier : rameau d'olivier horizontal, feuilles alternées, deux olives pendantes */
function crest(cx,base){const L='M0 0C10 -9 26 -10 40 0C26 10 10 9 0 0Z';
  const stem=`<path d="M${cx-118} ${base-30}C${cx-60} ${base-60} ${cx+40} ${base-60} ${cx+118} ${base-44}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>`;
  const pts=[[-96,-40,-150],[-70,-46,-28],[-40,-52,-160],[-12,-54,-20],[20,-54,-165],[48,-52,-12],[78,-48,-170],[104,-46,-6]];
  const lv=pts.map(([x,y,a])=>`<path d="${L}" transform="translate(${cx+x} ${base+y}) rotate(${a}) scale(1.05)"/>`).join('');
  const ol=`<ellipse cx="${cx-30}" cy="${base-18}" rx="15" ry="19" transform="rotate(-12 ${cx-30} ${base-18})"/><ellipse cx="${cx+34}" cy="${base-20}" rx="15" ry="19" transform="rotate(12 ${cx+34} ${base-20})"/>`;
  return stem+lv+ol;}
function emblem(col,o){o=Object.assign({text:true},o);let y=130;const c=crest(W/2,y-8);
  const g=Vv(0,y/u)+A(7,y/u);y+=8*u;const g2=Gg(0,y/u)+A(7,y/u);y+=8*u;const via=viaduct(y);y+=6*u;
  let t='';if(o.text){const L=["HUILE D'OLIVE","DE BÉJA","TUNISIE"];L.forEach((s,i)=>{y+=i?36:56;
    t+=`<text x="0" y="${y}" font-family="Archivo, Arial, sans-serif" font-stretch="125%" font-weight="800" font-size="27" letter-spacing="1.5" fill="${col}">${s}</text>`;});y+=6;}
  return `<svg xmlns="http://www.w3.org/2000/svg" style="color:${col}" viewBox="-30 -20 ${W+60} ${y+40}"><g fill="${col}">${c}<path d="${g}${g2}"/>${via}</g>${t}</svg>`;}
module.exports={emblem};
if(require.main===module){fs.writeFileSync('vaga-coufique-latin-v2.svg',emblem('#000'));}
