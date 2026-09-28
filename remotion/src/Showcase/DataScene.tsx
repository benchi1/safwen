import { evolvePath } from "@remotion/paths";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, colors, display } from "./theme";

const BARS = [
  { label: "Lun", value: 42 },
  { label: "Mar", value: 68 },
  { label: "Mer", value: 55 },
  { label: "Jeu", value: 91 },
  { label: "Ven", value: 77 },
];

const LINE = [12, 30, 22, 48, 40, 66, 58, 84, 96];
const CHART_W = 880;
const CHART_H = 360;

const linePath = LINE.map((v, i) => {
  const x = (i / (LINE.length - 1)) * CHART_W;
  const y = CHART_H - (v / 100) * CHART_H;
  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
}).join(" ");

export const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const counter = interpolate(frame, [10, 70], [0, 128], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const lineProgress = interpolate(frame, [40, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { strokeDasharray, strokeDashoffset } = evolvePath(
    lineProgress,
    linePath,
  );
  const lastX = CHART_W;
  const lastY = CHART_H - (LINE[LINE.length - 1] / 100) * CHART_H;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.cream,
        padding: 100,
        justifyContent: "center",
        gap: 70,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: body,
            fontSize: 40,
            color: colors.ink,
            opacity: 0.6,
          }}
        >
          Croissance hebdo
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 220,
            lineHeight: 1,
            color: colors.ink,
          }}
        >
          +{Math.round(counter)}
          <span style={{ color: colors.coral }}>%</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 36,
          height: 520,
        }}
      >
        {BARS.map((b, i) => {
          const s = spring({
            frame: frame - 8 - i * 5,
            fps,
            config: { damping: 13 },
          });
          const highlight = b.value === Math.max(...BARS.map((x) => x.value));
          return (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 44,
                  color: colors.ink,
                  opacity: s,
                }}
              >
                {Math.round(b.value * Math.min(s, 1))}
              </div>
              <div
                style={{
                  width: "100%",
                  height: (b.value / 100) * 400 * s,
                  borderRadius: 24,
                  background: highlight ? colors.coral : colors.ink,
                }}
              />
              <div
                style={{
                  fontFamily: body,
                  fontSize: 32,
                  color: colors.ink,
                  opacity: 0.6,
                }}
              >
                {b.label}
              </div>
            </div>
          );
        })}
      </div>

      <svg
        width={CHART_W}
        height={CHART_H}
        viewBox={`-20 -20 ${CHART_W + 40} ${CHART_H + 40}`}
        style={{ overflow: "visible" }}
      >
        <path
          d={linePath}
          fill="none"
          stroke={colors.violet}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
        <circle
          cx={lastX}
          cy={lastY}
          r={22 * spring({ frame: frame - 100, fps })}
          fill={colors.coral}
        />
      </svg>
    </AbsoluteFill>
  );
};
