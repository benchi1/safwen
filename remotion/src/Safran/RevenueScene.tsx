import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { body, clamp, colors, easeOut, fr } from "./theme";

export const RevenueScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = interpolate(frame, [8, 60], [0, 31.3], {
    ...clamp,
    easing: easeOut,
  });
  const label = interpolate(frame, [0, 15], [0, 1], clamp);
  const badge = spring({ frame: frame - 60, fps, config: { damping: 10 } });
  const ring = interpolate(frame, [8, 60], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const R = 400;
  const C = 2 * Math.PI * R;

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg
          width={2 * R + 40}
          height={2 * R + 40}
          style={{ position: "absolute", transform: "rotate(-90deg)" }}
        >
          <circle
            cx={R + 20}
            cy={R + 20}
            r={R}
            fill="none"
            stroke={`${colors.sky}22`}
            strokeWidth={16}
          />
          <circle
            cx={R + 20}
            cy={R + 20}
            r={R}
            fill="none"
            stroke={colors.sky}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ring)}
          />
        </svg>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: body,
              fontSize: 42,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: colors.ice,
              opacity: label,
            }}
          >
            Chiffre d’affaires
          </div>
          <div
            style={{
              fontFamily: body,
              fontWeight: 800,
              fontSize: 260,
              lineHeight: 1.05,
              color: colors.white,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fr(count, 1)}
          </div>
          <div
            style={{
              fontFamily: body,
              fontWeight: 600,
              fontSize: 64,
              color: colors.white,
              opacity: label,
            }}
          >
            milliards d’euros
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 50,
              padding: "16px 40px",
              borderRadius: 999,
              background: colors.sky,
              color: colors.night,
              fontFamily: body,
              fontWeight: 800,
              fontSize: 56,
              transform: `scale(${badge})`,
            }}
          >
            +15&nbsp;% sur un an
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
