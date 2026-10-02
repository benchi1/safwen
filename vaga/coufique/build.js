/* VAGA · emblème en coufique carré, dans l'esprit de la Grande Mosquée de Paris.
   Grille u = 20. Colonne de 13 u. Un seul poids : 1 u. */
const fs=require('fs');const u=20,W=13*u;
const R=(x,y,w,h)=>`M${x*u} ${y*u}h${w*u}v${h*u}h${-w*u}Z`;
/* Rang « initiale + alef » : boucle carrée à droite, alef à gauche, ligne de base continue, trois points */
function row(y0){let d='';
  d+=R(0,y0,1,9);            // alef
  d+=R(0,y0+8,13,1);         // ligne de base (kashida)
  d+=R(8,y0+4,5,1)+R(8,y0+4,1,5)+R(12,y0+4,1,5); // boucle (fond = ligne de base)
  d+=R(9.5,y0+0,1,1)+R(11.5,y0+0,1,1)+R(10.5,y0+2,1,1); // trois points (ڤ / ڨ)
  return d;}
/* Viaduc : tablier, 5 arches en plein cintre, sol */
function viaduct(y0){let d=R(-0.5,y0,14,1);const n=5,pier=1,span=(13-(n+1)*pier)/n,r=span/2;
  let x=0;for(let i=0;i<=n;i++){d+=R(x,y0+1,pier,4.5);x+=pier+span;}
  // écoinçons : bandeau sous le tablier percé d'arches
  let a='';x=pier;for(let i=0;i<n;i++){a+=`M${x*u} ${(y0+1)*u}h${span*u}v${r*u}a${r*u} ${r*u} 0 0 0 ${-span*u} 0Z`;x+=span+pier;}
  return {d:d+R(-0.5,y0+5.5,14,1),a};}
/* Sommet : deux feuilles d'olivier en coupe + olive (à la place du croissant et de l'étoile) */
function crest(cx,y){const leaf=(s)=>`<path transform="translate(${cx} ${y+118}) scale(${s} 1) rotate(-38)" d="M0 0C10 -30 12 -70 0 -104C-12 -70 -10 -30 0 0Z"/>`;
  return `${leaf(1)}${leaf(-1)}<ellipse cx="${cx}" cy="${y+30}" rx="17" ry="22"/><path d="M${cx} ${y+52}V${y+112}" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`;}
function emblem(col,opt){opt=opt||{};let y=150;const r1=row(y/u);y+=10*u;const r2=row(y/u);y+=10*u;const v=viaduct(y/u);y+=6.5*u;
  const svgH=y+(opt.text?150:20);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -10 ${W+40} ${svgH}" style="color:${col}">
  <g fill="${col}">${crest(W/2,0)}
  <path d="${r1}${r2}" />
  <path d="${v.d}"/><path d="M${-0.5*u} ${(y/u-5.5)*u}h${14*u}v${0}" />
  </g>
  <g fill="${col}"><path d="${(()=>{let d='';return d})()}"/></g>
  ${spandrel(y-6.5*u,col)}
  ${opt.text?opt.text(y+40):''}
  </svg>`;}
function spandrel(y0,col){const n=5,pier=u,span=(W-(n+1)*pier)/n,r=span/2;let d=`M0 ${y0+u}H${W}V${y0+u+r+6}H0Z`;let x=pier;
  for(let i=0;i<n;i++){d+=`M${x} ${y0+u+r+6}V${y0+u+r+6}a${r} ${r} 0 0 1 ${span} 0Z`;x+=span+pier;}
  // arches : bandeau plein moins demi-cercles
  let holes='';x=pier;for(let i=0;i<n;i++){holes+=`M${x} ${y0+u+r+6.01}a${r} ${r} 0 0 1 ${span} 0Z`;x+=span+pier;}
  return `<path d="M0 ${y0+u}H${W}V${y0+u+r+6}H0Z ${holes}" fill="${col}" fill-rule="evenodd"/>`;}
module.exports={emblem,row,viaduct,crest,u,W};
if(require.main===module){fs.writeFileSync('vaga-coufique-v1.svg',emblem('#000'));}
