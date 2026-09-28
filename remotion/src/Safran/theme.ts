export { body } from "../fonts";

// Bleus repris du reel « Tour du monde du LEAP » (inspirés de l'identité
// Safran, pas les valeurs officielles).
export const colors = {
  night: "#050d1c",
  navy: "#0a1f3f",
  blue: "#1a4c9c",
  sky: "#4fa3ff",
  ice: "#bfe0ff",
  white: "#f5f8fc",
  grey: "#8a9ab4",
};

// 31.3 -> « 31,3 », 110778 -> « 110 778 » (espace fine insécable)
export const fr = (value: number, decimals = 0) =>
  value
    .toFixed(decimals)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Courbe « ease out » cubique pour les compteurs
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
