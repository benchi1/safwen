import { colors } from "./theme";

// Pictos au trait, dessinés progressivement : `draw` va de 0 à 1.
// pathLength={1} normalise la longueur de chaque tracé pour l'animation.
type Props = { draw: number; frame: number };

const stroke = (draw: number) => ({
  fill: "none",
  stroke: colors.sky,
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - draw,
});

// Soufflante vue de face, 18 aubes comme le LEAP
export const Turbofan: React.FC<Props> = ({ draw, frame }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <circle cx={200} cy={200} r={180} {...stroke(draw)} />
    <circle cx={200} cy={200} r={160} {...stroke(draw)} strokeWidth={3} />
    <g transform={`rotate(${frame * 9} 200 200)`}>
      {Array.from({ length: 18 }).map((_, i) => (
        <path
          key={i}
          d="M200 170 C 225 130, 215 80, 232 42"
          transform={`rotate(${i * 20} 200 200)`}
          {...stroke(draw)}
          strokeWidth={4}
        />
      ))}
    </g>
    <circle cx={200} cy={200} r={32} {...stroke(draw)} />
    <circle cx={200} cy={200} r={8} fill={colors.sky} opacity={draw} />
  </svg>
);

// Avion de combat à aile delta vu de dessus
export const DeltaJet: React.FC<Props> = ({ draw, frame }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <g transform={`translate(0 ${Math.sin(frame / 10) * 6})`}>
      <path
        d="M200 30 L214 110 L216 175 L350 300 L350 318 L218 292 L214 330 L252 356 L252 368 L200 360 L148 368 L148 356 L186 330 L182 292 L50 318 L50 300 L184 175 L186 110 Z"
        {...stroke(draw)}
      />
      <path d="M186 140 L130 170 L130 180 L186 165" {...stroke(draw)} />
      <path d="M214 140 L270 170 L270 180 L214 165" {...stroke(draw)} />
      <path d="M200 60 L200 120" {...stroke(draw)} strokeWidth={4} />
    </g>
    {/* Traînées de réacteur */}
    <path
      d="M192 372 L192 400 M208 372 L208 400"
      {...stroke(draw)}
      stroke={colors.ice}
      strokeDasharray="0.1 0.05"
      strokeDashoffset={-frame * 0.02}
    />
  </svg>
);

// Hélicoptère vu de profil, rotor en rotation
export const Helicopter: React.FC<Props> = ({ draw, frame }) => {
  const blade = Math.cos(frame * 0.9);
  return (
    <svg viewBox="10 60 380 240" width="100%" height="100%">
      <path
        d="M120 200 C 120 150, 170 140, 220 150 L 240 175 L 245 220 C 240 250, 150 255, 130 235 Z"
        {...stroke(draw)}
      />
      <path
        d="M150 175 C 160 160, 190 158, 205 162 L 215 185 L 150 190 Z"
        {...stroke(draw)}
        strokeWidth={4}
      />
      <path
        d="M240 190 L 350 180 L 355 150 L 368 150 L 365 200 L 245 215"
        {...stroke(draw)}
      />
      <path
        d="M140 262 L 240 262 M165 245 L 160 262 M215 245 L 220 262"
        {...stroke(draw)}
      />
      <path d="M190 148 L 190 122" {...stroke(draw)} />
      <line
        x1={190 - 170 * blade}
        y1={118}
        x2={190 + 170 * blade}
        y2={118}
        stroke={colors.ice}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={draw}
      />
      <circle
        cx={360}
        cy={175}
        r={24 * Math.abs(Math.sin(frame * 0.9))}
        {...stroke(draw)}
        strokeWidth={3}
        strokeDasharray="none"
      />
    </svg>
  );
};

// Train d'atterrissage principal, roues en rotation
export const LandingGear: React.FC<Props> = ({ draw, frame }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    {/* Contrefiche, fût et tige de l'amortisseur */}
    <path d="M200 90 L80 20" {...stroke(draw)} strokeWidth={10} />
    <path d="M200 20 L200 200" {...stroke(draw)} strokeWidth={22} />
    <path d="M200 200 L200 290" {...stroke(draw)} strokeWidth={10} />
    <path d="M200 185 L172 222 L200 258" {...stroke(draw)} strokeWidth={5} />
    <path d="M130 290 L270 290" {...stroke(draw)} strokeWidth={12} />
    {[130, 270].map((cx) => (
      <g key={cx} transform={`rotate(${frame * 6} ${cx} 290)`}>
        <circle cx={cx} cy={290} r={60} {...stroke(draw)} strokeWidth={12} />
        <circle cx={cx} cy={290} r={26} {...stroke(draw)} />
        {[0, 60, 120].map((a) => (
          <path
            key={a}
            d={`M${cx} 264 L${cx} 316`}
            transform={`rotate(${a} ${cx} 290)`}
            {...stroke(draw)}
            strokeWidth={4}
          />
        ))}
      </g>
    ))}
  </svg>
);

// Siège d'avion de profil
export const Seat: React.FC<Props> = ({ draw }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <path
      d="M150 60 C 130 60, 125 80, 128 100 L 150 240 C 152 255, 160 262, 175 262 L 290 262 C 305 262, 310 250, 305 238 L 295 222 C 290 214, 282 212, 272 212 L 190 212 L 175 90 C 173 70, 165 60, 150 60 Z"
      {...stroke(draw)}
    />
    <path
      d="M140 110 C 145 95, 160 95, 165 110"
      {...stroke(draw)}
      strokeWidth={4}
    />
    <path d="M190 190 L 280 190" {...stroke(draw)} />
    <path
      d="M200 262 L 190 340 M270 262 L 285 340 M170 340 L 300 340"
      {...stroke(draw)}
    />
  </svg>
);
