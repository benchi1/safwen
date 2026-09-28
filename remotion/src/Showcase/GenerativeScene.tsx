import { noise3D } from "@remotion/noise";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, display } from "./theme";

const COLS = 14;
const ROWS = 25;

export const GenerativeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const title = spring({ frame: frame - 12, fps, config: { damping: 15 } });

  const dots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = noise3D("grid", c * 0.12, r * 0.12, frame * 0.025);
      // L'onde se propage depuis le centre à l'ouverture
      const dist = Math.hypot(c - COLS / 2, r - ROWS / 2);
      const reveal = interpolate(frame - dist * 1.6, [0, 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const radius = interpolate(n, [-1, 1], [4, cellW * 0.46]) * reveal;
      const hue = interpolate(n, [-1, 1], [250, 400]) % 360;
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * cellW + cellW / 2}
          cy={r * cellH + cellH / 2}
          r={radius}
          fill={`hsl(${hue}, 90%, 62%)`}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <svg width={width} height={height}>
        {dots}
      </svg>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 170,
            color: colors.cream,
            background: colors.ink,
            padding: "10px 50px",
            borderRadius: 30,
            transform: `scale(${title}) rotate(${interpolate(title, [0, 1], [-8, -3])}deg)`,
          }}
        >
          Génératif
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
