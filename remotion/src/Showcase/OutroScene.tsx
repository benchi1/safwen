import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Blobs } from "./Blobs";
import { body, colors, display } from "./theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ring = spring({ frame, fps, config: { damping: 20 } });
  const text = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Blobs
        background={colors.ink}
        palette={[colors.coral, colors.violet, colors.lime]}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg width={960} height={960} style={{ position: "absolute" }}>
          <circle
            cx={480}
            cy={480}
            r={450}
            fill="none"
            stroke={colors.cream}
            strokeWidth={6}
            strokeDasharray={2 * Math.PI * 450}
            strokeDashoffset={2 * Math.PI * 450 * (1 - ring)}
            transform={`rotate(${-90 + frame * 1.5} 480 480)`}
            opacity={0.8}
          />
        </svg>
        <div
          style={{
            textAlign: "center",
            transform: `scale(${interpolate(text, [0, 1], [0.6, 1])})`,
            opacity: text,
          }}
        >
          <div
            style={{
              fontFamily: display,
              fontWeight: 700,
              fontSize: 180,
              color: colors.cream,
              lineHeight: 1,
            }}
          >
            100 %
            <br />
            code
          </div>
          <div
            style={{
              fontFamily: body,
              fontSize: 40,
              letterSpacing: 6,
              color: colors.lime,
              marginTop: 40,
              textTransform: "uppercase",
            }}
          >
            Rendu avec Remotion
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
