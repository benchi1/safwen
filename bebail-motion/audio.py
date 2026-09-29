"""Bande-son BeBail, calée sur la grille de reel.js (120 BPM, 116 temps = 58 s).

python3 audio.py  →  soundtrack.wav (48 kHz, stéréo, 16 bits)
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
verb = np.zeros((N, 2))   # départ réverbe


def add(sig, start, gain=1.0, pan=0.0, send=0.0):
    i = int(round(start * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    mix[i:i + n, 0] += sig[:n] * gain * l
    mix[i:i + n, 1] += sig[:n] * gain * r
    if send:
        verb[i:i + n, 0] += sig[:n] * gain * send * l
        verb[i:i + n, 1] += sig[:n] * gain * send * r


def tt(d):
    return np.arange(int(d * SR)) / SR


def lowpass(x, fc):
    # passe-bas du 1er ordre, vectorisé par FFT (réponse exacte de l'intégrateur RC)
    n = len(x)
    f = np.fft.rfftfreq(n * 2, 1 / SR)
    h = 1 / (1 + 1j * f / fc)
    return np.fft.irfft(np.fft.rfft(x, n * 2) * h)[:n]


def highpass(x, fc):
    return x - lowpass(x, fc)


def note(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# ─── instruments ──────────────────────────────────────────────────────────
def kick(d=0.5):
    t = tt(d)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * .4
    return np.tanh((body + click) * 1.6)


def clap():
    t = tt(.35)
    nz = highpass(rng.standard_normal(len(t)), 900)
    env = np.zeros_like(t)
    for k, o in enumerate([0, .011, .022]):
        env += np.where(t >= o, np.exp(-(t - o) * (120 if k < 2 else 16)), 0)
    return nz * env * .6


def hat(d=.07, open_=False):
    t = tt(d if not open_ else .22)
    nz = highpass(rng.standard_normal(len(t)), 7000)
    return nz * np.exp(-t * (55 if not open_ else 14)) * .5


def bass(freq, d):
    t = tt(d)
    env = np.minimum(1, t * 200) * np.exp(-t * 3.2)
    s = np.sin(2 * np.pi * freq * t) + .45 * np.sin(4 * np.pi * freq * t) + .18 * np.sin(6 * np.pi * freq * t)
    return np.tanh(s * env * 1.4)


def saw(freq, t, harm=14):
    s = np.zeros_like(t)
    for h in range(1, harm + 1):
        if freq * h > 16000:
            break
        s += np.sin(2 * np.pi * freq * h * t) / h
    return s


def pad(midis, d, bright=2500):
    t = tt(d)
    s = np.zeros_like(t)
    for m in midis:
        for det in (-.09, 0, .1):
            s += saw(note(m + det), t, 10)
    s = lowpass(s, bright) / (len(midis) * 3)
    env = np.minimum(1, t / .25) * np.minimum(1, (d - t) / .3)
    return s * env


def pluck(freq, d=.35):
    t = tt(d)
    s = saw(freq, t, 8) * np.exp(-t * 12)
    return lowpass(s, 3800) * .5


def bell(freq, d=2.5):
    t = tt(d)
    s = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * dec) for r, a, dec in
            [(1, 1, 2.2), (2.76, .45, 4), (5.4, .25, 7), (8.9, .12, 11)])
    return s * np.minimum(1, t * 400) * .5


def whoosh(d, rise=True):
    t = tt(d)
    nz = rng.standard_normal(len(t))
    x = t / d
    env = (x ** 2.2 if rise else (1 - x) ** 1.5) * np.minimum(1, (d - t) * 40 if rise else 1)
    s = highpass(nz, 400) * env
    return lowpass(s, 6000) * .55


def riser(d):
    t = tt(d)
    f = 180 * (12 ** (t / d))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + .4 * np.sin(ph * 1.5)) * (t / d) ** 2 * .25
    return tone + whoosh(d) * .8


def impact(d=2.2):
    t = tt(d)
    f = 30 + 60 * np.exp(-t * 6)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    crash = highpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 3.5) * .35
    return np.tanh((boom * 1.4 + crash) * 1.2)


def blip(freq, d=.07):
    t = tt(d)
    return np.sign(np.sin(2 * np.pi * freq * t)) * np.exp(-t * 35) * .22


def sweep_up(d, f0, f1):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * .3


# ─── arrangement ──────────────────────────────────────────────────────────
at = lambda beat: beat * B


def pop(freq=900, d=.09):
    t = tt(d)
    f = freq * (1 + 1.2 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * .6


def click(d=.03):
    t = tt(d)
    return highpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * .6


def ding(freq):
    return bell(freq, 1.2) * .8


def epiano(midis, d, vel=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for m in midis:
        f = note(m)
        s += (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + .15 * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t * 12)) * np.exp(-t * 1.6)
    return s / len(midis) * np.minimum(1, t * 300) * np.minimum(1, (d - t) * 20) * vel


def scratch(d):
    t = tt(d)
    nz = lowpass(highpass(rng.standard_normal(len(t)), 1500), 5000)
    mod = .5 + .5 * np.abs(np.sin(2 * np.pi * 6.5 * t * (1 + .3 * np.sin(t * 9))))
    return nz * mod * np.minimum(1, t * 30) * np.minimum(1, (d - t) * 30) * .35


def tick():
    t = tt(.025)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 250) * .4


# S1 · constat : nappe sombre, une note par ligne
add(pad([45, 52, 57, 60], at(10.5), bright=900), 0, .45, send=.4)
for k, m in enumerate([69, 67, 64, 62, 60]):
    add(epiano([m], 1.5), at(.6 + k * .32), .35, send=.5)
add(scratch(.45), at(3.2), .5)

# S2 · dispersion : tic-tac qui accélère, notifications, tension
add(pad([46, 53, 58, 61, 64], at(15), bright=1400), at(10), .38, send=.3)
for k in range(64):
    b_ = 10 + k * .25
    if b_ >= 24.6:
        break
    if k % (2 if b_ < 16 else 1) == 0:
        add(tick(), at(b_), .35 + .3 * (b_ - 10) / 14, pan=(-.3 if k % 2 else .3))
for i in range(6):
    add(pop(700), at(10.4 + i * 1.05), .5)
    add(ding(note(84 + (i * 5) % 12)), at(10.5 + i * 1.05), .12, pan=(-.5 + i * .2), send=.5)
for i in range(16):
    add(click(), at(11.5 + i * .4), .25, pan=np.sin(i * 1.3) * .7)
for i in range(18):
    add(ding(note(88 + (i * 7) % 12)), at(15.5 + i * .19), .05, pan=np.cos(i) * .8, send=.4)
for k, b_ in enumerate([18.1, 19.4, 20.7]):
    add(kick(.4), at(b_), .6)
    add(impact(.8), at(b_), .25, send=.3)
add(riser(at(2.5)), at(22.2), .5)
add(whoosh(at(1.3)), at(23.5), .7)
add(pop(1400, .15), at(24.2), .6)
add(bell(note(76), 1.5), at(25), .35, send=.6)

# S3 · révélation : l'accord qui résout
add(impact(3.0), at(26), .6, send=.6)
add(pad([48, 55, 59, 64, 67, 71], at(8.4), bright=2600), at(26), .55, send=.5)
for k, m in enumerate([72, 76, 79, 83, 84, 88]):
    add(bell(note(m), 2.0), at(26.2 + k * .12), .12, pan=(k - 2.5) * .2, send=.7)
add(pop(600, .2), at(26.8), .5)
for k in range(6):
    add(pop(1100 + k * 120, .06), at(27.3 + k * .06), .2)
add(whoosh(at(1.2)), at(32.7), .5)

# groove S4 → S8 (temps 34 → 102)
prog_ = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 53, 59]]   # Cmaj7 Am7 Fmaj7 G7sus
roots = [36, 33, 29, 31]
for bar in range(17):                           # 34 → 102
    b0 = 34 + bar * 4
    ch = prog_[bar % 4]
    add(epiano([m + 12 for m in ch], at(4)), at(b0), .32, send=.35)
    add(pad([m + 12 for m in ch], at(4), bright=1800), at(b0), .16, send=.3)
    r = note(roots[bar % 4])
    for q in range(8):
        if q % 2:
            add(bass(r, B / 2 * .85), at(b0 + q / 2), .5)
    for q in range(4):
        add(kick(.4), at(b0 + q), .75)
        if q % 2:
            add(clap(), at(b0 + q), .38, send=.25)
        add(hat(), at(b0 + q + .5), .22, pan=.25)
        add(hat(.04), at(b0 + q + .25), .08, pan=-.3)
        add(hat(.04), at(b0 + q + .75), .08, pan=-.3)
    if bar >= 4:
        arp = [0, 4, 7, 11, 12, 11, 7, 4]
        for q in range(8):
            add(pluck(note(ch[0] + 24 + arp[q] - (ch[0] - 48 if ch[0] > 48 else 0))), at(b0 + q / 2), .1, pan=(-.4 if q % 2 else .4), send=.45)

# S4 · cockpit
add(pop(500, .2), at(35), .5)
for k, b_ in enumerate([35.6, 35.9, 36.2]):
    add(pop(900 + k * 150), at(b_), .35)
for i in range(12):
    add(pop(700 + i * 60, .05), at(36.4 + i * .07), .15)
for i in range(3):
    add(pop(1000), at(37 + i * .25), .3)
add(ding(note(88)), at(40.2), .35, send=.5)
add(ding(note(93)), at(40.35), .25, send=.5)
add(pop(1300, .12), at(40.6), .4)
add(whoosh(at(1.3)), at(48.6), .5)

# S5 · contrats
for i in range(6):
    add(pop(800 + i * 90), at(51 + i * .12), .3)
add(click(.04), at(53), .9)
add(pop(1600, .1), at(53), .4)
add(whoosh(at(.8)), at(53.9), .35)
for k in range(4):
    t0 = 55 + k * .75
    for j in range(8):
        add(tick(), at(t0 + j * .085), .25, pan=.2)
add(scratch(at(1.8)), at(58.2), .8)
add(impact(.9), at(60.3), .5)
add(kick(.3), at(60.3), .5)
for k in range(10):
    add(bell(note(96 + (k * 5) % 12), .3), at(60.4 + k * .05), .06, pan=np.sin(k * 2), send=.6)
add(ding(note(84)), at(61.4), .3, send=.5)
add(whoosh(at(1.3)), at(64.6), .5)

# S6 · quittances
for b_, f in [(67.4, 800), (69.1, 950), (70.8, 1100)]:
    add(pop(f, .12), at(b_), .45)
for b_ in (67.6, 69.3):
    add(sweep_up(at(1.2), 400, 1600), b_ * B + .3, .25)
add(whoosh(at(1.2)), at(71.4), .6, pan=.5)
for b_ in (68.6, 70.3, 72.5):
    add(ding(note(91)), at(b_), .18, send=.4)
for k in range(7):
    add(sweep_up(at(.8), 600, 2400), at(73 + k), .12, pan=.3 * np.sin(k))
    add(tick(), at(73.4 + k), .3)
add(whoosh(at(1.3)), at(80.6), .5)

# S7 · preuves
add(sweep_up(at(1.4), 200, 1200), at(82.4), .3)
add(bell(note(79), 2.0), at(83.8), .3, send=.6)
for k in range(4):
    add(pop(700 + k * 110, .12), at(84 + k * .45), .4)
add(whoosh(at(1.3)), at(92.6), .5)

# S8 · avant / après
add(pop(500, .15), at(94.4), .4)
for k in range(4):
    add(whoosh(at(.5), rise=False), at(96.4 + k * .15), .15)
add(pop(500, .2), at(97), .4)
for k in range(4):
    add(pop(1000 + k * 140), at(97.4 + k * .2), .35)
    add(bell(note(84 + [0, 4, 7, 12][k]), .6), at(97.5 + k * .2), .08, send=.5)
add(riser(at(3)), at(99), .4)

# S9 · appel à l'action
add(impact(2.5), at(102), .6, send=.6)
add(pad([48, 55, 60, 64, 67, 71, 74], at(14), bright=2400), at(102), .55, send=.6)
add(epiano([60, 64, 67, 71, 74], at(6)), at(102), .4, send=.6)
for k, m in enumerate([72, 76, 79, 84]):
    add(bell(note(m), 2.5), at(102.3 + k * .15), .13, send=.7)
add(pop(900, .15), at(102.5), .4)
add(pop(700, .2), at(104.6), .5)
add(click(.04), at(107), 1.0)
add(pop(1500, .12), at(107), .5)
add(bell(note(88), 3.0), at(107.05), .3, send=.8)
add(bell(note(95), 3.0), at(107.2), .18, send=.8)
for q in range(8):
    b0 = 108 + q
    add(kick(.4), at(b0), .45 * (1 - q / 9))
    add(hat(), at(b0 + .5), .12 * (1 - q / 9))

# ─── réverbe, sidechain, master ───────────────────────────────────────────
ir_t = tt(2.2)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6) for _ in range(2)], 1)
ir[:, 0], ir[:, 1] = lowpass(ir[:, 0], 5000), lowpass(ir[:, 1], 5000)
L = N + len(ir_t)
for ch in range(2):
    wet = np.fft.irfft(np.fft.rfft(verb[:, ch], 2 * L) * np.fft.rfft(ir[:, ch], 2 * L))[:N]
    mix[:, ch] += wet * .12

t = np.arange(N) / SR
beatpos = (t / B) % 1
duck = np.where((t >= at(34)) & (t < at(102)), 1 - .4 * np.exp(-beatpos * B * 9), 1)
mix *= duck[:, None] ** .5

mix = highpass(mix[:, 0], 25)[:, None] * [1, 0] + highpass(mix[:, 1], 25)[:, None] * [0, 1]
fade = np.minimum(1, (DUR - t) / .6)
mix *= fade[:, None]
mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) / 0.89

with wave.open('soundtrack.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('soundtrack.wav', N / SR, 's')
