// Lesson 2 PDF — modify-the-game theme: change sound + add costume switches
// Builds on Lesson 1 (no reintroduction of basic Scratch UI)
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT = path.join(__dirname, '..', 'Lesson2_新手教學.pdf');
const FONT = path.join(__dirname, '..', '..', 'fonts', 'NotoSansTC-Regular.otf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: '坦克大戰 Scratch 第 2 堂：學會改積木',
    Author: 'Hacci',
    Subject: 'Scratch 新手教學（國小二年級）',
  },
});

doc.registerFont('CJK', FONT);
doc.font('CJK');
doc.pipe(fs.createWriteStream(OUT));

const C = {
  green: '#2e7d32', greenLight: '#e8f5e9',
  brown: '#8d4a1e', brownLight: '#b86a2a',
  dark: '#1a1a1a', gray: '#666', rule: '#cccccc',
  yellow: '#fff8e1', gold: '#daa520', goldLight: '#fff3c4',
  blue: '#1976d2', blueLight: '#e3f2fd',
  red: '#c62828', redLight: '#ffebee',
  purple: '#7b1fa2', purpleLight: '#f3e5f5',
};
const PAGE_W = doc.page.width;
const PAGE_H = doc.page.height;
const ML = doc.page.margins.left;
const MR = doc.page.margins.right;
const MB = doc.page.margins.bottom;
const CONTENT_W = PAGE_W - ML - MR;

function ensureSpace(min) { if (doc.y + min > PAGE_H - MB) doc.addPage(); }
function H1(text) {
  ensureSpace(60); doc.x = ML;
  doc.fillColor(C.green).fontSize(20).text(text);
  doc.moveDown(0.2);
  const y = doc.y;
  doc.moveTo(ML, y).lineTo(PAGE_W - MR, y).strokeColor(C.green).lineWidth(2).stroke();
  doc.moveDown(0.7);
}
function H2(text) {
  ensureSpace(40); doc.x = ML;
  doc.fillColor(C.dark).fontSize(14).text(text);
  doc.moveDown(0.3);
}
function P(text, opts = {}) {
  doc.x = ML;
  doc.fillColor(C.dark).fontSize(11).text(text, { lineGap: 4, width: CONTENT_W, ...opts });
  doc.moveDown(0.4);
}
function Step(num, title, body) {
  ensureSpace(70);
  const startY = doc.y;
  doc.save();
  doc.circle(ML + 10, startY + 9, 11).fillColor(C.green).fill();
  doc.fillColor('white').fontSize(12).text(String(num), ML + 4, startY + 3, { width: 12, align: 'center' });
  doc.restore();
  doc.fillColor(C.dark).fontSize(12);
  doc.text(title, ML + 30, startY, { width: CONTENT_W - 30, lineGap: 3 });
  doc.fillColor(C.dark).fontSize(11);
  doc.text(body, ML + 30, doc.y + 2, { width: CONTENT_W - 30, lineGap: 4 });
  doc.moveDown(0.7);
  doc.x = ML;
}
function Box(text, bg, labelColor, label) {
  doc.fontSize(10);
  const innerW = CONTENT_W - 16;
  const labelText = label + '  ';
  const textH = doc.heightOfString(labelText + text, { width: innerW, lineGap: 3 });
  const boxH = textH + 16;
  ensureSpace(boxH + 10);
  const boxY = doc.y;
  doc.save();
  doc.roundedRect(ML, boxY, CONTENT_W, boxH, 6).fillColor(bg).fill();
  doc.restore();
  doc.fillColor(labelColor).fontSize(10).text(labelText, ML + 8, boxY + 8, { continued: true, width: innerW, lineGap: 3 });
  doc.fillColor(C.dark).text(text);
  doc.y = boxY + boxH + 8;
  doc.x = ML;
}
const Tip  = t => Box(t, C.greenLight, C.green, '[ 小提示 ]');
const Warn = t => Box(t, C.redLight, C.red, '[ 注意！ ]');
const Task = t => Box(t, C.purpleLight, C.purple, '[ 任務 ★ ]');
function Spacer(n = 1) { doc.moveDown(n); }

