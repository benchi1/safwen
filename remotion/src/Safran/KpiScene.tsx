import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { body, clamp, colors, easeOut, fr } from "./theme";

const KPIS = [
  {
    label: "Résultat opérationnel courant",
    value: 5.2,
    decimals: 1,
    unit: "Md€",
    note: "marge de 16,6 %",
  },
  {
    label: "Cash-flow libre",
    value: 3.9,
    decimals: 1,
    unit: "Md€",
    note: "+23 % sur un an",
  },
  {
    label: "Dividende proposé",
    value: 3.35,
    decimals: 2,
    unit: "€",
    note: "par action, +16 %",
  },
  {
    label: "Collaborateurs",
    value: 110778,
    decimals: 0,
    unit: "",
    note: "au 31 décembre 2025",
  },
];

export const KpiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: 80,
          gap: 40,
        }}
      >
        {KPIS.map((kpi, i) => {
          const start = 6 + i * 14;
          const card = spring({
            frame: frame - start,
            fps,
            config: { damping: 15 },
          });
          const count = interpolate(
            frame,
            [start, start + 40],
            [0, kpi.value],
            {
              ...clamp,
              easing: easeOut,
            },
          );
          return (
            <div
              key={kpi.label}
              style={{
                borderRadius: 36,
                padding: "40px 56px",
                background: `linear-gradient(135deg, ${colors.blue}cc, ${colors.navy}cc)`,
                border: `2px solid ${colors.sky}44`,
                opacity: card,
                transform: `translateY(${(1 - card) * 80}px) scale(${interpolate(card, [0, 1], [0.92, 1])})`,
              }}
            >
              <div
                style={{
                  fontFamily: body,
                  fontSize: 36,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: colors.ice,
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: body,
                    fontWeight: 800,
                    fontSize: 130,
                    color: colors.white,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.1,
                  }}
                >
                  {fr(count, kpi.decimals)}
                  {kpi.unit ? (
                    <span style={{ fontSize: 60, color: colors.sky }}>
                      {" "}
                      {kpi.unit}
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    fontFamily: body,
                    fontSize: 34,
                    color: colors.grey,
                    textAlign: "right",
                  }}
                >
                  {kpi.note}
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
