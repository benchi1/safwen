import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, colors, display } from "./theme";

const CARDS = [
  { title: "Paramétrable", text: "Une vidéo, mille variantes", bg: colors.coral },
  { title: "Reproductible", text: "Même code, même rendu", bg: colors.lime },
  { title: "Scalable", text: "Rendu en série sur serveur", bg: colors.sky },
];

export const CardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sway = Math.sin(frame / 18) * 6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.violet,
        justifyContent: "center",
        alignItems: "center",
        perspective: 1600,
        gap: 50,
      }}
    >
      {CARDS.map((card, i) => {
        const s = spring({
          frame: frame - i * 8,
          fps,
          config: { damping: 12, mass: 0.8 },
        });
        return (
          <div
            key={card.title}
            style={{
              width: 820,
              height: 380,
              borderRadius: 48,
              background: card.bg,
              padding: 60,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
              transform: `rotateY(${interpolate(s, [0, 1], [-100, sway])}deg) rotateX(${interpolate(s, [0, 1], [30, 0])}deg) translateZ(${interpolate(s, [0, 1], [-400, 0])}px)`,
              opacity: interpolate(s, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontFamily: display,
                fontWeight: 700,
                fontSize: 96,
                color: colors.ink,
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                fontFamily: body,
                fontSize: 42,
                color: colors.ink,
                opacity: 0.75,
              }}
            >
              {card.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
