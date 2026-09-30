"""Musique BeBail (instrumentale), calée sur la grille de reel.js : 120 BPM, 116 temps = 58 s.

python3 audio.py  →  music.wav (48 kHz, stéréo)
Mixage avec la voix off et montage final : python3 mix.py

Parti pris : rien au-dessus de ~9 kHz, pas de bruit blanc brut, saturation légère.
"""
import wave
import numpy as np

SR = 48000
BPM = 120
B = 60 / BPM
DUR = 58.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
mix = np.zeros((N, 2))
verb = np.zeros((N, 2))


def add(sig, start, gain=1.0, pan=0.0, send=0.0):
    i = int(round(start * SR))
    if i >= N:
        return
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    mix[i:i + n, 0] += sig[:n] * gain * l
    mix[i:i + n, 1] += sig[:n] * gain * r
    if send:
        verb[i:i + n, 0] += sig[:n] * gain * send * l
        verb[i:i + n, 1] += sig[:n] * gain * send * r


def tt(d):
    return np.arange(int(d * SR)) / SR


def lowpass(x, fc, order=1):
    n = len(x)
    f = np.fft.rfftfreq(n * 2, 1 / SR)
    h = (1 / (1 + 1j * f / fc)) ** order
    return np.fft.irfft(np.fft.rfft(x, n * 2) * h)[:n]


def highpass(x, fc):
    return x - lowpass(x, fc)


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


at = lambda beat: beat * B


# ─── instruments ──────────────────────────────────────────────────────────
def kick(d=.45, g=1.0):
    t = tt(d)
    f = 48 + 90 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    return np.tanh(body * 1.5) * g


def clap():
    t = tt(.4)
    nz = lowpass(highpass(rng.standard_normal(len(t)), 700), 3200, 2)
    env = sum(np.where(t >= o, np.exp(-(t - o) * k), 0) for o, k in [(0, 140), (.01, 140), (.02, 18)])
    return nz * env * .8


def shaker():
    t = tt(.09)
    nz = lowpass(highpass(rng.standard_normal(len(t)), 3500), 7000, 2)
    return nz * np.sin(np.pi * np.minimum(1, t / .09)) ** 2 * .5


def sub(freq, d):
    t = tt(d)
    env = np.minimum(1, t * 120) * np.minimum(1, (d - t) * 60)
    return np.tanh((np.sin(2 * np.pi * freq * t) + .25 * np.sin(4 * np.pi * freq * t)) * 1.3) * env


def saw(freq, t, harm=10):
    s = np.zeros_like(t)
    for h in range(1, harm + 1):
        if freq * h > 9000:
            break
        s += np.sin(2 * np.pi * freq * h * t) / h
    return s


def pad(midis, d, bright=1600, attack=.4):
    t = tt(d)
    s = sum(saw(note(m + det), t, 8) for m in midis for det in (-.08, 0, .09))
    s = lowpass(s, bright, 2) / (len(midis) * 3)
    return s * np.minimum(1, t / attack) * np.minimum(1, (d - t) / .4)


def sweep_pad(midis, d, f0, f1):
    """nappe dont le filtre s'ouvre progressivement (tension de l'intro)"""
    out = np.zeros(int(d * SR))
    seg = int(.25 * SR)
    for k in range(0, len(out), seg):
        fc = f0 * (f1 / f0) ** (k / len(out))
        t = (np.arange(k, min(k + seg, len(out)))) / SR
        s = sum(saw(note(m + det), t, 8) for m in midis for det in (-.08, .09))
        out[k:k + len(t)] = lowpass(s, fc, 2) / (len(midis) * 2)
    t = tt(d)
    return out * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / .3)


def keys(midis, d, vel=1.0):
    t = tt(d)
    s = sum((np.sin(2 * np.pi * note(m) * t) + .35 * np.sin(4 * np.pi * note(m) * t) * np.exp(-t * 2.5)
             + .08 * np.sin(2 * np.pi * note(m) * 3 * t) * np.exp(-t * 6)) for m in midis)
    return s / len(midis) * np.exp(-t * 1.1) * np.minimum(1, t * 250) * np.minimum(1, (d - t) * 15) * vel


def pluck(freq, d=.4):
    t = tt(d)
    return lowpass(saw(freq, t, 6) * np.exp(-t * 9), 2600, 2) * .6


def bell(freq, d=2.0):
    t = tt(d)
    s = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * k) for r, a, k in [(1, 1, 2.0), (2.0, .3, 3.5), (3.0, .12, 6)])
    return s * np.minimum(1, t * 300) * .5


def pop(freq=600, d=.12):
    t = tt(d)
    f = freq * (1 + .8 * np.exp(-t * 50))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * .55


