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
/* Cuirasse de Ksour Essaf (musée du Bardo) : plastron, rang d'olives, deux disques, palmette, tête de Minerve casquée */
function cuirasse(cx,top,k){const circ=(x,y,r)=>`M${x-r} ${y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`;
  const ov=(x,y,rx,ry)=>`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
  // plastron (plein) percé : rang d'olives, deux disques, palmette, niche de la tête
  let p=`M-98 0C-60 0 -30 20 0 20C30 20 60 0 98 0L98 48C98 74 106 96 94 116C84 132 72 136 66 144C64 184 38 210 0 210C-38 210 -64 184 -66 144C-72 136 -84 132 -94 116C-106 96 -98 74 -98 48Z`;
  [-62,-44,-26,-9,9,26,44,62].forEach((x,i)=>{const y=12+Math.abs(x)*-0.13+ (Math.abs(x)<30?10:6);p+=ov(x,y+6,4.6,6.4);});
  p+=circ(-48,82,36)+circ(48,82,36)+`M-84 8H-78V44H-84ZM78 8H84V44H78Z`;
  p+=`M-2.6 66H2.6V108H-2.6Z M0 64C-4 54 -4 44 0 34C4 44 4 54 0 64Z M-3 62C-12 58 -16 50 -15 40C-8 46 -4 54 -3 62Z M3 62C12 58 16 50 15 40C8 46 4 54 3 62Z`;
  p+=`M0 112C-40 112 -56 136 -54 160C-52 190 -28 204 0 204C28 204 52 190 54 160C56 136 40 112 0 112Z`;
  // disques : anneau + umbo
  let disks=[-48,48].map(x=>circ(x,82,28)+circ(x,82,20)+circ(x,82,9)).join('');
  // tête de Minerve : casque à panache, mèches de chaque côté, visage
  let head=`M-30 150C-30 128 -16 118 0 118C16 118 30 128 30 150L22 146C18 134 10 130 0 130C-10 130 -18 134 -22 146Z`
   +`M-6 118C-6 106 -2 100 0 98C2 100 6 106 6 118Z`
   +`M-46 132C-38 126 -32 134 -32 146C-34 168 -40 182 -46 190C-50 172 -50 150 -46 132Z M46 132C38 126 32 134 32 146C34 168 40 182 46 190C50 172 50 150 46 132Z`
   +ov(0,166,21,27);
  let feat=ov(-8,160,4.2,2.2)+ov(8,160,4.2,2.2)+`M-1.6 162H1.6V178H-1.6Z`+`M-6 185H6V188H-6Z`;
  return `<g transform="translate(${cx} ${top}) scale(${k})"><path fill-rule="evenodd" d="${p}"/><path fill-rule="evenodd" d="${disks}"/><path d="${head}"/><path class="bg" d="${feat}"/></g>`;}
/* Port punique circulaire (cothon) vu du ciel : anneau, îlot de l'amirauté, chenal vers la mer */
function cothon(y0,col,bg){const cx=W/2,cy=y0+3.2*u;
  return `<path d="${R(0,y0/u,13,1)}${R(0,y0/u+6,13,1)}"/>
  <circle cx="${cx}" cy="${cy}" r="${2.3*u}" fill="none" stroke="${col}" stroke-width="${u}"/>
  <circle cx="${cx}" cy="${cy}" r="${0.8*u}"/>
  <path d="${R(6,y0/u+5,1,1.2)}"/>
  <path d="M0 ${cy-u*0.5}h${3.2*u}v${u}h${-3.2*u}ZM${W} ${cy-u*0.5}h${-3.2*u}v${u}h${3.2*u}Z"/>`;}
function emblem(col,o){o=Object.assign({text:true},o);let y=o.tanit?180:240;let d='';const c=o.tanit?tanit(W/2,y-22):cuirasse(W/2,8,0.98).replace('class="bg"','fill="'+(o.bg||'#fff')+'"');
  for(const [a,b] of [['C','A'],['R','T'],['H','A'],['G','E']]){d+=L[a](0,y/u)+L[b](7,y/u);y+=8*u;}
  const port=cothon(y,col);y+=7*u;
  let t='';if(o.text){["HUILE D'OLIVE","DE CARTHAGE","TUNISIE"].forEach((s,i)=>{y+=i?36:56;
    t+=`<text x="0" y="${y}" font-family="Archivo, Arial, sans-serif" font-stretch="125%" font-weight="800" font-size="27" letter-spacing="1.5" fill="${col}">${s}</text>`;});y+=6;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 ${W+60} ${y+40}"><g fill="${col}">${c}<path d="${d}"/>${port}</g>${t}</svg>`;}
module.exports={emblem};
if(require.main===module){fs.writeFileSync('carthage-coufique-noir.svg',emblem('#000'));}
