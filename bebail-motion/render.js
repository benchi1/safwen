// Rendu image par image : node render.js [stills t1,t2,...]
// Sans argument : rend les images et encode renders/video.mp4 (sans son ; voir mix.py pour l'audio).
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

let FPS, DUR, N;
const FFMPEG = process.env.FFMPEG || execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const dir = __dirname, out = path.join(dir, 'renders');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-web-security', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.goto('file://' + path.join(dir, 'index.html') + '?render');
  await page.evaluate(() => window.__ready);
  ({ FPS, DUR } = await page.evaluate(() => window.CONFIG)); N = Math.round(FPS * DUR);

  if (process.argv[2] === 'stills') {
    for (const s of process.argv[3].split(',')) {
      await page.evaluate(t => window.renderFrame(t), +s);
      await page.screenshot({ path: path.join(out, `still_${s}.png`) });
    }
    await browser.close();
    return;
  }

  const ff = spawn(FFMPEG, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-tune', 'animation',
    '-movflags', '+faststart', path.join(out, 'video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.renderFrame(t), i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
