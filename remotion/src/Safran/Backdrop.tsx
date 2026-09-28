import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "./theme";

// Fond marine avec une grille technique qui défile lentement.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.6) % 120;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${colors.navy} 0%, ${colors.night} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.sky}14 2px, transparent 2px), linear-gradient(90deg, ${colors.sky}14 2px, transparent 2px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `0 ${offset}px`,
          maskImage:
            "radial-gradient(90% 70% at 50% 45%, black 20%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};
