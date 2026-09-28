import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, display } from "./theme";

const WORDS = [
  { text: "Code.", bg: colors.coral, fg: colors.ink },
  { text: "Données.", bg: colors.lime, fg: colors.ink },
  { text: "Mouvement.", bg: colors.violet, fg: colors.cream },
];

export const WORD_DURATION = 32;

const Word: React.FC<{ text: string; bg: string; fg: string }> = ({
  text,
  bg,
  fg,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const exit = interpolate(frame, [WORD_DURATION - 6, WORD_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Mot fantôme géant en arrière-plan */}
      <div
        style={{
          position: "absolute",
          fontFamily: display,
          fontWeight: 700,
          fontSize: 560,
          color: fg,
          opacity: 0.07,
          whiteSpace: "nowrap",
          transform: `translateX(${interpolate(frame, [0, WORD_DURATION], [200, -200])}px) rotate(-90deg)`,
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: 150,
          color: fg,
          transform: `scale(${interpolate(enter, [0, 1], [2.6, 1]) + exit * 0.4})`,
          filter: `blur(${interpolate(enter, [0, 1], [24, 0]) + exit * 20}px)`,
          opacity: enter * (1 - exit),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const KineticScene: React.FC = () => {
  return (
    <Series>
      {WORDS.map((w) => (
        <Series.Sequence key={w.text} durationInFrames={WORD_DURATION}>
          <Word {...w} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
