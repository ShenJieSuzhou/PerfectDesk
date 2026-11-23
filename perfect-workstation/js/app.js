/* 完美工位 · 主逻辑 */
(function () {
  'use strict';
  const D = window.PW_DATA, P = window.Platform, E = D.ECON;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ITEM = {}; D.ITEMS.forEach(i => (ITEM[i.id] = i));
  const CAT = {}; D.CATS.forEach(c => (CAT[c.id] = c));
  const RANK = { N: 0, R: 1, SR: 2, SSR: 3 };
  const ERA_NAME = { '70s': '七十年代', '80s': '八十年代', '90s': '九十年代', '00s': '千禧年代', '10s': '一零年代', '20s': '二零年代', '当代': '当代手作', '常见': '生活常见' };
  const STYLE_TAG = { '70s': '七零复古风', '80s': '八零怀旧风', '90s': '九零回忆风', '00s': '千禧数码风', '10s': '简约现代风', '20s': '新潮科技风', '当代': '手作生活风', '常见': '自然治愈风' };
  const LAMPS = [71, 73, 77, 79];
  const SW = 360, SH = 440;

  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fmt = n => (n >= 100000 ? (n / 10000).toFixed(1) + '万' : String(Math.floor(n)));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hash = str => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  let uidN = Date.now() % 1000000;
  const newUid = () => 'u' + (uidN++).toString(36);
  const ic = (name, cls = '') => `<i class="pi ${cls}" style="background-image:url(assets/icons/48/${name}.png)"></i>`;
  const CAT_ICON = { desk: 'cat_desk', chair: 'cat_chair', pc: 'cat_computer', input: 'cat_peripheral', phone: 'cat_comm', pen: 'cat_stationery', time: 'cat_timer', lamp: 'cat_lamp_storage', plant: 'cat_plant_food', fun: 'cat_leisure' };
  const coinTag = n => `<span class="tag-coin">${ic('hud_coin', 'ico-coin')}${fmt(n)}</span>`;
  const gemTag = n => `<span class="tag-gem">${ic('hud_gem', 'ico-gem')}${fmt(n)}</span>`;
  const shardTag = n => `<span class="tag-shard">${ic('hud_shard')}${fmt(n)}</span>`;
  const priceTag = (cur, n) => (cur === 'gem' ? gemTag(n) : coinTag(n));

  /* ---------------- 存档 ---------------- */
  function freshDaily() {
    return { date: today(), tasks: {}, claimed: [], chests: [], shares: 0, invites: 0, refresh: 0, shop: null, freePull: true, exchange: 0, tapCoins: 0, cat: false };
  }
  function newState() {
    const s = {
      v: 1, coin: E.startCoin, gem: E.startGem, xp: 0, owned: {}, shards: 0, placed: [], theme: 'wood', themes: ['wood'],
      name: '我的完美工位', lastIncome: Date.now(), daily: freshDaily(), sign: { days: 0, last: '' }, achClaimed: [], setsClaimed: [],
      packs: [], pulls: 0, pity: 0, shares: 0, ssr: 0, placedEver: [], sound: true, time: 'auto', guide: 0, created: Date.now(),
    };
    D.STARTER.forEach(p => { s.owned[p.id] = 1; s.placed.push({ uid: newUid(), id: p.id, x: p.x, y: p.y, f: 0, zb: 0 }); s.placedEver.push(p.id); });
    [41, 57, 62, 82, 73].forEach(id => (s.owned[id] = 1));
    return s;
  }
  let S = P.load();
  if (!S || S.v !== 1) S = newState();
  const save = () => P.save(S);
  function checkDay() {
    if (S.daily.date !== today()) { S.daily = freshDaily(); task('login'); save(); return true; }
    return false;
  }

  /* ---------------- 计算 ---------------- */
  const owns = id => !!S.owned[id];
  const ownedCount = () => Object.keys(S.owned).length;
  const need = lv => 80 + lv * 60;
  function lvInfo() { let lv = 1, xp = S.xp; while (xp >= need(lv)) { xp -= need(lv); lv++; } return { lv, cur: xp, need: need(lv) }; }
  const maxPlaced = () => E.maxPlacedBase + lvInfo().lv * E.maxPlacedPerLv;
  const placedIds = () => new Set(S.placed.map(p => p.id));
  const theme = () => D.THEMES.find(t => t.id === S.theme) || D.THEMES[0];
  function setStatus() {
    const pl = placedIds();
    return D.SETS.map(st => ({ ...st, owned: st.items.filter(owns).length, placed: st.items.filter(i => pl.has(i)).length }));
  }
  function comfort() {
    let c = 0;
    S.placed.forEach(p => (c += ITEM[p.id].comfort));
    const cats = new Set(S.placed.map(p => ITEM[p.id].cat));
    if (cats.has('desk')) c += 5;
    if (cats.has('chair')) c += 5;
    c += cats.size;
    setStatus().forEach(st => { if (st.placed === st.items.length) c += st.bonus; });
    return c;
  }
  function styleTag() {
    const cnt = {};
    S.placed.forEach(p => { const e = ITEM[p.id].era; cnt[e] = (cnt[e] || 0) + 1; });
    const keys = Object.keys(cnt);
    if (!keys.length) return '空空如也';
    if (keys.length >= 5) return '时光混搭风';
    keys.sort((a, b) => cnt[b] - cnt[a]);
    return STYLE_TAG[keys[0]];
  }
  const incomeRate = () => Math.round(E.baseIncome + comfort() * E.comfortIncome);
  const pendingIncome = () => Math.floor(Math.min((Date.now() - S.lastIncome) / 3600000, E.maxIdleHours) * incomeRate());
  function stats() {
    return {
      ownedCount: ownedCount(), placed: S.placed.length, comfort: comfort(), shares: S.shares, pulls: S.pulls, ssr: S.ssr,
      sets: setStatus().filter(s => s.owned === s.items.length).length, eras: new Set(S.placed.map(p => ITEM[p.id].era)).size,
      signDays: S.sign.days, themes: S.themes.length,
    };
  }
  function timeMode() {
    if (S.time !== 'auto') return S.time;
    const h = new Date().getHours();
    return h >= 6 && h < 17 ? 'day' : h >= 17 && h < 19 ? 'dusk' : 'night';
  }

  /* ---------------- 音效（8-bit 合成） ---------------- */
  let AC;
  const SFX = {
    tap: [[660, 0.05]], coin: [[988, 0.06], [1318, 0.1]], drop: [[330, 0.05], [262, 0.05]], pick: [[523, 0.05], [784, 0.06]],
    gacha: [[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.14]], ssr: [[784, 0.1], [988, 0.1], [1175, 0.1], [1568, 0.3]],
    err: [[196, 0.14]], lv: [[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.1], [1318, 0.24]], meow: [[880, 0.06], [740, 0.12]],
  };
  function sfx(t) {
    if (!S.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      let tt = AC.currentTime;
      (SFX[t] || SFX.tap).forEach(([f, d]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0.045, tt); g.gain.exponentialRampToValueAtTime(0.001, tt + d);
        o.connect(g).connect(AC.destination); o.start(tt); o.stop(tt + d + 0.02); tt += d * 0.9;
      });
    } catch (e) {}
  }

  /* ---------------- 提示 / 弹窗 ---------------- */
  function toast(html, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.innerHTML = html;
    const wrap = $('#toastWrap');
    while (wrap.children.length >= 3) wrap.firstChild.remove();
    wrap.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2100);
    setTimeout(() => el.remove(), 2500);
  }
  let modalClose = null;
  function modal(html, opt = {}) {
    const m = $('#modal');
    m.className = 'modal ' + (opt.cls || '');
    m.innerHTML = html + (opt.noX ? '' : '<button class="m-x" data-act="close">×</button>');
    $('#modalMask').hidden = false;
    $('#modalMask').dataset.lock = opt.lock ? '1' : '';
    modalClose = opt.onClose || null;
    return m;
  }
  function closeModal() {
    $('#modalMask').hidden = true;
    $('#modal').innerHTML = '';
    const f = modalClose; modalClose = null;
    if (f) f();
  }

  /* ---------------- 奖励与成长 ---------------- */
  function addXp(n) {
    const before = lvInfo().lv;
    S.xp += n;
    const after = lvInfo().lv;
    if (after > before) {
      const g = 20 + after * 5;
      S.gem += g;
      setTimeout(() => { sfx('lv'); toast(`<b>工位升级 Lv.${after}！</b><br>摆放上限 +${E.maxPlacedPerLv} · ${gemTag(g)}`, 'big'); }, 300);
    }
  }
  function grantItem(id) {
    const it = ITEM[id];
    if (owns(id)) { const sh = D.RARITY[it.rarity].shard; S.shards += sh; return { id, dup: true, shard: sh }; }
    S.owned[id] = 1;
    if (it.rarity === 'SSR') S.ssr++;
    return { id, dup: false };
  }
  function randomItemAtLeast(rar) {
    const pool = D.ITEMS.filter(i => RANK[i.rarity] >= RANK[rar]);
    const fresh = pool.filter(i => !owns(i.id));
    return pick(fresh.length ? fresh : pool).id;
  }
  function give(r) {
    const parts = [];
    if (r.coin) { S.coin += r.coin; parts.push(coinTag(r.coin)); }
    if (r.gem) { S.gem += r.gem; parts.push(gemTag(r.gem)); }
    if (r.box) { const g = grantItem(randomItemAtLeast(r.box)); parts.push(`<span class="tag-item">${esc(ITEM[g.id].name)}${g.dup ? '（转碎片）' : ''}</span>`); }
    if (r.xp) addXp(r.xp);
    save();
    if (parts.length) { sfx('coin'); toast('获得 ' + parts.join(' ')); }
    refresh();
  }
  function spend(cur, n) {
    if (S.gm) return true; // GM：金币钻石无限
    if (cur === 'gem') {
      if (S.gem < n) { sfx('err'); toast('钻石不足，去「赚钻」看看吧', 'warn'); return false; }
      S.gem -= n;
    } else {
      if (S.coin < n) { sfx('err'); toast('金币不足，摆放更舒适的工位可以提高收益', 'warn'); return false; }
      S.coin -= n;
    }
    return true;
  }
  function task(id, n = 1) {
    const t = D.TASKS.find(x => x.id === id);
    if (!t) return;
    S.daily.tasks[id] = Math.min(t.goal, (S.daily.tasks[id] || 0) + n);
  }

  /* ---------------- 房间绘制（SVG 与 Canvas 共用几何） ---------------- */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  // 等距几何：u 为沿墙 0~1，h 为离地高度；a/b 为地板两个方向 0~1
  const LW = (u, h) => [8 + 172 * u, 322 - 86 * u - h];
  const RW = (u, h) => [180 + 172 * u, 236 + 86 * u - h];
  const FL = (a, b) => [8 + 172 * (a + b), 322 - 86 * a + 86 * b];
  const wq = (W, u0, u1, h0, h1) => [W(u0, h0), W(u1, h0), W(u1, h1), W(u0, h1)];
  const fq = (a0, a1, b0, b1) => [FL(a0, b0), FL(a1, b0), FL(a1, b1), FL(a0, b1)];
  function skyOf(th, mode) { return mode === 'night' ? '#1f2a5a' : mode === 'dusk' ? '#f2a27a' : th.sky; }
  function roomEdges(sh, th) {
    sh.push({ t: 'p', pts: [[8, 322], [180, 408], [180, 418], [8, 332]], fill: shade(th.trim, -10) });
    sh.push({ t: 'p', pts: [[180, 408], [352, 322], [352, 332], [180, 418]], fill: shade(th.trim, -30) });
    sh.push({ t: 'l', pts: [[8, 320], [180, 234], [352, 320]], stroke: th.trim, w: 5 });
    sh.push({ t: 'l', pts: [[8, 126], [180, 40], [352, 126]], stroke: th.trim, w: 7 });
    sh.push({ t: 'l', pts: [[8, 124], [8, 330]], stroke: th.trim, w: 5 });
    sh.push({ t: 'l', pts: [[352, 124], [352, 330]], stroke: shade(th.trim, -20), w: 5 });
    sh.push({ t: 'l', pts: [[180, 42], [180, 236]], stroke: 'rgba(0,0,0,.07)', w: 2 });
    return sh;
  }
  function roomShapes(th, mode) {
    if (th.kind === 'office') return officeShapes(th, mode);
    if (th.kind === 'factory') return factoryShapes(th, mode);
    return homeShapes(th, mode);
  }
  /* ---------- 办公室场景：通用小工具 ---------- */
  const FP = (a, b, h = 0) => { const p = FL(a, b); return [p[0], p[1] - h]; };
  const qA = (a, b0, b1, h0, h1) => [FP(a, b0, h0), FP(a, b1, h0), FP(a, b1, h1), FP(a, b0, h1)];
  const qB = (b, a0, a1, h0, h1) => [FP(a0, b, h0), FP(a1, b, h0), FP(a1, b, h1), FP(a0, b, h1)];
  // 等距方块：a=a0 面（朝左下）用原色，b=b1 面（朝右下）加深，顶面提亮
  function isoBox(poly, a0, a1, b0, b1, h0, h1, c, top) {
    poly(qB(b1, a0, a1, h0, h1), shade(c, -22));
    poly(qA(a0, b0, b1, h0, h1), c);
    poly([FP(a0, b0, h1), FP(a1, b0, h1), FP(a1, b1, h1), FP(a0, b1, h1)], top || shade(c, 16));
  }
  // 家具按远近排序后绘制（越靠后墙越先画）
  function furnish(list, poly) { list.sort((x, y) => x[0] - y[0]).forEach(f => f[1](poly)); }
  const depth = (a, b) => b - a;
  function skyline(poly, sh, th, mode, u0, u1, h0, h1) {
    poly(wq(LW, u0, u1, h0, h1), skyOf(th, mode));
    const sx = LW(u0 + (u1 - u0) * .78, h1 - 22);
    sh.push({ t: 'c', x: sx[0], y: sx[1], r: 8, fill: mode === 'night' ? '#f6f0cc' : mode === 'dusk' ? '#ffd08a' : '#fff4b8' });
    const bc = mode === 'night' ? '#2b3466' : mode === 'dusk' ? '#c47766' : shade(th.sky, -40);
    const n = Math.max(3, Math.round((u1 - u0) / .08)), w = (u1 - u0) / n, H = h1 - h0;
    for (let i = 0; i < n; i++) {
      const a = u0 + i * w, bh = H * (.3 + ((i * 37) % 11) / 18);
      poly(wq(LW, a, a + w, h0, h0 + Math.min(bh, H - 4)), i % 2 ? bc : shade(bc, -12));
      for (let y = h0 + 8; y < h0 + bh - 6; y += 10) for (let u = a + .012; u < a + w - .014; u += .026)
        if (mode === 'day' || (i * 5 + y + Math.round(u * 100)) % 3 === 0) poly(wq(LW, u, u + .01, y, y + 3), mode === 'day' ? shade(bc, 18) : '#ffe08a');
    }
  }
  function winFrame(poly, th, u0, u1, h0, h1, cols = 1, rows = 0) {
    const t = .01;
    [[u0 - t, u1 + t, h0 - 4, h0], [u0 - t, u1 + t, h1, h1 + 4]].forEach(([a, b, x, y]) => poly(wq(LW, a, b, x, y), th.trim));
    for (let k = 0; k <= cols; k++) { const u = u0 + ((u1 - u0) * k) / cols; poly(wq(LW, u - t, u + t * .3, h0, h1), th.trim); }
    for (let k = 1; k <= rows; k++) { const h = h0 + ((h1 - h0) * k) / (rows + 1); poly(wq(LW, u0, u1, h - 1.5, h + 1.5), th.trim); }
  }
  function blinds(poly, u0, u1, h0, h1, c) { for (let h = h1 - 3; h > h0; h -= 5) poly(wq(LW, u0, u1, h - 2.5, h), c); }
  function plank(poly, th, n = 10) { for (let i = 0; i < n; i++) poly(fq(0, 1, i / n, (i + 1) / n), i % 2 ? th.floorB : th.floorA); }
  function tiles(poly, th, n) { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) poly(fq(i / n, (i + 1) / n, j / n, (j + 1) / n), (i + j) % 2 ? th.floorB : th.floorA); }
  function walls(poly, th) {
    poly(wq(LW, 0, 1, 0, 196), th.wallL); poly(wq(RW, 0, 1, 0, 196), th.wallR);
    poly(wq(LW, 0, 1, 0, 7), shade(th.trim, 30)); poly(wq(RW, 0, 1, 0, 7), shade(th.trim, 40));
  }
  function plant(F, a, b, s = 1) {
    F.push([depth(a, b), poly => {
      isoBox(poly, a - .03 * s, a + .03 * s, b - .03 * s, b + .03 * s, 0, 16 * s, '#c98a4b');
      [[0, 0, 30, 9], [-.02, .02, 24, 7], [.02, -.01, 36, 7], [0, .03, 40, 6]].forEach(([da, db, h, r]) => {
        const p = FP(a + da * s, b + db * s, h * s); poly([[p[0] - r * s, p[1]], [p[0], p[1] - r * s * 1.3], [p[0] + r * s, p[1]], [p[0], p[1] + r * s * .9]], h % 2 ? '#5b8a59' : '#7fae7a');
      });
    }]);
  }
  function books(poly, face, x0, x1, h0, h1, seed) {
    const C = ['#c4614c', '#4f9ea0', '#f2c14e', '#7fae7a', '#9a6fc0', '#e9846b', '#3f4d5c'];
    for (let x = x0, i = seed; x < x1 - .012; i++) { const w = .012 + (i % 3) * .004; face(x, Math.min(x1, x + w), h0, h1 - (i % 4) * 3, C[i % C.length]); x += w + .003; }
  }
  /* ---------- 近景工位：镜头在自己的工位上，远景缩小变淡 ---------- */
  const deskTopL = (a0, b0, ai, bi, h) => [FP(a0, b0, h), FP(1, b0, h), FP(1, 1, h), FP(ai, 1, h), FP(ai, bi, h), FP(a0, bi, h)];
  // 格子间：坐在自己的格子里，两面布隔板 + 大号 L 形工作台，隔板上方露出远处办公区
  function closeCubicle(th, mode, poly, sh) {
    const fab = th.accent, cap = th.trim;
    poly(wq(LW, 0, 1, 120, 196), shade(th.wallL, -4)); poly(wq(RW, 0, 1, 120, 196), th.wallR);
    skyline(poly, sh, th, mode, .12, .88, 146, 186); winFrame(poly, th, .12, .88, 146, 186, 4);
    [.06, .3, .54, .78].forEach((u, i) => {
      poly(wq(RW, u, u + .17, 130, 140), shade(fab, 30));
      poly(wq(RW, u + .03, u + .09, 140, 149), '#3a3f46');
      if (i % 2 === 0) { const hd = RW(u + .13, 144); sh.push({ t: 'c', x: hd[0], y: hd[1], r: 4, fill: '#4b3a3a' }); }
      poly(wq(RW, u + .02, u + .14, 186, 189), mode === 'day' ? '#ffffff' : '#fff1b8');
    });
    poly(wq(LW, 0, 1, 128, 196), 'rgba(255,255,255,.24)'); poly(wq(RW, 0, 1, 128, 196), 'rgba(255,255,255,.24)');
    tiles(poly, th, 6);
    [LW, RW].forEach((W, i) => {
      poly(wq(W, 0, 1, 0, 128), i ? fab : shade(fab, -12));
      [.2, .4, .6, .8].forEach(u => poly(wq(W, u, u + .005, 6, 124), shade(fab, -22)));
      poly(wq(W, 0, 1, 124, 132), cap); poly(wq(W, 0, 1, 0, 6), shade(cap, 24));
    });
    poly([LW(.985, 0), LW(1, 0), RW(.015, 0), RW(.015, 132), LW(1, 132), LW(.985, 132)], cap);
    [[LW, .1, .17, 92, 106, '#f2c14e'], [LW, .19, .25, 96, 108, '#f19aa0'], [LW, .27, .33, 90, 102, '#9fd0d1']].forEach(([W, u0, u1, h0, h1, col]) => poly(wq(W, u0, u1, h0, h1), col));
    poly(wq(RW, .08, .22, 76, 112), '#fffaf1'); poly(wq(RW, .08, .22, 104, 112), '#e9846b');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) poly(wq(RW, .095 + k * .03, .11 + k * .03, 82 + r * 7, 85 + r * 7), '#c9bfb2');
    poly(fq(0, .7, 0, .3), 'rgba(75,58,58,.16)'); poly(fq(.7, 1, 0, 1), 'rgba(75,58,58,.16)');
    isoBox(poly, .73, .97, .7, .97, 0, 46, '#b9b2a6');
    [14, 30].forEach(h => poly(qB(.97, .73, .97, h, h + 1.5), '#8f887d'));
    [6, 22, 38].forEach(h => poly(qB(.97, .82, .88, h, h + 2), '#6d665c'));
    isoBox(poly, .01, .04, .26, .29, 0, 46, '#8f887d');
    poly(deskTopL(0, 0, .7, .3, 52), '#efe9df');
    poly(qA(0, 0, .3, 47, 52), '#d8cfc2'); poly(qB(.3, 0, .7, 47, 52), '#c4baab');
    poly(qA(.7, .3, 1, 47, 52), '#d8cfc2'); poly(qB(1, .7, 1, 47, 52), '#c4baab');
    const g = FP(.86, .12, 52); sh.push({ t: 'c', x: g[0], y: g[1], r: 2.5, fill: '#6d665c' });
  }
  // 互联网大开间：坐在教室式长条桌前，对面是同事的显示器背面，远处还有一排排工位
  function closeOpen(th, mode, poly, sh) {
    plank(poly, th, 12);
    skyline(poly, sh, th, mode, .04, .96, 30, 188); winFrame(poly, th, .04, .96, 30, 188, 5, 1);
    poly(wq(RW, 0, 1, 172, 190), th.accent);
    [[.06, .2, '#f2c14e'], [.22, .34, '#7fae7a'], [.36, .48, '#4f9ea0']].forEach(([u0, u1, col]) => poly(wq(RW, u0, u1, 176, 186), col));
    poly(wq(RW, .34, .72, 96, 154), '#2f343b'); poly(wq(RW, .355, .705, 100, 150), mode === 'night' ? '#3d5a80' : '#4e7fa8');
    [[.39, .5, 132, 140, '#fffaf1'], [.56, .59, 106, 124, '#f2c14e'], [.61, .64, 106, 136, th.accent], [.66, .69, 106, 118, '#7fae7a']].forEach(([u0, u1, h0, h1, col]) => poly(wq(RW, u0, u1, h0, h1), col));
    isoBox(poly, 0, 1, .04, .14, 30, 33, '#f4efe6', '#faf6ee');
    [.15, .45, .75].forEach(a => {
      isoBox(poly, a - .05, a + .05, .06, .075, 33, 46, '#3a3f46');
      isoBox(poly, a - .035, a + .035, .17, .22, 14, 17, th.accent);
      isoBox(poly, a - .035, a + .035, .21, .225, 17, 32, shade(th.accent, -12));
    });
    poly(wq(LW, 0, 1, 0, 196), 'rgba(255,255,255,.14)'); poly(wq(RW, 0, 1, 0, 196), 'rgba(255,255,255,.14)');
    poly(fq(0, 1, 0, .24), 'rgba(255,255,255,.2)');
    poly(fq(0, 1, .24, .66), 'rgba(75,58,58,.15)');
    [.03, .5, .95].forEach(a => isoBox(poly, a, a + .02, .27, .63, 0, 44, '#4b5563'));
    isoBox(poly, 0, 1, .24, .66, 44, 48, '#f4efe6', '#fbf8f2');
    [.12, .42, .72].forEach(a => {
      isoBox(poly, a + .07, a + .09, .27, .29, 48, 56, '#3a3f46');
      isoBox(poly, a, a + .16, .27, .29, 56, 82, '#3a3f46');
    });
    poly(qB(.34, 0, 1, 48, 61), 'rgba(207,224,236,.72)'); poly(qB(.34, 0, 1, 60, 62), th.trim);
  }
  // 企业前台：站在接待台里面朝大堂看；外侧高台挡住访客，内侧是大工作台面
  function closeReception(th, mode, poly, sh) {
    tiles(poly, th, 5);
    for (let k = 1; k < 5; k++) { poly(fq(k / 5 - .003, k / 5 + .003, 0, 1), '#cfc8bc'); poly(fq(0, 1, k / 5 - .003, k / 5 + .003), '#cfc8bc'); }
    poly(fq(0, .5, .5, 1), '#a98b6a');
    for (let k = 1; k < 5; k++) poly(fq(0, .5, .5 + k * .1, .5 + k * .1 + .006), '#957657');
    skyline(poly, sh, th, mode, .04, .96, 8, 186); winFrame(poly, th, .04, .96, 8, 186, 4);
    poly(wq(LW, .04, .96, 70, 84), 'rgba(255,255,255,.6)');
    poly(wq(LW, .36, .5, 117, 123), '#fffaf1'); poly(wq(LW, .38, .48, 108, 112), 'rgba(255,255,255,.8)');
    const lg = LW(.58, 118); poly([[lg[0], lg[1] - 14], [lg[0] + 13, lg[1]], [lg[0], lg[1] + 14], [lg[0] - 13, lg[1]]], '#fffaf1');
    poly([[lg[0], lg[1] - 7], [lg[0] + 6, lg[1]], [lg[0], lg[1] + 7], [lg[0] - 6, lg[1]]], th.accent);
    poly(wq(RW, 0, 1, 0, 30), shade(th.accent, 52));
    [.14, .31].forEach(u => { poly(wq(RW, u, u + .16, 0, 112), th.trim); poly(wq(RW, u + .01, u + .15, 0, 108), '#b7c2ca'); poly(wq(RW, u + .078, u + .082, 0, 108), '#8b979f'); });
    poly(wq(RW, .26, .36, 118, 126), '#3a3f46'); poly(wq(RW, .29, .33, 120, 124), '#f2c14e');
    poly(wq(RW, .6, .86, 80, 132), '#c9a24a'); poly(wq(RW, .615, .845, 84, 128), th.accent); poly(wq(RW, .64, .76, 98, 112), shade(th.accent, 40));
    [.2, .5, .8].forEach(u => { const p = RW(u, 192); poly([[p[0] - 5, p[1]], [p[0] + 5, p[1] + 2], [p[0] + 24, p[1] + 60], [p[0] - 24, p[1] + 48]], mode === 'day' ? 'rgba(255,255,255,.16)' : 'rgba(255,224,150,.22)'); });
    const F = [];
    F.push([depth(.98, .45), p => {
      isoBox(p, .84, .98, .45, .82, 0, 10, '#e9846b');
      isoBox(p, .95, .98, .45, .82, 10, 24, shade('#e9846b', -12));
      isoBox(p, .84, .98, .45, .49, 10, 17, shade('#e9846b', -12)); isoBox(p, .84, .98, .78, .82, 10, 17, shade('#e9846b', -12));
    }]);
    plant(F, .93, .12, .9); plant(F, .2, .08, .9);
    furnish(F, poly);
    poly(wq(LW, 0, 1, 0, 196), 'rgba(255,255,255,.1)'); poly(wq(RW, 0, 1, 0, 196), 'rgba(255,255,255,.1)');
    const ledge = '#eef1f3', ltop = shade(th.accent, -12);
    isoBox(poly, 0, .78, .22, .29, 0, 74, ledge, ltop); poly(qB(.29, 0, .71, 62, 66), th.accent);
    isoBox(poly, .71, .78, .29, 1, 0, 74, ledge, ltop); poly(qA(.71, .29, 1, 62, 66), th.accent);
    const bell = FP(.42, .255, 74); sh.push({ t: 'c', x: bell[0], y: bell[1] - 2, r: 3.5, fill: '#f2c14e' });
    poly(qB(.5, 0, .5, 0, 45), '#5a4d45'); poly(qA(.5, .5, 1, 0, 45), '#4e423b');
    poly(qA(0, .29, .5, 0, 50), '#d9d2c6'); poly(qB(1, .5, .71, 0, 50), '#cfc7ba');
    poly([FP(0, .29, 50), FP(.71, .29, 50), FP(.71, 1, 50), FP(.5, 1, 50), FP(.5, .5, 50), FP(0, .5, 50)], '#c9a074');
    poly(qB(.5, 0, .5, 45, 50), '#a77f55'); poly(qA(.5, .5, 1, 45, 50), '#b58b60');
  }
  /* ---------- 办公室分布局 ---------- */
  function officeShapes(th, mode) {
    const sh = [], poly = (pts, fill) => sh.push({ t: 'p', pts, fill }), F = [];
    const L = th.layout;
    if (!L) return officeGlass(th, mode);
    walls(poly, th);
    if (L === 'cubicle') closeCubicle(th, mode, poly, sh);
    else if (L === 'open') closeOpen(th, mode, poly, sh);
    else if (L === 'reception') closeReception(th, mode, poly, sh);
    else if (L === 'private') {
      plank(poly, th, 10);
      skyline(poly, sh, th, mode, .12, .56, 72, 176); blinds(poly, .12, .56, 150, 176, '#efe9df'); winFrame(poly, th, .12, .56, 72, 176, 2);
      poly(wq(RW, .64, .9, 0, 154), th.trim); poly(wq(RW, .66, .88, 0, 150), '#cfe2e8'); poly(wq(RW, .66, .88, 70, 100), 'rgba(255,255,255,.55)');
      poly(wq(RW, .68, .71, 62, 70), '#f2c14e'); poly(wq(RW, .74, .84, 158, 168), '#fffaf1');
      poly(wq(RW, .16, .34, 104, 142), '#c9a074'); poly(wq(RW, .18, .32, 108, 138), '#fffaf1'); poly(wq(RW, .21, .29, 128, 131), th.trim); poly(wq(RW, .21, .26, 120, 122), '#9aa');
      poly(fq(.2, .72, .32, .86), shade(th.accent, -10)); poly(fq(.24, .68, .36, .82), th.accent);
      F.push([depth(.95, .05), poly => {
        isoBox(poly, .62, .95, 0, .09, 0, 124, '#8a6446');
        const face = (x0, x1, h0, h1, c) => poly(qB(.09, x0, x1, h0, h1), c);
        [4, 34, 64, 94].forEach((h, i) => { poly(qB(.09, .63, .94, h, h + 26), '#5e412c'); books(poly, face, .64, .93, h + 1, h + 24, i * 3); });
      }]);
      F.push([depth(1, .2), poly => { isoBox(poly, .9, 1, .12, .3, 0, 52, '#9aa3a8'); [16, 34].forEach(h => poly(qA(.9, .14, .28, h, h + 2), '#6d767c')); }]);
      plant(F, .95, .2, .8);
    } else if (L === 'boss') {
      plank(poly, th, 8);
      [LW, RW].forEach((W, wi) => {
        poly(wq(W, 0, 1, 0, 70), shade(th.trim, 18 + wi * 8));
        for (let u = .04; u < 1; u += .12) poly(wq(W, u, u + .1, 10, 60), shade(th.trim, 28 + wi * 8));
        poly(wq(W, 0, 1, 70, 75), shade(th.trim, -10));
      });
      skyline(poly, sh, th, mode, .1, .58, 86, 184); winFrame(poly, th, .1, .58, 86, 184, 3);
      poly(wq(LW, .04, .11, 80, 190), th.accent); poly(wq(LW, .57, .64, 80, 190), th.accent);
      poly(wq(LW, .04, .64, 188, 194), shade(th.accent, -25));
      poly(wq(RW, .52, .9, 102, 164), '#c9a24a'); poly(wq(RW, .54, .88, 106, 160), '#f3ead2');
      const M = (u, h) => RW(u, h);
      poly([M(.56, 112), M(.64, 140), M(.7, 124), M(.76, 150), M(.86, 112)], '#5f7f6a');
      poly([M(.6, 112), M(.7, 130), M(.8, 112)], '#3e5a4b'); const sn = M(.82, 146); sh.push({ t: 'c', x: sn[0], y: sn[1], r: 4, fill: '#c4614c' });
      poly(fq(.14, .84, .3, .94), '#c9a24a'); poly(fq(.17, .81, .33, .91), th.accent); poly(fq(.22, .76, .38, .86), shade(th.accent, 12));
      F.push([depth(1, .04), poly => {
        isoBox(poly, .91, 1, .03, .46, 0, 156, '#5a3a26');
        const face = (x0, x1, h0, h1, c) => poly(qA(.91, x0, x1, h0, h1), c);
        [6, 36, 66, 96, 126].forEach((h, i) => { poly(qA(.91, .045, .445, h, h + 26), '#3f2819'); if (i !== 2) books(poly, face, .05, .44, h + 1, h + 24, i * 2); });
        const gb = FP(.91, .25, 80); sh.push({ t: 'c', x: gb[0], y: gb[1], r: 8, fill: '#4f9ea0' }); sh.push({ t: 'c', x: gb[0] - 2, y: gb[1] - 2, r: 3, fill: '#7fae7a' });
      }]);
      F.push([depth(.9, .05), poly => {
        const c = '#6b3b25';
        isoBox(poly, .64, .9, 0, .12, 0, 16, c); isoBox(poly, .64, .9, 0, .04, 16, 38, shade(c, -8));
        isoBox(poly, .64, .68, .04, .12, 16, 26, shade(c, -8)); isoBox(poly, .86, .9, .04, .12, 16, 26, shade(c, -8));
      }]);
      F.push([depth(.86, .2), poly => isoBox(poly, .7, .86, .18, .28, 0, 14, '#3a2a22', '#8fb8c4')]);
      plant(F, .97, .6, 1.3);
    }
    furnish(F, poly);
    return roomEdges(sh, th);
  }
  /* 写字楼：整面玻璃幕墙 + 城市天际线、白板墙、方块地毯 */
  function officeGlass(th, mode) {
    const sh = [], poly = (pts, fill) => sh.push({ t: 'p', pts, fill }), sky = skyOf(th, mode);
    poly(wq(LW, 0, 1, 0, 196), th.wallL);
    poly(wq(RW, 0, 1, 0, 196), th.wallR);
    poly(wq(LW, .04, .96, 16, 186), sky);
    if (mode === 'night') { sh.push({ t: 'c', x: LW(.8, 160)[0], y: LW(.8, 160)[1], r: 8, fill: '#f6f0cc' }); }
    else sh.push({ t: 'c', x: LW(.8, 158)[0], y: LW(.8, 158)[1], r: 10, fill: mode === 'dusk' ? '#ffd08a' : '#fff4b8' });
    const bc = mode === 'night' ? '#2b3466' : mode === 'dusk' ? '#c47766' : shade(th.sky, -40);
    const bs = [[.04, .12, 72], [.12, .2, 108], [.2, .3, 60], [.3, .38, 132], [.38, .49, 86], [.49, .57, 146], [.57, .67, 98], [.67, .75, 122], [.75, .85, 64], [.85, .96, 94]];
    bs.forEach(([a, b, h], i) => {
      poly(wq(LW, a, b, 16, 16 + h), i % 2 ? bc : shade(bc, -12));
      const lit = mode === 'day' ? shade(bc, 18) : '#ffe08a';
      for (let y = 26; y < 10 + h; y += 12) for (let u = a + .015; u < b - .02; u += .03) if (mode === 'day' || (i * 7 + y + Math.round(u * 100)) % 3 === 0) poly(wq(LW, u, u + .012, y, y + 4), lit);
    });
    poly([LW(.1, 186), LW(.16, 186), LW(.08, 120), LW(.04, 120)], 'rgba(255,255,255,.22)');
    poly([LW(.55, 186), LW(.58, 186), LW(.5, 110), LW(.47, 110)], 'rgba(255,255,255,.18)');
    [.04, .27, .5, .73, .955].forEach(u => poly(wq(LW, u, u + .012, 16, 186), th.trim));
    [[12, 18], [98, 101], [184, 190]].forEach(([a, b]) => poly(wq(LW, .04, .967, a, b), th.trim));
    poly(wq(RW, 0, 1, 0, 34), shade(th.wallR, -14));
    poly(wq(RW, 0, 1, 34, 40), th.accent);
    poly(wq(RW, .12, .58, 84, 160), th.trim);
    poly(wq(RW, .13, .57, 88, 156), '#fbfdfd');
    [[.17, .32, 140, 143, th.accent], [.17, .4, 130, 132, '#8aa0ad'], [.17, .36, 120, 122, '#8aa0ad'], [.42, .52, 104, 140, shade(th.accent, 40)]].forEach(([a, b, h0, h1, c]) => poly(wq(RW, a, b, h0, h1), c));
    poly(wq(RW, .72, .88, 162, 176), '#5b8a59');
    poly(wq(RW, .75, .8, 166, 172), '#fffaf1');
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) poly(fq(i / 6, (i + 1) / 6, j / 6, (j + 1) / 6), (i + j) % 2 ? th.floorB : th.floorA);
    poly(fq(.98, 1, 0, 1), shade(th.floorB, -10));
    return roomEdges(sh, th);
  }
  /* 工厂：砖墙或金属板墙、高窗、管道、卷帘门、环氧地坪和黄色通道线 */
  function factoryShapes(th, mode) {
    const sh = [], poly = (pts, fill) => sh.push({ t: 'p', pts, fill }), sky = skyOf(th, mode);
    poly(wq(LW, 0, 1, 0, 196), th.wallL);
    poly(wq(RW, 0, 1, 0, 196), th.wallR);
    [LW, RW].forEach(W => {
      if (th.wallStyle === 'brick') {
        for (let r = 0, h = 54; h < 196; r++, h += 10) {
          poly(wq(W, 0, 1, h, h + 1.6), th.mortar);
          for (let u = r % 2 ? .035 : 0; u < 1; u += .07) poly(wq(W, u, u + .007, h, h + 10), th.mortar);
        }
      } else for (let u = .03; u < 1; u += .06) poly(wq(W, u, u + .014, 54, 196), th.mortar);
      poly(wq(W, 0, 1, 0, 44), shade(th.trim, 70));
      poly(wq(W, 0, 1, 44, 54), th.accent);
      for (let u = -.02; u < 1; u += .05) poly([W(Math.max(0, u), 44), W(Math.min(1, u + .02), 44), W(Math.min(1, u + .04), 54), W(Math.max(0, u + .02), 54)], '#3d3a3a');
    });
    poly(wq(LW, .08, .92, 118, 186), th.trim);
    poly(wq(LW, .095, .905, 123, 181), sky);
    if (mode === 'night') [[.2, 170], [.45, 140], [.7, 165], [.82, 135]].forEach(([u, h]) => poly(wq(LW, u, u + .01, h, h + 2), '#fff6c8'));
    else poly(wq(LW, .3, .5, 160, 166), 'rgba(255,255,255,.7)');
    for (let k = 1; k < 6; k++) { const u = .095 + (.81 * k) / 6; poly(wq(LW, u - .005, u + .005, 123, 181), th.trim); }
    poly(wq(LW, .095, .905, 150, 154), th.trim);
    poly(wq(RW, .5, .9, 0, 112), th.trim);
    poly(wq(RW, .52, .88, 0, 106), shade(th.wallR, -24));
    for (let h = 6; h < 106; h += 8) poly(wq(RW, .52, .88, h, h + 2), shade(th.wallR, -40));
    poly(wq(RW, .66, .74, 8, 12), th.accent);
    [[146, '#8c969c'], [160, '#a7b0b5']].forEach(([h, c]) => { poly(wq(RW, 0, 1, h, h + 7), c); poly(wq(RW, 0, 1, h + 5, h + 7), shade(c, -30)); for (let u = .1; u < 1; u += .22) poly(wq(RW, u, u + .02, h - 2, h + 9), shade(c, -20)); });
    poly(wq(RW, .93, .96, 0, 167), '#8c969c');
    poly([RW(.2, 116), RW(.32, 116), RW(.26, 138)], th.accent);
    poly(wq(RW, .255, .265, 120, 131), '#3d3a3a');
    poly([LW(.975, 0), LW(1, 0), RW(.025, 0), RW(.025, 196), LW(1, 196), LW(.975, 196)], th.trim);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) poly(fq(i / 4, (i + 1) / 4, j / 4, (j + 1) / 4), (i + j) % 2 ? th.floorB : th.floorA);
    poly(fq(0, 1, .6, .63), th.accent);
    poly(fq(0, 1, .93, .96), th.accent);
    poly(fq(.78, .97, .04, .3), th.accent);
    for (let a = .8; a < .96; a += .045) poly(fq(a, a + .02, .04, .3), '#3d3a3a');
    return roomEdges(sh, th);
  }
  function homeShapes(th, mode) {
    const sky = skyOf(th, mode);
    const sh = [];
    const poly = (pts, fill) => sh.push({ t: 'p', pts, fill });
    poly([[8, 322], [180, 236], [180, 40], [8, 126]], th.wallL);
    poly([[180, 236], [352, 322], [352, 126], [180, 40]], th.wallR);
    for (let i = 0; i < 7; i++) {
      const x = 200 + i * 22, y = 150 + (x - 180) * 0.5 + (i % 2) * 30;
      poly([[x, y], [x + 4, y + 2], [x + 4, y + 6], [x, y + 4]], shade(th.wallR, -9));
    }
    // 窗户
    poly([[42, 142], [134, 96], [134, 180], [42, 226]], th.trim);
    poly([[48, 142], [128, 102], [128, 174], [48, 214]], sky);
    if (mode === 'night') {
      [[62, 150], [96, 128], [76, 180], [114, 150], [58, 196]].forEach(([x, y]) => poly([[x, y], [x + 2, y], [x + 2, y + 2], [x, y + 2]], '#fff6c8'));
      sh.push({ t: 'c', x: 104, y: 136, r: 9, fill: '#f6f0cc' });
      sh.push({ t: 'c', x: 108, y: 133, r: 8, fill: sky });
    } else {
      sh.push({ t: 'c', x: 104, y: 134, r: 10, fill: mode === 'dusk' ? '#ffd08a' : '#fff4b8' });
      poly([[56, 178], [72, 170], [84, 172], [94, 166], [104, 170], [80, 182], [60, 186]], 'rgba(255,255,255,.75)');
    }
    poly([[86, 122], [91, 120], [91, 192], [86, 194]], th.trim);
    poly([[48, 176], [128, 136], [128, 141], [48, 181]], th.trim);
    poly([[40, 226], [136, 178], [136, 184], [40, 232]], shade(th.trim, -18));
    // 地板
    const L = [8, 322], T = [180, 236], B = [180, 408], R = [352, 322];
    const Pp = t => [L[0] + (T[0] - L[0]) * t, L[1] + (T[1] - L[1]) * t];
    const Qp = t => [B[0] + (R[0] - B[0]) * t, B[1] + (R[1] - B[1]) * t];
    for (let i = 0; i < 9; i++) poly([Pp(i / 9), Pp((i + 1) / 9), Qp((i + 1) / 9), Qp(i / 9)], i % 2 ? th.floorB : th.floorA);
    for (let i = 0; i < 9; i++) {
      const a = Pp(i / 9 + 0.05), b = Qp(i / 9 + 0.05), k = 0.3 + (i % 3) * 0.2;
      const m = [a[0] * k + b[0] * (1 - k), a[1] * k + b[1] * (1 - k)];
      poly([[m[0], m[1]], [m[0] + 6, m[1] + 3], [m[0] + 6, m[1] + 5], [m[0], m[1] + 2]], shade(th.floorB, -14));
    }
    // 小地毯
    poly([[120, 352], [196, 314], [262, 347], [186, 385]], shade(th.wallL, -26));
    poly([[128, 352], [196, 318], [254, 347], [186, 381]], shade(th.wallR, -8));
    poly([[150, 352], [196, 329], [232, 347], [186, 370]], shade(th.wallL, -26));
    return roomEdges(sh, th);
  }
  function roomSVG(th, mode) {
    const body = roomShapes(th, mode).map(s => {
      if (s.t === 'p') return `<polygon points="${s.pts.map(p => p.join(',')).join(' ')}" fill="${s.fill}"/>`;
      if (s.t === 'c') return `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.fill}"/>`;
      return `<polyline points="${s.pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${s.stroke}" stroke-width="${s.w}"/>`;
    }).join('');
    return `<svg class="room" viewBox="0 0 ${SW} ${SH}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
  }
  function drawRoom(g, th, mode) {
    roomShapes(th, mode).forEach(s => {
      g.beginPath();
      if (s.t === 'c') { g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fillStyle = s.fill; g.fill(); return; }
      s.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      if (s.t === 'p') { g.closePath(); g.fillStyle = s.fill; g.fill(); }
      else { g.strokeStyle = s.stroke; g.lineWidth = s.w; g.stroke(); }
    });
  }

  /* ---------------- 摆放 ---------------- */
  const ED = { on: false, sel: null, undo: [], cat: 'all' };
  // 前后层级由位置决定：越靠下（离观察者越近）越靠前，拖动即可调整
  const zOf = p => ({ wall: 0, floor: 1000, desk: 2000 }[ITEM[p.id].slot]) + p.y;
  const itTf = p => `${p.r ? `rotate(${p.r}deg)` : ''}${p.f ? ' scaleX(-1)' : ''}` || 'none';
  const normDeg = d => ((Math.round(d) % 360) + 360) % 360;
  function clampPos(it, x, y) {
    x = Math.max(it.w * 0.3, Math.min(SW - it.w * 0.3, x));
    const z = (theme().zones || {})[it.slot];
    const r = z ? [Math.max(z[0], 40 + (it.slot === 'wall' ? it.h : 0)), z[1]] : it.slot === 'wall' ? [40 + it.h, 232] : it.slot === 'floor' ? [262, 436] : [130, 432];
    y = Math.max(r[0], Math.min(r[1], y));
    return { x: Math.round(x), y: Math.round(y) };
  }
  const snapshot = () => JSON.stringify(S.placed);
  function placeItem(id) {
    const it = ITEM[id];
    if (!owns(id)) return false;
    if (S.placed.some(p => p.id === id)) { toast('它已经在工位上啦'); return false; }
    if (S.placed.length >= maxPlaced()) { sfx('err'); toast(`工位放满了（${maxPlaced()} 件），升级工位可以放更多`, 'warn'); return false; }
    ED.undo.push(snapshot());
    let x, y;
    if (it.slot === 'wall') { x = 250 + Math.random() * 60; y = 120 + it.h; }
    else if (it.slot === 'floor') { if (it.cat === 'chair') { x = 128; y = 412; } else if (it.cat === 'desk') { x = 196; y = 372; } else { x = 300; y = 392; } }
    else { x = 130 + Math.random() * 110; y = 270 + Math.random() * 24; }
    const c = clampPos(it, x, y);
    const p = { uid: newUid(), id, x: c.x, y: c.y, f: 0, zb: 0 };
    S.placed.push(p);
    ED.sel = p.uid;
    if (!S.placedEver.includes(id)) { S.placedEver.push(id); addXp(6); }
    task('place');
    if (S.guide === 2) S.guide = 3;
    sfx('pick');
    save();
    return true;
  }
  function unplace(uid) {
    ED.undo.push(snapshot());
    S.placed = S.placed.filter(p => p.uid !== uid);
    if (ED.sel === uid) ED.sel = null;
    save();
  }

  /* ---------------- 场景渲染 ---------------- */
  const CAT_RECTS = (() => {
    const k = '#4b3a3a', o = '#eea35d', d = '#c9783a', w = '#fff8ee', p = '#f19aa0';
    const r = [
      [1, 2, 1, 4, k], [2, 5, 1, 1, k], [2, 5, 10, 5, k], [3, 6, 8, 3, o], [5, 6, 1, 2, d], [7, 6, 1, 2, d],
      [10, 2, 6, 6, k], [11, 3, 4, 4, o], [10, 1, 1, 1, k], [15, 1, 1, 1, k], [12, 4, 1, 1, k], [14, 4, 1, 1, k], [13, 5, 1, 1, p], [3, 8, 6, 1, w],
    ];
    return r.map(a => `<rect x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" fill="${a[4]}"/>`).join('');
  })();
  const CAT_SVG = `<svg viewBox="0 0 16 12" shape-rendering="crispEdges">${CAT_RECTS}<g class="la"><rect x="3" y="10" width="1" height="2" fill="#4b3a3a"/><rect x="9" y="10" width="1" height="2" fill="#4b3a3a"/></g><g class="lb"><rect x="5" y="10" width="1" height="2" fill="#4b3a3a"/><rect x="11" y="10" width="1" height="2" fill="#4b3a3a"/></g></svg>`;

  function itemHTML(p) {
    const it = ITEM[p.id];
    const sel = ED.on && ED.sel === p.uid ? ' sel' : '';
    return `<img class="it${sel}" data-uid="${p.uid}" src="${it.img}" alt="${esc(it.name)}" draggable="false" style="left:${p.x - it.w / 2}px;top:${p.y - it.h}px;width:${it.w}px;height:${it.h}px;z-index:${zOf(p)};transform:${itTf(p)};">`;
  }
  function armGeo(p) {
    const it = ITEM[p.id];
    return { x: p.x, y: p.y - it.h / 2, len: Math.max(it.w, it.h) / 2 + 20 };
  }
  function armHTML(p) {
    const g = armGeo(p);
    return `<div class="rot-arm" id="rotArm" style="left:${g.x}px;top:${g.y - g.len}px;height:${g.len}px;transform:rotate(${p.r || 0}deg)"><b title="拖动旋转"></b></div>`;
  }
  function syncRot(p) {
    const el = document.querySelector(`.it[data-uid="${p.uid}"]`); if (el) el.style.transform = itTf(p);
    const arm = $('#rotArm'); if (arm) { const g = armGeo(p); arm.style.left = g.x + 'px'; arm.style.top = g.y - g.len + 'px'; arm.style.height = g.len + 'px'; arm.style.transform = `rotate(${p.r || 0}deg)`; }
    const rg = $('#rotRange'); if (rg && +rg.value !== (p.r || 0)) rg.value = p.r || 0;
    const lb = $('#rotVal'); if (lb) lb.textContent = (p.r || 0) + '°';
    const ub = document.querySelector('[data-act="undo"]'); if (ub) ub.disabled = !ED.undo.length;
  }
  const catPos = { x: 250, y: 384, dir: -1 };
  function sceneHTML() {
    const mode = timeMode();
    const glows = mode === 'day' ? '' : S.placed.filter(p => LAMPS.includes(p.id) && !p.off).map(p => { const it = ITEM[p.id]; return `<i class="glow" style="left:${p.x}px;top:${p.y - it.h * 0.55}px"></i>`; }).join('');
    return `${roomSVG(theme(), mode)}<div class="items">${S.placed.map(itemHTML).join('')}${ED.on && ED.sel && sel() ? armHTML(sel()) : ''}</div>
      <div class="tint ${mode}"></div><div class="glows">${glows}</div>
      <div class="cat" id="cat" style="left:${catPos.x}px;top:${catPos.y}px;--d:${catPos.dir}">${CAT_SVG}</div><div class="fx" id="fx"></div>`;
  }
  function fitStage() {
    const wrap = $('#stageWrap'); if (!wrap) return;
    const s = wrap.clientWidth / SW;
    wrap.style.height = SH * s + 'px';
    $('#stage').style.transform = `scale(${s})`;
  }
  const stageScale = () => { const w = $('#stageWrap'); return w ? w.clientWidth / SW : 1; };

  function fx(x, y, text, cls) {
    const box = $('#fx'); if (!box) return;
    const el = document.createElement('span');
    el.className = 'pop ' + (cls || '');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    box.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function interact(p, el) {
    const it = ITEM[p.id];
    el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing');
    const top = p.y - it.h;
    let t = '✦', cls = '';
    if (it.cat === 'phone') { t = '叮铃铃'; cls = 'txt'; }
    else if (it.cat === 'fun') { t = '♪'; cls = 'note'; }
    else if (it.id >= 81 && it.id <= 85) { t = '♥'; cls = 'heart'; }
    else if (it.id >= 86 && it.id <= 90) { t = '~ ~'; cls = 'steam'; }
    else if (it.cat === 'time') { t = '滴答'; cls = 'txt'; }
    else if (it.cat === 'pc') { t = '>_'; cls = 'txt'; }
    else if (it.cat === 'chair') { t = '舒服～'; cls = 'txt'; }
    if (LAMPS.includes(p.id)) { p.off = !p.off; t = p.off ? '熄灯' : '开灯'; cls = 'txt'; setTimeout(renderDesk, 260); }
    fx(p.x, top, t, cls);
    sfx('tap');
    P.vibrate(8);
    task('tap');
    if (S.daily.tapCoins < 10 && Math.random() < 0.15) {
      const c = 5 + Math.floor(Math.random() * 11);
      S.daily.tapCoins++; S.coin += c;
      setTimeout(() => { fx(p.x + 14, top + 10, '+' + c, 'coin'); sfx('coin'); renderHud(); }, 260);
    }
    save();
    renderDots();
  }

  function catTick() {
    const el = $('#cat'); if (!el || ED.on || document.hidden) return;
    const nx = 60 + Math.random() * 220, ny = 360 + Math.random() * 50;
    catPos.dir = nx > catPos.x ? 1 : -1;
    catPos.x = nx; catPos.y = ny;
    el.classList.add('walk');
    el.style.setProperty('--d', catPos.dir);
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
    setTimeout(() => el && el.classList.remove('walk'), 3200);
  }
  setInterval(catTick, 7000);

  /* ---------------- 页面：工位 ---------------- */
  const GUIDE = ['', '点「布置」，开始装扮你的工位吧', '从下方挑一件物品点一下就能摆上去，拖动可以调整位置', '摆得不错！点右上角「完成」保存布局', '试试「晒工位」，分享就能赚钻石 ✦'];
  function chips(list, cur, act) {
    return list.map(c => `<button class="chip ${cur === c.id ? 'on' : ''}" data-act="${act}" data-id="${c.id}">${CAT_ICON[c.id] ? ic(CAT_ICON[c.id]) : ''}${esc(c.name)}</button>`).join('');
  }
  function renderDesk() {
    const pg = $('#page-desk');
    const st = stats();
    const inc = pendingIncome();
    const mode = timeMode();
    const sel = ED.on && ED.sel ? S.placed.find(p => p.uid === ED.sel) : null;
    const modeName = { auto: '自动', day: '白天', dusk: '黄昏', night: '夜晚' }[S.time];
    let html = `<div class="desk-head">
        <button class="ws-name" data-act="rename"><b>${esc(S.name)}</b>${ic('op_rename')}</button>
        <span class="style-tag">${styleTag()}</span>
        <button class="chip-btn" data-act="time">${ic(mode === 'night' ? 'op_night' : mode === 'dusk' ? 'op_dusk' : 'op_day')}${modeName}</button>
      </div>
      <div class="stage-wrap ${ED.on ? 'editing' : ''}" id="stageWrap">
        <div class="stage" id="stage">${sceneHTML()}</div>
        ${!ED.on && inc > 0 ? `<button class="income" data-act="income">${ic('hud_coin', 'ico-coin')}<b>+${fmt(inc)}</b><small>工位收益</small></button>` : ''}
        ${ED.on ? `<div class="edit-badge">拖动摆放 · 越靠下越靠前</div>` : ''}
        ${sel ? `<div class="sel-bar"><div class="sb-row"><b>${esc(ITEM[sel.id].name)}</b>
            <button data-act="flip">${ic('edit_flip')}翻转</button><button data-act="unplace" class="red">${ic('edit_stow')}收回</button></div>
            <div class="sb-row rot-row">${ic('edit_rotate')}<input type="range" class="px-range" id="rotRange" min="0" max="359" step="1" value="${sel.r || 0}" aria-label="旋转角度"><button data-act="rot0" id="rotVal" title="点击归零">${sel.r || 0}°</button></div></div>` : ''}
      </div>`;
    html += `<div class="stat-row">
        <div class="stat"><small>舒适度</small><b>${st.comfort}</b></div>
        <div class="stat"><small>收益/时</small><b>${incomeRate()}</b></div>
        <div class="stat"><small>摆放</small><b>${st.placed}/${maxPlaced()}</b></div>
        <div class="stat"><small>收藏</small><b>${st.ownedCount}/100</b></div>
      </div>`;
    if (!ED.on) {
      if (S.guide >= 1 && S.guide <= 4) html += `<div class="guide"><span class="g-cat">${CAT_SVG}</span><p>${GUIDE[S.guide]}</p><button data-act="skipGuide">跳过</button></div>`;
      html += `<div class="act-row">
          <button class="big-btn green ${S.guide === 1 ? 'pulse' : ''}" data-act="edit">${ic('op_arrange', 'big')}布置</button>
          <button class="big-btn coral ${S.guide === 4 ? 'pulse' : ''}" data-act="share">${ic('op_share', 'big')}晒工位<em>赚钻</em></button>
          <button class="big-btn" data-go="shop:theme">${ic('op_theme', 'big')}主题</button>
        </div>`;
      const sets = setStatus().filter(s => s.placed > 0).sort((a, b) => b.placed / b.items.length - a.placed / a.items.length).slice(0, 2);
      html += `<div class="panel"><div class="panel-h"><b>今日小目标</b><button class="link" data-go="me">全部 ›</button></div>
        ${D.TASKS.filter(t => !S.daily.claimed.includes(t.id)).slice(0, 3).map(taskRow).join('') || '<p class="muted">今天的任务都完成啦，休息一下吧～</p>'}</div>`;
      if (sets.length) html += `<div class="panel"><div class="panel-h"><b>套装进度</b><button class="link" data-go="book:sets">图鉴 ›</button></div>
        ${sets.map(s => `<div class="set-mini"><span>${esc(s.name)}</span><div class="bar"><i style="width:${(s.placed / s.items.length) * 100}%"></i></div><small>${s.placed}/${s.items.length}${s.placed === s.items.length ? ' · 舒适+' + s.bonus : ''}</small></div>`).join('')}</div>`;
    } else {
      const avail = D.ITEMS.filter(i => owns(i.id) && !placedIds().has(i.id) && (ED.cat === 'all' || i.cat === ED.cat));
      html += `<div class="tray">
          <div class="tray-h"><button data-act="undo" ${ED.undo.length ? '' : 'disabled'}>${ic('edit_undo')}撤销</button><button data-act="clearAll">${ic('edit_stow_all')}全部收回</button><button class="done ${S.guide === 3 ? 'pulse' : ''}" data-act="done">${ic('edit_done')}完成</button></div>
          ${S.guide === 2 || S.guide === 3 ? `<p class="tray-tip">${GUIDE[S.guide]}</p>` : ''}
          <div class="chips">${chips([{ id: 'all', name: '全部' }].concat(D.CATS), ED.cat, 'trayCat')}</div>
          <div class="tray-list">${avail.map(i => `<button class="tray-it r-${i.rarity}" data-act="put" data-id="${i.id}"><img src="${i.img}" alt=""><small>${esc(i.name)}</small></button>`).join('') || '<p class="muted pad">这一类的物品都摆上去啦，去商店或扭蛋收集更多吧</p>'}</div>
        </div>`;
    }
    pg.innerHTML = html;
    fitStage();
  }

  /* ---------------- 页面：背包 ---------------- */
  const UI = { tab: 'desk', bagCat: 'all', shopTab: 'daily', bookTab: 'items', bookCat: 'all', bookEra: 'all' };
  function itemCard(i, extra = '', act = 'detail') {
    const has = owns(i.id);
    return `<button class="card r-${i.rarity} ${has ? '' : 'locked'}" data-act="${act}" data-id="${i.id}">
      <span class="rar">${D.RARITY[i.rarity].name}</span><img src="${i.img}" alt="" loading="lazy"><b>${has ? esc(i.name) : '？？？'}</b><small>${ERA_NAME[i.era]}</small>${extra}</button>`;
  }
  function renderBag() {
    const pl = placedIds();
    const list = D.ITEMS.filter(i => owns(i.id) && (UI.bagCat === 'all' || i.cat === UI.bagCat));
    $('#page-bag').innerHTML = `<div class="page-h"><h2>背包</h2><p>已拥有 <b>${ownedCount()}</b> 件 · 碎片 <b>${shardTag(S.shards)}</b> · 工位 ${S.placed.length}/${maxPlaced()}</p></div>
      <div class="chips sticky">${chips([{ id: 'all', name: '全部' }].concat(D.CATS), UI.bagCat, 'bagCat')}</div>
      <div class="grid">${list.map(i => itemCard(i, pl.has(i.id) ? '<em class="ribbon">已摆放</em>' : '')).join('') || '<p class="muted pad">还没有这类物品，去商店逛逛吧</p>'}</div>`;
  }
  function itemDetail(id) {
    const i = ITEM[id], has = owns(id), placed = placedIds().has(id), R = D.RARITY[i.rarity];
    const sets = D.SETS.filter(s => s.items.includes(id)).map(s => s.name);
    modal(`<div class="detail r-${i.rarity}">
        <div class="d-img ${has ? '' : 'locked'}"><img src="${i.img}" alt=""></div>
        <span class="rar-b">${R.name}</span>
        <h3>${has ? esc(i.name) : '未获得的物品'}</h3>
        <p class="meta">${ERA_NAME[i.era]} · ${CAT[i.cat].name} · No.${i.key}</p>
        <p class="story">「${has ? esc(i.story) : '收集后解锁它的小故事'}」</p>
        <div class="d-tags"><span>舒适 +${i.comfort}</span><span>${{ desk: '桌面', floor: '地面', wall: '墙面' }[i.slot]}</span>${sets.map(s => `<span class="set">${esc(s)}</span>`).join('')}</div>
        <div class="d-btns">
          ${has ? (placed ? `<button class="btn" data-act="unplaceId" data-id="${id}">从工位收回</button>` : `<button class="btn green" data-act="placeNow" data-id="${id}">摆上工位</button>`)
        : `<button class="btn coral" data-act="swap" data-id="${id}">碎片兑换 ${shardTag(R.swap)}</button><button class="btn" data-act="toGacha">去扭蛋</button>`}
        </div>
        ${has ? '' : `<p class="muted small">当前碎片 ${S.shards}，重复扭到的物品会自动转化为碎片</p>`}
      </div>`, { cls: 'm-detail' });
  }

  /* ---------------- 页面：商店 ---------------- */
  function priceOf(i, r) {
    if (i.rarity === 'N') return { cur: 'coin', price: Math.round((D.RARITY.N.coin * (0.8 + r() * 0.6)) / 10) * 10 };
    if (i.rarity === 'R') return r() < 0.5 ? { cur: 'coin', price: Math.round((D.RARITY.R.coin * (0.9 + r() * 0.4)) / 10) * 10 } : { cur: 'gem', price: D.RARITY.R.gem };
    return { cur: 'gem', price: D.RARITY[i.rarity].gem };
  }
  function dailyShop() {
    if (S.daily.shop) return S.daily.shop;
    const r = rng(hash(S.daily.date + '#' + S.daily.refresh + '#' + ownedCount()));
    const w = { N: 5, R: 3, SR: 1.3, SSR: 0.45 };
    let pool = D.ITEMS.filter(i => !owns(i.id));
    if (pool.length < 6) pool = D.ITEMS.slice();
    const res = [];
    while (res.length < 6 && pool.length) {
      const tot = pool.reduce((a, i) => a + w[i.rarity], 0);
      let x = r() * tot, k = 0;
      for (; k < pool.length - 1; k++) { x -= w[pool[k].rarity]; if (x <= 0) break; }
      const i = pool.splice(k, 1)[0];
      const pr = priceOf(i, r);
      res.push({ id: i.id, cur: pr.cur, price: pr.price, orig: pr.price, sold: false });
    }
    if (res[0]) { res[0].deal = true; res[0].price = Math.round(res[0].orig * 0.7); }
    S.daily.shop = res; save();
    return res;
  }
  function countdown() {
    const d = new Date(); const ms = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) - d;
    return `${Math.floor(ms / 3600000)}小时${Math.floor((ms % 3600000) / 60000)}分`;
  }
  function renderShop() {
    const tabs = [{ id: 'daily', name: '每日精选' }, { id: 'gacha', name: '扭蛋' }, { id: 'pack', name: '礼包' }, { id: 'theme', name: '主题' }, { id: 'gem', name: '赚钻' }];
    let body = '';
    if (UI.shopTab === 'daily') {
      const list = dailyShop();
      body = `<div class="shop-top"><p>每日 0 点刷新 · 剩余 <b class="cd">${countdown()}</b></p><button class="chip-btn" data-act="refreshShop">${ic('hud_refresh')}刷新 ${gemTag(E.shopRefreshGem)}</button></div>
        <div class="grid">${list.map((s, k) => {
          const i = ITEM[s.id], sold = s.sold || owns(s.id);
          return `<div class="card shop-card r-${i.rarity} ${sold ? 'sold' : ''}" data-act="detail" data-id="${i.id}">
            ${s.deal ? '<em class="deal">限时 7 折</em>' : ''}<span class="rar">${D.RARITY[i.rarity].name}</span>
            <img src="${i.img}" alt=""><b>${esc(i.name)}</b><small>${ERA_NAME[i.era]}</small>
            <button class="buy" data-act="buy" data-k="${k}" ${sold ? 'disabled' : ''}>${sold ? '已拥有' : (s.deal ? `<s>${s.orig}</s>` : '') + priceTag(s.cur, s.price)}</button></div>`;
        }).join('')}</div>`;
    } else if (UI.shopTab === 'gacha') {
      const left = D.GACHA.pity - S.pity;
      body = `<div class="gacha">
          <div class="machine" id="machine">
            <div class="dome">${[[10,72],[24,64],[38,70],[52,62],[66,70],[78,64],[16,50],[31,46],[46,42],[60,48],[74,44],[24,28],[42,24],[58,30]].map(([x, y], k) => `<i class="cap c${k % 5}" style="left:${x}%;top:${y}%"></i>`).join('')}</div>
            <div class="m-body"><div class="m-label">时光扭蛋</div><div class="knob" id="knob"><i></i></div><div class="slot"></div></div>
          </div>
          <p class="pity">再扭 <b>${left}</b> 次必得 <span class="c-ssr">传说</span> 物品 · 十连必出 <span class="c-r">稀有</span> 以上</p>
          <div class="g-btns">
            ${S.daily.freePull ? `<button class="btn green" data-act="pull" data-n="1" data-free="1">今日免费扭一次</button>` : `<button class="btn" data-act="pull" data-n="1">扭 1 次 ${gemTag(D.GACHA.single)}</button>`}
            <button class="btn coral" data-act="pull" data-n="10">扭 10 次 ${gemTag(D.GACHA.ten)}<em>9折</em></button>
          </div>
          <div class="rates">${Object.entries(D.GACHA.rates).map(([k, v]) => `<span class="r-${k}">${D.RARITY[k].name} ${(v * 100).toFixed(1)}%</span>`).join('')}</div>
          <p class="muted small">重复的物品会转化为碎片（当前 ${S.shards}），碎片可以在图鉴里兑换指定物品</p>
        </div>`;
    } else if (UI.shopTab === 'pack') {
      body = D.ERA_PACKS.map(pk => {
        const bought = S.packs.includes(pk.id), all = pk.items.every(owns);
        return `<div class="pack ${bought ? 'sold' : ''}"><div class="pack-h"><b>${ic('hud_gift')}${esc(pk.name)}</b><span class="era-b">${ERA_NAME[pk.tag]}</span></div>
          <div class="pack-items">${pk.items.map(id => `<span class="r-${ITEM[id].rarity}" data-act="detail" data-id="${id}"><img src="${ITEM[id].img}" alt="">${owns(id) ? '<i>✓</i>' : ''}</span>`).join('')}</div>
          <div class="pack-f"><small>${pk.items.map(id => ITEM[id].name).join(' · ')}</small>
          <button class="btn coral sm" data-act="buyPack" data-id="${pk.id}" ${bought || all ? 'disabled' : ''}>${bought ? '已购买' : all ? '已集齐' : gemTag(pk.gem)}</button></div></div>`;
      }).join('') + '<p class="muted small center">礼包中已拥有的物品会转化为碎片</p>';
    } else if (UI.shopTab === 'theme') {
      const lv = lvInfo().lv;
      const KINDS = [['home', '居家房间'], ['office', '写字楼办公'], ['factory', '工厂车间']];
      body = KINDS.map(([kind, kname]) => `<h4 class="t-group">${kname}</h4><div class="grid two">${D.THEMES.filter(t => (t.kind || 'home') === kind).map(t => {
        const has = S.themes.includes(t.id), using = S.theme === t.id, lock = !S.gm && t.level && lv < t.level;
        return `<div class="theme-card ${using ? 'using' : ''}"><div class="t-prev">${roomSVG(t, t.dark ? 'night' : 'day')}</div><b>${esc(t.name)}</b>
          <button class="btn sm ${using ? '' : has ? 'green' : 'coral'}" data-act="theme" data-id="${t.id}" ${using || (!has && lock) ? 'disabled' : ''}>
          ${using ? '使用中' : has ? '使用' : lock ? `Lv.${t.level} 解锁` : priceTag(t.cur, t.price)}</button></div>`;
      }).join('')}</div>`).join('');
    } else {
      const sh = S.daily.shares, next = sh === 0 ? E.shareFirstGem : E.shareGem;
      body = `<div class="earn">
          <div class="earn-card hl"><div><b>晒工位赚钻石</b><p>生成工位海报分享到小红书，今日 ${Math.min(sh, E.shareMax)}/${E.shareMax}，首次分享奖励翻倍</p></div>
            <button class="btn coral" data-act="share" ${sh >= E.shareMax ? 'disabled' : ''}>${sh >= E.shareMax ? '明日再来' : '+' + next + ' 钻'}</button></div>
          <div class="earn-card"><div><b>邀请好友来参观</b><p>复制邀请口令发给好友，每日 1 次</p></div>
            <button class="btn" data-act="invite" ${S.daily.invites ? 'disabled' : ''}>${S.daily.invites ? '已领取' : '+' + E.inviteGem + ' 钻'}</button></div>
          <div class="earn-card"><div><b>金币兑换钻石</b><p>${coinTag(1200)} → ${gemTag(10)}，今日剩余 ${3 - S.daily.exchange} 次</p></div>
            <button class="btn" data-act="exchange" ${S.daily.exchange >= 3 ? 'disabled' : ''}>兑换</button></div>
          <div class="earn-card"><div><b>每日签到</b><p>连续签到，第 7 天送稀有物品</p></div><button class="btn" data-go="me">去签到</button></div>
          <div class="earn-card"><div><b>任务、套装与成就</b><p>每日任务、活跃宝箱、集齐套装和成就都有钻石</p></div><button class="btn" data-go="me">去看看</button></div>
          <div class="earn-card"><div><b>摸摸工位小猫</b><p>每天第一次摸摸它，会得到 ${gemTag(5)}</p></div><button class="btn" data-go="desk">去工位</button></div>
          <p class="muted small center">钻石仅为游戏内奖励，不支持充值与提现</p></div>`;
    }
    $('#page-shop').innerHTML = `<div class="page-h"><h2>商店</h2><p>收集横跨五十年的工位好物</p></div>
      <div class="seg">${tabs.map(t => `<button class="${UI.shopTab === t.id ? 'on' : ''}" data-act="shopTab" data-id="${t.id}">${t.name}${t.id === 'gacha' && S.daily.freePull ? '<em class="dot on"></em>' : ''}</button>`).join('')}</div>
      <div class="shop-body">${body}</div>`;
  }

  /* 扭蛋 */
  let pulling = false;
  function rollRarity() {
    const x = Math.random(); let acc = 0;
    for (const [k, v] of Object.entries(D.GACHA.rates)) { acc += v; if (x < acc) return k; }
    return 'N';
  }
  function doPull(n, free) {
    if (pulling) return;
    const cost = n === 1 ? D.GACHA.single : D.GACHA.ten;
    if (free) { if (!S.daily.freePull) return; S.daily.freePull = false; }
    else if (!spend('gem', cost)) return;
    pulling = true;
    const rars = [];
    for (let k = 0; k < n; k++) {
      S.pity++;
      const r = S.pity >= D.GACHA.pity ? 'SSR' : rollRarity();
      if (r === 'SSR') S.pity = 0;
      rars.push(r);
    }
    if (n === 10 && rars.every(r => r === 'N')) rars[9] = 'R';
    const res = rars.map(r => {
      const pool = D.ITEMS.filter(i => i.rarity === r);
      const fresh = pool.filter(i => !owns(i.id));
      return grantItem((fresh.length && Math.random() < 0.6 ? pick(fresh) : pick(pool)).id);
    });
    S.pulls += n; task('gacha'); addXp(8 * n); save();
    renderHud();
    const m = $('#machine'), k = $('#knob');
    m && m.classList.add('shake'); k && k.classList.add('turn');
    sfx('gacha');
    setTimeout(() => { pulling = false; m && m.classList.remove('shake'); k && k.classList.remove('turn'); showPull(res, n); refresh(); }, 900);
  }
  function showPull(res, n, title) {
    const best = res.reduce((a, r) => Math.max(a, RANK[ITEM[r.id].rarity]), 0);
    if (best >= 2) setTimeout(() => sfx('ssr'), 500);
    const cards = res.map((r, k) => {
      const i = ITEM[r.id];
      return `<div class="g-card r-${i.rarity}" style="animation-delay:${n === 1 ? 0.9 : 0.15 + k * 0.12}s"><span class="rar">${D.RARITY[i.rarity].name}</span><img src="${i.img}" alt=""><b>${esc(i.name)}</b>
        ${r.dup ? `<small class="dup">碎片 +${r.shard}</small>` : '<small class="new">NEW</small>'}</div>`;
    }).join('');
    const again = title ? '' : `<button class="btn coral" data-act="pull" data-n="${n}">再扭 ${n} 次 ${gemTag(n === 1 ? D.GACHA.single : D.GACHA.ten)}</button>`;
    modal(`<div class="pull ${best >= 3 ? 'legend' : ''}"><h3>${title || (best >= 3 ? '✦ 传说降临 ✦' : best >= 2 ? '哇，是史诗物品！' : '扭蛋结果')}</h3>
      ${n === 1 ? `<div class="capsule c${RANK[ITEM[res[0].id].rarity]}"><i class="top"></i><i class="bot"></i></div>` : ''}
      <div class="g-grid n${n}">${cards}</div>
      <div class="d-btns"><button class="btn" data-act="close">收下</button>${again}</div></div>`, { cls: 'm-pull' });
  }

  /* ---------------- 页面：图鉴 ---------------- */
  function renderBook() {
    const oc = ownedCount();
    const tabs = [{ id: 'items', name: '物品' }, { id: 'sets', name: '套装' }, { id: 'eras', name: '年代' }];
    let body = '';
    if (UI.bookTab === 'items') {
      const list = D.ITEMS.filter(i => (UI.bookCat === 'all' || i.cat === UI.bookCat) && (UI.bookEra === 'all' || i.era === UI.bookEra));
      body = `<div class="chips">${chips([{ id: 'all', name: '全部' }].concat(D.CATS), UI.bookCat, 'bookCat')}</div>
        <div class="chips">${chips([{ id: 'all', name: '全部年代' }].concat(D.ERAS.map(e => ({ id: e, name: ERA_NAME[e] }))), UI.bookEra, 'bookEra')}</div>
        <div class="grid">${list.map(i => itemCard(i)).join('')}</div>`;
    } else if (UI.bookTab === 'sets') {
      body = setStatus().map(s => {
        const done = s.owned === s.items.length, claimed = S.setsClaimed.includes(s.id);
        return `<div class="set-card ${done ? 'done' : ''}"><div class="pack-h"><b>${esc(s.name)}</b><small>${esc(s.desc)}</small></div>
          <div class="pack-items">${s.items.map(id => `<span class="r-${ITEM[id].rarity} ${owns(id) ? '' : 'locked'}" data-act="detail" data-id="${id}"><img src="${ITEM[id].img}" alt=""></span>`).join('')}</div>
          <div class="pack-f"><small>收集 ${s.owned}/${s.items.length} · 摆满 ${s.placed}/${s.items.length}（舒适+${s.bonus}）</small>
          <button class="btn sm ${done && !claimed ? 'coral' : ''}" data-act="claimSet" data-id="${s.id}" ${!done || claimed ? 'disabled' : ''}>${claimed ? '已领取' : gemTag(s.gem)}</button></div></div>`;
      }).join('');
    } else {
      body = D.ERAS.map(e => {
        const all = D.ITEMS.filter(i => i.era === e), have = all.filter(i => owns(i.id)).length;
        return `<button class="era-row" data-act="eraGo" data-id="${e}"><b>${ERA_NAME[e]}</b><div class="bar"><i style="width:${(have / all.length) * 100}%"></i></div><small>${have}/${all.length}</small></button>`;
      }).join('') + '<p class="muted small center">年代表示造型参考，并非发明年份</p>';
    }
    $('#page-book').innerHTML = `<div class="page-h"><h2>时光图鉴</h2><p>已收集 <b>${oc}</b>/100 · 碎片 ${shardTag(S.shards)}</p><div class="bar big"><i style="width:${oc}%"></i></div></div>
      <div class="seg">${tabs.map(t => `<button class="${UI.bookTab === t.id ? 'on' : ''}" data-act="bookTab" data-id="${t.id}">${t.name}</button>`).join('')}</div>${body}`;
  }

  /* ---------------- 页面：我的 ---------------- */
  const actPts = () => D.TASKS.filter(t => S.daily.claimed.includes(t.id)).reduce((a, t) => a + t.pts, 0);
  const rewardText = r => [r.coin ? coinTag(r.coin) : '', r.gem ? gemTag(r.gem) : '', r.box ? '<span class="tag-item">稀有物品</span>' : ''].join('');
  function taskRow(t) {
    const v = S.daily.tasks[t.id] || 0, done = v >= t.goal, claimed = S.daily.claimed.includes(t.id);
    const go = { place: 'edit', tap: 'goto:desk', gacha: 'goto:shop:gacha', share: 'share', buy: 'goto:shop:daily', income: 'goto:desk', login: 'goto:desk' }[t.id];
    const act = go.startsWith('goto:') ? `data-act="goto" data-id="${go.slice(5)}"` : `data-act="${go}"`;
    return `<div class="task ${claimed ? 'claimed' : ''}"><div><b>${esc(t.name)}</b><small>${v}/${t.goal} · 活跃+${t.pts} ${rewardText(t)}</small></div>
      ${claimed ? '<span class="ok">✓</span>' : done ? `<button class="btn sm coral" data-act="claimTask" data-id="${t.id}">领取</button>` : `<button class="btn sm" ${act}>去完成</button>`}</div>`;
  }
  function renderMe() {
    const st = stats(), li = lvInfo(), pts = actPts(), canSign = S.sign.last !== today();
    const cycle = canSign ? S.sign.days % 7 : (S.sign.days - 1) % 7;
    const achs = D.ACHIEVEMENTS.map(a => ({ ...a, ok: a.test(st), got: S.achClaimed.includes(a.id) })).sort((a, b) => (b.ok && !b.got) - (a.ok && !a.got) || a.got - b.got);
    $('#page-me').innerHTML = `
      <div class="profile"><div class="avatar">${CAT_SVG}</div><div class="p-info"><b>${esc(S.name)}</b><small>Lv.${li.lv} · ${styleTag()} · 已陪伴 ${Math.max(1, Math.ceil((Date.now() - S.created) / 86400000))} 天</small>
        <div class="bar"><i style="width:${(li.cur / li.need) * 100}%"></i></div><small>经验 ${li.cur}/${li.need} · 摆放上限 ${maxPlaced()}</small></div></div>
      <div class="p-stats"><div><b>${st.comfort}</b><small>舒适度</small></div><div><b>${st.ownedCount}</b><small>收藏</small></div><div><b>${st.sets}</b><small>套装</small></div><div><b>${S.shares}</b><small>分享</small></div></div>
      <div class="panel"><div class="panel-h"><b>七日签到</b><small>累计 ${S.sign.days} 天</small></div>
        <div class="sign">${D.SIGNIN.map((r, k) => {
          const got = canSign ? k < cycle : k <= cycle, cur = canSign && k === cycle;
          return `<div class="s-day ${got ? 'got' : ''} ${cur ? 'cur' : ''} ${k === 6 ? 'big' : ''}"><small>第${k + 1}天</small>${rewardText(r)}${got ? '<i>✓</i>' : ''}</div>`;
        }).join('')}</div>
        <button class="btn ${canSign ? 'coral' : ''} wide" data-act="sign" ${canSign ? '' : 'disabled'}>${canSign ? '签到领奖' : '今日已签到，明天见'}</button></div>
      <div class="panel"><div class="panel-h"><b>每日任务</b><small>活跃 ${pts}/120</small></div>
        <div class="chests"><div class="bar"><i style="width:${Math.min(100, (pts / 120) * 100)}%"></i></div>
        ${D.CHESTS.map((c, k) => { const ok = pts >= c.pts, got = S.daily.chests.includes(k); return `<button class="chest ${ok && !got ? 'ready' : ''} ${got ? 'got' : ''}" style="left:${(c.pts / 120) * 100}%" data-act="chest" data-id="${k}" ${ok && !got ? '' : 'disabled'}>${ic('hud_chest', 'big')}<small>${c.pts}</small></button>`; }).join('')}</div>
        ${D.TASKS.map(taskRow).join('')}</div>
      <div class="panel"><div class="panel-h"><b>成就</b><small>${S.achClaimed.length}/${D.ACHIEVEMENTS.length}</small></div>
        ${achs.map(a => `<div class="task ${a.got ? 'claimed' : ''}"><div><b>${esc(a.name)}</b><small>${esc(a.desc)} · ${gemTag(a.gem)}</small></div>
          ${a.got ? '<span class="ok">✓</span>' : `<button class="btn sm ${a.ok ? 'coral' : ''}" data-act="claimAch" data-id="${a.id}" ${a.ok ? '' : 'disabled'}>${a.ok ? '领取' : '未达成'}</button>`}</div>`).join('')}</div>
      <div class="panel"><div class="panel-h"><b>设置</b></div>
        <div class="set-row"><span>音效</span><button class="switch ${S.sound ? 'on' : ''}" data-act="sound"><i></i></button></div>
        <div class="set-row"><span>工位名称</span><button class="btn sm" data-act="rename">修改</button></div>
        <div class="set-row"><span>新手引导</span><button class="btn sm" data-act="replayGuide">重新查看</button></div>
        <div class="set-row"><span>重置存档</span><button class="btn sm red" data-act="reset">重置</button></div>
        <p class="muted small">完美工位 v1.0 · 本地存档 · 平台：${P.name}</p></div>`;
  }

  /* ---------------- 分享海报（Canvas） ---------------- */
  const imgCache = {};
  const loadImg = src => imgCache[src] || (imgCache[src] = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }));
  // 海报用内嵌图片数据，避免 file:// 下 Canvas 被跨域污染；首次分享时才加载，不影响启动速度
  let itemDataReady = null;
  function loadItemData() {
    if (window.PW_ITEM_DATA) return Promise.resolve();
    return itemDataReady || (itemDataReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'js/items-data.js'; s.onload = res; s.onerror = () => { itemDataReady = null; rej(new Error('items-data')); };
      document.head.appendChild(s);
    }));
  }
  const posterSrc = it => (window.PW_ITEM_DATA && window.PW_ITEM_DATA[it.id]) || it.img;
  function box(g, x, y, w, h, fill, border) {
    g.fillStyle = border; g.fillRect(x, y, w, h);
    g.fillStyle = fill; g.fillRect(x + 4, y + 4, w - 8, h - 8);
  }
  async function renderPoster() {
    await loadItemData();
    const W = 720, H = 1240, th = theme(), mode = timeMode(), st = stats();
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = th.dark ? '#2b2540' : '#f6efe3'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(0,0,0,.05)';
    for (let y = 0; y < H; y += 24) for (let x = (y / 24) % 2 ? 12 : 0; x < W; x += 24) g.fillRect(x, y, 4, 4);
    box(g, 24, 24, W - 48, H - 48, th.dark ? '#352e52' : '#fffaf1', '#4b3a3a');
    const font = '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif';
    g.fillStyle = th.dark ? '#ffe7c4' : '#4b3a3a';
    g.font = `bold 46px ${font}`; g.fillText(S.name, 64, 104);
    g.font = `26px ${font}`; g.fillStyle = '#e07a5f'; g.fillText(`# ${styleTag()}   Lv.${lvInfo().lv}`, 66, 146);
    g.save(); g.translate(48, 170); g.scale(1.733, 1.733);
    drawRoom(g, th, mode);
    const list = S.placed.slice().sort((a, b) => zOf(a) - zOf(b));
    for (const p of list) {
      const it = ITEM[p.id];
      try {
        const im = await loadImg(posterSrc(it));
        g.save();
        g.translate(p.x, p.y - it.h / 2);
        if (p.r) g.rotate((p.r * Math.PI) / 180);
        if (p.f) g.scale(-1, 1);
        g.drawImage(im, -it.w / 2, -it.h / 2, it.w, it.h);
        g.restore();
      } catch (e) {}
    }
    if (mode !== 'day') {
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = mode === 'night' ? 'rgba(70,74,150,.5)' : 'rgba(255,170,120,.28)';
      g.fillRect(0, 0, SW, SH);
      g.globalCompositeOperation = 'screen';
      S.placed.filter(p => LAMPS.includes(p.id) && !p.off).forEach(p => {
        const y = p.y - ITEM[p.id].h * 0.55, gr = g.createRadialGradient(p.x, y, 4, p.x, y, 80);
        gr.addColorStop(0, 'rgba(255,214,140,.75)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
        g.fillStyle = gr; g.fillRect(p.x - 80, y - 80, 160, 160);
      });
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    [['舒适度', st.comfort], ['收藏', st.ownedCount + '/100'], ['套装', st.sets + '/10']].forEach(([k, v], n) => {
      const x = 64 + n * 204, y = 960;
      box(g, x, y, 188, 120, n === 0 ? '#f9d9c9' : n === 1 ? '#d9ead9' : '#e6ddf2', '#4b3a3a');
      g.fillStyle = '#4b3a3a'; g.font = `bold 40px ${font}`; g.fillText(String(v), x + 22, y + 62);
      g.font = `24px ${font}`; g.fillStyle = '#7b6a62'; g.fillText(k, x + 22, y + 98);
    });
    g.fillStyle = th.dark ? '#ffe7c4' : '#4b3a3a'; g.font = `bold 32px ${font}`; g.fillText('完美工位', 64, 1150);
    g.font = `22px ${font}`; g.fillStyle = '#9a8a80'; g.fillText('像素治愈放置 · 来打造你理想中的工位', 64, 1186);
    // 像素小猫印章
    g.save(); g.translate(568, 1108); g.scale(5.5, 5.5);
    const cat = [[1, 2, 1, 4, '#4b3a3a'], [2, 5, 10, 5, '#4b3a3a'], [3, 6, 8, 3, '#eea35d'], [10, 2, 6, 6, '#4b3a3a'], [11, 3, 4, 4, '#eea35d'], [10, 1, 1, 1, '#4b3a3a'], [15, 1, 1, 1, '#4b3a3a'], [12, 4, 1, 1, '#4b3a3a'], [14, 4, 1, 1, '#4b3a3a'], [13, 5, 1, 1, '#f19aa0'], [3, 10, 1, 2, '#4b3a3a'], [10, 10, 1, 2, '#4b3a3a']];
    cat.forEach(([x, y, w, h, f]) => { g.fillStyle = f; g.fillRect(x, y, w, h); });
    g.restore();
    return new Promise(r => c.toBlob(r, 'image/png'));
  }
  const shareText = () => `我在「完美工位」打造了我的${styleTag()}工位！舒适度 ${comfort()}，收藏了 ${ownedCount()}/100 件跨越五十年的好物 ✨ #完美工位 #我的工位 #像素风`;
  let shareBlob = null;
  async function openShare() {
    if (ED.on) { exitEdit(); refresh(); }
    toast('正在生成工位海报…');
    try { shareBlob = await renderPoster(); } catch (e) { toast('海报生成失败，请稍后重试', 'warn'); return; }
    const url = URL.createObjectURL(shareBlob);
    const sh = S.daily.shares, left = Math.max(0, E.shareMax - sh), next = sh === 0 ? E.shareFirstGem : E.shareGem;
    modal(`<div class="share"><h3>晒出我的工位</h3><img class="poster" src="${url}" alt="工位海报">
      <p class="s-text">${esc(shareText())}</p>
      <p class="muted small">${left ? `分享成功可得 ${gemTag(next)}（今日剩余 ${left} 次）` : '今日分享奖励已领完，依然可以分享哦'}</p>
      <div class="d-btns"><button class="btn" data-act="copyText">复制文案</button><button class="btn coral" data-act="doShare">分享 / 保存</button></div></div>`,
      { cls: 'm-share', onClose: () => setTimeout(() => URL.revokeObjectURL(url), 1000) });
  }
  async function doShare() {
    if (!shareBlob) return;
    const r = await P.shareImage(shareBlob, shareText());
    if (!r.ok) { toast('分享已取消'); return; }
    S.shares++; S.daily.shares++; task('share'); addXp(30);
    if (S.guide === 4) S.guide = 5;
    closeModal();
    if (S.daily.shares <= E.shareMax) { toast(r.method === 'download' ? '海报已保存，快去小红书发布吧' : '分享成功！'); give({ gem: S.daily.shares === 1 ? E.shareFirstGem : E.shareGem }); }
    else { save(); refresh(); toast(r.method === 'download' ? '海报已保存' : '分享成功！'); }
  }

  /* ---------------- 交互分发 ---------------- */
  function go(tab, sub) {
    if (ED.on && tab !== 'desk') exitEdit();
    UI.tab = tab;
    if (tab === 'shop' && sub) UI.shopTab = sub;
    if (tab === 'book' && sub) UI.bookTab = sub;
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + tab));
    $$('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $('.pages').scrollTop = 0;
    closeModal();
    refresh();
  }
  function exitEdit() {
    ED.on = false; ED.sel = null; ED.undo = [];
    if (S.guide === 2 || S.guide === 3) S.guide = 4;
    save();
  }
  function ask(text, ok) {
    modal(`<div class="confirm"><p>${text}</p><div class="d-btns"><button class="btn" data-act="close">取消</button><button class="btn coral" data-act="confirmOk">确定</button></div></div>`, { cls: 'm-small' });
    askOk = ok;
  }
  let askOk = null;
  const sel = () => S.placed.find(q => q.uid === ED.sel);

  const ACT = {
    close: closeModal,
    confirmOk() { const f = askOk; askOk = null; closeModal(); f && f(); },
    goto: el => { const [t, s] = el.dataset.id.split(':'); go(t, s); },
    edit() { if (UI.tab !== 'desk') go('desk'); ED.on = true; ED.sel = null; ED.undo = []; if (S.guide === 1) S.guide = 2; save(); renderDesk(); },
    done() { exitEdit(); sfx('coin'); toast('布局已保存 ✓'); refresh(); },
    trayCat: el => { ED.cat = el.dataset.id; renderDesk(); },
    put: el => { if (placeItem(+el.dataset.id)) refresh(); },
    flip() { const p = sel(); if (!p) return; ED.undo.push(snapshot()); p.f = p.f ? 0 : 1; save(); renderDesk(); },
    rot0() { const p = sel(); if (!p || !p.r) return; ED.undo.push(snapshot()); p.r = 0; syncRot(p); save(); },
    unplace() { if (ED.sel) { unplace(ED.sel); sfx('drop'); refresh(); } },
    undo() { const s = ED.undo.pop(); if (s) { S.placed = JSON.parse(s); ED.sel = null; save(); refresh(); } },
    clearAll() { ask('把工位上的物品全部收回背包？', () => { ED.undo.push(snapshot()); S.placed = []; ED.sel = null; save(); refresh(); }); },
    income() {
      const n = pendingIncome(); if (n <= 0) return;
      S.lastIncome = Date.now(); task('income'); addXp(5);
      give({ coin: n });
    },
    time() { const o = ['auto', 'day', 'dusk', 'night']; S.time = o[(o.indexOf(S.time) + 1) % 4]; save(); renderDesk(); },
    rename() {
      modal(`<div class="confirm"><h3>给工位起个名字</h3><input id="nameIn" maxlength="12" value="${esc(S.name)}"><div class="d-btns"><button class="btn" data-act="close">取消</button><button class="btn coral" data-act="saveName">保存</button></div></div>`, { cls: 'm-small' });
      setTimeout(() => $('#nameIn') && $('#nameIn').focus(), 50);
    },
    saveName() { const v = ($('#nameIn').value || '').trim(); if (v) { S.name = v; save(); } closeModal(); refresh(); },
    skipGuide() { S.guide = 5; save(); renderDesk(); },
    replayGuide() { S.guide = 0; save(); go('desk'); welcome(); },
    share: openShare, doShare,
    copyText: async () => { toast((await P.copyText(shareText())) ? '文案已复制' : '复制失败，请长按手动复制'); },
    detail: el => itemDetail(+el.dataset.id),
    bagCat: el => { UI.bagCat = el.dataset.id; renderBag(); },
    placeNow: el => { const id = +el.dataset.id; closeModal(); go('desk'); ED.on = true; ED.undo = []; placeItem(id); refresh(); },
    unplaceId: el => { const p = S.placed.find(q => q.id === +el.dataset.id); if (p) unplace(p.uid); closeModal(); refresh(); toast('已收回背包'); },
    swap: el => {
      const i = ITEM[+el.dataset.id], cost = D.RARITY[i.rarity].swap;
      if (S.shards < cost) { sfx('err'); toast(`碎片不足（${S.shards}/${cost}）`, 'warn'); return; }
      S.shards -= cost; grantItem(i.id); addXp(10); save(); sfx('coin'); toast(`兑换成功：${esc(i.name)}`); refresh(); itemDetail(i.id);
    },
    toGacha() { go('shop', 'gacha'); },
    shopTab: el => { UI.shopTab = el.dataset.id; renderShop(); },
    refreshShop() { if (!spend('gem', E.shopRefreshGem)) return; S.daily.refresh++; S.daily.shop = null; save(); sfx('pick'); refresh(); },
    buy: el => {
      const s = dailyShop()[+el.dataset.k]; if (!s || s.sold || owns(s.id)) return;
      if (!spend(s.cur, s.price)) return;
      s.sold = true; grantItem(s.id); task('buy'); addXp(10); save(); sfx('coin');
      toast(`购买成功：${esc(ITEM[s.id].name)}`); refresh();
    },
    pull: el => { closeModal(); if (UI.tab !== 'shop' || UI.shopTab !== 'gacha') go('shop', 'gacha'); doPull(+el.dataset.n, !!el.dataset.free); },
    buyPack: el => {
      const pk = D.ERA_PACKS.find(x => x.id === el.dataset.id); if (!pk || S.packs.includes(pk.id)) return;
      if (!spend('gem', pk.gem)) return;
      S.packs.push(pk.id);
      const got = pk.items.map(grantItem); addXp(20); save();
      refresh(); showPull(got, 4, pk.name);
    },
    theme: el => {
      const t = D.THEMES.find(x => x.id === el.dataset.id);
      if (!S.themes.includes(t.id)) { if (!spend(t.cur, t.price)) return; S.themes.push(t.id); addXp(15); toast(`解锁主题：${t.name}`); }
      S.theme = t.id;
      let moved = 0;
      S.placed.forEach(p => { const c = clampPos(ITEM[p.id], p.x, p.y); if (c.x !== p.x || c.y !== p.y) { p.x = c.x; p.y = c.y; moved++; } });
      save(); sfx('coin'); applyTheme(); refresh();
      if (moved) toast(`有 ${moved} 件物品超出新主题的摆放区，已移到边上，可以重新摆放`);
    },
    invite: async () => {
      if (S.daily.invites) return;
      await P.copyText(`来「完美工位」参观我的${styleTag()}工位吧！邀请口令 PW${hash(S.name + S.created).toString(36).slice(0, 6).toUpperCase()}`);
      S.daily.invites = 1; toast('邀请口令已复制，快发给好友吧'); give({ gem: E.inviteGem });
    },
    exchange() { if (S.daily.exchange >= 3) return; if (!spend('coin', 1200)) return; S.daily.exchange++; give({ gem: 10 }); },
    bookTab: el => { UI.bookTab = el.dataset.id; renderBook(); },
    bookCat: el => { UI.bookCat = el.dataset.id; renderBook(); },
    bookEra: el => { UI.bookEra = el.dataset.id; renderBook(); },
    eraGo: el => { UI.bookTab = 'items'; UI.bookEra = el.dataset.id; UI.bookCat = 'all'; renderBook(); },
    claimSet: el => { const s = D.SETS.find(x => x.id === el.dataset.id); if (S.setsClaimed.includes(s.id) || !s.items.every(owns)) return; S.setsClaimed.push(s.id); give({ gem: s.gem, xp: 20 }); },
    sign() { if (S.sign.last === today()) return; const r = D.SIGNIN[S.sign.days % 7]; S.sign.days++; S.sign.last = today(); give({ ...r, xp: 10 }); },
    claimTask: el => {
      const t = D.TASKS.find(x => x.id === el.dataset.id);
      if (S.daily.claimed.includes(t.id) || (S.daily.tasks[t.id] || 0) < t.goal) return;
      S.daily.claimed.push(t.id); give({ coin: t.coin, gem: t.gem, xp: t.pts });
    },
    chest: el => { const k = +el.dataset.id, c = D.CHESTS[k]; if (S.daily.chests.includes(k) || actPts() < c.pts) return; S.daily.chests.push(k); give(c); },
    claimAch: el => { const a = D.ACHIEVEMENTS.find(x => x.id === el.dataset.id); if (S.achClaimed.includes(a.id) || !a.test(stats())) return; S.achClaimed.push(a.id); give({ gem: a.gem, xp: 20 }); },
    sound() { S.sound = !S.sound; save(); refresh(); sfx('tap'); },
    reset() { ask('确定要重置全部进度吗？此操作无法撤销。', () => { P.clear(); location.reload(); }); },
    startGame() { S.guide = 1; save(); closeModal(); refresh(); },
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a && !a.disabled && ACT[a.dataset.act]) { e.stopPropagation(); ACT[a.dataset.act](a); return; }
    const g = e.target.closest('[data-go]');
    if (g) { const [t, s] = g.dataset.go.split(':'); go(t, s); return; }
    const t = e.target.closest('[data-tab]');
    if (t) { sfx('tap'); go(t.dataset.tab); }
  });
  $('#modalMask').addEventListener('click', e => { if (e.target.id === 'modalMask' && !e.currentTarget.dataset.lock) closeModal(); });
  /* GM 开关：连续快速点击喇叭 13 次（每次间隔 < 0.6 秒）开启或关闭 */
  const GM_TAPS = 13;
  let gmTaps = 0, gmLast = 0, gmSound = null;
  function gmUnlockAll() {
    D.ITEMS.forEach(i => { if (!owns(i.id)) { S.owned[i.id] = 1; if (i.rarity === 'SSR') S.ssr++; } });
    D.THEMES.forEach(t => { if (!S.themes.includes(t.id)) S.themes.push(t.id); });
  }
  function gmTap() {
    const now = Date.now();
    if (now - gmLast > 600) { gmTaps = 0; gmSound = S.sound; }
    gmLast = now;
    if (++gmTaps < GM_TAPS) return false;
    gmTaps = 0;
    S.sound = gmSound;
    S.gm = !S.gm;
    if (S.gm) gmUnlockAll();
    save(); refresh();
    toast(S.gm ? 'GM 模式已开启：全部物品与主题已解锁，金币钻石无限' : 'GM 模式已关闭，已解锁的内容会保留');
    return true;
  }
  $('#soundBtn').addEventListener('click', () => { if (!gmTap()) ACT.sound(); });
  $('#lvBadge').addEventListener('click', () => go('me'));

  /* 场景触控：编辑时拖拽，浏览时互动 */
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#stage')) return;
    if (e.target.closest('#cat') && !ED.on) {
      fx(catPos.x + 10, catPos.y - 12, '喵～', 'txt'); fx(catPos.x, catPos.y - 30, '♥', 'heart'); sfx('meow'); P.vibrate(10);
      if (!S.daily.cat) { S.daily.cat = true; toast('小猫蹭了蹭你'); give({ gem: 5 }); }
      return;
    }
    if (ED.on && e.target.closest('.rot-arm b')) { rotateDrag(e); return; }
    const el = e.target.closest('.it');
    if (!el) { if (ED.on && ED.sel) { ED.sel = null; renderDesk(); } return; }
    const p = S.placed.find(q => q.uid === el.dataset.uid); if (!p) return;
    if (!ED.on) { interact(p, el); return; }
    e.preventDefault();
    const it = ITEM[p.id], sc = stageScale(), sx = e.clientX, sy = e.clientY, ox = p.x, oy = p.y, before = snapshot();
    let moved = false;
    const wasSel = ED.sel === p.uid;
    ED.sel = p.uid;
    $$('.it.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel', 'drag');
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    const mv = ev => {
      const dx = (ev.clientX - sx) / sc, dy = (ev.clientY - sy) / sc;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      const c = clampPos(it, ox + dx, oy + dy);
      p.x = c.x; p.y = c.y;
      el.style.left = p.x - it.w / 2 + 'px'; el.style.top = p.y - it.h + 'px'; el.style.zIndex = zOf(p);
      if (wasSel) syncRot(p);
    };
    const up = () => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      if (moved) { ED.undo.push(before); save(); sfx('drop'); P.vibrate(6); }
      else if (!wasSel) sfx('tap');
      renderDesk();
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });

  /* 旋转：拖动手柄（靠近 0/45/90… 度时吸附）、滑动条、鼠标滚轮 */
  function rotateDrag(e) {
    const p = sel(); if (!p) return;
    e.preventDefault();
    const knob = e.target, before = snapshot(), r0 = p.r || 0;
    try { knob.setPointerCapture(e.pointerId); } catch (err) {}
    $('#stageWrap').classList.add('rotating');
    const mv = ev => {
      const box = $('#stage').getBoundingClientRect(), sc = stageScale(), g = armGeo(p);
      const dx = (ev.clientX - box.left) / sc - g.x, dy = (ev.clientY - box.top) / sc - g.y;
      let d = normDeg((Math.atan2(dx, -dy) * 180) / Math.PI);
      const near = Math.round(d / 45) * 45;
      if (Math.abs(d - near) <= 4) d = near % 360;
      p.r = d; syncRot(p);
    };
    const up = () => {
      knob.removeEventListener('pointermove', mv); knob.removeEventListener('pointerup', up); knob.removeEventListener('pointercancel', up);
      $('#stageWrap') && $('#stageWrap').classList.remove('rotating');
      if ((p.r || 0) !== r0) { ED.undo.push(before); save(); syncRot(p); sfx('drop'); P.vibrate(6); }
    };
    knob.addEventListener('pointermove', mv); knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
  }
  let rotBefore = null;
  document.addEventListener('input', e => {
    if (e.target.id !== 'rotRange') return;
    const p = sel(); if (!p) return;
    if (rotBefore === null) rotBefore = snapshot();
    p.r = normDeg(+e.target.value); syncRot(p);
  });
  document.addEventListener('change', e => {
    const p = sel();
    if (e.target.id !== 'rotRange' || rotBefore === null || !p) return;
    ED.undo.push(rotBefore); rotBefore = null; save(); syncRot(p);
  });
  let wheelT = 0;
  document.addEventListener('wheel', e => {
    if (!ED.on || !e.target.closest('#stage')) return;
    const p = sel(); if (!p) return;
    e.preventDefault();
    if (Date.now() - wheelT > 600) ED.undo.push(snapshot());
    wheelT = Date.now();
    p.r = normDeg((p.r || 0) + (e.deltaY > 0 ? 5 : -5)); syncRot(p); save();
  }, { passive: false });

  /* ---------------- 刷新 ---------------- */
  function renderHud() {
    const li = lvInfo();
    $('#lvNum').textContent = li.lv;
    $('#xpBar').style.width = (li.cur / li.need) * 100 + '%';
    $('#coinNum').textContent = S.gm ? '∞' : fmt(S.coin);
    $('#gemNum').textContent = S.gm ? '∞' : fmt(S.gem);
    document.body.classList.toggle('gm', !!S.gm);
    $('#soundBtn').classList.toggle('off', !S.sound);
  }
  function renderDots() {
    const st = stats();
    $('#dotShop').classList.toggle('on', S.daily.freePull);
    $('#dotBook').classList.toggle('on', D.SETS.some(s => !S.setsClaimed.includes(s.id) && s.items.every(owns)));
    const me = S.sign.last !== today()
      || D.TASKS.some(t => !S.daily.claimed.includes(t.id) && (S.daily.tasks[t.id] || 0) >= t.goal)
      || D.CHESTS.some((c, k) => !S.daily.chests.includes(k) && actPts() >= c.pts)
      || D.ACHIEVEMENTS.some(a => !S.achClaimed.includes(a.id) && a.test(st));
    $('#dotMe').classList.toggle('on', me);
  }
  function applyTheme() {
    const th = theme();
    document.documentElement.style.setProperty('--bg', th.bg);
    document.body.classList.toggle('dark', !!th.dark);
  }
  function refresh() {
    renderHud(); renderDots();
    ({ desk: renderDesk, bag: renderBag, shop: renderShop, book: renderBook, me: renderMe })[UI.tab]();
  }
  function welcome() {
    modal(`<div class="welcome"><div class="w-cat">${CAT_SVG}</div><h3>欢迎来到完美工位</h3>
      <p>这里收藏着从七十年代到现在的 100 件工位好物。<br>慢慢收集，慢慢布置，打造你理想中的小角落。</p>
      <div class="w-gift"><span>初始工位 ×1</span><span>${gemTag(E.startGem)}</span><span>${coinTag(E.startCoin)}</span><span>免费扭蛋 ×1</span></div>
      <button class="btn coral wide" data-act="startGame">开始布置</button></div>`, { cls: 'm-welcome', lock: true, noX: true });
  }

  window.addEventListener('resize', fitStage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDay(); refresh(); } });
  setInterval(() => {
    if (checkDay()) { refresh(); return; }
    if (UI.tab === 'desk' && !ED.on) {
      const b = $('.income b'), n = pendingIncome();
      if (b) b.textContent = '+' + fmt(n); else if (n > 0) renderDesk();
    }
  }, 30000);

  checkDay();
  task('login');
  save();
  applyTheme();
  refresh();
  if (S.guide === 0) welcome();
  window.PW = { get state() { return S; }, refresh };
})();




