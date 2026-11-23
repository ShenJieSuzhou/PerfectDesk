// 完美工位 · 16×16 像素图标生成器（逐格手绘，零依赖）
// 字符：. 透明  k 轮廓  a 主色  b 高光。每个图标在 14×14 安全区内绘制，自动居中到 16×16（四周≥1px）。
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const K = '#4b3a3a', HI = '#fffaf1';
const C = { green: '#7fae7a', coral: '#e9846b', gold: '#f2c14e', teal: '#4f9ea0' };
const ICONS = [
 // ---------- 底栏（金色=选中，与现有底栏一致） ----------
 ['nav_workstation','工位','gold',['...kkkkkkkk...','..kbbaaaaaak..','..kbaaaaaaak..','..kaaaaaaaak..','..kaaaaaaaak..','...kkkkkkkk...','......kk......','.....kkkk.....','.kkkkkkkkkkkk.','kaaaaaaaaaaaak','.kkkkkkkkkkkk.','.kk........kk.','.kk........kk.','.kk........kk.']],
 ['nav_bag','背包','gold',['.....kkkk.....','....kk..kk....','...kkkkkkkk...','..kaaaaaaaak..','.kabbaaaaaaak.','.kabaaaaaaaak.','.kaaaaaaaaaak.','.kkkkkkkkkkkk.','.kaaakbbkaaak.','.kaaakkkkaaak.','.kaaaaaaaaaak.','.kaaaaaaaaaak.','..kkkkkkkkkk..']],
 ['nav_shop','商店','gold',['.kkkkkkkkkkkk.','kaabbaabbaabbk','kaabbaabbaabbk','.kkkkkkkkkkkk.','.k..........k.','.k.kkkk.kkk.k.','.k.kbbk.kak.k.','.k.kkkk.kak.k.','.k......kak.k.','.k......kak.k.','.kkkkkkkkkkkk.']],
 ['nav_collection','图鉴','gold',['.kkkkk..kkkkk.','kbaaaakkaaaaak','kakkkakkakkkak','kaaaaakkaaaaak','kakkkakkakkkak','kaaaaakkaaaaak','kakkaakkakkaak','kaaaaakkaaaaak','.kkkkkkkkkkkk.','......kk......']],
 ['nav_me','我的','gold',['....kkkkkk....','...kbaaaaak...','..kbaaaaaaak..','..kaaaaaaaak..','..kaaaaaaaak..','...kaaaaaak...','....kkkkkk....','..............','...kkkkkkkk...','..kaaaaaaaak..','.kaaaaaaaaaak.','.kaaaaaaaaaak.','.kkkkkkkkkkkk.']],
 // ---------- 工位操作 ----------
 ['op_arrange','布置','green',['......kk......','.....kbak.....','....kaaaak....','....kkaakk....','..kk.kaak.kk..','.kakkkaakkkak.','kaaaaaaaaaaaak','kaaaaaaaaaaaak','.kakkkaakkkak.','..kk.kaak.kk..','....kkaakk....','....kaaaak....','.....kaak.....','......kk......']],
 ['op_share','晒工位','coral',['...kkkk.......','.kkkaaakkkkkk.','kaaaaaaaaabbak','kaaaakkkkaaaak','kaaakbbaakaaak','kaaakbaaakaaak','kaaakaaaakaaak','kaaaakkkkaaaak','kaaaaaaaaaaaak','.kkkkkkkkkkkk.']],
 ['op_theme','主题','teal',['....kkkkkk....','..kkbbaaaakk..','.kabbaaaaaaak.','kaaaaaaaakkaak','kaaaaaaaakkaak','kaaaaaaaaaaaak','kakkaaaaaaakk.','kakkaaaaaak...','kaaaaaaaaak...','kaakkaaaaaak..','.kakkaaaaaaak.','..kkaaaaaakk..','....kkkkkk....']],
 ['op_day','白天','gold',['......kk......','......kk......','..kk......kk..','..kk.kkkk.kk..','....kbbaak....','...kbaaaaak...','kk.kaaaaaak.kk','kk.kaaaaaak.kk','...kaaaaaak...','....kaaaak....','..kk.kkkk.kk..','..kk......kk..','......kk......','......kk......']],
 ['op_dusk','黄昏','coral',['......kk......','..kk..kk..kk..','..kk......kk..','.....kkkk.....','....kbbaak....','kk.kbaaaaak.kk','kk.kaaaaaak.kk','kkkkkkkkkkkkkk','..............','..kkkkkkkkkk..','..............','....kkkkkk....']],
 ['op_night','夜晚','gold',['....kkkkk.....','..kkaaak......','.kaaakk.......','.kaak.......k.','kaak.......kbk','kaak........k.','kaak..........','kaaak.........','kbaaak........','.kaaaakk...kk.','.kaaaaaakkkak.','..kkaaaaaakk..','....kkkkkk....']],
 ['op_rename','改名','green',['..........kk..','.........kbbk.','........kbbbbk','.......kkkkbk.','......kaaakk..','.....kaaaak...','....kaaaak....','...kaaaak.....','..kaaaak......','.kbbaak.......','.kbbkk........','.kkk..........']],
 // ---------- 编辑工具 ----------
 ['edit_flip','翻转','teal',['k.....kk.....k','kk..........kk','kak...kk...kbk','kaak......kbbk','kaaak.kk.kbbbk','kaaaak..kbbbbk','kaaak.kk.kbbbk','kaak......kbbk','kak...kk...kbk','kk..........kk','k.....kk.....k']],
 ['edit_rotate','旋转','teal',['....kkkkk..k..','..kkaaaaakkak.','.kaakkkkkaaak.','kaak....kaaak.','kak....kaaaak.','kak....kkkkkk.','kak...........','kak.......kk..','kaak.....kaak.','.kaakkkkkaak..','..kkaaaaakk...','....kkkkk.....']],
 ['edit_stow','收回','coral',['.....kkkk.....','.....kaak.....','.....kaak.....','...kkkaakkk...','....kaaaak....','.....kaak.....','......kk......','kkkkk....kkkkk','kaaaakkkkaaaak','kbaaaaaaaaaaak','kaaaaaaaaaaaak','.kkkkkkkkkkkk.']],
 ['edit_undo','撤销','teal',['....kk........','...kak........','..kaakkkkkk...','.kbaaaaaaaakk.','..kaakkkkkaaak','...kak....kaak','....kk.....kak','...........kak','..........kaak','......kkkkaak.','......kaaaak..','......kkkkk...']],
 ['edit_done','完成','green',['...........kk.','..........kbak','.........kaak.','........kaak..','.kk....kaak...','kaak..kaak....','.kaakkaak.....','..kaaaak......','...kaak.......','....kk........']],
 ['edit_stow_all','全部收回','coral',['..kkkk..kkkk..','..kaak..kaak..','.kkaakkkkaakk.','.kaaaakkaaaak.','..kaak..kaak..','...kk....kk...','kkk........kkk','kaakkkkkkkkaak','kbaaaaaaaaaaak','kaaaaaaaaaaaak','.kkkkkkkkkkkk.']],
 // ---------- 物品分类 ----------
 ['cat_desk','桌子','gold',['.kkkkkkkkkkkk.','kbaaaaaaaaaaak','kkkkkkkkkkkkkk','.kak....kaaak.','.kak....kakak.','.kak....kaaak.','.kak....kkkkk.','.kak....kaaak.','.kak....kakak.','.kak....kaaak.','.kkk....kkkkk.']],
 ['cat_chair','椅子','coral',['...kkkkkkkk...','..kbaaaaaaak..','..kaaaaaaaak..','..kaaaaaaaak..','..kaaaaaaaak..','...kkkkkkkk...','......kk......','.kkkkkkkkkkkk.','kbaaaaaaaaaaak','.kkkkkkkkkkkk.','......kk......','..kkkkkkkkkk..','.kk...kk...kk.']],
 ['cat_computer','电脑','teal',['.kkkkkkkkkkkk.','kaaaaaaaaaaaak','kakkkkkkkkkkak','kakbkkkkkkkkak','kakkbkkkkkkkak','kakkkkkkkkkkak','kakkkkkkkkkkak','kaaaaaaaaaaaak','.kkkkkkkkkkkk.','.....kaak.....','...kkkkkkkk...']],
 ['cat_peripheral','外设','green',['......k.......','......k.......','....kkkkkk....','...kbbkkaak...','...kbbkkaak...','...kkkkkkkk...','...kaaaaaak...','...kaaaaaak...','...kaaaaaak...','....kaaaak....','.....kkkk.....']],
 ['cat_comm','通讯','coral',['....kkkkkk....','...kaaaaaak...','...kakkkkak.k.','...kakbkkak..k','...kakkbkak..k','...kakkkkak.k.','...kakkkkak...','...kakkkkak...','...kaaaaaak...','...kaakkaak...','...kaaaaaak...','....kkkkkk....']],
 ['cat_stationery','文具','teal',['...k...k......','..kbk.kbk.k...','..kbk.kbkkbk..','..kbk.kbkkbk..','.kkkkkkkkkkkk.','.kbaaaaaaaaak.','.kaaaaaaaaaak.','.kakkkkkkkkak.','.kaaaaaaaaaak.','.kaaaaaaaaaak.','..kkkkkkkkkk..']],
 ['cat_timer','计时','gold',['.kk........kk.','kaakkkkkkkkaak','.kkkaaaaaakkk.','..kaabbbbaak..','.kabbbkbbbbak.','.kabbbkbbbbak.','.kabbbkkkbbak.','.kabbbbbbbbak.','..kaabbbbaak..','...kaaaaaak...','..kkkkkkkkkk..','..kk......kk..']],
 ['cat_lamp_storage','灯与收纳','gold',['.....kkkkk....','....kbaaaak...','...kaaaaaaak..','..kkkkkkkkkkk.','......kk......','......kk......','......kk......','......kk......','......kk......','......kk......','...kkkkkkkk...','..kaaaaaaaak..','..kkkkkkkkkk..']],
 ['cat_plant_food','植物饮食','green',['......kk......','.....kaak.....','.kk..kaak..kk.','kaak.kaak.kaak','kaaakkaakkaaak','.kaaakaakaaak.','..kkaaaaaakk..','....kkaakk....','..kkkkkkkkkk..','..kbbbbbbbbk..','...kbbbbbbk...','...kbbbbbbk...','....kkkkkk....']],
 ['cat_leisure','休闲','coral',['..kkkkkkkkkk..','.kbaaaaaaaaak.','kaakaaaaaaakak','kakkkaaaaakaak','kaakaaaaaaaaak','kaaaaaaaaaaaak','kaaaakkkkaaaak','kaaak....kaaak','.kkk......kkk.']],
 // ---------- 顶部状态栏与其他 ----------
 ['hud_sound_on','音效开','teal',['.....kk.......','....kak...k...','...kaak.k..k..','kkkkaak..k..k.','kbakaak..k..k.','kaakaak..k..k.','kaakaak..k..k.','kkkkaak..k..k.','...kaak.k..k..','....kak...k...','.....kk.......']],
 ['hud_sound_off','音效关','coral',['.....kk.......','....kak.......','...kaak.......','kkkkaak.......','kbakaak.k...k.','kaakaak..k.k..','kaakaak...k...','kkkkaak..k.k..','...kaak.k...k.','....kak.......','.....kk.......']],
 ['hud_coin','金币','gold',['....kkkkkk....','..kkaaaaaakk..','.kabbaaaaaaak.','.kbaakkkkaaak.','kabaakaakaaaak','kaaaakaakaaaak','kaaaakaakaaaak','kaaaakaakaaaak','kaaaakaakaaaak','.kaaakkkkaaak.','.kaaaaaaaaaak.','..kkaaaaaakk..','....kkkkkk....']],
 ['hud_gem','钻石','teal',['...kkkkkkkk...','..kbbaaaaaak..','.kbbaaaaaaaak.','kkkkkkkkkkkkkk','.kbaaaaaaaaak.','..kbaaaaaaak..','...kbaaaaak...','....kbaaak....','.....kbak.....','......kk......']],
 ['hud_refresh','刷新','green',['....kkkkk.....','..kkbaaaakk.k.','.kaakkkkkaakak','.kak.....kaaak','kak.....kaaaak','kak.....kkkkk.','kkk...........','...........kkk','.kkkkk.....kak','kaaaak.....kak','kaaak.....kak.','kakaakkkkkaak.','.k.kkaaaaakk..','.....kkkkk....']],
 ['hud_chest','宝箱','gold',['..kkkkkkkkkk..','.kbbaaaaaaaak.','kaaaaaaaaaaaak','kkkkkkkkkkkkkk','kaaaakbbkaaaak','kaaaakbbkaaaak','kaaaaakkaaaaak','kaaaaaaaaaaaak','kaaaaaaaaaaaak','.kkkkkkkkkkkk.']],
 ['hud_gift','礼物','coral',['..kkk....kkk..','.kaaak..kaaak.','..kkaakkaakk..','kkkkkkkkkkkkkk','kaaaaabbaaaaak','kkkkkkkkkkkkkk','.kaaaabbaaaak.','.kaaaabbaaaak.','.kaaaabbaaaak.','.kaaaabbaaaak.','.kaaaabbaaaak.','.kkkkkkkkkkkk.']],
 ['hud_shard','碎片','coral',['.......kk.....','......kbak....','.....kbaak....','.....kbaaak...','....kbaaaak...','....kbaaaaak..','...kbaaaaaak..','...kbaaaaak...','...kaaaaak....','....kaaak.....','....kaak......','.....kk.......']],
];
const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16), 255];
const errors = [];
function grid(name, rows) {
  if (rows.length > 14) errors.push(`${name}: 行数 ${rows.length} > 14`);
  rows.forEach((r, i) => { if (r.length !== 14) errors.push(`${name}: 第${i}行宽 ${r.length}`); if (/[^.kab]/.test(r)) errors.push(`${name}: 第${i}行含非法字符`); });
  let x0 = 99, x1 = -1, y0 = 99, y1 = -1;
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
  const ox = Math.floor((16 - (x1 - x0 + 1)) / 2) - x0, oy = Math.floor((16 - (y1 - y0 + 1)) / 2) - y0;
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g[y + oy][x + ox] = c; }));
  // 规格检查：四周留白 ≥1px；填色像素必须被轮廓或填色包围（不外露）
  for (let i = 0; i < 16; i++) for (const [y, x] of [[0, i], [15, i], [i, 0], [i, 15]]) if (g[y][x] !== '.') errors.push(`${name}: 边缘留白不足`);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (g[y][x] === 'a' || g[y][x] === 'b')
    for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) if (g[y+dy][x+dx] === '.') errors.push(`${name}: (${x},${y}) 填色外露`);
  return g;
}
// 无依赖 PNG 编码（RGBA，8bit）
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (~c) >>> 0; };
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(w, h, px) { // px: (x,y)=>[r,g,b,a]
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) raw.set(px(x, y), y * (w * 4 + 1) + 1 + x * 4); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const out = path.join(__dirname, '..', 'assets', 'icons');
const variants = [];
for (const [name, label, main, rows] of ICONS) {
  const g = grid(name, rows);
  const pal = { k: hex(K), a: hex(C[main]), b: hex(HI) };
  if (name.startsWith('nav_')) {
    variants.push({ file: name + '_normal', label: label + '·未选中', g, pal: { k: pal.k } });
    variants.push({ file: name + '_selected', label: label + '·选中', g, pal });
  } else variants.push({ file: name, label, g, pal });
}
const manifest = [];
for (const v of variants) {
  const used = new Set();
  v.g.flat().forEach(c => { if (c !== '.' && v.pal[c]) used.add(c); });
  if (used.size > 3) errors.push(`${v.file}: 颜色数 ${used.size}`);
  for (const s of [1, 2, 3]) {
    const dir = path.join(out, String(16 * s)); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, v.file + '.png'), png(16 * s, 16 * s, (x, y) => v.pal[v.g[Math.floor(y / s)][Math.floor(x / s)]] || [0,0,0,0]));
  }
  manifest.push({ file: v.file, label: v.label, colors: used.size, rows: v.g.map(r => r.map(c => v.pal[c] ? c : '.').join('')) });
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ outline: K, highlight: HI, colors: C, icons: manifest }, null, 1));
console.log(`图标 ${ICONS.length} 个，导出文件 ${variants.length} 张 × 3 尺寸`);
if (errors.length) { console.log('规格问题：\n' + errors.join('\n')); process.exit(1); } else console.log('规格检查全部通过');
