import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Blobs } from "./Blobs";
import { body, colors, display } from "./theme";

const WORD = "REMOTION";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bar = spring({ frame: frame - 28, fps, config: { damping: 200 } });
  const subtitle = interpolate(frame, [36, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Blobs
        background={colors.ink}
        palette={[colors.violet, colors.coral, colors.sky]}
      />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 48 }}
      >
        <div
          style={{
            fontFamily: body,
            fontSize: 38,
            letterSpacing: 12,
            color: colors.cream,
            opacity: subtitle,
            textTransform: "uppercase",
          }}
        >
          Démo · 100 % code
        </div>
        <div style={{ display: "flex", overflow: "hidden", padding: "0 20px" }}>
          {WORD.split("").map((letter, i) => {
            const s = spring({
              frame: frame - i * 3,
              fps,
              config: { damping: 11, mass: 0.7 },
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 200,
                  color: colors.cream,
                  display: "inline-block",
                  transform: `translateY(${interpolate(s, [0, 1], [260, 0])}px) rotate(${interpolate(s, [0, 1], [18, 0])}deg)`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div
          style={{
            height: 14,
            width: 760 * bar,
            borderRadius: 7,
            background: `linear-gradient(90deg, ${colors.coral}, ${colors.lime})`,
          }}
        />
        <div
          style={{
            fontFamily: body,
            fontWeight: 600,
            fontSize: 60,
            color: colors.cream,
            opacity: subtitle,
            transform: `translateY(${(1 - subtitle) * 30}px)`,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          Des vidéos écrites
          <br />
          en React
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
