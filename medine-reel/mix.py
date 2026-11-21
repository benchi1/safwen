"""Mixage : voix off + ambiance (vent du désert, souffles aux transitions), puis montage final.

python3 mix.py  ->  soundtrack.wav et renders/medine_ep1.mp4
Pas de musique : uniquement une ambiance sonore discrète sous la voix.
"""
import os
import subprocess
import wave
import numpy as np

SR, DUR, VOFF = 48000, 75.0, 0.6
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)
t = np.arange(N) / SR

# transitions (mêmes valeurs que reel.js, en temps vidéo)
CUTS = [x + VOFF for x in (7.2, 17.2, 25.4, 29.65, 39.15, 49.0, 54.5, 61.4, 66.6)]


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').reshape(-1, 2).astype(float) / 32768


def lowpass(x, fc):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / (1 + (f / fc) ** 2), len(x))


def bandpass(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X = np.fft.rfft(x)
    X *= 1 / (1 + (f / hi) ** 4) * (f / lo) ** 2 / (1 + (f / lo) ** 2)
    return np.fft.irfft(X, len(x))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# vent : bruit filtré, modulé lentement, stéréo décorrélée
wind = np.zeros((N, 2))
for ch in range(2):
    n = rng.standard_normal(N)
    w = norm(bandpass(n, 120, 900))
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * (0.07 + 0.02 * ch) * t + ch) * np.sin(2 * np.pi * 0.023 * t + 2)
    gust = norm(lowpass(rng.standard_normal(N), 0.6)) * 0.35
    wind[:, ch] = w * np.clip(mod + gust, 0.1, 1.3)
wind *= 10 ** (-31 / 20)

# souffles aux transitions
sfx = np.zeros((N, 2))
for c in CUTS:
    L = int(SR * 1.6)
    s0 = int((c - 0.9) * SR)
    n = norm(bandpass(rng.standard_normal(L), 300, 3500))
    env = np.sin(np.linspace(0, np.pi, L)) ** 3
    pan = np.linspace(-0.6, 0.6, L)
    seg = n * env * 10 ** (-27 / 20)
    sfx[s0:s0 + L, 0] += seg * (1 - pan) / 2 * 1.4
    sfx[s0:s0 + L, 1] += seg * (1 + pan) / 2 * 1.4

# scintillement doux à l'ouverture et sur la carte de fin
for c, d in ((0.4, 4.0), (71.5, 3.2)):
    L = int(SR * d)
    s0 = int(c * SR)
    n = norm(bandpass(rng.standard_normal(L), 4000, 11000))
    env = np.sin(np.linspace(0, np.pi, L)) ** 2
    sfx[s0:s0 + L] += (n * env * 10 ** (-36 / 20))[:, None]

# grave chaud sous l'intro (impact)
L = int(SR * 3.5)
tt = np.arange(L) / SR
boom = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 1.6) * 10 ** (-20 / 20)
sfx[int(0.35 * SR):int(0.35 * SR) + L] += boom[:, None]

# voix
voice = load(os.path.join(HERE, 'voix', 'take_a.mp3'))
vo = np.zeros((N, 2))
s0 = int(VOFF * SR)
vo[s0:s0 + len(voice)] = voice[:N - s0]
vo = vo / (np.max(np.abs(vo)) + 1e-9) * 10 ** (-3 / 20)

# ducking de l'ambiance sous la voix
env = lowpass(np.abs(vo).mean(1), 3)
duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
amb = (wind + sfx) * duck[:, None]

fade = np.minimum(1, t / 0.5) * np.minimum(1, (DUR - t) / 1.2)
mix = (vo + amb) * fade[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)

out = os.path.join(HERE, 'soundtrack.wav')
with wave.open(out, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((mix * 32767).astype('<i2').tobytes())
print('soundtrack.wav ok')

video = os.path.join(HERE, 'renders', 'video.mp4')
final = os.path.join(HERE, 'renders', 'medine_ep1.mp4')
if os.path.exists(video):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-i', out, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-shortest', '-movflags', '+faststart', final], check=True)
    print('->', final)
