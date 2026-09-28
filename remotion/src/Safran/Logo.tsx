import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { body, clamp, colors } from "./theme";

type Props = {
  // Image de départ de l'animation, relative à la séquence
  delay?: number;
  size?: number;
};

// Logo typographique provisoire. Pour la diffusion, remplacer le texte par le
// fichier officiel (ex. <Img src={staticFile("safran/logo.svg")} />) fourni
// par la communication, en gardant le masque et le balayage.
export const Logo: React.FC<Props> = ({ delay = 0, size = 180 }) => {
  const frame = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 200 } });
  const sweep = interpolate(frame, [10, 40], [-30, 130], clamp);
  const lift = spring({ frame: frame - 4, fps, config: { damping: 16 } });

  return (
    <div
      style={{
        position: "relative",
        fontFamily: body,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: size * 0.06,
        color: colors.white,
        clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`,
        transform: `translateY(${(1 - lift) * 40}px)`,
        lineHeight: 1,
        padding: "0.1em 0.05em",
      }}
    >
      SAFRAN
      {/* Reflet lumineux qui balaie le mot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(100deg, transparent ${sweep - 15}%, ${colors.ice}cc ${sweep}%, transparent ${sweep + 15}%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
};