def wood(freq=1100):
    t = tt(.06)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 90) * .35


def swell(d, f0=300, f1=2500):
    """souffle doux (bruit filtré qui monte), sans aigus agressifs"""
    t = tt(d)
    nz = rng.standard_normal(len(t))
    out = np.zeros_like(nz)
    seg = int(.1 * SR)
    for k in range(0, len(nz), seg):
        fc = f0 * (f1 / f0) ** (k / len(nz))
        out[k:k + seg] = lowpass(nz[max(0, k - 200):k + seg], fc, 2)[-len(nz[k:k + seg]):]
    x = t / d
    return out * x ** 2 * np.minimum(1, (d - t) * 25) * .6


def whoosh(d):
    t = tt(d)
    nz = lowpass(highpass(rng.standard_normal(len(t)), 300), 2800, 2)
    return nz * np.sin(np.pi * t / d) ** 2 * .6


def boom(d=2.5):
    t = tt(d)
    f = 34 + 50 * np.exp(-t * 5)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 1.5) * .9


def riser_tone(d, m0=60, m1=72):
    t = tt(d)
    f = note(m0) * (note(m1) / note(m0)) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return lowpass(s, 2500) * (t / d) ** 2 * .25


# ─── harmonie ─────────────────────────────────────────────────────────────
# intro en la mineur, résolution en do majeur au logo
CH = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]   # Cmaj7 Am7 Fmaj7 G
ROOT = [36, 33, 29, 31]

# S1–S2 · tension : nappe filtrée qui s'ouvre, pulsation de basse, battement cardiaque
add(sweep_pad([57, 60, 64, 67], at(26), 350, 2200), 0, .55, send=.35)
for k in range(52):                                   # croches de basse, temps 0 → 26
    b_ = k * .5
    add(sub(note(33), .2) * (.5 + .5 * b_ / 26), at(b_), .35)
for b_ in range(10, 26, 2):
    add(kick(.35, .7), at(b_), .6)
    add(kick(.3, .5), at(b_ + .5), .35)
for b_ in np.arange(14, 25.5, .5):
    add(wood(1000 if b_ % 1 else 1300), at(b_), .18 + .1 * (b_ - 14) / 11, pan=(-.3 if b_ % 1 else .3), send=.2)
# les cartes qui s'empilent
for i in range(6):
    add(pop(520 + i * 40), at(10.4 + i * 1.05), .45, pan=(-.4 + i * .16))
for k, b_ in enumerate([18.1, 19.4, 20.7]):          # « Trop… »
    add(kick(.5), at(b_), .8)
    add(keys([57, 60, 64][k:k + 1] + [45], 1.2), at(b_), .35, send=.4)
add(swell(at(3.4)), at(22.4), .7)
add(riser_tone(at(3.4), 57, 69), at(22.4), .8)

# S3 · le drop du logo
add(boom(), at(26), 1.0, send=.3)
add(pad([48, 55, 59, 64, 67], at(8.2), bright=2200, attack=.05), at(26), .55, send=.5)
add(keys([60, 64, 67, 71, 74], at(4)), at(26), .45, send=.5)
for k, m in enumerate([72, 76, 79, 83]):
    add(bell(note(m)), at(26.3 + k * .15), .13, pan=(k - 1.5) * .3, send=.6)
add(pop(420, .2), at(26.8), .4)
for k in range(8):                                    # battements doux avant le groove
    add(kick(.4, .6), at(30 + k * .5), .35 + .05 * k)
add(swell(at(2)), at(32), .5)

# S4 → S8 · groove (temps 34 → 102), avec montée à 66 et respiration à 94
for bar in range(17):
    b0 = 34 + bar * 4
    ch, r = CH[bar % 4], note(ROOT[bar % 4])
    energy = 1.0 if bar < 8 else 1.15
    breakdown = b0 >= 94
    add(keys([m + 12 for m in ch], at(4)), at(b0), .3, send=.35)
    add(pad([m + 12 for m in ch], at(4), bright=1400), at(b0), .16 if not breakdown else .3, send=.3)
    for q in range(8):                                # basse sur les contretemps + note fantôme
        if q % 2:
            add(sub(r, B / 2 * .8), at(b0 + q / 2), .55 * (.6 if breakdown else 1))
        elif q in (2, 6) and not breakdown:
            add(sub(r * 2, B / 4), at(b0 + q / 2), .15)
    for q in range(4):
        add(kick(), at(b0 + q), .85 * (.5 if breakdown else 1))
        if not breakdown:
            if q % 2:
                add(clap(), at(b0 + q), .38 * energy, send=.3)
            add(shaker(), at(b0 + q + .5), .22 * energy, pan=.25)
            add(shaker(), at(b0 + q + .25), .1, pan=-.25)
            add(shaker(), at(b0 + q + .75), .1, pan=-.25)
    if 4 <= bar < 15:                                 # arpège qui s'étoffe
        arp = [0, 7, 12, 16, 12, 7, 4, 7]
        oct_ = 12 if bar >= 8 else 0
        base = ch[0] + 12
        for q in range(8):
            add(pluck(note(base + arp[q] + oct_)), at(b0 + q / 2), .14, pan=(-.35 if q % 2 else .35), send=.4)
