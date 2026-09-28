import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { Logo } from "./Logo";
import { body, clamp, colors } from "./theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const text = interpolate(frame, [24, 44], [0, 1], clamp);
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Backdrop />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 50 }}
      >
        <Logo delay={0} size={200} />
        <div
          style={{
            fontFamily: body,
            fontWeight: 500,
            fontSize: 50,
            color: colors.ice,
            textAlign: "center",
            lineHeight: 1.3,
            opacity: text,
          }}
        >
          Propulser l’aviation,
          <br />
          partout dans le monde
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          fontFamily: body,
          fontSize: 28,
          color: colors.grey,
          opacity: text,
        }}
      >
        Source : résultats annuels 2025 de Safran, publiés le 13 février 2026
      </div>
    </AbsoluteFill>
  );
};