// ===== mini drawing =====
function drawTank(x, y, size = 16, dir = 'up') {
  const s = size / 40;
  doc.save();
  doc.translate(x, y);
  doc.scale(s);
  if (dir === 'up' || dir === 'down') {
    doc.rect(2, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
    doc.rect(30, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
    doc.rect(10, 10, 20, 22).fillAndStroke('#4caf50', '#1b5e20');
  } else {
    doc.rect(6, 2, 28, 8).fillAndStroke('#2e7d32', '#1b5e20');
    doc.rect(6, 30, 28, 8).fillAndStroke('#2e7d32', '#1b5e20');
    doc.rect(10, 10, 20, 20).fillAndStroke('#4caf50', '#1b5e20');
  }
  doc.circle(20, 20, 6).fillAndStroke('#66bb6a', '#1b5e20');
  if (dir === 'up')    doc.rect(18, 2, 4, 14).fillAndStroke('#1b5e20', '#1b5e20');
  if (dir === 'down')  doc.rect(18, 24, 4, 14).fillAndStroke('#1b5e20', '#1b5e20');
  if (dir === 'left')  doc.rect(2, 18, 14, 4).fillAndStroke('#1b5e20', '#1b5e20');
  if (dir === 'right') doc.rect(24, 18, 14, 4).fillAndStroke('#1b5e20', '#1b5e20');
  doc.restore();
}
function drawBrick(x, y, size = 14) {
  doc.save();
  doc.rect(x, y, size, size).fillAndStroke(C.brownLight, '#3e2010');
  doc.moveTo(x, y + size/2).lineTo(x + size, y + size/2).strokeColor('#3e2010').stroke();
  doc.moveTo(x + size/2, y).lineTo(x + size/2, y + size/2).strokeColor('#3e2010').stroke();
  doc.moveTo(x + size/4, y + size/2).lineTo(x + size/4, y + size).strokeColor('#3e2010').stroke();
  doc.moveTo(x + 3*size/4, y + size/2).lineTo(x + 3*size/4, y + size).strokeColor('#3e2010').stroke();
  doc.restore();
}
function drawEagle(x, y, size = 18) {
  const s = size / 48;
  doc.save();
  doc.translate(x, y); doc.scale(s);
  doc.roundedRect(2, 2, 44, 44, 4).fillAndStroke(C.goldLight, '#b8860b');
  doc.moveTo(24, 10).lineTo(18, 18).lineTo(10, 22).lineTo(16, 22).lineTo(12, 28).lineTo(18, 26)
     .lineTo(16, 36).lineTo(24, 32).lineTo(32, 36).lineTo(30, 26).lineTo(36, 28).lineTo(32, 22)
     .lineTo(38, 22).lineTo(30, 18).closePath().fillAndStroke(C.gold, '#704c00');
  doc.circle(24, 14, 3).fillAndStroke(C.gold, '#704c00');
  doc.restore();
}
function drawLevel(x, y, w, h, title, bricks, tank, eagle) {
  const cols = 15, rows = 12;
  const cellW = w / cols, cellH = h / rows;
  doc.save();
  doc.rect(x, y, w, h).fillAndStroke('#1a1a1a', '#4caf50').lineWidth(1.5).stroke();
  doc.restore();
  for (const [c, r] of bricks) drawBrick(x + c * cellW, y + r * cellH, Math.min(cellW, cellH));
  if (tank) drawTank(x + tank.col * cellW - 4, y + tank.row * cellH - 4, Math.min(cellW, cellH) * 1.5);
  if (eagle) drawEagle(x + eagle.col * cellW - 4, y + eagle.row * cellH - 4, Math.min(cellW, cellH) * 1.8);
  if (title) doc.fillColor(C.dark).fontSize(10).text(title, x, y + h + 4, { width: w, align: 'center' });
}

// ===== scene layouts (mirror build_sb3.js) =====
const rng = (a, b) => Array.from({length: b - a + 1}, (_, i) => i + a);
const SCENE_LAYOUTS = {
  '2-1': {
    bricks: [
      [6, 0], [7, 0], [8, 0],
      [6, 1], [8, 1],
      [6, 2], [8, 2],
      ...rng(3, 11).map(c => [c, 5]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
  '2-2': {
    bricks: [
      [6, 0], [7, 0], [8, 0],
      [6, 1],
      [6, 2], [7, 2], [8, 2],
      ...rng(0, 10).map(c => [c, 5]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
  '2-3': {
    bricks: [
      [6, 0], [7, 0], [8, 0],
      [8, 1],
      [6, 2], [7, 2], [8, 2],
      ...rng(4, 14).map(c => [c, 5]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
  '2-4': {
    bricks: [],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
};

// =====================================================================
// PAGE 1: cover
// =====================================================================
doc.fillColor(C.gray).fontSize(11).text('坦克大戰 Scratch 課程   ·   國小二年級', ML, 50, { align: 'right', width: CONTENT_W });
Spacer(2);
doc.fillColor(C.green).fontSize(32).text('第 2 堂課', { align: 'center' });
Spacer(0.2);
doc.fillColor(C.dark).fontSize(18).text('學會改積木 — 換音效、加造型', { align: 'center' });
Spacer(0.6);
doc.fillColor(C.gray).fontSize(11).text('給已經完成第 1 堂的小朋友   ·   約 60 ~ 80 分鐘', { align: 'center' });

Spacer(1.5);

// 4-scene roadmap
const lvW = (CONTENT_W - 30) / 4;
const lvH = lvW * 12 / 15;
const lvY = doc.y;
['2-1', '2-2', '2-3', '2-4'].forEach((key, i) => {
  const layout = SCENE_LAYOUTS[key];
  const x = ML + (lvW + 10) * i;
  drawLevel(x, lvY, lvW, lvH, null, layout.bricks, layout.tank, layout.eagle);
  doc.fillColor(C.green).fontSize(11).text(key, x, lvY + lvH + 4, { width: lvW, align: 'center' });
  const names = { '2-1': '南口', '2-2': '東口', '2-3': '西口', '2-4': '沙盒' };
  doc.fillColor(C.dark).fontSize(9).text(names[key], x, lvY + lvH + 18, { width: lvW, align: 'center' });
});
doc.y = lvY + lvH + 50;

// Info card
const cardX = ML + 20;
const cardW = CONTENT_W - 40;
const cardY = doc.y;
const cardH = 175;
doc.save();
doc.roundedRect(cardX, cardY, cardW, cardH, 10).fillColor(C.purpleLight).fill();
doc.restore();
doc.fillColor(C.purple).fontSize(13).text('今天的兩個任務', cardX + 16, cardY + 12);
doc.fillColor(C.dark).fontSize(11).text(
  '★  任務一：把方向鍵程式加上「換造型」積木\n' +
  '      → 按 ↑ 坦克朝上、按 → 坦克朝右，看起來像真的在轉！\n' +
  '★  任務二：從 Scratch 音效庫挑一個新音效，換掉「勝利」\n' +
  '      → 贏的時候會播你選的音效',
  cardX + 16, cardY + 36, { width: cardW - 32, lineGap: 6 }
);
doc.fillColor(C.purple).fontSize(13).text('新挑戰', cardX + 16, cardY + 122);
doc.fillColor(C.dark).fontSize(11).text(
  '老鷹被磚牆包起來，每關只剩一個出口，要找到才能通關！',
  cardX + 16, cardY + 144, { width: cardW - 32 }
);

doc.y = cardY + cardH + 20;
doc.fillColor(C.gray).fontSize(9).text('Hacci × Wu   ·   Battle City Edition', ML, doc.y, { align: 'center', width: CONTENT_W });

// =====================================================================
// PAGE 2: open + what's new + 4 costumes
// =====================================================================
doc.addPage();
H1('一、打開檔案');

Step(1, 'scratch.mit.edu → Create → 檔案 → 從你的電腦上載',
  '選老師給你的 Lesson2_BattleCity.sb3。\n（操作跟第 1 堂一樣，只是這次選 Lesson2 的檔案！）');

H1('二、這次有什麼不一樣？');

P('打開之後，先試玩看看（按綠旗 + 方向鍵），會發現：');
doc.fillColor(C.dark).fontSize(11);
[
  '・老鷹被磚牆包起來了 — 只能從一個方向進去',
  '・坦克會動但「永遠朝上」 — 因為「換造型」還沒裝上去（這就是任務一！）',
  '・贏了還是「叮叮叮叮~」勝利音效（任務二要換掉）',
].forEach(t => doc.text(t, { lineGap: 4 }));
Spacer(0.5);

H1('三、看 4 個新造型');

P('點玩家坦克 → 點上面的「造型」頁籤，會看到 4 張坦克圖：');

const cY = doc.y + 5;
const costumeNames = ['坦克-上', '坦克-下', '坦克-左', '坦克-右'];
const dirs = ['up', 'down', 'left', 'right'];
costumeNames.forEach((name, i) => {
  const cx = ML + 60 + i * 110;
  drawTank(cx, cY, 50, dirs[i]);
  doc.fillColor(C.dark).fontSize(10).text(name, cx - 10, cY + 56, { width: 70, align: 'center' });
});
doc.y = cY + 80;

P('每張圖砲管朝的方向不一樣！等一下我們要讓「按哪個方向鍵 → 顯示哪張圖」。');

// =====================================================================
// PAGE 3: TASK 1
// =====================================================================
doc.addPage();
H1('四、任務一：讓坦克會「轉向」');

Task('找到 4 個方向鍵的程式，每個上面都加一塊「造型換成 [對應方向]」。\n總共要加 4 塊積木！');

Step(1, '點玩家坦克 → 「程式」頁籤',
  '右下角角色清單點「玩家坦克」，上方頁籤切回「程式」。');

Step(2, '找到「當 ↑ 鍵被按下」那一組',
  '中間程式區，找最上面寫「當 [↑] 鍵被按下」的積木組（中間欄）。');

Step(3, '從左邊積木區拖一塊「造型換成」',
  '左邊積木區，點「外觀」分類（紫色）。\n找「造型換成 [坦克-上]」這塊，拖出來。');

Step(4, '把它接到「當 ↑ 鍵被按下」下面',
  '貼到「當 ↑ 鍵被按下」的正下方，「y 改變 10」的上面。\n下拉選單選「坦克-上」。');

Step(5, '重複 ↓ ← → 三個方向',
  '對其他 3 組各加一塊：\n   ▸  ↓ 鍵下面 → 造型換成「坦克-下」\n   ▸  ← 鍵下面 → 造型換成「坦克-左」\n   ▸  → 鍵下面 → 造型換成「坦克-右」');

Step(6, '按綠旗測試',
  '按方向鍵，坦克的砲管應該會跟著轉方向！');

Tip('坦克沒在轉？檢查每塊「造型換成」是不是選對了方向（↑配上、↓配下、…）。');

// =====================================================================
// PAGE 4: TASK 2
// =====================================================================
doc.addPage();
H1('五、任務二：換個勝利音效');

Task('從 Scratch 內建音效庫挑一個你喜歡的，換掉現在的「勝利」音效。');

Step(1, '點玩家坦克 → 點上方「聲音」頁籤',
  '會看到目前只有一個音效，叫「勝利」。');

Step(2, '點左下角的喇叭 icon「選擇音效」',
  '左下角有個藍色喇叭 icon（上面寫加號）。點它一下，會跳出 Scratch 的音效庫。');

Step(3, '挑一個你喜歡的',
  '推薦：\n   ▸  Cheer  歡呼聲\n   ▸  Win  勝利音效\n   ▸  Magic Spell  魔法\n   ▸  Triumph  凱旋');

Step(4, '把它選進來，會出現在聲音清單',
  '現在聲音清單有 2 個：勝利 + 你選的那個。');

Step(5, '回到「程式」頁籤，找勝利偵測那組（左下）',
  '找到「播放音效 [勝利] 直到結束」這塊。');

Step(6, '點下拉選單，改成你選的音效',
  '點「勝利」會出現下拉，選你剛加的那個音效。');

Step(7, '按綠旗，玩到贏為止',
  '碰到老鷹時，會播你選的新音效！');

Tip('不喜歡？再選一次就好。聲音清單可以放很多個，隨便換。');

// =====================================================================
// PAGE 5: scene walkthrough
// =====================================================================
doc.addPage();
H1('六、闖 3 關：找出口！');

P('這 3 關老鷹都被磚牆包起來。看圖找出口，從那個方向開進去。');

const wY = doc.y;
const wLvW = (CONTENT_W - 20) / 3;
const wLvH = wLvW * 12 / 15;
['2-1', '2-2', '2-3'].forEach((key, i) => {
  const layout = SCENE_LAYOUTS[key];
  const x = ML + (wLvW + 10) * i;
  drawLevel(x, wY, wLvW, wLvH, null, layout.bricks, layout.tank, layout.eagle);
  const titles = { '2-1': '南口 ↓', '2-2': '東口 →', '2-3': '西口 ←' };
  doc.fillColor(C.green).fontSize(11).text(titles[key], x, wY + wLvH + 4, { width: wLvW, align: 'center' });
});
doc.y = wY + wLvH + 30;

H2('每關提示');
P('2-1 南口：出口在老鷹「正下方」。從下面開進去（按 ↑ 進入）。');
P('2-2 東口：出口在老鷹「右邊」。要繞到老鷹右側，按 ← 進入。');
P('2-3 西口：出口在老鷹「左邊」。要繞到老鷹左側，按 → 進入。');

Tip('每關都有一面長橫牆擋住直線路徑，要繞過去才能到老鷹旁邊。');

// =====================================================================
// PAGE 6: sandbox + save + challenges + next class
// =====================================================================
doc.addPage();
H1('七、第 4 關  2-4  沙盒命題：用上 4 個方向！');

Task('在 2-4 沙盒，自己排磚牆，做一個從起點走到老鷹的時候，\n↑ ↓ ← → 4 個方向鍵全部都要用到的關卡。');

Step(1, '切到 2-4 沙盒背景',
  '舞台面板 → 背景頁籤 → 點 2-4_沙盒。');

Step(2, '複製磚牆',
  '角色清單對「磚牆」按右鍵 → 複製。重複 10 ~ 15 次。');

Step(3, '排路線',
  '腦海先想一條 Z 字或 S 字路線，再把磚牆排成「擋掉直線」的樣子。');

Step(4, '按綠旗自己測試',
  '從起點開到老鷹，數一數：↑ ↓ ← → 都用到了嗎？');

Tip('想用到 ↓，老鷹要放在「比起點低」、或是繞過去要回頭的地方。');

H1('八、存檔');

P('檔案 → 下載到你的電腦 → 命名為 MyTank_Lesson2.sb3');

H1('九、課後挑戰');

doc.fillColor(C.green).fontSize(13).text('★    一星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       讓坦克跑更快：把方向鍵的 10 全部改成 15。', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★   二星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       在「碰到老鷹 → 播音效」之間加一塊「造型換成 [坦克-上]」（贏的瞬間切回朝上）', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★ ★  三星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       自己錄一個音效（聲音頁籤 → 麥克風 icon），換掉勝利音效。', { lineGap: 4 });

Spacer(1);
H1('十、下一堂預告');
P('第 3 堂課，我們會讓坦克「發射子彈」！');
P('需要新的概念：分身 (clone)、廣播 (broadcast)、子彈方向。');

Spacer(2);
doc.fillColor(C.gray).fontSize(10).text('做得很棒！記得儲存你的作品，下堂課見。', ML, doc.y, { align: 'center', width: CONTENT_W });

doc.end();
doc.on('end', () => console.log('PDF done:', OUT));
