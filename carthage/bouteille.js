const fs=require('fs');const E=require('./build.js');
const C={pourpre:'#4E1A3D',sable:'#EADBC0',or:'#C9A04A'};
const full=E.emblem(C.sable,{bg:C.pourpre});const vb=full.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const emb=full.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const lw=116,ly=420,sc=lw/vb[2],lx=210-lw/2,embH=vb[3]*sc;
const SIG=fs.readFileSync(__dirname+'/signature.path','utf8');const sigY=ly+embH+40;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 1100">
<defs>
 <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#10160B"/><stop offset=".18" stop-color="#3B4A22"/><stop offset=".32" stop-color="#1E2913"/><stop offset=".8" stop-color="#121A0C"/><stop offset="1" stop-color="#070A05"/></linearGradient>
 <linearGradient id="h" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="cap" x1="0" x2="1"><stop offset="0" stop-color="#2A0D20"/><stop offset=".4" stop-color="#7A3160"/><stop offset=".7" stop-color="${C.pourpre}"/><stop offset="1" stop-color="#1E0817"/></linearGradient>
 <linearGradient id="lab" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".15" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
</defs>
<path d="M176 120V250C176 300 92 318 92 380V1060Q92 1084 116 1084H304Q328 1084 328 1060V380C328 318 244 300 244 250V120Z" fill="url(#g)"/>
<rect x="104" y="390" width="14" height="670" rx="7" fill="url(#h)"/>
<rect x="170" y="20" width="80" height="110" rx="5" fill="url(#cap)"/>
${Array.from({length:12},(_,i)=>`<line x1="${174+i*6.5}" y1="24" x2="${174+i*6.5}" y2="126" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`).join('')}
<rect x="164" y="124" width="92" height="26" fill="${C.sable}"/>
<text x="210" y="142" text-anchor="middle" font-family="Archivo" font-stretch="125%" font-weight="700" font-size="11" letter-spacing="3" fill="${C.pourpre}">RÉCOLTE 2026</text>
<rect x="96" y="${ly-34}" width="228" height="660" fill="${C.pourpre}"/>
<g transform="translate(${lx-vb[0]*sc} ${ly-vb[1]*sc}) scale(${sc})">${emb}</g>
<g transform="translate(0 ${sigY-868})"><path d="${SIG}" fill="${C.sable}"/></g>
<line x1="134" x2="286" y1="${sigY+30}" y2="${sigY+30}" stroke="${C.sable}" stroke-opacity=".5"/>
<text x="210" y="${sigY+62}" text-anchor="middle" font-family="Instrument Serif" font-style="italic" font-size="30" fill="${C.sable}">Vierge extra</text>
<text x="210" y="${sigY+88}" text-anchor="middle" font-family="Archivo" font-stretch="112%" font-weight="700" font-size="10" letter-spacing="1.6" fill="${C.or}">CHEMLALI · PRESSÉE À FROID</text>
<text x="210" y="${sigY+128}" text-anchor="middle" font-family="Archivo" font-stretch="125%" font-weight="600" font-size="11" letter-spacing="3" fill="${C.sable}">50 CL</text>
<rect x="96" y="${ly-34}" width="228" height="660" fill="url(#lab)"/>
</svg>`;
fs.writeFileSync(__dirname+'/carthage-bouteille.svg',svg);console.log('label bottom',ly-34+700,'text end',sigY+128);
