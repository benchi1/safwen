import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { Logo } from "./Logo";
import { body, clamp, colors } from "./theme";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });
  const tag = interpolate(frame, [38, 58], [0, 1], clamp);
  const year = spring({ frame: frame - 50, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 40 }}
      >
        <div
          style={{
            height: 6,
            width: 720 * line,
            background: `linear-gradient(90deg, transparent, ${colors.sky}, transparent)`,
          }}
        />
        <Logo delay={8} />
        <div
          style={{
            height: 6,
            width: 720 * line,
            background: `linear-gradient(90deg, transparent, ${colors.sky}, transparent)`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: body,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: 14,
            textTransform: "uppercase",
            color: colors.ice,
            opacity: tag,
            transform: `translateY(${(1 - tag) * 20}px)`,
          }}
        >
          Résultats annuels
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 800,
            fontSize: 150,
            color: colors.sky,
            transform: `scale(${year})`,
          }}
        >
          2025
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
