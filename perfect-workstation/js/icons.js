/* 完美工位 · 像素图标库
 * 16×16 逻辑像素，逐格定义，输出为 SVG（crispEdges），任意整数倍缩放都保持锐利。
 * 字符调色板：. 透明  k 轮廓  a 主色  b 高光  d 暗部（默认由主色自动加深）
 *            w 纸白  g 金  c 珊瑚  n 绿  t 青  p 粉
 */
(function () {
  const FIXED = { k: '#4b3a3a', w: '#fffaf1', g: '#f2c14e', c: '#e9846b', n: '#7fae7a', t: '#4f9ea0', p: '#f19aa0' };
  const shade = (hex, amt) => {
    const v = parseInt(hex.slice(1), 16), f = x => Math.max(0, Math.min(255, Math.round(x + amt)));
    return '#' + [f(v >> 16), f((v >> 8) & 255), f(v & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  const I = {
    /* ---------- 底栏 ---------- */
    desk: { a: '#4f9ea0', b: '#f3e3c6', d: '#c98a4b', p: [
      '...kkkkkkkkkk...', '...kbbbbbbbbk...', '...kbwaaaaabk...', '...kbaaaaaabk...', '...kbaaaaaabk...', '...kbbbbbbbbk...',
      '...kkkkkkkkkk...', '.......kk.......', '.kkkkkkkkkkkkkk.', '.kddddddddddddk.', '.kkkkkkkkkkkkkk.', '..kk........kk..',
      '..kk........kk..', '..kk........kk..'] },
    bag: { a: '#7fae7a', b: '#b9d8b0', p: [
      '......kkkk......', '.....k....k.....', '....kkkkkkkk....', '...kaaaaaaaak...', '..kabbaaaaaaak..', '..kabaaaaaaaak..',
      '..kaaaaaaaaaak..', '..kkkkkkkkkkkk..', '..kaaakbbkaaak..', '..kaaakkkkaaak..', '..kaaaaaaaaaak..', '..kddddddddddk..', '...kkkkkkkkkk...'] },
    shop: { a: '#e9846b', b: '#f3e3c6', p: [
      '.kkkkkkkkkkkkkk.', 'kaawwaawwaawwaak', 'kaawwaawwaawwaak', 'kkkkkkkkkkkkkkkk', '.kbbbbbbbbbbbbk.', '.kbkkkkbbkkkkbk.',
      '.kbkwwkbbkaakbk.', '.kbkwwkbbkaakbk.', '.kbkkkkbbkaakbk.', '.kbbbbbbbkaakbk.', '.kkkkkkkkkkkkkk.'] },
    book: { a: '#9a6fc0', b: '#d8cbb6', p: [
      '.kkkkkk..kkkkkk.', 'kwwwwwwkkwwwwwwk', 'kwbbbbwkkwbbbbwk', 'kwwwwwwkkwwwwwwk', 'kwbbbbwkkwbbbbwk', 'kwwwwwwkkwwwwwwk',
      'kwbbbwwkkwbbbwwk', 'kwwwwwwkkwwwwwwk', 'kaaaaaakkaaaaaak', '.kkkkkkaakkkkkk.', '.......kk.......'] },
    me: { a: '#eea35d', b: '#ffd3a3', p: [
      '..kk........kk..', '..kak......kak..', '..kaak....kaak..', '..kaaakkkkaaak..', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.',
      '.kaakkaaaakkaak.', '.kaakkaaaakkaak.', '.kaaaaakkaaaaak.', '.kppaaaaaaaappk.', '..kaaaaaaaaaak..', '...kkkkkkkkkk...'] },
    /* ---------- 工位操作 ---------- */
    edit: { a: '#c98a4b', b: '#e7b27a', d: '#8f8a86', p: [
      '...........kkk..', '..........kbbk..', '.........kbaak..', '........kbaak...', '.......kbaak....', '......kkaak.....',
      '.....kddkk......', '....kdddk.......', '...kccck........', '..kccck.........', '..kcck..........', '..kkk...........'] },
    share: { a: '#e9846b', b: '#f3e3c6', p: [
      '.....kkkkk......', '....kbbbbbk.....', '.kkkkkkkkkkkkkk.', 'kaaaaaaaaaaaaaak', 'kaaaakkkkkaawwak', 'kaaaktttttkaaaak',
      'kaaaktwwttkaaaak', 'kaaaktwtttkaaaak', 'kaaaktttttkaaaak', 'kaaaakkkkkaaaaak', 'kddddddddddddddk', '.kkkkkkkkkkkkkk.'] },
    theme: { a: '#c98a4b', b: '#e7b27a', p: [
      '.....kkkkkk.....', '...kkbbbbbbkk...', '..kbbccbbbbbbk..', '.kbbbccbbnnbbbk.', '.kbggbbbbnnbbbk.', '.kbggbbbbbbbbk..',
      '.kbbbbbbbbkkk...', '.kbttbbbbk......', '.kbttbbbbk......', '.kbbbbbbbbk.....', '..kbbbbbbbbkk...', '...kkbbbbbbbbk..', '.....kkkkkkkk...'] },
    day: { a: '#f2c14e', b: '#fff1b8', p: [
      '.......kk.......', '..kk...kk...kk..', '..kk........kk..', '......kkkk......', '.....kbbaak.....', '....kbaaaaak....',
      '.kk.kaaaaaak.kk.', '.kk.kaaaaaak.kk.', '....kaaaaaak....', '.....kaaaak.....', '......kkkk......', '..kk........kk..',
      '..kk...kk...kk..', '.......kk.......'] },
    dusk: { a: '#f2a65a', b: '#ffd8a0', p: [
      '.......kk.......', '..kk........kk..', '......kkkk......', '.....kbbaak.....', '....kbaaaaak....', '.kk.kaaaaaak.kk.',
      'kkkkkkkkkkkkkkkk', '..cccc....cccc..', '....cccccc......', '......cc....cc..'] },
    night: { a: '#f2d57a', b: '#fff1b8', p: [
      '.....kkkkk......', '...kkaaak.......', '..kaaakk....k...', '.kaaak.....kbk..', '.kaak.......k...', 'kaaak...........',
      'kaaak...........', 'kaaak...........', 'kaaaak.......k..', '.kaaaak.....kbk.', '.kaaaaakkkk..k..', '..kkaaaaaaak....', '....kkkkkkk.....'] },
    rename: { a: '#f2c14e', b: '#fff1b8', p: [
      '...........kkk..', '..........kccck.', '.........kccck..', '........kwwwk...', '.......kaaak....', '......kaabk.....',
      '.....kaabk......', '....kaabk.......', '...kaabk........', '..kwwwk.........', '.kwwk...........', '.kk.............'] },
    /* ---------- 编辑工具 ---------- */
    flip: { a: '#4f9ea0', b: '#fffaf1', p: [
      '.......kk.......', '................', '.k.....kk.....k.', '.kk..........kk.', '.kak...kk...kbk.', '.kaak......kbbk.',
      '.kaaak.kk.kbbbk.', '.kaaaak..kbbbbk.', '.kaaak.kk.kbbbk.', '.kaak......kbbk.', '.kak...kk...kbk.', '.kk..........kk.',
      '.k.....kk.....k.', '................', '.......kk.......'] },
    front: { a: '#7fae7a', b: '#e7d9c2', p: [
      '.......kk.......', '......kaak......', '.....kaaaak.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kkkkaaaakkkk..',
      '.....kaaaak.....', '.....kaaaak.....', '.....kkkkkk.....', '................', '.kkkkkkkkkkkkkk.', '.kbbbbbbbbbbbbk.', '.kkkkkkkkkkkkkk.'] },
    back: { a: '#7fae7a', b: '#e7d9c2', p: [
      '.kkkkkkkkkkkkkk.', '.kbbbbbbbbbbbbk.', '.kkkkkkkkkkkkkk.', '................', '.....kkkkkk.....', '.....kaaaak.....',
      '.....kaaaak.....', '..kkkkaaaakkkk..', '...kaaaaaaaak...', '....kaaaaaak....', '.....kaaaak.....', '......kaak......', '.......kk.......'] },
    unplace: { a: '#e9846b', b: '#c98a4b', p: [
      '......kkkk......', '......kaak......', '......kaak......', '...kkkkaakkkk...', '....kaaaaaak....', '.....kaaaak.....',
      '......kaak......', '..kkk..kk..kkk..', '..kbk......kbk..', '..kbkkkkkkkkbk..', '..kbbbbbbbbbbk..', '..kkkkkkkkkkkk..'] },
    undo: { a: '#4f9ea0', b: '#9fd0d1', p: [
      '....k...........', '...kk...........', '..kakkkkkkkk....', '.kaaaaaaaaaakk..', '..kakkkkkkkaak..', '...kk......kaak.',
      '....k......kaak.', '..........kaak..', '......kkkkaak...', '......kaaaaak...', '......kkkkkkk...'] },
    done: { a: '#7fae7a', b: '#b9d8b0', p: [
      '............kk..', '...........kaak.', '..........kaak..', '.........kaak...', '..kk....kaak....', '.kaak..kaak.....',
      '..kaakkaak......', '...kaaaak.......', '....kaak........', '.....kk.........'] },
    clear: { a: '#c98a4b', b: '#e7b27a', p: [
      '..kkkkkkkkkkkk..', '.kbbbbbkkbbbbbk.', 'kkkkkkkkkkkkkkkk', '.kaaaaakkaaaaak.', '.kaaaaakkaaaaak.', '.kaaakkkkkkaaak.',
      '.kaaakwwwwkaaak.', '.kaaakkkkkkaaak.', '.kaaaaaaaaaaaak.', '.kddddddddddddk.', '.kkkkkkkkkkkkkk.'] },
    /* ---------- 物品分类 ---------- */
    'cat-desk': { a: '#c98a4b', b: '#e7b27a', p: [
      '.kkkkkkkkkkkkkk.', '.kbbbbbbbbbbbbk.', '.kkkkkkkkkkkkkk.', '..kakaaaaaakak..', '..kakkkkkkkkak..', '..kak......kak..',
      '..kak......kak..', '..kak......kak..', '..kkk......kkk..'] },
    'cat-chair': { a: '#7fae7a', b: '#b9d8b0', p: [
      '....kkkkkkk.....', '....kbbbbbk.....', '....kbaaabk.....', '....kbaaabk.....', '....kbaaabk.....', '....kkkkkkk.....',
      '...kkkkkkkkk....', '...kbbbbbbbk....', '...kkkkkkkkk....', '......kak.......', '...kkkkakkkk....', '...k...k...k....'] },
    'cat-pc': { a: '#4f9ea0', b: '#9fd0d1', p: [
      '..kkkkkkkkkkk...', '..kwwwwwwwwwk...', '..kwkkkkkkkwkk..', '..kwkbaaaakwkwk.', '..kwkaaaaakwkwk.', '..kwkaaaaakwkwk.',
      '..kwkkkkkkkwkwk.', '..kwwwwwwwnwkk..', '..kkkkkkkkkkk...', '.....kwwwk......', '...kkkkkkkkk....', '...kwwwwwwwk....', '...kkkkkkkkk....'] },
    'cat-input': { a: '#8f8a86', b: '#f3e3c6', p: [
      '.......kk.......', '........k.......', '........k.......', 'kkkkkkkkkkkkkkkk', 'kbbbbbbbbbbbbbbk', 'kbdbdbdbdbdbdbbk',
      'kbbbbbbbbbbbbbbk', 'kbbdbdbdbdbdbdbk', 'kbbbbbbbbbbbbbbk', 'kbbbddddddddbbbk', 'kbbbbbbbbbbbbbbk', 'kkkkkkkkkkkkkkkk'] },
    'cat-phone': { a: '#e9846b', b: '#ffd0c2', p: [
      '..kkkkkkkkkkkk..', '.kaaaaaaaaaaaak.', '.kaakkkkkkkkaak.', '.kkk..kkkk..kkk.', '.....kaaaak.....', '....kaawwaak....',
      '...kaawkkwaak...', '...kaawkkwaak...', '...kaaawwaaak...', '...kaaaaaaaak...', '...kkkkkkkkkk...'] },
    'cat-pen': { a: '#9a6fc0', b: '#c9b8a0', p: [
      '...k.k.k.k.k....', '..kkkkkkkkkkk...', '..kwwwwwwwwwk...', '..kwbbbbbbbwk...', '..kwwwwwwwwwk...', '..kwbbbbbwwwk...',
      '..kwwwwwwwwwk...', '..kwbbbbbbwwk...', '..kwwwwwwwwwk...', '..kaaaaaaaaak...', '..kkkkkkkkkkk...'] },
    'cat-time': { a: '#f2c14e', b: '#fff1b8', p: [
      '..kk........kk..', '.kaak......kaak.', '.kak.kkkkkk.kak.', '..kkkwwwwwwkkk..', '...kwwwkwwwwk...', '..kwwwwkwwwwwk..',
      '..kwwwwkwwwwwk..', '..kwwwwkkkkwwk..', '..kwwwwwwwwwwk..', '...kwwwwwwwwk...', '....kkkkkkkk....', '...kk......kk...'] },
    'cat-lamp': { a: '#f2c14e', b: '#fff1b8', d: '#7fae7a', p: [
      '........kkkkk...', '.......kbaaaak..', '......kaaaaaaak.', '......kkkkkkkkk.', '.......kdk......', '......kdk.......',
      '.....kdk........', '....kdk.........', '.....kdk........', '......kdk.......', '.......kdk......', '....kkkkkkkk....',
      '....kddddddk....', '....kkkkkkkk....'] },
    'cat-plant': { a: '#e9846b', b: '#ffd0c2', p: [
      '......kk........', '.....knnk..kk...', '..kk.knnk.knnk..', '.knnkknnkknnk...', '.knnnknnknnnk...', '..knnnnnnnnk....',
      '...kknnnnkk.....', '...kkkkkkkkk....', '...kbaaaaaak....', '....kaaaaaak....', '....kaaaaaak....', '.....kkkkkk.....'] },
    'cat-fun': { a: '#7fae7a', b: '#b9d8b0', p: [
      '...kkkkkkkkkk...', '...kwwwwwwwwk...', '...kwkkkkkkwk...', '...kwkaaaakwk...', '...kwkabaakwk...', '...kwkaaaakwk...',
      '...kwkkkkkkwk...', '...kwwwwwwwwk...', '...kwkwwwwcwk...', '...kkkkwwcwwk...', '...kwkwwwwwwk...', '...kwwwwwwwwk...', '...kkkkkkkkkk...'] },
    /* ---------- HUD 与其他 ---------- */
    sound: { a: '#4f9ea0', b: '#9fd0d1', p: [
      '......k.........', '.....kk...k.....', '..kkkak....k....', '..kbkak..k..k...', '..kbkak...k.k...', '..kbkak...k.k...',
      '..kbkak..k..k...', '..kkkak....k....', '.....kk...k.....', '......k.........'] },
    mute: { a: '#8f8a86', b: '#d8cbb6', p: [
      '......k.........', '.....kk.........', '..kkkak.........', '..kbkak.k...k...', '..kbkak..k.k....', '..kbkak...k.....',
      '..kbkak..k.k....', '..kkkak.k...k...', '.....kk.........', '......k.........'] },
    coin: { a: '#f2c14e', b: '#fff1b8', d: '#c9902c', p: [
      '.....kkkkkk.....', '...kkaaaaaakk...', '..kaabbaaaaaak..', '..kabaaaaaaadk..', '.kaabaakkaaaddk.', '.kaaaaakkaaaadk.',
      '.kaaaaakkaaaadk.', '.kaaaaakkaaaddk.', '..kaaaaaaaaadk..', '..kaaaaaaaaddk..', '...kkddddddkk...', '.....kkkkkk.....'] },
    gem: { a: '#3f9fb3', b: '#a8e6ef', p: [
      '....kkkkkkkk....', '...kbwbbbbbaak..', '..kbbbbbbbbaaak.', '.kkkkkkkkkkkkkk.', '.kbbbbbbbaaaaak.', '..kbbbbbbaaaak..',
      '...kbbbbbaaak...', '....kbbbbaak....', '.....kbbbak.....', '......kbak......', '.......kk.......'] },
    refresh: { a: '#7fae7a', b: '#b9d8b0', p: [
      '......kkkk......', '....kkaaaakk.k..', '...kaakkkkaakak.', '..kak....kkaaak.', '..kak.....kaaak.', '.kak.....kkkkkk.',
      '.kak........kak.', '.kkkkkk.....kak.', '.kaaak.....kak..', '.kaaakk....kak..', '.kakaakkkkaak...', '..k.kkaaaakk....', '......kkkk......'] },
    chest: { a: '#c98a4b', b: '#e7b27a', p: [
      '...kkkkkkkkkk...', '..kaaaaaaaaaak..', '.kbbbbbbbbbbbbk.', '.kaaaaaaaaaaaak.', '.kkkkkkggkkkkkk.', '.kaaaaakggkaaak.',
      '.kaaaaaakkaaaak.', '.kaaaaaaaaaaaak.', '.kddddddddddddk.', '.kkkkkkkkkkkkkk.'] },
    gift: { a: '#9a6fc0', b: '#c9a8e3', p: [
      '....kk...kk.....', '...kcck.kcck....', '....kcckcck.....', '.kkkkkkkkkkkkkk.', '.kaaaaaccaaaaak.', '.kkkkkkkkkkkkkk.',
      '..kaaaaccaaaak..', '..kaaaaccaaaak..', '..kbaaaccaaaak..', '..kaaaaccaaaak..', '..kkkkkkkkkkkk..'] },
    shard: { a: '#9a6fc0', b: '#d9c3ef', p: [
      '........kk......', '.......kbak.....', '......kbbaak....', '......kbaaak....', '.....kbbaaak....', '.....kbaaaak....',
      '....kbbaaaak....', '....kbaaaadk....', '....kbaaadk.....', '.....kaadk......', '......kkk.......'] },
  };

  const problems = [];
  const cache = {};
  function build(name, opt) {
    const ic = I[name];
    if (!ic) return '';
    const col = Object.assign({}, FIXED, { a: ic.a, b: ic.b || shade(ic.a, 60), d: ic.d || shade(ic.a, -45) }, opt || {});
    const rows = ic.p;
    rows.forEach((r, i) => { if (r.length !== 16) problems.push(`${name} 第${i}行长度 ${r.length}`); });
    if (rows.length > 16) problems.push(`${name} 行数 ${rows.length}`);
    // 计算包围盒并居中到 16×16
    let x0 = 16, x1 = -1, y0 = rows.length, y1 = -1;
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
    const ox = Math.floor((16 - (x1 - x0 + 1)) / 2) - x0, oy = Math.floor((16 - (y1 - y0 + 1)) / 2) - y0;
    let out = '';
    rows.forEach((r, y) => {
      let x = 0;
      while (x < r.length) {
        const ch = r[x];
        if (ch === '.') { x++; continue; }
        let e = x; while (e < r.length && r[e] === ch) e++;
        out += `<rect x="${x + ox}" y="${y + oy}" width="${e - x}" height="1" fill="${col[ch] || '#f0f'}"/>`;
        x = e;
      }
    });
    return out;
  }
  /** 返回 SVG 字符串。size 为显示像素（建议 16 的整数倍），opt 可覆盖颜色，例如 { a: '#ccc' } */
  function icon(name, size = 32, opt, cls = '') {
    const key = name + JSON.stringify(opt || {});
    const body = cache[key] || (cache[key] = build(name, opt));
    return `<svg class="px-ic ${cls}" width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
  }
  window.PWIcon = icon;
  window.PW_ICON_NAMES = Object.keys(I);
  window.PW_ICON_PROBLEMS = problems;
})();
