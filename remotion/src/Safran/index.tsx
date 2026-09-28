import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { IntroScene } from "./IntroScene";
import { KpiScene } from "./KpiScene";
import { OutroScene } from "./OutroScene";
import {
  PRODUCT_DURATION,
  PRODUCTS_DURATION,
  ProductsScene,
} from "./ProductsScene";
import { RevenueScene } from "./RevenueScene";
import { SegmentsScene } from "./SegmentsScene";
import { clamp } from "./theme";

const T = 15;
const timing = linearTiming({ durationInFrames: T });
// Logo, chiffre d'affaires, métiers, indicateurs, produits, fin
const SCENES = [120, 110, 140, 150, PRODUCTS_DURATION, 110];

export const SAFRAN_DURATION =
  SCENES.reduce((sum, d) => sum + d, 0) - (SCENES.length - 1) * T;

const sceneStarts = SCENES.map((_, i) =>
  SCENES.slice(0, i).reduce((sum, d) => sum + d - T, 0),
);

export const SafranResultats: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
          <RevenueScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
          <SegmentsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[3]}>
          <KpiScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={timing}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[4]}>
          <ProductsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES[5]}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        src={staticFile("nappe.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, SAFRAN_DURATION - 30, SAFRAN_DURATION],
            [0, 0.8, 0.8, 0],
            clamp,
          )
        }
      />
      <Sequence from={8}>
        <Audio src={staticFile("impact.wav")} volume={0.8} />
      </Sequence>
      {sceneStarts.slice(1).map((start) => (
        <Sequence key={start} from={start - T / 2}>
          <Audio src={staticFile("souffle.wav")} volume={0.5} />
        </Sequence>
      ))}
      {/* Un coup par produit */}
      {[1, 2, 3, 4].map((i) => (
        <Sequence
          key={`produit-${i}`}
          from={sceneStarts[4] + i * PRODUCT_DURATION}
          durationInFrames={PRODUCT_DURATION}
        >
          <Audio src={staticFile("impact.wav")} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
