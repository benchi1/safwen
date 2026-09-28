import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Polices variables embarquées dans public/fonts : aucun accès réseau au rendu.
export const display = "Space Grotesk";
export const body = "Inter";

loadFont({
  family: display,
  url: staticFile("fonts/SpaceGrotesk.woff2"),
  weight: "300 700",
});
loadFont({
  family: body,
  url: staticFile("fonts/Inter.woff2"),
  weight: "100 900",
});
