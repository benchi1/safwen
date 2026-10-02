const fs=require('fs');const S=6;const ink='#000',paper='#fff';
/* Olivier : tronc tordu + 5 branches portant des feuilles étroites alternées + olives */
function bez(p0,p1,p2,t){const u=1-t;return [u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]];}
function tan(p0,p1,p2,t){return [2*(1-t)*(p1[0]-p0[0])+2*t*(p2[0]-p1[0]),2*(1-t)*(p1[1]-p0[1])+2*t*(p2[1]-p1[1])];}
const BR=[ // branches depuis le haut du tronc (0,0) ; coordonnées locales
 [[0,0],[-22,-6],[-46,-4]], [[0,0],[-16,-18],[-30,-32]], [[0,0],[2,-22],[-2,-44]], [[0,0],[16,-18],[30,-32]], [[0,0],[22,-6],[46,-4]]];
function oliveTree(cx,cy,s,col,bgc,halo){
  let leaves='',stems='',olives='';
  BR.forEach((b,bi)=>{stems+=`M${b[0]}Q${b[1]} ${b[2]}`;
    for(let i=1;i<=6;i++){const t=0.18+i*0.13;const p=bez(...b,t),d=tan(...b,t);const ang=Math.atan2(d[1],d[0])*180/Math.PI;
      const side=i%2?1:-1;const L=13-i*0.6;
      leaves+=`<path d="M0 0C${L*.3} ${-L*.12} ${L*.7} ${-L*.12} ${L} 0C${L*.7} ${L*.12} ${L*.3} ${L*.12} 0 0Z" transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${(ang+side*38).toFixed(0)})"/>`;}
    const tip=b[2],d=tan(...b,1);const ang=Math.atan2(d[1],d[0])*180/Math.PI;
    leaves+=`<path d="M0 0C4 -1.6 9 -1.6 13 0C9 1.6 4 1.6 0 0Z" transform="translate(${tip[0]} ${tip[1]}) rotate(${ang.toFixed(0)})"/>`;
    if(bi%2===0){const p=bez(...b,0.62);olives+=`<ellipse cx="${(p[0]+(bi<2?3:-3)).toFixed(1)}" cy="${(p[1]+6).toFixed(1)}" rx="3.2" ry="4.2"/>`;}
  });
  stems=stems.replace(/,/g,' ');
  const trunk='M-9 46C-4 36 -1 28 -5 20C-8 14 -6 7 -2 0H3C5 6 4 12 6 18C8 25 4 35 10 46Z';
  const g=(c,sw)=>`<g fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"><path d="${stems}" fill="none" stroke-width="${2.6+sw}"/>${leaves}${olives}<path d="${trunk}"/></g>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${halo?g(bgc,halo):''}${g(col,0)}<path d="M1 12c-1 6 0 12 2 16" stroke="${bgc}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
}
/* Viaduc : tablier, corniche, 5 arches contiguës en plein cintre, piles hautes */
function viaduct(x,w,deck,ground,col){const n=5,span=w/n,r=span/2,top=deck+5;let a='';
  for(let i=0;i<n;i++){const ax=x+i*span;a+=`M${ax} ${ground}V${top+r}A${r} ${r} 0 0 1 ${ax+span} ${top+r}V${ground}`;}
  return `<rect x="${x-5}" y="${deck-7}" width="${w+10}" height="7" fill="${col}"/><rect x="${x-9}" y="${deck-13}" width="${w+18}" height="3" fill="${col}"/>
  <path d="${a}" fill="none" stroke="${col}" stroke-width="${S}"/>`;}
function scene(col,bgc,o){o=Object.assign({sun:'line'},o);
  return `${o.sun==='line'?`<circle cx="128" cy="94" r="40" fill="none" stroke="${col}" stroke-width="${S}"/>`:o.sun==='solid'?`<circle cx="128" cy="94" r="40" fill="${col}"/>`:''}
  ${oliveTree(128,96,1.02,o.treeCol||col,o.halo||bgc,o.sun==='solid'?0:7)}
  ${viaduct(70,116,146,224,col)}
  <path d="M${o.x0||44} 150C58 152 62 196 70 224M${o.x1||212} 150C198 152 194 196 186 224" fill="none" stroke="${col}" stroke-width="${S}"/>
  <path d="M${o.x0||44} 224H${o.x1||212}" stroke="${col}" stroke-width="${S}"/>`;}
const A=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
 <path d="M38 236V112A90 90 0 0 1 218 112V236" fill="none" stroke="${ink}" stroke-width="${S}"/>
 <path d="M26 236H230" stroke="${ink}" stroke-width="${S}"/>${scene(ink,paper)}</svg>`;
const B=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><clipPath id="cb"><circle cx="128" cy="128" r="112"/></clipPath></defs>
 <circle cx="128" cy="128" r="122" fill="${ink}"/><circle cx="128" cy="128" r="114" fill="none" stroke="${paper}" stroke-width="2.5"/>
 <g clip-path="url(#cb)" transform="translate(0 4)">${scene(paper,ink,{x0:0,x1:256})}</g></svg>`;
/* C — arc outrepassé (fer à cheval), plein, scène en réserve */
const HS='M44 238V120A84 84 0 1 1 212 120V238Z'; // approximé : cercle prolongé
const horse=`M50 238V132C50 130 46 124 42 118A88 88 0 1 1 214 118C210 124 206 130 206 132V238Z`;
const C=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><clipPath id="cc"><path d="${horse}"/></clipPath></defs>
 <path d="${horse}" fill="${ink}"/><g clip-path="url(#cc)">${scene(paper,ink,{x0:20,x1:236})}</g>
 <path d="M28 244H228" stroke="${ink}" stroke-width="${S}"/></svg>`;
fs.writeFileSync('a-cartouche-v2.svg',A);fs.writeFileSync('b-piece-v2.svg',B);fs.writeFileSync('c-arc-v2.svg',C);
