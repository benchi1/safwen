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

export const colors = {
  ink: "#0B0B12",
  cream: "#F4EFE6",
  coral: "#FF5A36",
  lime: "#C6F432",
  violet: "#7B61FF",
  sky: "#4CC9F0",
};
