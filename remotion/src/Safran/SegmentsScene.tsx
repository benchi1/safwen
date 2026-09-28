import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { body, clamp, colors, easeOut, fr } from "./theme";

const SEGMENTS = [
  { name: "Propulsion", value: 15.7, color: colors.sky },
  { name: "Équipements & Défense", value: 12.3, color: colors.ice },
  { name: "Intérieurs d’avions", value: 3.3, color: colors.grey },
];
const TOTAL = SEGMENTS.reduce((s, x) => s + x.value, 0);

export const SegmentsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = interpolate(frame, [0, 15], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", padding: 100, gap: 80 }}>
        <div style={{ opacity: title }}>
          <div
            style={{
              fontFamily: body,
              fontSize: 40,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: colors.ice,
            }}
          >
            Chiffre d’affaires 2025
          </div>
          <div
            style={{
              fontFamily: body,
              fontWeight: 800,
              fontSize: 96,
              color: colors.white,
            }}
          >
            Trois métiers
          </div>
        </div>

        {/* Barre empilée */}
        <div
          style={{
            display: "flex",
            height: 90,
            borderRadius: 45,
            overflow: "hidden",
            background: `${colors.sky}18`,
          }}
        >
          {SEGMENTS.map((seg, i) => {
            const grow = interpolate(
              frame,
              [12 + i * 10, 45 + i * 10],
              [0, 1],
              {
                ...clamp,
                easing: easeOut,
              },
            );
            return (
              <div
                key={seg.name}
                style={{
                  width: `${(seg.value / TOTAL) * 100 * grow}%`,
                  background: seg.color,
                  borderRight: `4px solid ${colors.night}`,
                }}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {SEGMENTS.map((seg, i) => {
            const s = spring({
              frame: frame - 30 - i * 12,
              fps,
              config: { damping: 16 },
            });
            const share = (seg.value / TOTAL) * 100;
            return (
              <div
                key={seg.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 36,
                  opacity: s,
                  transform: `translateX(${(1 - s) * -80}px)`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: seg.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: body,
                      fontWeight: 600,
                      fontSize: 50,
                      color: colors.white,
                    }}
                  >
                    {seg.name}
                  </div>
                  <div
                    style={{
                      fontFamily: body,
                      fontSize: 36,
                      color: colors.grey,
                    }}
                  >
                    {Math.round(share)}&nbsp;% du total
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: body,
                    fontWeight: 800,
                    fontSize: 72,
                    color: seg.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fr(seg.value * s, 1)}
                  <span style={{ fontSize: 40 }}> Md€</span>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
