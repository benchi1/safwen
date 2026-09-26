// Génère compositions/carte.html à partir de tools/carte.template.html :
// pays (Natural Earth 1:50m), graticule, sites projetés, trajectoires du
// moteur et pays survolés le long de chaque trajet.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoGraticule10, geoContains } from "d3-geo";
import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json" with { type: "json" };
import { SITES, AUTRES_SITES } from "./sites.mjs";

countries.registerLocale(fr);
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const MAP_W = 2000;
const topo = JSON.parse(
  readFileSync(join(here, "node_modules/world-atlas/countries-50m.json"), "utf8"),
);
const world = feature(topo, topo.objects.countries);
world.features = world.features.filter((f) => f.id !== "010"); // Antarctique

const projection = geoNaturalEarth1().fitWidth(MAP_W, { type: "Sphere" });
const path = geoPath(projection).digits(1);
const MAP_H = Math.round(path.bounds({ type: "Sphere" })[1][1]);

const NOMS = { "840": "États-Unis", "643": "Russie" };
const nomPays = (id) => {
  if (NOMS[id]) return NOMS[id];
  const a2 = countries.numericToAlpha2(id);
  return (a2 && countries.getName(a2, "fr", { select: "alias" })) || null;
};

const r1 = (v) => Math.round(v * 10) / 10;
const proj = (lonlat) => projection(lonlat).map(r1);

const sites = SITES.map((s) => ({ ...s, xy: proj(s.lonlat) }));
const autres = AUTRES_SITES.map((s) => ({ ...s, xy: proj(s.lonlat) }));

// Trajectoires : Bézier quadratique, point de contrôle soulevé vers le haut.
const vols = [];
for (let i = 0; i < sites.length - 1; i++) {
  const [ax, ay] = sites[i].xy;
  const [bx, by] = sites[i + 1].xy;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const lift = Math.min(len * 0.28, 170);
  const c = [r1((ax + bx) / 2 + nx * lift), r1((ay + by) / 2 + ny * lift)];

  // Pays survolés, échantillonnés le long de la courbe.
  const N = 240;
  const segs = [];
  for (let k = 0; k <= N; k++) {
    const p = k / N;
    const q = 1 - p;
    const x = q * q * ax + 2 * q * p * c[0] + p * p * bx;
    const y = q * q * ay + 2 * q * p * c[1] + p * p * by;
    const ll = projection.invert([x, y]);
    const f = ll && world.features.find((f) => geoContains(f, ll));
    const id = f ? f.id : null;
    const last = segs[segs.length - 1];
    if (last && last.id === id) last.p1 = p;
    else segs.push({ id, nom: id ? nomPays(id) : null, p0: p, p1: p });
  }
  // Fil d'Ariane des pays survolés (mer ignorée, doublons consécutifs fusionnés).
  const etiquettes = [];
  for (const sg of segs.filter((x) => x.id)) {
    const prev = etiquettes[etiquettes.length - 1];
    if (prev && prev.id === sg.id) prev.p1 = sg.p1;
    else etiquettes.push({ id: sg.id, nom: sg.nom, p0: sg.p0, p1: sg.p1 });
  }
  vols.push({ de: sites[i].id, vers: sites[i + 1].id, c, len: r1(len), survols: segs.filter((x) => x.id), etiquettes });
}

const paysSites = new Set(sites.map((s) => s.iso));
const paths = world.features
  .map((f) => {
    const d = path(f);
    if (!d) return "";
    const cls = paysSites.has(f.id) ? "pays pays-site" : "pays";
    return `<path id="c-${f.id}" class="${cls}" d="${d}"/>`;
  })
  .join("");
const graticule = `<path class="graticule" d="${path(geoGraticule10())}"/>`;
const sphere = `<path class="sphere" d="${path({ type: "Sphere" })}"/>`;

const data = {
  MAP_W,
  MAP_H,
  sites: sites.map(({ lonlat, ...s }) => s),
  autres: autres.map(({ lonlat, ...s }) => s),
  vols,
};

const tpl = readFileSync(join(here, "carte.template.html"), "utf8");
const out = tpl
  .replace("<!--SPHERE-->", sphere)
  .replace("<!--GRATICULE-->", graticule)
  .replace("<!--PAYS-->", paths)
  .replaceAll("__MAP_W__", String(MAP_W))
  .replaceAll("__MAP_H__", String(MAP_H))
  .replace("/*__DATA__*/null", JSON.stringify(data));
writeFileSync(join(root, "compositions/carte.html"), out);

for (const v of vols) {
  console.log(
    `${v.de} → ${v.vers} (${v.len}u) :`,
    v.etiquettes.map((s) => s.nom || "·mer·").join(" › "),
  );
}
console.log(`carte.html : ${(out.length / 1024).toFixed(0)} Ko, ${MAP_W}x${MAP_H}`);
