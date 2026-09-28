import { noise2D } from "@remotion/noise";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  palette: string[];
  background: string;
};

// Taches de couleur floues qui dérivent au gré d'un bruit de Perlin.
export const Blobs: React.FC<Props> = ({ palette, background }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      {palette.map((color, i) => {
        const t = frame * 0.006;
        const x = (0.5 + 0.45 * noise2D(`x${i}`, t, i)) * width;
        const y = (0.5 + 0.45 * noise2D(`y${i}`, t, i)) * height;
        const size = 900 + 200 * noise2D(`s${i}`, t, 0);
        return (
          <div
            key={color}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: 0.55,
              filter: "blur(160px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