# remplissages avant chaque grosse section
for b_ in (49, 65, 81):
    for k in range(4):
        add(kick(.3, .8), at(b_ + k * .25), .45)
    add(swell(at(1)), at(b_), .4)
add(swell(at(3)), at(99), .6)
add(riser_tone(at(3), 60, 72), at(99), .7)

# sons d'interface (doux)
for b_, f in [(35, 480), (35.6, 620), (35.9, 700), (36.2, 780), (37, 700), (37.25, 760), (37.5, 820)]:
    add(pop(f), at(b_), .3)
add(bell(note(84)), at(40.2), .25, send=.5)
add(bell(note(91)), at(40.35), .18, send=.5)
for i in range(6):
    add(pop(560 + i * 50), at(51 + i * .12), .25)
add(pop(900, .08), at(53), .5)
add(whoosh(at(.8)), at(53.9), .3)
for k in range(4):
    for j in range(6):
        add(wood(1500 + 80 * (j % 3)), at(55 + k * .75 + j * .1), .07, pan=.2)
t_sig = tt(at(1.8))
add(lowpass(rng.standard_normal(len(t_sig)), 1800, 2) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 6 * t_sig))) * .25, at(58.2), .5)
add(boom(1.2), at(60.3), .55)
add(pop(340, .25), at(60.3), .6)
for k in range(6):
    add(bell(note(88 + [0, 4, 7, 12, 16, 19][k])), at(60.4 + k * .07), .06, send=.6)
for b_, f in [(67.4, 520), (69.1, 620), (70.8, 720)]:
    add(pop(f), at(b_), .4)
add(whoosh(at(1.2)), at(71.4), .45, pan=.4)
for k in range(7):
    add(bell(note(84 + [0, 4, 7, 4, 0, 7, 12][k]), .8), at(73 + k), .08, pan=.3 * np.sin(k), send=.4)
add(bell(note(79)), at(83.8), .25, send=.6)
for k in range(4):
    add(pop(480 + k * 70), at(84 + k * .45), .35)
for k in range(4):
    add(pop(620 + k * 90), at(97.4 + k * .2), .3)
    add(bell(note(84 + [0, 4, 7, 12][k]), .7), at(97.5 + k * .2), .07, send=.5)
for b_ in (9.3, 33.3, 49.3, 65.3, 81.3, 93.3, 101.3):     # whip-pans
    add(whoosh(at(1.2)), at(b_), .45)

# S9 · final
add(boom(3), at(102), .9, send=.4)
add(pad([48, 55, 60, 64, 67, 71, 74], at(14), bright=2000, attack=.05), at(102), .55, send=.6)
add(keys([60, 64, 67, 71, 74], at(6)), at(102), .45, send=.5)
for k, m in enumerate([72, 76, 79, 84]):
    add(bell(note(m)), at(102.3 + k * .15), .12, send=.6)
add(pop(520, .2), at(104.6), .45)
add(pop(900, .08), at(107), .6)
add(bell(note(88), 3), at(107.05), .25, send=.7)
for q in range(8):
    add(kick(.4), at(108 + q), .5 * (1 - q / 9))
    add(sub(note(36), .4), at(108 + q + .5), .3 * (1 - q / 9))

# ─── réverbe, sidechain, master ───────────────────────────────────────────
ir_t = tt(2.4)
ir = np.stack([lowpass(rng.standard_normal(len(ir_t)), 4000) * np.exp(-ir_t * 2.4) for _ in range(2)], 1)
L = N + len(ir_t)
for ch in range(2):
    mix[:, ch] += np.fft.irfft(np.fft.rfft(verb[:, ch], 2 * L) * np.fft.rfft(ir[:, ch], 2 * L))[:N] * .1

t = np.arange(N) / SR
bp = (t / B) % 1
duck = np.where((t >= at(34)) & (t < at(94)), 1 - .35 * np.exp(-bp * B * 8), 1)
mix *= duck[:, None]
for ch in range(2):
    mix[:, ch] = lowpass(highpass(mix[:, ch], 30), 11000)
mix *= np.minimum(1, (DUR - t) / .8)[:, None]
mix = np.tanh(mix * .9)
mix /= np.max(np.abs(mix)) / .9

with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav', DUR, 's')
