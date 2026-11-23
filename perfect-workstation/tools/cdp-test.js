const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = process.argv[2] || path.join(os.tmpdir(), 'pw-shots');
fs.mkdirSync(OUT, { recursive: true });
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'pwchrome-'));
const ch = spawn(CHROME, ['--headless=new', '--no-sandbox', '--remote-debugging-port=9333', '--user-data-dir=' + prof, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let ver;
  for (let i = 0; i < 40; i++) { try { ver = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; } catch (e) { await sleep(250); } }
  const page = ver.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const out = []; const pend = {}; const logs = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + JSON.stringify(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text)); if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push('ERR ' + d.params.args.map(a => a.value || a.description).join(' ')); if (d.method === 'Log.entryAdded') logs.push('LOG ' + d.params.entry.text + ' ' + (d.params.entry.url||'')); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) logs.push('EVAL ' + JSON.stringify(r.result.exceptionDetails.exception?.description)); return r.result.result?.value; };
  const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64')); };
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const steps = JSON.parse(fs.readFileSync(process.argv[3], 'utf8').replace(/^\uFEFF/, ''));
  for (const s of steps) {
    if (s.nav) { await send('Page.navigate', { url: s.nav }); await sleep(s.wait || 1200); }
    if (s.js) { const v = await ev(s.js); if (s.log) out.push(s.log + ': ' + JSON.stringify(v)); await sleep(s.wait || 400); }
    if (s.shot) await shot(s.shot);
  }
  fs.writeFileSync(path.join(OUT,'_log.txt'), out.join('\n') + '\n' + (logs.join('\n') || 'no errors'));
  ws.close(); ch.kill(); process.exit(0);
})().catch(e => { fs.writeFileSync(path.join(OUT,'_log.txt'), 'FATAL ' + e.stack); ch.kill(); process.exit(1); });


