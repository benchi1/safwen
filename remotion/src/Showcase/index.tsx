import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CardsScene } from "./CardsScene";
import { DataScene } from "./DataScene";
import { GenerativeScene } from "./GenerativeScene";
import { KineticScene, WORD_DURATION } from "./KineticScene";
import { OutroScene } from "./OutroScene";
import { TitleScene } from "./TitleScene";

const T = 15;
const timing = linearTiming({ durationInFrames: T });
// Titre, typo cinétique, données, génératif, cartes 3D, outro
const SCENES = [
  { duration: 90 },
  { duration: WORD_DURATION * 3 },
  { duration: 130 },
  { duration: 110 },
  { duration: 100 },
  { duration: 100 },
];

export const SHOWCASE_DURATION =
  SCENES.reduce((sum, s) => sum + s.duration, 0) - (SCENES.length - 1) * T;

// Image de début de chaque scène, chevauchement des transitions déduit
const sceneStarts = SCENES.map((_, i) =>
  SCENES.slice(0, i).reduce((sum, s) => sum + s.duration - T, 0),
);

export const Showcase: React.FC = () => {
  const { width, height } = useVideoConfig();

  const kineticStart = sceneStarts[1];

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0].duration}>
          <TitleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[1].duration}>
          <KineticScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-top-left" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[2].duration}>
          <DataScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width, height })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[3].duration}>
          <GenerativeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={flip({ direction: "from-right" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[4].duration}>
          <CardsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={iris({ width, height })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[5].duration}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        src={staticFile("nappe.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, SHOWCASE_DURATION - 30, SHOWCASE_DURATION],
            [0, 0.8, 0.8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      {sceneStarts.slice(1).map((start) => (
        <Sequence key={`souffle-${start}`} from={start - T / 2}>
          <Audio src={staticFile("souffle.wav")} volume={0.6} />
        </Sequence>
      ))}
      {[0, 1, 2].map((i) => (
        <Sequence
          key={`impact-${i}`}
          from={kineticStart + i * WORD_DURATION}
          durationInFrames={WORD_DURATION}
        >
          <Audio src={staticFile("impact.wav")} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={sceneStarts[5] + 5}>
        <Audio src={staticFile("impact.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
