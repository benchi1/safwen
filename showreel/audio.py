"""Bande-son synthétisée, calée sur la même grille que reel.js (128 BPM, 32 temps = 15 s).

python3 audio.py  →  soundtrack.wav (48 kHz, stéréo, 16 bits)
"""
import wave
import numpy as np

SR = 48000
BPM = 128
B = 60 / BPM
DUR = 15.0
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

# intro : le point, les ondes, le trait
add(bell(note(81), 1.2), at(.05), .35, send=.5)
for k in range(3):
    add(bell(note(88), .5), at(.12 + k * .16), .12 * (1 - k * .25), pan=(-.5, .5, 0)[k], send=.6)
add(sweep_up(at(.6), 300, 2400), at(1.0), .8)
add(riser(at(2)), 0, .5)
add(impact(), at(2), .9, send=.4)
add(pad([57, 60, 64], at(2)), at(2), .35, send=.3)
add(whoosh(at(.45)), at(3.55), .8)

# progression Am – F – C – G (une mesure = 4 temps)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
roots = [45, 41, 48, 43]
for bar in range(1, 7):                        # temps 4 → 28
    b0 = bar * 4
    ch = chords[(bar - 1) % 4]
    add(pad([m + 12 for m in ch] + [ch[0]], at(4)), at(b0), .42, send=.35)
    r = note(roots[(bar - 1) % 4] - 12)
    for s8 in range(8):
        if s8 % 2:                                  # basse sur les contretemps
            add(bass(r, B / 2 * .9), at(b0 + s8 / 2), .55)
        elif bar >= 3:
            add(bass(r * 2, B / 4), at(b0 + s8 / 2), .18)

# batterie
for beat in range(4, 26):
    add(kick(), at(beat), .95)
    if beat >= 8 and beat % 2 == 1:
        add(clap(), at(beat), .6, send=.3)
    if beat >= 8:
        add(hat(open_=beat % 4 == 3), at(beat + .5), .35, pan=.3)
    if 16 <= beat < 24:
        for q in (.25, .75):
            add(hat(), at(beat + q), .16, pan=-.3)
add(impact(1.2), at(4), .5)

# arpège pendant particules + 3D
arp = [0, 7, 12, 15, 12, 7, 3, 7]
for beat in range(12, 24):
    ch = chords[((beat - 4) // 4) % 4]
    for q in range(4):
        m = ch[0] + 12 + arp[(beat * 4 + q) % 8]
        add(pluck(note(m)), at(beat + q / 4), .22, pan=(-.4 if q % 2 else .4), send=.4)

# transitions
for b_ in (7.4, 11.4, 15.4, 19.3, 23.4):
    add(whoosh(at(.6)), at(b_), .7, pan=0)
add(sweep_up(at(.5), 200, 1600), at(7.5), .5)
for b_ in (8, 12, 16, 20, 24):
    add(impact(1.0), at(b_), .35, send=.3)

# particules : scintillement quand le mot se forme
for k in range(24):
    add(bell(note(96 + (k * 5) % 12), .4), at(12.3 + k * .06), .04, pan=np.sin(k), send=.8)

# liquide : bulles
for k in range(10):
    add(sweep_up(.12, 300 + k * 40, 900 + k * 90), at(24.2 + k * .18), .25, pan=np.cos(k * 1.7) * .6)

# glitch : chaque coupe claque, stutter
for k in range(8):
    b_ = 26 + k * .5
    add(kick(.25), at(b_), .8)
    add(blip(note(84 + (k * 7) % 12)), at(b_), .5, pan=(-.6 if k % 2 else .6))
    add(hat(.05), at(b_ + .25), .4)
    if k >= 4:
        for s in range(4):
            add(clap()[:int(SR * B / 8)], at(b_ + s / 8), .25)
add(riser(at(2)), at(26), .6)

# signature
add(impact(3.0), at(28), 1.0, send=.6)
add(pad([57, 64, 69, 72, 76], at(4.2), bright=1800), at(28), .5, send=.5)
add(bell(note(69), 3.5), at(30), .5, send=.7)             # le point atterrit
add(bell(note(76), 3.0), at(30.5), .3, pan=.3, send=.7)   # rebond
for k, m in enumerate([81, 84, 88]):
    add(bell(note(m), 2.5), at(30.9 + k * .16), .18, pan=(k - 1) * .4, send=.8)

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
duck = np.where((t >= at(4)) & (t < at(26)), 1 - .45 * np.exp(-beatpos * B * 9), 1)
mix *= duck[:, None] ** .5

mix = highpass(mix[:, 0], 25)[:, None] * [1, 0] + highpass(mix[:, 1], 25)[:, None] * [0, 1]
fade = np.minimum(1, (DUR - t) / .12)
mix *= fade[:, None]
mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) / 0.89

with wave.open('soundtrack.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('soundtrack.wav', N / SR, 's')
