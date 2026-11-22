"""Mixage S01E01 : voix (3 blocs) + sound design synthétique (sans musique).

python3 mix.py  ->  soundtrack.wav puis renders/S01E01_qalb.mp4
"""
import os
import subprocess
import wave
import numpy as np

SR, DUR = 48000, 89.5
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(3)
mix = np.zeros((N, 2))


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').reshape(-1, 2).astype(float) / 32768


def filt(x, lo=None, hi=None):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X = np.fft.rfft(x)
    if hi: X /= 1 + (f / hi) ** 4
    if lo: X *= (f / lo) ** 2 / (1 + (f / lo) ** 2)
    return np.fft.irfft(X, len(x))


def put(sig, t, gain_db, pan=0.0):
    s0 = int(t * SR)
    if s0 >= N: return
    sig = sig[:N - s0] * 10 ** (gain_db / 20)
    mix[s0:s0 + len(sig), 0] += sig * (1 - pan) / 1
    mix[s0:s0 + len(sig), 1] += sig * (1 + pan) / 1


def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / SR / d); return e


def norm(x): return x / (np.max(np.abs(x)) + 1e-9)


# ambiance de pièce (très basse)
room = norm(filt(rng.standard_normal(N), 40, 500))
mix += (room * 10 ** (-46 / 20))[:, None]

# battements de cœur sur l'accroche
for k, t0 in enumerate(np.arange(0.35, 6.6, 1.05)):
    for dt, g in ((0, 0), (.22, -5)):
        L = int(.35 * SR); tt = np.arange(L) / SR
        s = np.sin(2 * np.pi * (52 + 30 * np.exp(-tt * 30)) * tt) * env(L, .004, .09)
        put(s, t0 + dt, -14 + g)

# goutte d'encre
def plip(f0=900, f1=260):
    L = int(.28 * SR); tt = np.arange(L) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(L, .001, .05)
put(plip(), 24.72, -10)
put(norm(filt(rng.standard_normal(int(.5 * SR)), 80, 400)) * env(int(.5 * SR), .002, .15), 24.72, -16)
for i in range(64):
    t = 31.9 + 4.6 * (i / 64) ** .62
    put(plip(700 + rng.uniform(-200, 300), 200 + rng.uniform(0, 120)), t, -19 + rng.uniform(-3, 2), rng.uniform(-.5, .5))

# grondement de couverture (rān)
L = int(3.2 * SR); tt = np.arange(L) / SR
rumble = norm(filt(rng.standard_normal(L), 30, 160)) * np.sin(np.pi * np.clip(tt / 3.2, 0, 1)) ** 2
put(rumble, 34.2, -14)

# reflets (polissage)
for t in (29.6, 53.9, 61.5, 65.0, 73.8):
    L = int(1.2 * SR)
    s = norm(filt(rng.standard_normal(L), 5000, 12000)) * np.sin(np.linspace(0, np.pi, L)) ** 3
    put(s, t, -22, rng.uniform(-.4, .4))

# chapelet : 100 grains
for i in range(100):
    k = i / 99
    # inverse approximatif de l'easing : répartition accélérée puis ralentie
    u = .5 * (1 - np.cos(np.pi * k))
    t = 58.84 + (61.6 - 58.84) * u
    L = int(.03 * SR)
    s = norm(filt(rng.standard_normal(L), 1500, 5000)) * env(L, .0005, .006)
    put(s, t, -20 + rng.uniform(-2, 1), -.3 + .6 * k)

# ondes du dhikr
for j in range(6):
    t = 62.6 + j * .35 / .9
    L = int(1.4 * SR); tt = np.arange(L) / SR
    s = np.sin(2 * np.pi * 110 * tt) * env(L, .02, .45) * .6 + np.sin(2 * np.pi * 220 * tt) * env(L, .02, .25) * .2
    put(s, t, -22)

# rideaux (passage papier <-> nuit)
for t in (39.85, 44.95, 65.12, 70.35, 77.65):
    L = int(1.0 * SR)
    s = norm(filt(rng.standard_normal(L), 200, 2500)) * np.sin(np.linspace(0, np.pi, L)) ** 2
    put(s, t - .2, -20)

# nappe grave sous les versets et le générique (pas de mélodie)
for a, b in ((40.2, 45.3), (65.4, 70.7), (78.0, 89.5)):
    L = int((b - a) * SR); tt = np.arange(L) / SR
    e = np.minimum(1, tt / 1.2) * np.minimum(1, (b - a - tt) / 1.2)
    s = (np.sin(2 * np.pi * 55 * tt) + .35 * np.sin(2 * np.pi * 82.5 * tt + 1)) * e
    put(s, a, -24)

# nūr : lumière
L = int(2.5 * SR)
put(norm(filt(rng.standard_normal(L), 3000, 9000)) * np.sin(np.linspace(0, np.pi, L)) ** 2, 75.1, -26)

# voix
vo = np.zeros((N, 2))
for f, t0 in (('b1', .6), ('b2', 45.4), ('b3', 70.8)):
    v = load(os.path.join(HERE, 'voix', f + '.mp3'))
    s0 = int(t0 * SR); v = v[:N - s0]
    vo[s0:s0 + len(v)] += v
vo = vo / (np.max(np.abs(vo)) + 1e-9) * 10 ** (-2 / 20)

# ducking
e = np.abs(vo).mean(1)
e = filt(e, None, 4)
duck = 1 - .5 * np.clip(e / (e.max() * .2), 0, 1)
out = vo + mix * duck[:, None]
t = np.arange(N) / SR
out *= (np.minimum(1, t / .3) * np.minimum(1, (DUR - t) / 1.0))[:, None]
out = np.tanh(out * 1.1) / np.tanh(1.1)
out /= max(1.0, np.max(np.abs(out)) / .97)

wav = os.path.join(HERE, 'soundtrack.wav')
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('soundtrack ok')

video = os.path.join(HERE, 'renders', 'video.mp4')
final = os.path.join(HERE, 'renders', 'S01E01_qalb.mp4')
if os.path.exists(video) and os.path.getsize(video) > 1e6:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-i', wav,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '256k', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
                    '-shortest', '-movflags', '+faststart', final], check=True)
    print('->', final)
