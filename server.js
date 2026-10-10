// Presentation Rating System - server (no package installation required)
// Run: node server.js   |   To change the admin PIN: ADMIN_PIN=5555 node server.js
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const PIN = String(process.env.ADMIN_PIN || '1234');
const FILE = path.join(__dirname, 'data.json');

let D = { names: [], current: -1, votes: {} };
try { D = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) {}
const save = () => { try { fs.writeFileSync(FILE, JSON.stringify(D)); } catch (e) {} };

function readBody(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch (e) { resolve({}); } });
  });
}
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/state' && req.method === 'GET') {
    return send(res, 200, { names: D.names, current: D.current, votes: Object.values(D.votes) });
  }

  if (url === '/api/vote' && req.method === 'POST') {
    const b = await readBody(req);
    const n = D.names.length, p = +b.p, v = +b.v, s = +b.s;
    // Only current presenter can vote, not themselves, from 1 to 10
    if (!(p >= 0 && p < n && v >= 0 && v < n && p !== v && p === D.current && s >= 1 && s <= 10)) {
      return send(res, 400, { error: 'invalid' });
    }
    D.votes[p + '_' + v] = { p, v, s };
    save();
    return send(res, 200, { ok: 1 });
  }

  if (url === '/api/admin' && req.method === 'POST') {
    const b = await readBody(req);
    if (String(b.pin) !== PIN) return send(res, 403, { error: 'wrong pin' });
    if (b.action === 'names' && Array.isArray(b.names)) {
      D = { names: b.names.map(x => String(x).trim()).filter(Boolean), current: -1, votes: {} };
    } else if (b.action === 'start') {
      const i = +b.index;
      if (i >= 0 && i < D.names.length) D.current = i;
    } else if (b.action === 'end') {
      D.current = -1;
    } else if (b.action === 'reset') {
      D.votes = {}; D.current = -1;
    } // no change in 'check'
    save();
    return send(res, 200, { ok: 1 });
  }

  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    return fs.readFile(path.join(__dirname, 'public', 'index.html'), (e, data) => {
      if (e) { res.writeHead(500); return res.end('index.html not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  }

  res.writeHead(404); res.end('Not found');
}).listen(PORT, '0.0.0.0', () => {
  console.log('Server running: http://localhost:' + PORT);
  console.log('Admin PIN: ' + PIN);
});
