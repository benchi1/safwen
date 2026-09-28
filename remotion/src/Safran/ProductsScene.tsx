import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import {
  DeltaJet,
  Helicopter,
  LandingGear,
  Seat,
  Turbofan,
} from "./Illustrations";
import { body, clamp, colors } from "./theme";

export const PRODUCT_DURATION = 54;

const PRODUCTS = [
  {
    name: "LEAP",
    kicker: "Moteur d’avion",
    fact: "1 802 moteurs livrés en 2025, +28 %",
    detail: "Avec GE Aerospace, via CFM International",
    Art: Turbofan,
  },
  {
    name: "M88",
    kicker: "Défense",
    fact: "Le moteur du Rafale",
    detail: "Conçu et produit par Safran",
    Art: DeltaJet,
  },
  {
    name: "Arriel",
    kicker: "Hélicoptères",
    fact: "Turbines d’hélicoptères",
    detail: "Safran Helicopter Engines",
    Art: Helicopter,
  },
  {
    name: "Trains",
    kicker: "Systèmes d’atterrissage",
    fact: "Trains d’atterrissage et freins carbone",
    detail: "Safran Landing Systems",
    Art: LandingGear,
  },
  {
    name: "Cabines",
    kicker: "Intérieurs d’avions",
    fact: "Sièges et aménagements de cabine",
    detail: "Safran Seats & Cabin",
    Art: Seat,
  },
];

export const PRODUCTS_DURATION = PRODUCT_DURATION * PRODUCTS.length;

const Product: React.FC<(typeof PRODUCTS)[number] & { index: number }> = ({
  name,
  kicker,
  fact,
  detail,
  Art,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = interpolate(frame, [0, 26], [0, 1], clamp);
  const name_ = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const text = interpolate(frame, [14, 26], [0, 1], clamp);
  const exit = interpolate(
    frame,
    [PRODUCT_DURATION - 8, PRODUCT_DURATION],
    [0, 1],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateX(${exit * -120}px)`,
        alignItems: "center",
        justifyContent: "center",
        padding: 90,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 90,
          fontFamily: body,
          fontSize: 34,
          letterSpacing: 6,
          color: colors.grey,
        }}
      >
        NOS PRODUITS · {String(index + 1).padStart(2, "0")}/
        {String(PRODUCTS.length).padStart(2, "0")}
      </div>
      <div
        style={{
          width: 760,
          height: 760,
          transform: `scale(${interpolate(frame, [0, PRODUCT_DURATION], [0.94, 1.04])})`,
          filter: `drop-shadow(0 0 ${30 * draw}px ${colors.sky}88)`,
        }}
      >
        <Art draw={draw} frame={frame} />
      </div>
      <div style={{ alignSelf: "stretch", marginTop: 40 }}>
        <div
          style={{
            fontFamily: body,
            fontSize: 38,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: colors.sky,
            opacity: text,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1.05,
            color: colors.white,
            transform: `translateY(${(1 - name_) * 60}px)`,
            opacity: name_,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 600,
            fontSize: 52,
            color: colors.white,
            opacity: text,
            marginTop: 10,
          }}
        >
          {fact}
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: 38,
            color: colors.grey,
            opacity: text,
            marginTop: 12,
          }}
        >
          {detail}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductsScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Series>
        {PRODUCTS.map((p, i) => (
          <Series.Sequence key={p.name} durationInFrames={PRODUCT_DURATION}>
            <Product {...p} index={i} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
