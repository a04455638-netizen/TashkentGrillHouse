import { spawn, execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const viewports = [
  { width: 375, height: 667, name: '375_mobile' },
  { width: 390, height: 844, name: '390_iphone' },
  { width: 768, height: 1024, name: '768_tablet' },
  { width: 1024, height: 768, name: '1024_desktop_sm' },
  { width: 1440, height: 900, name: '1440_desktop' },
  { width: 1920, height: 1080, name: '1920_large' }
];

const screenshotDir = path.resolve('test_screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

async function waitForServer(port, maxTries = 20) {
  for (let i = 0; i < maxTries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/ru/`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return false;
}

(async () => {
  console.log('Starting Vite preview server on port 4173...');
  const server = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'ignore'
  });

  const ready = await waitForServer(4173);
  if (!ready) {
    console.error('Failed to start preview server');
    server.kill();
    process.exit(1);
  }
  console.log('Preview server ready at http://localhost:4173/');

  const results = [];

  for (const vp of viewports) {
    const outFile = path.join(screenshotDir, `screenshot_${vp.name}.png`);
    const cmd = `"${chromePath}" --headless --disable-gpu --window-size=${vp.width},${vp.height} --screenshot="${outFile}" http://localhost:4173/ru/`;
    try {
      console.log(`Testing viewport ${vp.width}x${vp.height} (${vp.name})...`);
      execSync(cmd, { stdio: 'ignore', timeout: 15000 });
      if (fs.existsSync(outFile)) {
        const sz = fs.statSync(outFile).size;
        console.log(`  -> Saved ${outFile} (${sz} bytes)`);
        results.push({ ...vp, status: 'PASSED', size: sz });
      } else {
        console.error(`  -> Failed to create screenshot for ${vp.name}`);
        results.push({ ...vp, status: 'FAILED' });
      }
    } catch (err) {
      console.error(`  -> Error at ${vp.width}x${vp.height}:`, err.message);
      results.push({ ...vp, status: 'ERROR', error: err.message });
    }
  }

  // Also test all primary subpages
  const subpages = [
    '/ru/menu',
    '/ru/reservation',
    '/ru/order',
    '/ru/order/track',
    '/ru/about',
    '/ru/account',
    '/ru/contact',
    '/en/',
    '/admin'
  ];

  for (const sp of subpages) {
    const cleanName = sp.replace(/\//g, '_');
    const outFile = path.join(screenshotDir, `subpage${cleanName}.png`);
    const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1440,900 --screenshot="${outFile}" http://localhost:4173${sp}`;
    try {
      console.log(`Testing route ${sp}...`);
      execSync(cmd, { stdio: 'ignore', timeout: 15000 });
      if (fs.existsSync(outFile)) {
        const sz = fs.statSync(outFile).size;
        console.log(`  -> Saved ${outFile} (${sz} bytes)`);
      }
    } catch (err) {
      console.error(`  -> Error at ${sp}:`, err.message);
    }
  }

  server.kill();
  console.log('\n--- V2 VISUAL TEST SUITE COMPLETE ---');
  console.log(JSON.stringify(results, null, 2));
})();
