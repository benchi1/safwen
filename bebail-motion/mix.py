"""Mixage final : musique + voix off, puis montage avec renders/video.mp4.

python3 mix.py [local|runway]
- voix : voix/runway_vN.mp3 si présent (et si « runway » ou par défaut), sinon voix/local_vN.wav
- musique : music_runway.mp3 si présent, sinon music.wav (python3 audio.py)
La musique baisse automatiquement sous la voix (ducking).
Sortie : soundtrack.wav et renders/bebail.mp4
"""
import os
import subprocess
import sys
import wave
import numpy as np
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR, DUR, B = 48000, 58.0, .5
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
mode = sys.argv[1] if len(sys.argv) > 1 else 'auto'


def load(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').reshape(-1, 2).astype(float) / 32768


def lowpass(x, fc):
    f = np.fft.rfftfreq(len(x) * 2, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, len(x) * 2) / (1 + 1j * f / fc), len(x) * 2)[:len(x)]


# musique
mp = os.path.join(HERE, 'music_runway.mp3')
music = load(mp) if os.path.exists(mp) and mode != 'local' else load(os.path.join(HERE, 'music.wav'))
music = music[:N] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0)))
t = np.arange(N) / SR
music *= np.minimum(1, (DUR - t) / 1.5)[:, None]

# voix
voice = np.zeros((N, 2))
for line in open(os.path.join(HERE, 'voix', 'script.txt'), encoding='utf-8'):
    if line.startswith('#') or not line.strip():
        continue
    vid, start, _ = line.strip().split('|', 2)
    rw, lc = os.path.join(HERE, 'voix', f'runway_{vid}.mp3'), os.path.join(HERE, 'voix', f'local_{vid}.wav')
    src = rw if os.path.exists(rw) and mode != 'local' else lc
    v = load(src).mean(1)
    v = v - lowpass(v, 90)                            # coupe le grave parasite
    v = .6 * v + .4 * lowpass(v, 6000)                # adoucit les sifflantes
    v = np.tanh(v / (np.max(np.abs(v)) + 1e-9) * 1.6) / np.tanh(1.6)   # compression douce
    i = int(float(start) * B * SR)
    n = min(len(v), N - i)
    voice[i:i + n] += v[:n, None] * .8

# ducking : enveloppe de la voix lissée, la musique descend de ~10 dB sous la voix
env = np.abs(voice[:, 0])
k = int(.25 * SR)
cs = np.concatenate([[0], np.cumsum(env)])
idx = np.arange(N)
env = (cs[np.minimum(idx + k // 2, N)] - cs[np.maximum(idx - k // 2, 0)]) / k
env = np.clip(env / (env.max() + 1e-9) * 4, 0, 1)
gain = 1 - .68 * env
out = music * .85 * gain[:, None] + voice
out /= np.max(np.abs(out)) / .95

with wave.open(os.path.join(HERE, 'soundtrack.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())

video = os.path.join(HERE, 'renders', 'video.mp4')
if os.path.exists(video):
    subprocess.run([FF, '-y', '-v', 'error', '-i', video, '-i', os.path.join(HERE, 'soundtrack.wav'), '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart',
                    os.path.join(HERE, 'renders', 'bebail.mp4')], check=True)
    print('renders/bebail.mp4')
print('soundtrack.wav')
