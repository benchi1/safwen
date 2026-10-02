const fs=require('fs');const V=require('../logo.js');
const u=20,W=13*u;const R=(x,y,w,h)=>`M${x*u} ${y*u}h${w*u}v${h*u}h${-w*u}Z`;
/* Rang « ڤا » / « ڨا » : alef à gauche, ligne de base continue, tête (boucle) large à droite, trois points au-dessus */
function row(y0,link){let d='';
  d+=R(0,y0-(link?1:0),1,9+(link?1:0)); // alef (relié au rang du dessus)
  d+=R(0,y0+8,13,1);                     // ligne de base
  d+=R(4,y0+4,9,1)+R(4,y0+4,1,4)+R(12,y0+4,1,4); // tête de la lettre
  d+=R(8,y0,1,1)+R(6.5,y0+2,1,1)+R(9.5,y0+2,1,1); // trois points : un en haut, deux en bas
  return d;}
function viaduct(y0){const n=5,pier=u,span=(W-(n+1)*pier)/n,r=span/2;
  let d=`M${-u/2} ${y0}h${W+u}v${u}h${-(W+u)}Z`; // tablier
  let x=0;for(let i=0;i<=n;i++){d+=`M${x} ${y0+u}h${pier}v${4*u}h${-pier}Z`;x+=pier+span;}
  let s=`M0 ${y0+u}H${W}V${y0+u+r+8}H0Z`;x=pier;for(let i=0;i<n;i++){s+=`M${x} ${y0+u+r+8.01}V${y0+u+r}a${r} ${r} 0 0 1 ${span} 0V${y0+u+r+8.01}Z`;x+=span+pier;}
  d+=`M${-u/2} ${y0+5*u}h${W+u}v${u}h${-(W+u)}Z`; // sol
  return `<path d="${d}"/><path d="${s}" fill-rule="evenodd"/>`;}
/* Cimier : deux feuilles d'olivier en coupe, une olive au centre */
function crest(cx,base){const lf=s=>`<path transform="translate(${cx+s*6} ${base}) scale(${s} 1) rotate(-34)" d="M0 0C17 -30 18 -78 0 -112C-18 -78 -17 -30 0 0Z"/>`;
  return `${lf(1)}${lf(-1)}<ellipse cx="${cx}" cy="${base-80}" rx="21" ry="27"/>`;}
function emblem(col,bg,o){o=Object.assign({text:true},o);let y=130;const c=crest(W/2,y-8);
  const r1=row(y/u,false);y+=10*u;const r2=row(y/u,true);y+=10*u;const via=viaduct(y);y+=6*u;
  let t='';if(o.text){y+=50;const wmH=W*62/258;t=`<g transform="translate(0 ${y}) scale(${W/258})">${V.wordInner(col,o.olive||col,2,0,1)}</g>`;y+=wmH+34;
    t+=`<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-stretch="125%" font-weight="700" font-size="17" letter-spacing="5.6" fill="${col}">HUILE D'OLIVE · BÉJA</text>`;y+=10;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 ${W+60} ${y+40}"><g fill="${col}">${c}<path d="${r1}${r2}"/>${via}</g>${t}</svg>`;}
module.exports={emblem};
if(require.main===module){fs.writeFileSync('vaga-coufique-v2.svg',emblem('#000','#fff'));
  const C=V.C;fs.writeFileSync('vaga-coufique-v2-dengri.svg',emblem(C.dengri,C.chaux,{olive:C.terre}));}
