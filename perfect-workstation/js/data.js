/* 完美工位 · 数据配置（数值可在此统一调整） */
(function () {
  const CATS = [
    { id: 'desk', name: '桌子', slot: 'floor', w: 172 },
    { id: 'chair', name: '椅子', slot: 'floor', w: 84 },
    { id: 'pc', name: '电脑', slot: 'desk', w: 70 },
    { id: 'input', name: '外设', slot: 'desk', w: 50 },
    { id: 'phone', name: '通讯', slot: 'desk', w: 36 },
    { id: 'pen', name: '文具', slot: 'desk', w: 36 },
    { id: 'time', name: '计时', slot: 'desk', w: 40 },
    { id: 'lamp', name: '灯与收纳', slot: 'desk', w: 50 },
    { id: 'plant', name: '植物饮食', slot: 'desk', w: 42 },
    { id: 'fun', name: '休闲', slot: 'desk', w: 42 },
  ];

  // [名称, 年代, 故事]
  const RAW = [
    ['木质抽屉办公桌', '70s', '抽屉里还躺着一张泛黄的工作证。'],
    ['钢木打字机桌', '70s', '轻巧结实，专为“哒哒哒”而生。'],
    ['金属办公桌', '80s', '冬天摸上去凉凉的，夏天很解暑。'],
    ['键盘托盘桌', '90s', '抽出托盘的那一刻，像打开了新世界。'],
    ['转角工作台', '90s', '转个身，就是另一片小天地。'],
    ['玻璃办公桌', '00s', '透明桌面，脚丫也能晒到太阳。'],
    ['极简白色办公桌', '10s', '什么都不放，也很好看。'],
    ['电动升降桌', '20s', '站一会儿，坐一会儿，腰说谢谢。'],
    ['小空间折叠桌', '20s', '出租屋的好伙伴，收起来只有一点点。'],
    ['木工手作工作台', '当代', '每个小孔里，都藏着一个周末。'],
    ['木质靠背椅', '70s', '吱呀一声，坐下就是一整个下午。'],
    ['弯管皮革椅', '70s', '老主任最爱的那把椅子。'],
    ['绿色软垫转椅', '80s', '转三圈，灵感就来了。'],
    ['钢管折叠椅', '80s', '开会、看电影、打牌，样样都行。'],
    ['蓝色布面办公椅', '90s', '扶手上有一块被磨亮的地方。'],
    ['网背办公椅', '00s', '后背终于不出汗了。'],
    ['人体工学椅', '10s', '它比你更懂你的脊椎。'],
    ['跪坐椅', '20s', '坐姿端正，心也跟着安静下来。'],
    ['圆形软垫凳', '当代', '软软的，像坐在一朵云上。'],
    ['木质脚踏凳', '当代', '踩上去，脚也有了自己的工位。'],
    ['绿屏终端', '70s', '一闪一闪的光标，在等你开口。'],
    ['米白 CRT 显示器', '80s', '开机时“嗡”的一声，是熟悉的问候。'],
    ['横置电脑主机', '80s', '显示器就稳稳地坐在它头上。'],
    ['塔式电脑主机', '90s', '风扇声是那个年代的白噪音。'],
    ['透明彩壳一体机', '90s', '能看到里面的样子，像一颗糖果。'],
    ['厚重笔记本电脑', '90s', '背着它出门，等于背了块砖。'],
    ['银框液晶显示器', '00s', '桌面一下子宽敞了好多。'],
    ['迷你电脑主机', '10s', '小小一盒，装下整个世界。'],
    ['超薄笔记本电脑', '20s', '轻到会忘记自己带了电脑。'],
    ['超宽显示器', '20s', '左边写代码，右边看猫猫。'],
    ['机械打字机', '70s', '每一个字，都需要用力地写下。'],
    ['米白全尺寸键盘', '80s', '咔嗒咔嗒，是八十年代的节拍。'],
    ['双键滚球鼠标', '80s', '要定期把小球抠出来擦一擦。'],
    ['轨迹球', '90s', '手腕不动，世界在指尖滚动。'],
    ['针式打印机', '90s', '吱吱吱——打印一张成绩单。'],
    ['平板扫描仪', '00s', '把旧照片，一张张留进电脑里。'],
    ['USB 摄像头', '00s', '第一次视频通话，大家都在挥手。'],
    ['数位绘图板', '10s', '画下的每一笔，都轻轻落在心上。'],
    ['紧凑机械键盘', '20s', '换了三套键帽，还是最爱这一套。'],
    ['垂直人体工学鼠标', '20s', '握手一样地握住它。'],
    ['珊瑚色拨号电话', '70s', '转一圈拨号盘，等一声“喂”。'],
    ['按键座机', '80s', '电话线绕在手指上，聊了好久。'],
    ['大哥大移动电话', '80s', '拿着它，整条街都会回头看。'],
    ['寻呼机', '90s', '“速回电”，三个字让人心跳加速。'],
    ['传真机', '90s', '一张纸慢慢吐出来，像一封来信。'],
    ['直板手机', '90s', '贪吃蛇最高纪录，至今没人打破。'],
    ['翻盖手机', '00s', '“啪”地合上，是最酷的挂电话方式。'],
    ['滑盖手机', '00s', '无聊时滑来滑去，能玩一整节课。'],
    ['智能手机与支架', '10s', '放在支架上，假装自己在认真工作。'],
    ['折叠屏手机', '20s', '展开是平板，合上是小方块。'],
    ['皮面纸质笔记本', '70s', '扉页写着：“愿你永远热爱生活。”'],
    ['金属钢笔', '70s', '吸一管墨水，写一封长信。'],
    ['卷笔刀', '80s', '转啊转，铅笔变成了尖尖的样子。'],
    ['大型订书机', '80s', '啪！一叠作业整整齐齐。'],
    ['活页文件夹', '90s', '每一页都能拿出来，再放回去。'],
    ['螺旋线圈笔记本', '90s', '线圈上卡着一支快没水的笔。'],
    ['彩色便利贴座', '00s', '把待办贴满一整面墙。'],
    ['修正带', '00s', '错了也没关系，轻轻一划就好。'],
    ['胶带切割座', '10s', '撕胶带的声音，意外地解压。'],
    ['尺与三角尺套组', '当代', '量一量，生活刚刚好。'],
    ['机械翻页钟', '70s', '每过一分钟，“啪嗒”翻一页。'],
    ['奶油色圆形挂钟', '70s', '滴答滴答，提醒你按时下班。'],
    ['台式计算器', '80s', '按键很大，算账很安心。'],
    ['双铃闹钟', '80s', '叮铃铃——整栋楼都醒了。'],
    ['数字闹钟', '90s', '绿色的数字，在夜里静静发光。'],
    ['科学计算器', '90s', '考试时最可靠的战友。'],
    ['机械厨房计时器', '00s', '拧一下，专注二十五分钟。'],
    ['沙漏', '10s', '看沙子落下，时间也慢了下来。'],
    ['番茄计时器', '20s', '番茄熟了，就去休息一下吧。'],
    ['台式翻页日历', '当代', '今天也是值得被圈起来的一天。'],
    ['绿色玻璃银行灯', '70s', '拉一下链子，灯光是温柔的绿。'],
    ['金属文件柜', '70s', '每一个抽屉，都装着一段往事。'],
    ['折臂台灯', '80s', '弯一弯手臂，把光送到你面前。'],
    ['金属网状笔筒', '80s', '笔总是比笔筒多一支。'],
    ['抽屉文具盒', '90s', '小抽屉里藏着回形针和糖。'],
    ['多层文件盘', '90s', '待办、进行中、已完成。'],
    ['夹式阅读灯', '00s', '夹在哪里，哪里就亮起来。'],
    ['洞洞收纳板', '10s', '挂上喜欢的小物，墙也热闹了。'],
    ['显示器挂灯', '20s', '只照亮桌面，不打扰眼睛。'],
    ['桌面线材收纳盒', '20s', '乱糟糟的线，终于有了家。'],
    ['陶盆绿萝', '常见', '浇一点水，它就会长出新叶子。'],
    ['小型仙人掌', '常见', '不爱说话，偶尔开一朵小花。'],
    ['虎尾兰', '常见', '默默净化空气的好室友。'],
    ['多肉组合盆', '常见', '胖乎乎的一家人。'],
    ['玻璃花瓶与单枝花', '常见', '一枝花，就够让桌面变温柔。'],
    ['搪瓷保温壶', '70s', '壶身上的彩虹，是妈妈的味道。'],
    ['条纹陶瓷咖啡杯', '80s', '第一口咖啡，世界才开机。'],
    ['玻璃茶杯', '90s', '看着茶叶慢慢舒展开。'],
    ['不锈钢保温杯', '10s', '泡上枸杞，养生从工位开始。'],
    ['木质便当盒', '当代', '今天的午饭，是自己做的。'],
    ['木壳收音机', '70s', '调到熟悉的频道，听一首老歌。'],
    ['迷你唱片机', '70s', '唱针落下，时光倒流。'],
    ['磁带随身听', '80s', '用铅笔卷磁带，是一代人的技能。'],
    ['头戴有线耳机', '80s', '戴上它，世界只剩下音乐。'],
    ['便携 CD 播放器', '90s', '走路要很稳，不然会跳歌。'],
    ['掌上游戏机', '90s', '课桌底下的秘密乐园。'],
    ['桌面小风扇', '00s', '对着它说话，声音会变成机器人。'],
    ['电子阅读器', '10s', '一整个图书馆，揣在口袋里。'],
    ['无线耳机充电盒', '20s', '“咔哒”一声，耳机回家了。'],
    ['桌面加湿器', '20s', '小小的白雾，像一朵会呼吸的云。'],
  ];

  const SSR = [10, 25, 61, 92];
  const SR = [6, 17, 21, 30, 31, 43, 50, 71, 78, 96, 100];
  const R = [2, 5, 8, 12, 16, 18, 23, 26, 29, 34, 35, 38, 39, 45, 47, 49, 64, 69, 73, 79, 85, 91, 93, 95, 98];
  const WIDTH = { 4: 165, 5: 180, 9: 150, 20: 70, 19: 62, 24: 46, 28: 46, 30: 96, 26: 64, 21: 72, 31: 62, 35: 62, 36: 62, 37: 30, 33: 32, 40: 32, 34: 36, 41: 48, 42: 46, 45: 54, 43: 22, 46: 18, 44: 32, 61: 46, 62: 56, 63: 44, 72: 64, 75: 50, 76: 50, 78: 74, 79: 64, 74: 30, 80: 46, 83: 34, 84: 50, 85: 30, 87: 32, 88: 40, 89: 26, 86: 28, 90: 46, 92: 50, 91: 50, 97: 36, 99: 38, 100: 34, 70: 40, 60: 44, 52: 40 };
  const FLOOR = [72];
  const WALL = [62, 78];

  const RARITY = {
    N: { name: '普通', color: '#8f9b86', comfort: 2, coin: 160, shard: 5, swap: 30 },
    R: { name: '稀有', color: '#4f9ea0', comfort: 4, coin: 600, gem: 40, shard: 15, swap: 90 },
    SR: { name: '史诗', color: '#9a6fc0', comfort: 7, gem: 90, shard: 40, swap: 220 },
    SSR: { name: '传说', color: '#e0954a', comfort: 12, gem: 220, shard: 100, swap: 520 },
  };

  const ITEMS = RAW.map((r, i) => {
    const id = i + 1;
    const cat = CATS[Math.floor(i / 10)];
    const rarity = SSR.includes(id) ? 'SSR' : SR.includes(id) ? 'SR' : R.includes(id) ? 'R' : 'N';
    const slot = WALL.includes(id) ? 'wall' : FLOOR.includes(id) ? 'floor' : cat.slot;
    const nat = (window.PW_NATURAL || [])[i] || [128, 128];
    const w = WIDTH[id] || cat.w;
    return {
      id, key: String(id).padStart(3, '0'), name: r[0], era: r[1], story: r[2],
      cat: cat.id, rarity, slot, w, h: Math.round((w * nat[1]) / nat[0]),
      img: 'assets/items/' + String(id).padStart(3, '0') + '.png',
      comfort: RARITY[rarity].comfort + (cat.id === 'plant' ? 1 : 0),
    };
  });

  const ERAS = ['70s', '80s', '90s', '00s', '10s', '20s', '当代', '常见'];

  const SETS = [
    { id: 'office70', name: '七十年代老派办公室', items: [1, 11, 31, 41, 71], bonus: 15, gem: 60, desc: '木桌、打字机与绿罩台灯' },
    { id: 'pc80', name: '八零电脑房', items: [3, 13, 22, 32, 33, 63], bonus: 15, gem: 60, desc: '米白色的电子时代' },
    { id: 'net90', name: '九零回忆角', items: [4, 15, 24, 44, 46, 96], bonus: 15, gem: 60, desc: '寻呼机和掌机的放学后' },
    { id: 'y2k', name: '千禧数码', items: [6, 16, 27, 37, 47, 48], bonus: 15, gem: 60, desc: '银色与透明的未来感' },
    { id: 'minimal', name: '极简现代', items: [7, 17, 29, 39, 49, 79], bonus: 15, gem: 60, desc: '少即是多' },
    { id: 'green', name: '绿意工位', items: [81, 82, 83, 84, 85], bonus: 18, gem: 50, desc: '植物就是最好的同事' },
    { id: 'paper', name: '文具控', items: [51, 52, 53, 54, 56, 57], bonus: 12, gem: 50, desc: '写字是一种治愈' },
    { id: 'time', name: '时间管理大师', items: [61, 64, 68, 69, 70], bonus: 15, gem: 60, desc: '专注每一分钟' },
    { id: 'music', name: '慢生活音乐角', items: [91, 92, 93, 94, 95], bonus: 18, gem: 70, desc: '让音乐陪你上班' },
    { id: 'cafe', name: '续命饮品站', items: [86, 87, 88, 89, 90], bonus: 12, gem: 50, desc: '咖啡、茶和便当' },
  ];

  const THEMES = [
    { id: 'wood', name: '原木小屋', price: 0, cur: 'coin', wallL: '#efe3d0', wallR: '#f6ecdc', trim: '#b9773f', floorA: '#c98a4b', floorB: '#b97a3f', sky: '#bfe3ea', bg: '#f3ece1' },
    { id: 'mint', name: '薄荷早晨', price: 1500, cur: 'coin', wallL: '#d5eadf', wallR: '#e3f2e9', trim: '#6f9f86', floorA: '#d8c6a3', floorB: '#c9b590', sky: '#cdeef4', bg: '#eaf5ee' },
    { id: 'sakura', name: '樱花黄昏', price: 120, cur: 'gem', wallL: '#f3d6d6', wallR: '#f9e4e1', trim: '#c97a7a', floorA: '#e3b9a4', floorB: '#d6a893', sky: '#f6c7a8', bg: '#fbeeee' },
    { id: 'blue', name: '复古灰蓝', price: 2500, cur: 'coin', level: 3, wallL: '#c9d4dc', wallR: '#d8e1e7', trim: '#5f7484', floorA: '#9aa3a8', floorB: '#8b9499', sky: '#d6e6ee', bg: '#e8edf0' },
    { id: 'cream', name: '奶油阳光', price: 180, cur: 'gem', level: 4, wallL: '#f6e7b9', wallR: '#fbf0cc', trim: '#d39b3e', floorA: '#e8c48a', floorB: '#dcb579', sky: '#ffe6a3', bg: '#fdf6df' },
    { id: 'cowork', kind: 'office', name: '联合办公', price: 2000, cur: 'coin', level: 2, wallL: '#dfe6ea', wallR: '#eef1f2', trim: '#5d7280', floorA: '#a3adb4', floorB: '#959fa7', sky: '#bfe0f0', accent: '#4f9ea0', bg: '#eef2f3' },
    { id: 'cbd', kind: 'office', name: '云端写字楼', price: 160, cur: 'gem', level: 3, wallL: '#d4dde6', wallR: '#e6ebf0', trim: '#3f4d5c', floorA: '#76808f', floorB: '#6a7483', sky: '#a9d6f0', accent: '#e9846b', bg: '#e6ecf2' },
    { id: 'cubicle', kind: 'office', layout: 'cubicle', zones: { wall: [150, 262], desk: [188, 302], floor: [290, 436] }, name: '格子间', price: 1200, cur: 'coin', wallL: '#e4e2dc', wallR: '#efede8', trim: '#6b7178', floorA: '#8e96a0', floorB: '#858d97', sky: '#cfe4ee', accent: '#7f97ad', bg: '#eeedea' },
    { id: 'open', kind: 'office', layout: 'open', zones: { desk: [222, 326], floor: [292, 436] }, name: '互联网大开间', price: 2600, cur: 'coin', level: 2, wallL: '#f1efe8', wallR: '#fbfaf5', trim: '#4b5563', floorA: '#d9b98c', floorB: '#cfae80', sky: '#bfe3f2', accent: '#f08a4b', bg: '#f6f3ec' },
    { id: 'private', kind: 'office', layout: 'private', name: '独立办公室', price: 3200, cur: 'coin', level: 3, wallL: '#e6ddd0', wallR: '#f1e9dd', trim: '#6f5a48', floorA: '#b98d62', floorB: '#ad8157', sky: '#c4e2ee', accent: '#5f8f8a', bg: '#f2ece3' },
    { id: 'reception', kind: 'office', layout: 'reception', zones: { desk: [186, 316], floor: [318, 436] }, name: '企业前台', price: 200, cur: 'gem', level: 4, wallL: '#e9edf0', wallR: '#f6f8f9', trim: '#3f4d5c', floorA: '#e8e4dc', floorB: '#dcd6cc', sky: '#c8e6f3', accent: '#2f6f8f', bg: '#eef2f4' },
    { id: 'boss', kind: 'office', layout: 'boss', name: '老总办公室', price: 320, cur: 'gem', level: 6, wallL: '#e8dcc4', wallR: '#f2e8d3', trim: '#5a3a26', floorA: '#7a4e30', floorB: '#6e452a', sky: '#b9dcef', accent: '#9e2f2f', bg: '#f1e8d8' },
    { id: 'loft', kind: 'factory', wallStyle: 'brick', name: '红砖老厂房', price: 3000, cur: 'coin', level: 4, wallL: '#b7644a', wallR: '#c27460', mortar: '#dcbca4', trim: '#4a4f55', floorA: '#a7a49d', floorB: '#9b9891', sky: '#cfe3e6', accent: '#f2c14e', bg: '#f1e6dc' },
    { id: 'smart', kind: 'factory', wallStyle: 'panel', name: '智造车间', price: 220, cur: 'gem', level: 5, wallL: '#c9d2d6', wallR: '#d8e0e3', mortar: '#b2bdc2', trim: '#3d6b6e', floorA: '#86ab9c', floorB: '#7ca192', sky: '#d6ecf0', accent: '#f2c14e', bg: '#e7efee' },
    { id: 'neon', name: '午夜霓虹', price: 260, cur: 'gem', level: 6, wallL: '#3c3561', wallR: '#4a4275', trim: '#e86fa6', floorA: '#3a3250', floorB: '#322b46', sky: '#1f2d5c', bg: '#2b2540', dark: true },
  ];

  const SIGNIN = [
    { coin: 200 }, { gem: 20 }, { coin: 400 }, { gem: 30 }, { coin: 600 }, { gem: 50 }, { gem: 80, box: 'R' },
  ];

  const TASKS = [
    { id: 'login', name: '打开工位，说声早安', goal: 1, pts: 10, coin: 100 },
    { id: 'place', name: '摆放 3 件物品', goal: 3, pts: 20, coin: 150 },
    { id: 'tap', name: '和小物件互动 5 次', goal: 5, pts: 15, coin: 120 },
    { id: 'gacha', name: '扭蛋 1 次', goal: 1, pts: 20, gem: 10 },
    { id: 'share', name: '分享你的工位', goal: 1, pts: 25, gem: 15 },
    { id: 'buy', name: '在商店买 1 件物品', goal: 1, pts: 20, coin: 200 },
    { id: 'income', name: '领取一次工位收益', goal: 1, pts: 10, coin: 80 },
  ];
  const CHESTS = [{ pts: 40, coin: 300 }, { pts: 80, gem: 30 }, { pts: 120, gem: 60, box: 'R' }];

  const ACHIEVEMENTS = [
    { id: 'own10', name: '小有收藏', desc: '拥有 10 件物品', test: s => s.ownedCount >= 10, gem: 30 },
    { id: 'own30', name: '收藏家', desc: '拥有 30 件物品', test: s => s.ownedCount >= 30, gem: 80 },
    { id: 'own60', name: '时光馆长', desc: '拥有 60 件物品', test: s => s.ownedCount >= 60, gem: 150 },
    { id: 'own100', name: '完美图鉴', desc: '集齐全部 100 件', test: s => s.ownedCount >= 100, gem: 500 },
    { id: 'place12', name: '满满当当', desc: '工位同时摆放 12 件物品', test: s => s.placed >= 12, gem: 40 },
    { id: 'comfort80', name: '舒适至上', desc: '舒适度达到 80', test: s => s.comfort >= 80, gem: 60 },
    { id: 'share1', name: '第一次晒工位', desc: '完成 1 次分享', test: s => s.shares >= 1, gem: 20 },
    { id: 'share10', name: '工位博主', desc: '累计分享 10 次', test: s => s.shares >= 10, gem: 100 },
    { id: 'gacha10', name: '扭蛋新手', desc: '累计扭蛋 10 次', test: s => s.pulls >= 10, gem: 40 },
    { id: 'gacha50', name: '扭蛋达人', desc: '累计扭蛋 50 次', test: s => s.pulls >= 50, gem: 120 },
    { id: 'ssr1', name: '传说降临', desc: '获得 1 件传说物品', test: s => s.ssr >= 1, gem: 80 },
    { id: 'set1', name: '成套成双', desc: '完成 1 个套装', test: s => s.sets >= 1, gem: 50 },
    { id: 'set5', name: '风格大师', desc: '完成 5 个套装', test: s => s.sets >= 5, gem: 200 },
    { id: 'era', name: '穿越五十年', desc: '工位同时摆放 5 个不同年代的物品', test: s => s.eras >= 5, gem: 60 },
    { id: 'streak7', name: '七日之约', desc: '累计签到 7 天', test: s => s.signDays >= 7, gem: 80 },
    { id: 'theme2', name: '换个心情', desc: '拥有 2 个主题房间', test: s => s.themes >= 2, gem: 30 },
  ];

  const ERA_PACKS = [
    { id: 'p70', name: '七十年代礼包', items: [2, 12, 52, 86], gem: 150, tag: '70s' },
    { id: 'p80', name: '八零怀旧礼包', items: [14, 42, 53, 94], gem: 140, tag: '80s' },
    { id: 'p90', name: '九零放学礼包', items: [26, 34, 55, 88], gem: 170, tag: '90s' },
    { id: 'p00', name: '千禧闪耀礼包', items: [36, 57, 58, 97], gem: 130, tag: '00s' },
    { id: 'p20', name: '新时代礼包', items: [9, 40, 80, 99], gem: 150, tag: '20s' },
  ];

  const GACHA = {
    single: 60, ten: 540,
    rates: { N: 0.66, R: 0.25, SR: 0.075, SSR: 0.015 },
    pity: 60, // 第 60 抽必出传说
  };

  const STARTER = [
    { id: 1, x: 196, y: 372 },
    { id: 11, x: 120, y: 410 },
    { id: 22, x: 214, y: 262 },
    { id: 32, x: 168, y: 284 },
    { id: 81, x: 262, y: 266 },
    { id: 87, x: 120, y: 294 },
  ];

  const ECON = {
    startCoin: 500, startGem: 160,
    baseIncome: 24, comfortIncome: 2.2, maxIdleHours: 8,
    shopRefreshGem: 10, shareFirstGem: 50, shareGem: 20, shareMax: 3, inviteGem: 30,
    maxPlacedBase: 10, maxPlacedPerLv: 2,
  };

  window.PW_DATA = { CATS, ITEMS, RARITY, ERAS, SETS, THEMES, SIGNIN, TASKS, CHESTS, ACHIEVEMENTS, ERA_PACKS, GACHA, STARTER, ECON };
})();
