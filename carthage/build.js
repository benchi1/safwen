/* CARTHAGE · emblème coufique carré latin, même système que VAGA (u = 20, fût 1 u, lettres 6 × 7 u) */
const fs=require('fs');const u=20,W=13*u;
const R=(x,y,w,h)=>`M${x*u} ${y*u}h${w*u}v${h*u}h${-w*u}Z`;
const L={
 C:(x,y)=>R(x,y,6,1)+R(x,y,1,7)+R(x,y+6,6,1)+R(x+5,y,1,2)+R(x+5,y+5,1,2),
 A:(x,y)=>{const X=x*u,Y=y*u,o=3*u,i=2*u;return `M${X} ${Y+7*u}V${Y+o}A${o} ${o} 0 0 1 ${X+6*u} ${Y+o}V${Y+7*u}H${X+5*u}V${Y+o}A${i} ${i} 0 0 0 ${X+u} ${Y+o}V${Y+7*u}Z`+R(x+1,y+4,4,1);},
 R:(x,y)=>R(x,y,1,7)+R(x,y,6,1)+R(x+5,y,1,4)+R(x,y+3,6,1)+`M${(x+2.6)*u} ${(y+4)*u}H${(x+3.9)*u}L${(x+6)*u} ${(y+7)*u}H${(x+4.7)*u}Z`,
 T:(x,y)=>R(x,y,6,1)+R(x+2.5,y,1,7),
 H:(x,y)=>R(x,y,1,7)+R(x+5,y,1,7)+R(x,y+3,6,1),
 G:(x,y)=>R(x,y,6,1)+R(x,y,1,7)+R(x,y+6,6,1)+R(x+5,y+3,1,4)+R(x+3,y+3,3,1)+R(x+5,y,1,2),
 E:(x,y)=>R(x,y,6,1)+R(x,y,1,7)+R(x,y+6,6,1)+R(x,y+3,4.5,1)
};
/* Signe de Tanit : robe triangulaire, bras en feuilles d'olivier levées, tête ronde */
function tanit(cx,base){const leaf='M0 0C14 -15 42 -17 66 0C42 17 14 15 0 0Z';
  return `<path d="M${cx-58} ${base}L${cx} ${base-92}L${cx+58} ${base}Z"/>
  <path d="M${cx-82} ${base-96}h164v13h-164Z"/>
  <path d="${leaf}" transform="translate(${cx-80} ${base-90}) rotate(-118)"/>
  <path d="${leaf}" transform="translate(${cx+80} ${base-90}) rotate(-62)"/>
  <circle cx="${cx}" cy="${base-128}" r="25"/>`;}
/* Port punique circulaire (cothon) vu du ciel : anneau, îlot de l'amirauté, chenal vers la mer */
function cothon(y0,col,bg){const cx=W/2,cy=y0+3.2*u;
  return `<path d="${R(0,y0/u,13,1)}${R(0,y0/u+6,13,1)}"/>
  <circle cx="${cx}" cy="${cy}" r="${2.3*u}" fill="none" stroke="${col}" stroke-width="${u}"/>
  <circle cx="${cx}" cy="${cy}" r="${0.8*u}"/>
  <path d="${R(6,y0/u+5,1,1.2)}"/>
  <path d="M0 ${cy-u*0.5}h${3.2*u}v${u}h${-3.2*u}ZM${W} ${cy-u*0.5}h${-3.2*u}v${u}h${3.2*u}Z"/>`;}
function emblem(col,o){o=Object.assign({text:true},o);let y=180;let d='';const c=tanit(W/2,y-22);
  for(const [a,b] of [['C','A'],['R','T'],['H','A'],['G','E']]){d+=L[a](0,y/u)+L[b](7,y/u);y+=8*u;}
  const port=cothon(y,col);y+=7*u;
  let t='';if(o.text){["HUILE D'OLIVE","DE CARTHAGE","TUNISIE"].forEach((s,i)=>{y+=i?36:56;
    t+=`<text x="0" y="${y}" font-family="Archivo, Arial, sans-serif" font-stretch="125%" font-weight="800" font-size="27" letter-spacing="1.5" fill="${col}">${s}</text>`;});y+=6;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 ${W+60} ${y+40}"><g fill="${col}">${c}<path d="${d}"/>${port}</g>${t}</svg>`;}
module.exports={emblem};
if(require.main===module){fs.writeFileSync('carthage-coufique-noir.svg',emblem('#000'));}
